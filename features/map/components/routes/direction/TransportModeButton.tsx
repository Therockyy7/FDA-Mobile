// features/map/components/routes/direction/TransportModeButton.tsx
import React from "react";
import { TouchableOpacity } from "react-native";

interface TransportModeButtonProps {
  active: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}

export function TransportModeButton({ active, icon, onPress }: TransportModeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? "#2563EB" : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </TouchableOpacity>
  );
}
