// features/map/components/areas/cards/AreaStationChips.tsx
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { RADIUS, STATUS_BADGE } from "~/features/map/lib/map-ui-utils";

interface Station {
  stationCode: string;
  waterLevel: number;
  severity: string;
}

interface AreaStationChipsProps {
  stations: Station[];
  colors: { cardBg: string; text: string; subtext: string };
}

function severityColor(severity: string) {
  if (severity === "critical") return "#EF4444";
  if (severity === "warning") return "#F97316";
  return "#10B981";
}

export function AreaStationChips({ stations, colors }: AreaStationChipsProps) {
  if (stations.length === 0) return null;

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Trạm ảnh hưởng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {stations.slice(0, 4).map((s, i) => {
          const c = severityColor(s.severity);
          return (
            <View key={i} style={[styles.chip, { backgroundColor: colors.cardBg }]}>
              <View style={[styles.dot, { backgroundColor: c }]} />
              <Text style={[styles.code, { color: colors.text }]}>{s.stationCode}</Text>
              <Text style={[styles.level, { color: c }]}>{s.waterLevel}cm</Text>
            </View>
          );
        })}
        {stations.length > 4 && (
          <View style={[styles.chip, styles.moreChip, { backgroundColor: colors.cardBg }]}>
            <Ionicons name="add" size={12} color={colors.subtext} />
            <Text style={[styles.code, { color: colors.subtext }]}>+{stations.length - 4}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.chip,
    gap: 5,
  },
  moreChip: {
    minWidth: 40,
    justifyContent: "center",
  },
  dot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
  },
  code: {
    fontSize: 12,
    fontWeight: "700",
  },
  level: {
    fontSize: 11,
    fontWeight: "600",
  },
});