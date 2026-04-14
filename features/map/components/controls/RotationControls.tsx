// features/map/components/controls/RotationControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { SHADOW, MAP_ICON_COLORS } from "~/lib/design-tokens";

interface RotationControlsProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export function RotationControls({ onRotateLeft, onRotateRight }: RotationControlsProps) {
  const { isDarkColorScheme } = useColorScheme();
  const iconColor = isDarkColorScheme ? MAP_ICON_COLORS.dark.active : MAP_ICON_COLORS.light.active;

  return (
    <View
      className="bg-white dark:bg-[#1E293B] border border-[#F1F5F9] dark:border-[#334155]"
      style={[
        SHADOW.md,
        {
          borderRadius: 20,
          overflow: "hidden",
        },
      ]}
    >
      <TouchableOpacity
        onPress={onRotateLeft}
        testID="map-controls-rotate-left-btn"
        accessibilityRole="button"
        accessibilityLabel="Xoay bản đồ sang trái"
        style={{
          width: 50,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="return-up-back" size={20} color={iconColor} />
      </TouchableOpacity>
      <View className="bg-[#F1F5F9] dark:bg-[#334155]" style={{ height: 1 }} />
      <TouchableOpacity
        onPress={onRotateRight}
        testID="map-controls-rotate-right-btn"
        accessibilityRole="button"
        accessibilityLabel="Xoay bản đồ sang phải"
        style={{
          width: 50,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="return-up-forward" size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}
