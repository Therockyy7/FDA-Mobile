// features/map/components/stations/cards/StationStats.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { RADIUS, STATUS_BADGE } from "~/features/map/lib/map-ui-utils";

interface StationStatsProps {
  waterLevel: number | null;
  unit: string;
  alertLevel: string | null;
  severityColor: string;
  severityLabel: string;
  severityConfig: {
    name: "alert-circle" | "alert" | "information-circle" | "checkmark-circle";
  };
  colors: { cardBg: string; text: string; subtext: string };
}

export function StationStats({
  waterLevel,
  unit,
  alertLevel,
  severityColor,
  severityLabel,
  severityConfig,
  colors,
}: StationStatsProps) {
  return (
    <View style={styles.root}>
      {/* Water Level */}
      <View
        style={[
          styles.waterCard,
          { backgroundColor: colors.cardBg, borderColor: severityColor },
        ]}
      >
        {/* Left: value */}
        <View style={styles.leftCol}>
          <View style={styles.labelRow}>
            <Ionicons name="water" size={10} color={severityColor} />
            <Text style={[styles.label, { color: colors.subtext }]}>
              MỰC NƯỚC
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: severityColor }]}>
              {waterLevel !== null
                ? typeof waterLevel === "number"
                  ? waterLevel.toFixed(1)
                  : waterLevel
                : "—"}
            </Text>
            <Text style={[styles.unit, { color: severityColor }]}>{unit}</Text>
          </View>
        </View>

        {/* Right: alert pill */}
        <View
          style={[styles.alertPill, { backgroundColor: `${severityColor}18` }]}
        >
          {/* <View style={[styles.dot, { backgroundColor: severityColor }]} /> */}
          <Ionicons
            name={severityConfig.name}
            size={10}
            color={severityColor}
          />
          <Text style={[styles.alertText, { color: severityColor }]}>
            {alertLevel || severityLabel.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: 8 },
  waterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: RADIUS.chip,
    padding: 10,
    borderWidth: 1.5,
  },
  leftCol: { flex: 1 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  unit: {
    fontSize: 14,
    fontWeight: "700",
  },
  alertPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: STATUS_BADGE.borderRadius,
    paddingHorizontal: STATUS_BADGE.paddingHorizontal,
    paddingVertical: STATUS_BADGE.paddingVertical,
    gap: 4,
  },
  dot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
  },
  alertText: {
    fontSize: STATUS_BADGE.fontSize,
    fontWeight: STATUS_BADGE.fontWeight,
    letterSpacing: STATUS_BADGE.letterSpacing,
  },
});
