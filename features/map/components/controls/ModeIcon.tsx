// features/map/components/controls/ModeIcon.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface ModeIconProps {
  active: boolean;
  viewMode: "zones" | "routes";
  onPress: () => void;
}

export function ModeIcon({ active, viewMode, onPress }: ModeIconProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const iconColor = active
    ? "#3B82F6"
    : isDark ? "#94A3B8" : "#6B7280";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: active
          ? "#EFF6FF"
          : isDark ? "#334155" : "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name={viewMode === "zones" ? "water" : "navigate"}
        size={18}
        color={iconColor}
      />
    </TouchableOpacity>
  );
}
