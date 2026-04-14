// features/map/components/overlays/navigation/RecenterButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { SHADOW } from "~/lib/design-tokens";

interface RecenterButtonProps {
  onPress: () => void;
}

export function RecenterButton({ onPress }: RecenterButtonProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      testID="map-nav-recenter-btn"
      style={[
        SHADOW.md,
        {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: isDarkColorScheme ? "#1E293B" : "white",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
        },
      ]}
    >
      <Ionicons name="navigate" size={22} color="#2563EB" />
    </TouchableOpacity>
  );
}
