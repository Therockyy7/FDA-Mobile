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
          onPress={onBack}
          activeOpacity={0.8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "#334155",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onThresholdPress}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: "#1E293B",
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Ionicons name="options" size={16} color="#F59E0B" />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#F8FAFC" }}>
            Ngưỡng cảnh báo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 14 }}>
        <Text
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
          style={{
            fontSize: 13,
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
