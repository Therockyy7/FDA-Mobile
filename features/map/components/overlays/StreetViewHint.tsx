// features/map/components/overlays/StreetViewHint.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";

interface StreetViewHintProps {
  visible: boolean;
}

export function StreetViewHint({ visible }: StreetViewHintProps) {
  if (!visible) return null;

  return (
    <View
      className="absolute top-20 right-4 rounded-2xl p-3 max-w-[200px] flex-row items-center gap-2 bg-amber-500"
      style={SHADOW.md}
      testID="map-overlay-streetview-hint"
    >
      <Ionicons name="eye" size={16} color="white" />
      <Text className="text-xs font-semibold text-white flex-1">
        Nhấn marker để xem Street View
      </Text>
    </View>
  );
}
