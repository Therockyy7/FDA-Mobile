// features/map/components/controls/LayersToggleButton.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface LayersToggleButtonProps {
  onPress: () => void;
}

export function LayersToggleButton({ onPress }: LayersToggleButtonProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: isDark ? "#3B82F6" : "#007AFF",
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
    >
      <MaterialIcons name="layers" size={20} color="white" />
    </TouchableOpacity>
  );
}
