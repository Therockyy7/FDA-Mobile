// features/map/components/routes/direction/TransportModeButton.tsx
import React from "react";
import { TouchableOpacity } from "react-native";

interface TransportModeButtonProps {
  active: boolean;
  icon: React.ReactNode;
  onPress: () => void;
}

export const TransportModeButton = React.memo(function TransportModeButton({
  active,
  icon,
  onPress,
}: TransportModeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`px-2.5 py-1.5 rounded-full items-center justify-center ${active ? "bg-blue-600" : "bg-transparent"}`}
    >
      {icon}
    </TouchableOpacity>
  );
});
