// features/map/components/controls/CreateAreaButton.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

interface CreateAreaButtonProps {
  onPress: () => void;
}

export function CreateAreaButton({ onPress }: CreateAreaButtonProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: isDark ? "#10B981" : "#10B981",
        alignItems: "center",
        justifyContent: "center",
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="add-circle" size={22} color="white" />
    </TouchableOpacity>
  );
}
