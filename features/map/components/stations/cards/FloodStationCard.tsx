// features/map/components/stations/cards/FloodStationCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useMapColors } from "~/features/map/lib/map-ui-utils";
import { RADIUS } from "~/lib/design-tokens";
import {
  FloodSeverityFeature,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from "~/features/map/types/map-layers.types";
import { StationFooter } from "./StationFooter";
import { StationStats } from "./StationStats";

interface FloodStationCardProps {
  station: FloodSeverityFeature;
  onClose: () => void;
  onViewDetails?: () => void;
}

function getSeverityIcon(severity: string) {
  if (severity === "critical") return "alert-circle" as const;
  if (severity === "warning") return "alert" as const;
  if (severity === "caution") return "information-circle" as const;
  return "checkmark-circle" as const;
}

export function FloodStationCard({
  station,
  onClose,
  onViewDetails,
}: FloodStationCardProps) {
  const colors = useMapColors();
  const { properties } = station;

  const severityColor =
    properties.markerColor ||
    SEVERITY_COLORS[properties.severity] ||
    SEVERITY_COLORS.unknown;
  const severityLabel =
    SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;
  const severityIcon = getSeverityIcon(properties.severity);

  return (
    <View testID="map-station-card" style={[styles.root, { backgroundColor: colors.card }]}>
      {/* Thin gradient header */}
      <LinearGradient
        colors={[severityColor, severityColor + "80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <MaterialCommunityIcons name="water" size={16} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {properties.stationName}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.code}>{properties.stationCode}</Text>
              {properties.roadName && (
                <>
                  <Text style={styles.metaSep}>·</Text>
                  <Ionicons
                    name="location"
                    size={10}
                    color="rgba(255,255,255,0.65)"
                  />
                  <Text style={styles.road} numberOfLines={1}>
                    {properties.roadName}
                  </Text>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={15} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tight body */}
      <View style={styles.body}>
        <StationStats
          waterLevel={properties.waterLevel}
          unit={properties.unit}
          alertLevel={properties.alertLevel}
          severityColor={severityColor}
          severityLabel={severityLabel}
          severityConfig={{ name: severityIcon }}
          colors={{ cardBg: colors.background, text: colors.text, subtext: colors.subtext }}
        />

        {/* <StationSensorInfo
          sensorHeight={properties.sensorHeight}
          distance={properties.distance}
          unit={properties.unit}
          colors={colors}
        /> */}

        <StationFooter
          measuredAt={properties.measuredAt}
          stationStatus={properties.stationStatus}
          severityColor={severityColor}
          onViewDetails={onViewDetails}
          colors={{ subtext: colors.subtext, muted: colors.muted }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: RADIUS.sheet,
    overflow: "hidden",
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "white",
    marginBottom: 1,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  code: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600" },
  metaSep: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  road: { fontSize: 11, color: "rgba(255,255,255,0.65)", flex: 1 },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: {
    padding: 10,
  },
});
