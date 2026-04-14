// app/alerts/thresholds/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import { MAP_COLORS, SEVERITY_PALETTE } from "~/lib/design-tokens";

import AlertThresholdsFooter from "~/features/alerts/components/alert-thresholds/AlertThresholdsFooter";
import AlertThresholdsHeader from "~/features/alerts/components/alert-thresholds/AlertThresholdsHeader";
import GlobalThresholdCard from "~/features/alerts/components/alert-thresholds/GlobalThresholdCard";
import ThresholdCard from "~/features/alerts/components/alert-thresholds/ThresholdCard";
import ThresholdSectionTitle from "~/features/alerts/components/alert-thresholds/ThresholdSectionTitle";

type SeverityKey = "info" | "caution" | "warning" | "critical";

// Flood severity color tokens — import from design-tokens to stay in sync with Tailwind config
const SEVERITY_COLORS: Record<SeverityKey, string> = {
  info: "#0077BE",                  // flood-info / brand primary (TAB_COLORS.light.active)
  caution: SEVERITY_PALETTE.caution.primary,  // caution
  warning: SEVERITY_PALETTE.warning.primary,  // warning (orange)
  critical: SEVERITY_PALETTE.critical.primary, // critical (red)
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export default function AlertThresholdsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  // Theme colors — sub-components still consume colors props (story 4.2 pending migration)
  // Defensive: provide defaults if MAP_COLORS returns incomplete structure
  const defaultScheme = isDarkColorScheme ? MAP_COLORS.dark : MAP_COLORS.light;
  const scheme = {
    background: defaultScheme?.background ?? "#f6f7f8",
    card: defaultScheme?.card ?? "#ffffff",
    text: defaultScheme?.text ?? "#1F2937",
    subtext: defaultScheme?.subtext ?? "#64748B",
    border: defaultScheme?.border ?? "#E2E8F0",
  };
  const colors = useMemo(
    () => ({
      primary: "#137fec",
      bg: isDarkColorScheme ? "#101922" : scheme.background,
      surface: scheme.card,
      surfaceSoft: isDarkColorScheme ? "#0B1A33" : "#F9FAFB",
      text: scheme.text,
      subtext: isDarkColorScheme ? "#9CA3AF" : "#617589",
      border: scheme.border,
      borderSoft: isDarkColorScheme
        ? "rgba(31,41,55,0.5)"
        : "rgba(229,231,235,0.7)",
      overlay: isDarkColorScheme
        ? "rgba(16,25,34,0.85)"
        : "rgba(255,255,255,0.80)",
      error: "#EF4444",
      errorSoft: isDarkColorScheme ? "rgba(239,68,68,0.15)" : "#FEF2F2",
      status: SEVERITY_COLORS,
    }),
    [isDarkColorScheme],
  );

  const global = {
    info: 1.0,
    caution: 2.5,
    warning: 4.0,
    critical: 6.0,
    unit: "m",
  };
  const [custom, setCustom] = useState<Record<SeverityKey, number>>({
    info: 1.2,
    caution: 1.0,
    warning: 4.5,
    critical: 7.0,
  });

  const errors = useMemo(() => {
    const e: Partial<Record<SeverityKey, string>> = {};
    if (!(custom.caution > custom.info))
      e.caution = `Phải lớn hơn Info (${custom.info.toFixed(1)}m)`;
    if (!(custom.warning > custom.caution))
      e.warning = `Phải lớn hơn Caution (${custom.caution.toFixed(1)}m)`;
    if (!(custom.critical > custom.warning))
      e.critical = `Phải lớn hơn Warning (${custom.warning.toFixed(1)}m)`;
    return e;
  }, [custom]);

  const canSave = Object.keys(errors).length === 0;

  const headerHeight = Math.max(insets.top - 6, 0) + 52;
  const footerHeight = 74 + Math.max(insets.bottom, 12);

  const setValue = (key: SeverityKey, value: number) => {
    setCustom((prev) => ({ ...prev, [key]: round1(clamp(value, 0, 10)) }));
  };

  const setFromText = (key: SeverityKey, text: string) => {
    // Validate numeric input: reject if not finite after decimal normalization
    const n = Number(text.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return;
    setValue(key, n);
  };

  const resetToDefault = () => {
    setCustom({
      info: global.info,
      caution: global.caution,
      warning: global.warning,
      critical: global.critical,
    });
  };

  const save = () => {
    // TODO: wire API, use params.areaId
  };

  // Memoize color object to prevent unnecessary child re-renders
  const thresholdCardColors = useMemo(
    () => ({
      surface: colors.surface,
      surfaceSoft: colors.surfaceSoft,
      text: colors.text,
      subtext: colors.subtext,
      borderSoft: colors.borderSoft,
      primary: colors.primary,
      error: colors.error,
      errorSoft: colors.errorSoft,
      bg: colors.bg,
    }),
    [colors],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      testID="alerts-thresholds-screen"
    >
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.bg}
      />

      <AlertThresholdsHeader
        title="Ngưỡng cảnh báo"
        topInset={insets.top}
        onBack={() => router.back()}
        colors={{
          overlay: colors.overlay,
          borderSoft: colors.borderSoft,
          text: colors.text,
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + 4,
          paddingBottom: footerHeight + 10,
        }}
        testID="alerts-thresholds-scroll"
      >
        <ThresholdSectionTitle
          title="Mặc định toàn hệ thống"
          colors={{ text: colors.text }}
          testID="alerts-thresholds-global-title"
        />
        <GlobalThresholdCard
          global={global}
          colors={{
            surface: colors.surface,
            borderSoft: colors.borderSoft,
            status: colors.status,
            subtext: colors.subtext,
            text: colors.text,
          }}
          testID="alerts-thresholds-global-card"
        />

        <ThresholdSectionTitle
          title="Ngưỡng tùy chỉnh của bạn"
          colors={{ text: colors.text }}
          testID="alerts-thresholds-custom-title"
        />

        <View className="px-4 gap-2.5" testID="alerts-thresholds-custom-list">
          <ThresholdCard
            title="Info"
            color={colors.status.info}
            value={custom.info}
            unit="m"
            onChange={(v) => setValue("info", v)}
            onTextChange={(t) => setFromText("info", t)}
            colors={thresholdCardColors}
            testID="alerts-thresholds-card-info"
          />
          <ThresholdCard
            title="Caution"
            color={colors.status.caution}
            value={custom.caution}
            unit="m"
            onChange={(v) => setValue("caution", v)}
            onTextChange={(t) => setFromText("caution", t)}
            colors={thresholdCardColors}
            error={errors.caution}
            testID="alerts-thresholds-card-caution"
          />
          <ThresholdCard
            title="Warning"
            color={colors.status.warning}
            value={custom.warning}
            unit="m"
            onChange={(v) => setValue("warning", v)}
            onTextChange={(t) => setFromText("warning", t)}
            colors={thresholdCardColors}
            error={errors.warning}
            testID="alerts-thresholds-card-warning"
          />
          <ThresholdCard
            title="Critical"
            color={colors.status.critical}
            value={custom.critical}
            unit="m"
            onChange={(v) => setValue("critical", v)}
            onTextChange={(t) => setFromText("critical", t)}
            colors={thresholdCardColors}
            error={errors.critical}
            testID="alerts-thresholds-card-critical"
          />
        </View>

        <View className="h-2" />
      </ScrollView>

      <AlertThresholdsFooter
        bottomInset={insets.bottom}
        canSave={canSave}
        onReset={resetToDefault}
        onSave={save}
        colors={{
          overlay: colors.overlay,
          borderSoft: colors.borderSoft,
          primary: colors.primary,
        }}
      />
    </SafeAreaView>
  );
}
