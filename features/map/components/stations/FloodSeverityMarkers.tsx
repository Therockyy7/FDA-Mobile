// features/map/components/FloodSeverityMarkers.tsx
import React, { useMemo } from "react";
import { Marker } from "react-native-maps";
import { useMapLayerSettings } from "../../hooks/useMapLayerSettings";
import {
    SEVERITY_COLORS,
    SEVERITY_LABELS,
    type FloodSeverityFeature,
} from "../../types/map-layers.types";

interface FloodSeverityMarkersProps {
  onMarkerPress?: (feature: FloodSeverityFeature) => void;
}

export function FloodSeverityMarkers({
  onMarkerPress,
}: FloodSeverityMarkersProps) {
  const { floodSeverity, settings, floodLoading } = useMapLayerSettings();

  // Memoize and filter valid markers to prevent unnecessary re-renders
  const markers = useMemo(() => {
    if (!settings.overlays.flood || !floodSeverity?.features?.length) {
      return [];
    }

    // Filter out features with invalid coordinates
    return floodSeverity.features.filter((feature) => {
      const { properties, geometry } = feature;

      // Validate coordinates exist
      if (!geometry?.coordinates || geometry.coordinates.length < 2) {
        console.warn(`⚠️ Invalid coordinates for ${properties.stationName}`);
        return false;
      }

      const [longitude, latitude] = geometry.coordinates;

      // Validate lat/lng are valid numbers
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        isNaN(latitude) ||
        isNaN(longitude)
      ) {
        console.warn(`⚠️ Invalid lat/lng for ${properties.stationName}`);
        return false;
      }

      return true;
    });
  }, [settings.overlays.flood, floodSeverity?.features]);

  // Don't render while loading or if no markers
  if (floodLoading || markers.length === 0) {
    return null;
  }


  return (
    <>
      {markers.map((feature) => {
        const { properties, geometry } = feature;
        const [longitude, latitude] = geometry.coordinates;

        const color =
          SEVERITY_COLORS[properties.severity] || SEVERITY_COLORS.unknown;
        const label =
          SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;

        return (
          <Marker
            key={properties.stationId}
            identifier={properties.stationId}
            coordinate={{ latitude, longitude }}
            pinColor={color}
            title={properties.stationName}
            description={`Mực nước: ${properties.waterLevel}${properties.unit} - ${label}`}
            onPress={() => onMarkerPress?.(feature)}
            tracksViewChanges={false} // Performance optimization - prevents crash
          />
        );
      })}
    </>
  );
}
