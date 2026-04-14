// features/alerts/components/alert-settings/AlertSettingsHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AlertSettingsHeaderColors } from "../../types/alert-settings.types";

interface AlertSettingsHeaderProps {
  areaName: string;
  description: string;
  onBack: () => void;
  onThresholdPress: () => void;
  topInset: number;
  colors: AlertSettingsHeaderColors;
}

export function AlertSettingsHeader({
  areaName,
  description,
  onBack,
  onThresholdPress,
  topInset,
  colors,
}: AlertSettingsHeaderProps) {
  return (
    <View
      testID="alerts-settings-header"
      style={{
        backgroundColor: colors.background,
        paddingTop: topInset + 8,
        paddingHorizontal: 20,
        paddingBottom: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity
          testID="alerts-settings-back-button"
          onPress={onBack}
          activeOpacity={0.8}
          className="w-9 h-9 rounded-xl bg-slate-700 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          testID="alerts-settings-threshold-button"
          onPress={onThresholdPress}
          activeOpacity={0.85}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700"
        >
          <Ionicons name="options" size={16} color="#F59E0B" />
          <Text className="text-xs font-bold text-slate-50">
            Ngưỡng cảnh báo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 14 }}>
        <Text
          testID="alerts-settings-area-name"
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          {areaName}
        </Text>
        <Text
          testID="alerts-settings-description"
          style={{
            fontSize: 14,
            color: colors.subtext,
            marginTop: 4,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

export default AlertSettingsHeader;
