// features/map/components/overlays/StreetViewHint.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { CARD_SHADOW } from "~/features/map/lib/map-ui-utils";

interface StreetViewHintProps {
  visible: boolean;
}

export function StreetViewHint({ visible }: StreetViewHintProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 80,
        right: 16,
        backgroundColor: isDark ? "rgba(245,158,11,0.95)" : "rgba(245,158,11,0.95)",
        borderRadius: 16,
        padding: 12,
        ...CARD_SHADOW,
        maxWidth: 200,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons name="eye" size={16} color="white" />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: "white",
          flex: 1,
        }}
      >
        Nhấn marker để xem Street View
      </Text>
    </View>
  );
}
