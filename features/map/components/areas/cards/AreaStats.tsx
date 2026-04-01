// features/map/components/areas/cards/AreaStats.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatTime } from "../../../lib/formatters";

interface AreaStatsProps {
  radiusMeters: number;
  stationCount: number;
  evaluatedAt: string | null;
  colors: {
    cardBg: string;
    text: string;
    subtext: string;
    border: string;
  };
}

export function AreaStats({
  radiusMeters,
  stationCount,
  evaluatedAt,
  colors,
}: AreaStatsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
      {/* Radius */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.cardBg,
          padding: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons name="radius-outline" size={20} color={colors.subtext} />
        <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 4 }}>
          Bán kính
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
          {radiusMeters >= 1000
            ? `${(radiusMeters / 1000).toFixed(1)} km`
            : `${radiusMeters} m`}
        </Text>
      </View>

      {/* Stations */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.cardBg,
          padding: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons name="broadcast" size={20} color={colors.subtext} />
        <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 4 }}>
          Trạm theo dõi
        </Text>
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
          {stationCount}
        </Text>
      </View>

      {/* Updated */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.cardBg,
          padding: 12,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Ionicons name="time-outline" size={20} color={colors.subtext} />
        <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 4 }}>
          Cập nhật
        </Text>
        <Text
          style={{ fontSize: 12, fontWeight: "700", color: colors.text }}
          numberOfLines={1}
        >
          {formatTime(evaluatedAt)}
        </Text>
      </View>
    </View>
  );
}
