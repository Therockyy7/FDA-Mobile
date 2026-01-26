import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import AlertThresholdsFooter from "~/features/alerts/components/alert-thresholds/AlertThresholdsFooter";
import AlertThresholdsHeader from "~/features/alerts/components/alert-thresholds/AlertThresholdsHeader";
import GlobalThresholdCard from "~/features/alerts/components/alert-thresholds/GlobalThresholdCard";
import ThresholdCard from "~/features/alerts/components/alert-thresholds/ThresholdCard";
import ThresholdSectionTitle from "~/features/alerts/components/alert-thresholds/ThresholdSectionTitle";

type SeverityKey = "info" | "caution" | "warning" | "critical";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export default function AlertThresholdsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const colors = useMemo(
    () => ({
      primary: "#137fec",
      bg: isDarkColorScheme ? "#101922" : "#f6f7f8",
      surface: isDarkColorScheme ? "#111827" : "#ffffff",
      surfaceSoft: isDarkColorScheme ? "#0F172A" : "#F9FAFB",
      text: isDarkColorScheme ? "#ffffff" : "#111418",
      subtext: isDarkColorScheme ? "#9CA3AF" : "#617589",
      border: isDarkColorScheme ? "#1F2937" : "#E5E7EB",
      borderSoft: isDarkColorScheme
        ? "rgba(31,41,55,0.5)"
        : "rgba(229,231,235,0.7)",
      overlay: isDarkColorScheme
        ? "rgba(16,25,34,0.85)"
        : "rgba(255,255,255,0.80)",
      error: "#EF4444",
      errorSoft: isDarkColorScheme ? "rgba(239,68,68,0.15)" : "#FEF2F2",
      status: {
        info: "#137fec",
        caution: "#f59e0b",
        warning: "#f97316",
        critical: "#ef4444",
      } as Record<SeverityKey, string>,
    }),
    [isDarkColorScheme],
  );

  const global = { info: 1.0, caution: 2.5, warning: 4.0, critical: 6.0, unit: "m" };
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
    const cleaned = text.replace(",", ".");
    const n = Number(cleaned);
    if (Number.isFinite(n)) setValue(key, n);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.bg}
      />

      <AlertThresholdsHeader
        title="Ngưỡng cảnh báo"
        topInset={insets.top}
        onBack={() => router.back()}
        colors={{ overlay: colors.overlay, borderSoft: colors.borderSoft, text: colors.text }}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + 4,
          paddingBottom: footerHeight + 10,
        }}
      >
        <ThresholdSectionTitle title="Mặc định toàn hệ thống" colors={{ text: colors.text }} />
        <GlobalThresholdCard
          global={global}
          colors={{
            surface: colors.surface,
            borderSoft: colors.borderSoft,
            status: colors.status,
            subtext: colors.subtext,
            text: colors.text,
          }}
        />

        <ThresholdSectionTitle title="Ngưỡng tùy chỉnh của bạn" colors={{ text: colors.text }} />

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <ThresholdCard
            title="Info"
            color={colors.status.info}
            value={custom.info}
            unit="m"
            onChange={(v) => setValue("info", v)}
            onTextChange={(t) => setFromText("info", t)}
            colors={{
              surface: colors.surface,
              surfaceSoft: colors.surfaceSoft,
              text: colors.text,
              subtext: colors.subtext,
              borderSoft: colors.borderSoft,
              primary: colors.primary,
              error: colors.error,
              errorSoft: colors.errorSoft,
              bg: colors.bg,
            }}
          />

          <ThresholdCard
            title="Caution"
            color={colors.status.caution}
            value={custom.caution}
            unit="m"
            onChange={(v) => setValue("caution", v)}
            onTextChange={(t) => setFromText("caution", t)}
            colors={{
              surface: colors.surface,
              surfaceSoft: colors.surfaceSoft,
              text: colors.text,
              subtext: colors.subtext,
              borderSoft: colors.borderSoft,
              primary: colors.primary,
              error: colors.error,
              errorSoft: colors.errorSoft,
              bg: colors.bg,
            }}
            error={errors.caution}
          />

          <ThresholdCard
            title="Warning"
            color={colors.status.warning}
            value={custom.warning}
            unit="m"
            onChange={(v) => setValue("warning", v)}
            onTextChange={(t) => setFromText("warning", t)}
            colors={{
              surface: colors.surface,
              surfaceSoft: colors.surfaceSoft,
              text: colors.text,
              subtext: colors.subtext,
              borderSoft: colors.borderSoft,
              primary: colors.primary,
              error: colors.error,
              errorSoft: colors.errorSoft,
              bg: colors.bg,
            }}
            error={errors.warning}
          />

          <ThresholdCard
            title="Critical"
            color={colors.status.critical}
            value={custom.critical}
            unit="m"
            onChange={(v) => setValue("critical", v)}
            onTextChange={(t) => setFromText("critical", t)}
            colors={{
              surface: colors.surface,
              surfaceSoft: colors.surfaceSoft,
              text: colors.text,
              subtext: colors.subtext,
              borderSoft: colors.borderSoft,
              primary: colors.primary,
              error: colors.error,
              errorSoft: colors.errorSoft,
              bg: colors.bg,
            }}
            error={errors.critical}
          />
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      <AlertThresholdsFooter
        bottomInset={insets.bottom}
        canSave={canSave}
        onReset={resetToDefault}
        onSave={save}
        colors={{ overlay: colors.overlay, borderSoft: colors.borderSoft, primary: colors.primary }}
      />
    </SafeAreaView>
  );
}
