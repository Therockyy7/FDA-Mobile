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
  topInset: number;
  colors: AlertSettingsHeaderColors;
}

export function AlertSettingsHeader({
  areaName,
  description,
  onBack,
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
