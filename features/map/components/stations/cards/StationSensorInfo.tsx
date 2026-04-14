// features/map/components/stations/cards/StationSensorInfo.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { RADIUS } from "~/lib/design-tokens";

interface StationSensorInfoProps {
  sensorHeight: number | null;
  distance: number | null;
  unit: string;
  colors: { cardBg: string; text: string; subtext: string };
}

export function StationSensorInfo({ sensorHeight, distance, unit, colors }: StationSensorInfoProps) {
  if (sensorHeight === null && distance === null) return null;

  return (
    <View testID="map-station-sensor-info" style={styles.row}>
      {sensorHeight !== null && (
        <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
          <MaterialCommunityIcons name="arrow-expand-vertical" size={12} color={colors.subtext} />
          <Text style={[styles.label, { color: colors.subtext }]}>Cao</Text>
          <Text style={[styles.value, { color: colors.text }]}>{sensorHeight}{unit}</Text>
        </View>
      )}
      {distance !== null && (
        <View style={[styles.pill, { backgroundColor: colors.cardBg }]}>
          <MaterialCommunityIcons name="ruler" size={12} color={colors.subtext} />
          <Text style={[styles.label, { color: colors.subtext }]}>Cách</Text>
          <Text style={[styles.value, { color: colors.text }]}>{distance}{unit}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginBottom: 10 },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: RADIUS.chip,
    gap: 4,
  },
  label: { fontSize: 11, fontWeight: "500" },
  value: { fontSize: 13, fontWeight: "800", marginLeft: "auto" },
});