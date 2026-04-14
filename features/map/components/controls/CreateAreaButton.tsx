// features/map/components/controls/CreateAreaButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { MAP_OVERLAY_LAYER_COLORS } from "~/lib/design-tokens";

interface CreateAreaButtonProps {
  onPress: () => void;
  testID?: string;
}

export function CreateAreaButton({ onPress, testID }: CreateAreaButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      testID={testID ?? "map-controls-create-area-btn"}
      accessibilityRole="button"
      accessibilityLabel="Tạo vùng mới"
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: MAP_OVERLAY_LAYER_COLORS.success,
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="add-circle" size={22} color="white" />
    </TouchableOpacity>
  );
}
