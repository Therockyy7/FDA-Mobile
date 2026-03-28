// features/map/components/routes/cards/FloodZoneBanner.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface FloodZoneBannerProps {
  type: "start" | "end";
}

const MESSAGES = {
  start: "Điểm xuất phát đang nằm trong vùng ngập. Hãy cẩn thận khi di chuyển.",
  end: "Điểm đến đang nằm trong vùng ngập. Hãy cẩn thận khi đến nơi.",
};

export function FloodZoneBanner({ type }: FloodZoneBannerProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FEF3C7",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Ionicons name="warning" size={14} color="#D97706" />
      <Text style={{ fontSize: 12, color: "#92400E", flex: 1 }}>
        {MESSAGES[type]}
      </Text>
    </View>
  );
}
