// features/map/components/controls/RotationControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface RotationControlsProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export function RotationControls({ onRotateLeft, onRotateRight }: RotationControlsProps) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <TouchableOpacity
        onPress={onRotateLeft}
        style={{
          width: 50,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="return-up-back" size={20} color="#3B82F6" />
      </TouchableOpacity>
      <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />
      <TouchableOpacity
        onPress={onRotateRight}
        style={{
          width: 50,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="return-up-forward"
          size={20}
          color="#3B82F6"
        />
      </TouchableOpacity>
    </View>
  );
}
