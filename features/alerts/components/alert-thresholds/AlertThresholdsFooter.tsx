// features/alerts/components/alert-thresholds/AlertThresholdsFooter.tsx
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AlertThresholdsFooterProps {
  bottomInset: number;
  canSave: boolean;
  colors: {
    overlay: string;
    borderSoft: string;
    primary: string;
  };
  onReset: () => void;
  onSave: () => void;
}

export function AlertThresholdsFooter({
  bottomInset,
  canSave,
  colors,
  onReset,
  onSave,
}: AlertThresholdsFooterProps) {
  const safeBottomInset = Math.max(Math.max(bottomInset, 0), 35);
  const isEnabled = canSave === true;
  return (
    <View
      testID="alerts-thresholds-footer"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backgroundColor: colors.overlay,
        borderTopWidth: 1,
        borderTopColor: colors.borderSoft,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: safeBottomInset,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          testID="alerts-thresholds-reset-button"
          activeOpacity={0.85}
          onPress={onReset}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ color: colors.primary, fontWeight: "800", fontSize: 14 }}
          >
            Reset về mặc định
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="alerts-thresholds-save-button"
          activeOpacity={0.85}
          onPress={onSave}
          disabled={!isEnabled}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-white font-extrabold text-sm">
            Lưu thay đổi
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AlertThresholdsFooter;
