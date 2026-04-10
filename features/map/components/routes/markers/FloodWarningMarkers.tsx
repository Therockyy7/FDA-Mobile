// features/map/components/routes/FloodWarningMarkers.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { Marker, Polygon } from "react-native-maps";
import type { FloodWarningDto } from "~/features/map/types/safe-route.types";
import { CARD_SHADOW } from "~/features/map/lib/map-ui-utils";

interface FloodWarningMarkersProps {
  warnings: FloodWarningDto[];
}

const CRITICAL_COLORS = {
  fill: "rgba(239, 68, 68, 0.15)",
  stroke: "rgba(239, 68, 68, 0.6)",
  bg: "#EF4444",
  border: "#B91C1C",
};
const WARNING_COLORS = {
  fill: "rgba(249, 115, 22, 0.15)",
  stroke: "rgba(249, 115, 22, 0.6)",
  bg: "#F97316",
  border: "#C2410C",
};

export function FloodWarningMarkers({ warnings }: FloodWarningMarkersProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

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
        const c = isCritical ? CRITICAL_COLORS : WARNING_COLORS;

        return (
          <React.Fragment key={warning.stationId}>
            {warning.polygonCoordinates.length > 0 && (
              <Polygon
                coordinates={warning.polygonCoordinates}
                fillColor={c.fill}
                strokeColor={c.stroke}
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
                style={[
                  CARD_SHADOW,
                  {
                    backgroundColor: isDark ? c.border : c.bg,
                    borderRadius: 12,
                    padding: 6,
                    borderWidth: 2,
                    borderColor: isDark ? c.bg : c.border,
                  },
                ]}
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
