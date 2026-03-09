// features/alerts/components/alert-settings/SaveSettingsBar.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AlertSettingsColors } from "../../types/alert-settings.types";

interface SaveSettingsBarProps {
  onSave: () => void;
  isSaving: boolean;
  bottomInset: number;
  colors: AlertSettingsColors;
}

export function SaveSettingsBar({
  onSave,
  isSaving,
  bottomInset,
  colors,
}: SaveSettingsBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: 20,
        paddingBottom: Math.max(bottomInset, 20),
      }}
    >
      <TouchableOpacity
        onPress={onSave}
        disabled={isSaving}
        activeOpacity={0.8}
        style={{
          backgroundColor: isSaving ? colors.subtext : colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.cardBg,
          }}
        >
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default SaveSettingsBar;
