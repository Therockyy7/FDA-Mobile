// features/map/components/controls/StreetViewClearButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { OVERLAY_SHADOW } from "~/features/map/lib/map-ui-utils";

interface StreetViewClearButtonProps {
  onPress: () => void;
}

export function StreetViewClearButton({ onPress }: StreetViewClearButtonProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#F59E0B",
        alignItems: "center",
        justifyContent: "center",
        ...OVERLAY_SHADOW,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="eye-off" size={22} color="white" />
    </TouchableOpacity>
  );
}
