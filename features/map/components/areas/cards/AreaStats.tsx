// features/map/components/areas/cards/AreaStats.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatTime } from "~/features/map/lib/formatters";
import { RADIUS } from "~/features/map/lib/map-ui-utils";

interface AreaStatsProps {
  radiusMeters: number;
  stationCount: number;
  evaluatedAt: string | null;
  colors: { cardBg: string; text: string; subtext: string };
}

export function AreaStats({ radiusMeters, stationCount, evaluatedAt, colors }: AreaStatsProps) {
  return (
    <View style={styles.row}>
      {/* Radius */}
      <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
        <MaterialCommunityIcons name="radius-outline" size={14} color={colors.subtext} />
        <View>
          <Text style={[styles.pillLabel, { color: colors.subtext }]}>Bán kính</Text>
          <Text style={[styles.pillValue, { color: colors.text }]}>
            {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)}km` : `${radiusMeters}m`}
          </Text>
        </View>
      </View>

      {/* Stations */}
      <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
        <MaterialCommunityIcons name="broadcast" size={14} color={colors.subtext} />
        <View>
          <Text style={[styles.pillLabel, { color: colors.subtext }]}>Trạm</Text>
          <Text style={[styles.pillValue, { color: colors.text }]}>{stationCount}</Text>
        </View>
      </View>

      {/* Updated */}
      <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
        <Ionicons name="time-outline" size={14} color={colors.subtext} />
        <View>
          <Text style={[styles.pillLabel, { color: colors.subtext }]}>Cập nhật</Text>
          <Text style={[styles.pillValue, { color: colors.text }]} numberOfLines={1}>
            {formatTime(evaluatedAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: RADIUS.chip,
    gap: 6,
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 1,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: "800",
  },
});