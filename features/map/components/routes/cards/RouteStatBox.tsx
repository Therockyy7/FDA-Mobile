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

export function RouteStatBox({ icon, label, value, valueColor }: RouteStatBoxProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#334155" : "#F8FAFC",
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
      }}
    >
      <Ionicons name={icon as any} size={18} color={isDark ? "#94A3B8" : "#64748B"} />
      <Text
        style={{
          fontSize: 10,
          color: isDark ? "#64748B" : "#94A3B8",
          marginTop: 2,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: valueColor || (isDark ? "#F1F5F9" : "#1E2937"),
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
