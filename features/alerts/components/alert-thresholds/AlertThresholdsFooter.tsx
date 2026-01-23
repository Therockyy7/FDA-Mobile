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
  return (
    <View
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
        paddingBottom: Math.max(bottomInset, 35),
      }}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
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
          activeOpacity={0.85}
          onPress={onSave}
          disabled={!canSave}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
            Lưu thay đổi
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AlertThresholdsFooter;
