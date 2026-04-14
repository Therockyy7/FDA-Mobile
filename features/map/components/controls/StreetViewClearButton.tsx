// features/map/components/controls/StreetViewClearButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { SHADOW } from "~/lib/design-tokens";

interface StreetViewClearButtonProps {
  onPress: () => void;
}

export function StreetViewClearButton({ onPress }: StreetViewClearButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      testID="map-controls-streetview-clear-btn"
      accessibilityRole="button"
      accessibilityLabel="Thoát chế độ Street View"
      style={[
        SHADOW.md,
        {
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#F59E0B",
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
      activeOpacity={0.8}
    >
      <Ionicons name="eye-off" size={22} color="white" />
    </TouchableOpacity>
  );
}
