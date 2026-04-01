// features/map/components/controls/ZoomControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <>
      {/* Zoom In */}
      <TouchableOpacity
        onPress={onZoomIn}
        style={{
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color="#1F2937" />
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: "#F1F5F9" }} />

      {/* Zoom Out */}
      <TouchableOpacity
        onPress={onZoomOut}
        style={{
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={24} color="#1F2937" />
      </TouchableOpacity>
    </>
  );
}
