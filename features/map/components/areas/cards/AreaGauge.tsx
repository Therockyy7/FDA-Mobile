// features/map/components/areas/cards/AreaGauge.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { FLOOD_COLORS, RADIUS } from "~/lib/design-tokens";

interface AreaGaugeProps {
  maxWaterLevel: number;
  colors: { cardBg: string; text: string; subtext: string; border: string };
}

function getWaterLevelConfig(level: number) {
  if (level >= 40) return { color: FLOOD_COLORS.danger, label: "Nguy hiểm", icon: "alert-circle" };
  if (level >= 20) return { color: FLOOD_COLORS.warning, label: "Cảnh báo", icon: "warning" };
  if (level >= 10) return { color: FLOOD_COLORS.warning, label: "Theo dõi", icon: "eye" };
  return { color: FLOOD_COLORS.safe, label: "An toàn", icon: "checkmark-circle" };
}

export function AreaGauge({ maxWaterLevel, colors }: AreaGaugeProps) {
  const cfg = getWaterLevelConfig(maxWaterLevel);
  const fillPercent = Math.min((maxWaterLevel / 60) * 100, 100);

  return (
    <View testID="map-area-gauge" style={styles.row}>
      {/* Left: compact value */}
      <View style={[styles.valueBox, { backgroundColor: colors.cardBg }]}>
        <Ionicons name={cfg.icon as any} size={14} color={cfg.color} style={{ marginBottom: 4 }} />
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
          <Text style={[styles.value, { color: colors.text }]}>{maxWaterLevel}</Text>
          <Text style={[styles.unit, { color: colors.subtext }]}>cm</Text>
        </View>
        <Text style={[styles.cfgLabel, { color: cfg.color }]}>{cfg.label}</Text>
      </View>

      {/* Right: progress bar */}
      <View style={styles.progress}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: colors.subtext }]}>MỰC NƯỚC CAO NHẤT</Text>
          <Text style={[styles.progressPct, { color: colors.text }]}>{Math.round(fillPercent)}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${fillPercent}%`, backgroundColor: cfg.color }]} />
        </View>
        <View style={styles.scaleRow}>
          <Text style={[styles.scaleText, { color: colors.subtext }]}>0</Text>
          <Text style={[styles.scaleText, { color: colors.subtext }]}>30</Text>
          <Text style={[styles.scaleText, { color: colors.subtext }]}>60cm</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  valueBox: {
    width: 80,
    padding: 10,
    borderRadius: RADIUS.chip,
    alignItems: "center",
    flexShrink: 0,
  },
  value: { fontSize: 24, fontWeight: "900", lineHeight: 28 },
  unit: { fontSize: 12, fontWeight: "600" },
  cfgLabel: { fontSize: 11, fontWeight: "700", marginTop: 3 },
  progress: { flex: 1, justifyContent: "center", gap: 4 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  progressPct: { fontSize: 12, fontWeight: "800" },
  progressTrack: { height: 6, borderRadius: RADIUS.chip, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: RADIUS.chip },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },
  scaleText: { fontSize: 11, fontWeight: "600" },
});