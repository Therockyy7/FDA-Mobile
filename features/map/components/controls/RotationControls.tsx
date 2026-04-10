// features/map/components/controls/RotationControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { OVERLAY_SHADOW } from "~/features/map/lib/map-ui-utils";

interface RotationControlsProps {
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export function RotationControls({ onRotateLeft, onRotateRight }: RotationControlsProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <View
      style={{
        backgroundColor: isDark ? "#1E293B" : "white",
        borderRadius: 20,
        ...OVERLAY_SHADOW,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#F1F5F9",
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
      <View style={{ height: 1, backgroundColor: isDark ? "#334155" : "#F1F5F9" }} />
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
