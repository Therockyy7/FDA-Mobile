// features/map/components/controls/ZoomControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <>
      {/* Zoom In */}
      <TouchableOpacity
        onPress={onZoomIn}
        testID="map-controls-zoom-in-btn"
        style={{
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color={isDark ? "#94A3B8" : "#1F2937"} />
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: isDark ? "#334155" : "#F1F5F9" }} />

      {/* Zoom Out */}
      <TouchableOpacity
        onPress={onZoomOut}
        testID="map-controls-zoom-out-btn"
        style={{
          width: 50,
          height: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="remove" size={24} color={isDark ? "#94A3B8" : "#1F2937"} />
      </TouchableOpacity>
    </>
  );
}
