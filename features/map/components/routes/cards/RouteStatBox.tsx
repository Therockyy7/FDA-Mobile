// features/map/components/routes/cards/RouteStatBox.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface RouteStatBoxProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}

export const RouteStatBox = React.memo(function RouteStatBox({ icon, label, value, valueColor }: RouteStatBoxProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-xl p-2.5 items-center">
      <Ionicons name={icon as any} size={18} color={isDarkColorScheme ? "#94A3B8" : "#64748B"} />
      <Text className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
        {label}
      </Text>
      <Text
        style={{ fontSize: 14, fontWeight: "700", marginTop: 2, color: valueColor || undefined }}
        className={valueColor ? undefined : "text-slate-800 dark:text-slate-100"}
      >
        {value}
      </Text>
    </View>
  );
});
