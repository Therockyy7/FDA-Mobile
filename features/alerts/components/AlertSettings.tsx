// features/alerts/components/AlertSettings.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
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

export function AlertSettings({
  areaId,
  areaName,
  initialSettings,
  onSave,
}: AlertSettingsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  // Form state
  const [minimumSeverity, setMinimumSeverity] = useState<AlertSeverity>(
    initialSettings?.minimumSeverity || "Warning"
  );
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannels>(
    initialSettings?.notificationChannels || {
      push: true,
      email: false,
      sms: false,
    }
  );
  const [quietHours, setQuietHours] = useState<QuietHours>(
    initialSettings?.quietHours || {
      enabled: true,
      startTime: "22:00",
      endTime: "06:00",
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) return;
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(
          `${ALERT_SETTINGS_KEY_PREFIX}${areaId}`,
        );
        if (!stored) return;
        const parsed = JSON.parse(stored) as AlertSettingsFormData;
        if (parsed.minimumSeverity) {
          setMinimumSeverity(parsed.minimumSeverity);
        }
        if (parsed.notificationChannels) {
          setNotificationChannels(parsed.notificationChannels);
        }
        if (parsed.quietHours) {
          setQuietHours(parsed.quietHours);
        }
      } catch {
        // Ignore storage errors and keep defaults
      }
    };
    loadSettings();
  }, [areaId, initialSettings]);

  // Theme colors
  const colors: AlertSettingsColors = {
    background: isDarkColorScheme ? "#101922" : "#f6f7f8",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    primary: "#137fec",
    mutedBg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    divider: isDarkColorScheme ? "#334155" : "#F3F4F6",
    statusBarStyle: "light-content",
  };

  const headerColors: AlertSettingsHeaderColors = {
    background: "#1E293B",
    text: "#F1F5F9",
    subtext: "#94A3B8",
    border: "#334155",
  };

  const severityOptions: {
    value: AlertSeverity;
    label: string;
    color: string;
  }[] = [
    { value: "Caution", label: "Caution", color: "#F59E0B" },
    { value: "Warning", label: "Warning", color: "#F97316" },
    { value: "Critical", label: "Critical", color: "#EF4444" },
  ];

  const [activeTimeField, setActiveTimeField] = useState<"start" | "end" | null>(
    null
  );
  const [timePickerValue, setTimePickerValue] = useState<Date>(
    new Date()
  );

  const parseTimeToDate = (time: string) => {
    const [hours, minutes] = time.split(":").map((value) => Number(value));
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const openTimePicker = (field: "start" | "end") => {
    setActiveTimeField(field);
    setTimePickerValue(
      parseTimeToDate(field === "start" ? quietHours.startTime : quietHours.endTime)
    );
  };

  const closeTimePicker = () => {
    setActiveTimeField(null);
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
        quietHours,
      };

      await AsyncStorage.setItem(
        `${ALERT_SETTINGS_KEY_PREFIX}${areaId}`,
        JSON.stringify(settings),
      );

      if (onSave) {
        await onSave(settings);
      }

      Alert.alert("Thành công", "Cài đặt cảnh báo đã được lưu", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể lưu cài đặt");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={colors.statusBarStyle as any}
        backgroundColor={headerColors.background}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <AlertSettingsHeader
          areaName={areaName}
          description="Configure alerts for your saved home area"
          onBack={() => router.back()}
          topInset={insets.top}
          colors={headerColors}
        />

        <MinimumSeveritySection
          minimumSeverity={minimumSeverity}
          onChange={setMinimumSeverity}
          options={severityOptions}
          colors={colors}
        />

        <NotificationChannelsSection
          notificationChannels={notificationChannels}
          onChange={setNotificationChannels}
          colors={colors}
        />

        <QuietHoursSection
          quietHours={quietHours}
          onToggle={(enabled) =>
            setQuietHours((prev) => ({ ...prev, enabled }))
          }
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
        onConfirm={(date) => applyTimePicker(date)}
        onCancel={closeTimePicker}
        colors={colors}
      />

      {/* Background Decorations */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: SCREEN_WIDTH * 0.5,
          height: SCREEN_WIDTH * 0.5,
          backgroundColor: `${colors.primary}05`,
          borderRadius: SCREEN_WIDTH * 0.25,
          transform: [{ scale: 1 }],
          opacity: 0.5,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: SCREEN_WIDTH * 0.5,
          height: SCREEN_WIDTH * 0.5,
          backgroundColor: `${colors.primary}05`,
          borderRadius: SCREEN_WIDTH * 0.25,
          transform: [{ scale: 1 }],
          opacity: 0.5,
        }}
      />
    </View>
  );
}

export default AlertSettings;