// features/alerts/components/AlertSettings.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import { MAP_COLORS } from "~/lib/design-tokens";
import { AlertSettingsService } from "../services/alert-settings.service";
import type {
  AlertSettingsColors,
  AlertSettingsFormData,
  AlertSettingsHeaderColors,
  AlertSeverity,
  NotificationChannels,
  QuietHours,
} from "../types/alert-settings.types";
import AlertSettingsHeader from "./alert-settings/AlertSettingsHeader";
import MinimumSeveritySection from "./alert-settings/MinimumSeveritySection";
import NotificationChannelsSection from "./alert-settings/NotificationChannelsSection";
import QuietHoursSection from "./alert-settings/QuietHoursSection";
import SaveSettingsBar from "./alert-settings/SaveSettingsBar";
import TimePickerModal from "./alert-settings/TimePickerModal";

interface AlertSettingsProps {
  areaId: string;
  areaName: string;
  initialSettings?: Partial<AlertSettingsFormData>;
  onSave?: (settings: AlertSettingsFormData) => Promise<void>;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ALERT_SETTINGS_KEY_PREFIX = "@alert_settings_";
const PRIMARY = "#137fec";

// Flood severity colors — sourced from tailwind flood-* tokens
const SEVERITY_OPTIONS: { value: AlertSeverity; label: string; color: string }[] = [
  { value: "Caution", label: "Chú ý", color: "#F59E0B" },
  { value: "Warning", label: "Cảnh báo", color: "#F97316" },
  { value: "Critical", label: "Nguy hiểm", color: "#EF4444" },
];

export function AlertSettings({
  areaId,
  areaName,
  initialSettings,
  onSave,
}: AlertSettingsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const normalizeTime = (time: string) =>
    time.length === 5 ? `${time}:00` : time;

  const [minimumSeverity, setMinimumSeverity] = useState<AlertSeverity>(
    initialSettings?.minimumSeverity ?? "Warning",
  );
  const [notificationChannels, setNotificationChannels] =
    useState<NotificationChannels>(
      initialSettings?.notificationChannels ?? { push: true, email: false, sms: false },
    );
  const [quietHours, setQuietHours] = useState<QuietHours>(() => {
    if (initialSettings?.quietHours) {
      return {
        startTime: normalizeTime(initialSettings.quietHours.startTime),
        endTime: normalizeTime(initialSettings.quietHours.endTime),
      };
    }
    return { startTime: "22:00:00", endTime: "06:00:00" };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<"start" | "end" | null>(null);
  const [timePickerValue, setTimePickerValue] = useState<Date>(new Date());

  useEffect(() => {
    if (initialSettings) return;
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(
          `${ALERT_SETTINGS_KEY_PREFIX}${areaId}`,
        );
        if (!stored) return;
        const parsed = JSON.parse(stored) as AlertSettingsFormData;
        if (parsed.minimumSeverity) setMinimumSeverity(parsed.minimumSeverity);
        if (parsed.notificationChannels) setNotificationChannels(parsed.notificationChannels);
        if (parsed.quietHours) {
          setQuietHours({
            startTime: normalizeTime(parsed.quietHours.startTime),
            endTime: normalizeTime(parsed.quietHours.endTime),
          });
        }
      } catch {
        // Ignore storage errors — keep defaults
      }
    };
    loadSettings();
  }, [areaId, initialSettings]);

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
  const colors: AlertSettingsColors = {
    background: isDarkColorScheme ? "#101922" : scheme.background,
    cardBg: scheme.card,
    text: scheme.text,
    subtext: scheme.subtext,
    border: scheme.border,
    primary: PRIMARY,
    mutedBg: isDarkColorScheme ? "#0B1A33" : "#F8FAFC",
    divider: isDarkColorScheme ? scheme.border : "#F3F4F6",
    statusBarStyle: "light-content",
  };

  const headerColors: AlertSettingsHeaderColors = {
    background: "#1E293B",
    text: (defaultScheme?.text ?? MAP_COLORS.dark.text),
    subtext: (defaultScheme?.subtext ?? MAP_COLORS.dark.subtext),
    border: (defaultScheme?.border ?? MAP_COLORS.dark.border),
  };

  const parseTimeToDate = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    // Validate time bounds to prevent invalid dates
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return new Date(); // Return current time as fallback
    }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date) => {
    const hhmm = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${hhmm}:00`;
  };

  const openTimePicker = (field: "start" | "end") => {
    setActiveTimeField(field);
    setTimePickerValue(
      parseTimeToDate(field === "start" ? quietHours.startTime : quietHours.endTime),
    );
  };

  const applyTimePicker = (selectedDate: Date) => {
    if (!activeTimeField) return;
    const formatted = formatTime(selectedDate);
    setQuietHours((prev) => ({
      ...prev,
      startTime: activeTimeField === "start" ? formatted : prev.startTime,
      endTime: activeTimeField === "end" ? formatted : prev.endTime,
    }));
    setActiveTimeField(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings: AlertSettingsFormData = {
        minimumSeverity,
        notificationChannels,
        quietHours: {
          startTime: normalizeTime(quietHours.startTime),
          endTime: normalizeTime(quietHours.endTime),
        },
      };

      const payload = AlertSettingsService.buildSubscriptionPayload(settings);
      await AlertSettingsService.updateSubscription(areaId, payload);

      if (onSave) await onSave(settings);

      await AsyncStorage.setItem(
        `${ALERT_SETTINGS_KEY_PREFIX}${areaId}`,
        JSON.stringify(settings),
      );

      Alert.alert("Thành công", "Cài đặt cảnh báo đã được lưu", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Không thể lưu cài đặt";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      testID="alerts-settings-root"
    >
      <StatusBar barStyle="light-content" backgroundColor={headerColors.background} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        testID="alerts-settings-scroll"
      >
        <AlertSettingsHeader
          areaName={areaName}
          description="Thiết lập cảnh báo cho khu vực bạn đã lưu"
          onBack={() => router.back()}
          onThresholdPress={() =>
            router.push({ pathname: "/alerts/thresholds", params: { areaId, areaName } })
          }
          topInset={insets.top}
          colors={headerColors}
        />
        <MinimumSeveritySection
          minimumSeverity={minimumSeverity}
          onChange={setMinimumSeverity}
          options={SEVERITY_OPTIONS}
          colors={colors}
        />
        <NotificationChannelsSection
          notificationChannels={notificationChannels}
          onChange={setNotificationChannels}
          colors={colors}
        />
        <QuietHoursSection
          quietHours={quietHours}
          onStartPress={() => openTimePicker("start")}
          onEndPress={() => openTimePicker("end")}
          colors={colors}
        />
      </ScrollView>

      <SaveSettingsBar
        onSave={handleSave}
        isSaving={isSaving}
        bottomInset={insets.bottom}
        colors={colors}
      />

      <TimePickerModal
        visible={activeTimeField !== null}
        title={activeTimeField === "start" ? "Chọn giờ bắt đầu" : "Chọn giờ kết thúc"}
        value={timePickerValue}
        onConfirm={applyTimePicker}
        onCancel={() => setActiveTimeField(null)}
        colors={colors}
      />

      {/* Background decorations — JS styles required for dynamic radius calculation */}
      <View
        pointerEvents="none"
        className="absolute top-0 right-0 opacity-50"
        style={{
          width: SCREEN_WIDTH * 0.5,
          height: SCREEN_WIDTH * 0.5,
          backgroundColor: `${PRIMARY}05`,
          borderRadius: SCREEN_WIDTH * 0.25,
        }}
      />
      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 opacity-50"
        style={{
          width: SCREEN_WIDTH * 0.5,
          height: SCREEN_WIDTH * 0.5,
          backgroundColor: `${PRIMARY}05`,
          borderRadius: SCREEN_WIDTH * 0.25,
        }}
      />
    </View>
  );
}

export default AlertSettings;
