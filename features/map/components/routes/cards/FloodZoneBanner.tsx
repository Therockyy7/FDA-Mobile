// features/map/components/routes/cards/FloodZoneBanner.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface FloodZoneBannerProps {
  type: "start" | "end";
}

const MESSAGES = {
  start: "Điểm xuất phát đang nằm trong vùng ngập. Hãy cẩn thận khi di chuyển.",
  end: "Điểm đến đang nằm trong vùng ngập. Hãy cẩn thận khi đến nơi.",
};

export function FloodZoneBanner({ type }: FloodZoneBannerProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: isDark ? "rgba(254,243,199,0.15)" : "#FEF3C7",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Ionicons name="warning" size={14} color={isDark ? "#FBBF24" : "#D97706"} />
      <Text style={{ fontSize: 12, color: isDark ? "#FCD34D" : "#92400E", flex: 1 }}>
        {MESSAGES[type]}
      </Text>
    </View>
  );
}
