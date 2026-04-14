// features/map/components/controls/LayersToggleButton.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { MAP_OVERLAY_LAYER_COLORS } from "~/lib/design-tokens";

interface LayersToggleButtonProps {
  onPress: () => void;
  testID?: string;
}

export function LayersToggleButton({ onPress, testID }: LayersToggleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      testID={testID ?? "map-controls-layers-btn"}
      accessibilityRole="button"
      accessibilityLabel="Mở bảng lớp bản đồ"
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: MAP_OVERLAY_LAYER_COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
    >
      <MaterialIcons name="layers" size={20} color="white" />
    </TouchableOpacity>
  );
}
