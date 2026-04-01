// features/map/components/stations/cards/FloodStationCard.tsx
import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  FloodSeverityFeature,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from "../../../types/map-layers.types";
import { StationHeader } from "./StationHeader";
import { StationStats } from "./StationStats";
import { StationSensorInfo } from "./StationSensorInfo";
import { StationFooter } from "./StationFooter";

interface FloodStationCardProps {
  station: FloodSeverityFeature;
  onClose: () => void;
  onViewDetails?: () => void;
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return { name: "alert-circle" as const, gradient: ["#EF4444", "#DC2626"] };
    case "warning":
      return { name: "alert" as const, gradient: ["#F97316", "#EA580C"] };
    case "caution":
      return {
        name: "information-circle" as const,
        gradient: ["#EAB308", "#CA8A04"],
      };
    default:
      return { name: "checkmark-circle" as const, gradient: ["#22C55E", "#16A34A"] };
  }
}

export function FloodStationCard({
  station,
  onClose,
  onViewDetails,
}: FloodStationCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const { properties } = station;

  const severityColor =
    properties.markerColor ||
    SEVERITY_COLORS[properties.severity] ||
    SEVERITY_COLORS.unknown;
  const severityLabel =
    SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  const severityConfig = getSeverityIcon(properties.severity);

  return (
    <View style={{ flex: 1 }}>
      {/* Top gradient strip */}
      <View style={{ height: 4, backgroundColor: severityColor }} />

      <View style={{ padding: 16 }}>
        <StationHeader
          stationName={properties.stationName}
          stationCode={properties.stationCode}
          severityColor={severityColor}
          onClose={onClose}
          colors={colors}
        />

        {/* Location Info */}
        {(properties.roadName || properties.locationDesc) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 12,
              backgroundColor: colors.cardBg,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Ionicons
              name="location"
              size={16}
              color={colors.subtext}
              style={{ marginTop: 2 }}
            />
            <View style={{ marginLeft: 8, flex: 1 }}>
              {properties.roadName && (
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
                  {properties.roadName}
                </Text>
              )}
              {properties.locationDesc && (
                <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 2 }}>
                  {properties.locationDesc}
                </Text>
              )}
            </View>
          </View>
        )}

        <StationStats
          waterLevel={properties.waterLevel}
          unit={properties.unit}
          alertLevel={properties.alertLevel}
          severityColor={severityColor}
          severityLabel={severityLabel}
          severityConfig={severityConfig}
          colors={colors}
        />

        <StationSensorInfo
          sensorHeight={properties.sensorHeight}
          distance={properties.distance}
          unit={properties.unit}
          colors={colors}
        />

        <StationFooter
          measuredAt={properties.measuredAt}
          stationStatus={properties.stationStatus}
          severityColor={severityColor}
          onViewDetails={onViewDetails}
          colors={colors}
        />
      </View>
    </View>
  );
}

export default React.memo(FloodStationCard, (prevProps, nextProps) => {
  const prev = prevProps.station?.properties;
  const next = nextProps.station?.properties;
  return (
    prev?.stationId === next?.stationId &&
    prev?.waterLevel === next?.waterLevel &&
    prev?.severity === next?.severity &&
    prev?.measuredAt === next?.measuredAt
  );
});
