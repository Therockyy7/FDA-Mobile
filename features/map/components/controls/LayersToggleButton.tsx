// features/map/components/controls/LayersToggleButton.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface LayersToggleButtonProps {
  onPress: () => void;
}

export function LayersToggleButton({ onPress }: LayersToggleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#007AFF",
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
    >
      <MaterialIcons name="layers" size={20} color="white" />
    </TouchableOpacity>
  );
}
