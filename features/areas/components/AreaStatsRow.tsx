
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { QuickStat } from "../types/areas-types";

interface AreaStatsRowProps {
  stats: QuickStat[];
}

export function AreaStatsRow({ stats }: AreaStatsRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
      }}
    >
      {stats.map((stat, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            backgroundColor: "#F9FAFB",
            padding: 10,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: stat.color,
            }}
          >
            {stat.count}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: "#6B7280",
              marginTop: 2,
              fontWeight: "600",
            }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
