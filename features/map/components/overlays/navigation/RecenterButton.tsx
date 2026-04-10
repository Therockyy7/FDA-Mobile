// features/map/components/overlays/navigation/RecenterButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { CARD_SHADOW } from "~/features/map/lib/map-ui-utils";

interface RecenterButtonProps {
  onPress: () => void;
}

export function RecenterButton({ onPress }: RecenterButtonProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: isDark ? "#1E293B" : "white",
        alignItems: "center",
        justifyContent: "center",
        ...CARD_SHADOW,
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#E2E8F0",
      }}
    >
      <Ionicons name="navigate" size={22} color="#2563EB" />
    </TouchableOpacity>
  );
}
