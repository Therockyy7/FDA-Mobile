// features/map/components/FloodSeverityMarkers.tsx
import React, { useMemo } from "react";
import { Marker } from "react-native-maps";
import { useMapSettings } from "../..//../stores/useMapSettingsStore";
import {
  isPointFeature,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  type FloodSeverityFeature,
  type FloodSeverityGeoJSON,
} from "../..//../types/map-layers.types";

interface FloodSeverityMarkersProps {
  floodSeverity: FloodSeverityGeoJSON | null;
  onMarkerPress?: (feature: FloodSeverityFeature) => void;
}

export function FloodSeverityMarkers({
  floodSeverity,
  onMarkerPress,
}: FloodSeverityMarkersProps) {
  const settings = useMapSettings();

  // Memoize and filter valid markers to prevent unnecessary re-renders
  const markers = useMemo(() => {
    if (!settings?.overlays?.flood || !floodSeverity?.features?.length) {
      return [];
    }

    // Filter to only Point features with valid coordinates
    return floodSeverity.features.filter(
      (feature): feature is FloodSeverityFeature => {
        if (!isPointFeature(feature)) return false;

        const { geometry } = feature;

        // Validate coordinates exist
        if (!geometry?.coordinates || geometry.coordinates.length < 2) {
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
          return false;
        }

        return true;
      },
    );
  }, [settings?.overlays?.flood, floodSeverity?.features]);

  // Don't render if no markers (keep stale markers visible during re-fetch)
  if (markers.length === 0) {
    return null;
  }

  return (
    <>
      {markers.map((feature) => {
        const { properties, geometry } = feature;
        const [longitude, latitude] = geometry.coordinates;

        const color =
          properties.markerColor ||
          SEVERITY_COLORS[properties.severity] ||
          SEVERITY_COLORS.unknown;
        const label =
          SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;

        return (
          <Marker
            key={`${properties.stationId}-${properties.severity}`}
            identifier={properties.stationId}
            coordinate={{ latitude, longitude }}
            pinColor={color}
            title={properties.stationName}
            description={`Mực nước: ${properties.waterLevel}${properties.unit} - ${label}`}
            onPress={() => onMarkerPress?.(feature)}
            tracksViewChanges={false}
          />
        );
      })}
    </>
  );
}
