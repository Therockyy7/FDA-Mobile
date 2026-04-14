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

export const FloodZoneBanner = React.memo(function FloodZoneBanner({ type }: FloodZoneBannerProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View
      className="flex-row items-center gap-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg px-2.5 py-2"
      testID="map-route-floodzone-banner"
    >
      <Ionicons name="warning" size={14} color={isDarkColorScheme ? "#FBBF24" : "#D97706"} />
      <Text className="text-xs text-amber-800 dark:text-amber-300 flex-1">
        {MESSAGES[type]}
      </Text>
    </View>
  );
});
