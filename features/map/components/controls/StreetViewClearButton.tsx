// features/map/components/controls/StreetViewClearButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface StreetViewClearButtonProps {
  onPress: () => void;
}

export function StreetViewClearButton({ onPress }: StreetViewClearButtonProps) {
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
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="eye-off" size={22} color="white" />
    </TouchableOpacity>
  );
}
