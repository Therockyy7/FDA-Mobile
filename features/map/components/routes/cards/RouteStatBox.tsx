// features/map/components/routes/cards/RouteStatBox.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface RouteStatBoxProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}

export function RouteStatBox({ icon, label, value, valueColor }: RouteStatBoxProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 10,
        alignItems: "center",
      }}
    >
      <Ionicons name={icon as any} size={18} color="#64748B" />
      <Text
        style={{
          fontSize: 10,
          color: "#94A3B8",
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
          color: valueColor || "#1E293B",
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
