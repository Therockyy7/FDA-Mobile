// features/map/components/routes/FloodWarningMarkers.tsx

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Marker, Polygon } from "react-native-maps";
import type { FloodWarningDto } from "../../types/safe-route.types";

interface FloodWarningMarkersProps {
  warnings: FloodWarningDto[];
}

export function FloodWarningMarkers({ warnings }: FloodWarningMarkersProps) {
  if (warnings.length === 0) return null;

  // Deduplicate by stationId
  const uniqueStations = new Map<string, FloodWarningDto>();
  for (const w of warnings) {
    if (!uniqueStations.has(w.stationId)) {
      uniqueStations.set(w.stationId, w);
    }
  }

  return (
    <>
      {Array.from(uniqueStations.values()).map((warning) => {
        const isCritical = warning.severity === "critical";
        const fillColor = isCritical
          ? "rgba(239, 68, 68, 0.15)"
          : "rgba(249, 115, 22, 0.15)";
        const strokeColor = isCritical
          ? "rgba(239, 68, 68, 0.6)"
          : "rgba(249, 115, 22, 0.6)";
        const bgColor = isCritical ? "#EF4444" : "#F97316";
        const borderColor = isCritical ? "#B91C1C" : "#C2410C";

        return (
          <React.Fragment key={warning.stationId}>
            {warning.polygonCoordinates.length > 0 && (
              <Polygon
                coordinates={warning.polygonCoordinates}
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={2}
              />
            )}

            <Marker
              coordinate={{
                latitude: warning.latitude,
                longitude: warning.longitude,
              }}
              title={warning.stationName}
              description={`Mực nước: ${warning.waterLevel} ${warning.unit} - ${isCritical ? "Nguy hiểm" : "Cảnh báo"}`}
              tracksViewChanges={false}
            >
              <View
                style={{
                  backgroundColor: bgColor,
                  borderRadius: 999,
                  padding: 6,
                  borderWidth: 2,
                  borderColor: borderColor,
                  shadowColor: bgColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons
                  name={isCritical ? "alert-circle" : "warning"}
                  size={16}
                  color="white"
                />
              </View>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
}
