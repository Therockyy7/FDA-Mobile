// features/map/components/controls/CreateAreaButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface CreateAreaButtonProps {
  onPress: () => void;
}

export function CreateAreaButton({ onPress }: CreateAreaButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#10B981",
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="add-circle" size={22} color="white" />
    </TouchableOpacity>
  );
}
