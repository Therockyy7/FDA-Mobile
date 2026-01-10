// features/map/components/FloodSeverityMarkers.tsx
import React from "react";
import { Marker } from "react-native-maps";
import { useMapLayerSettings } from "../hooks/useMapLayerSettings";
import {
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  type FloodSeverityFeature,
} from "../types/map-layers.types";

interface FloodSeverityMarkersProps {
  onMarkerPress?: (feature: FloodSeverityFeature) => void;
}

export function FloodSeverityMarkers({ onMarkerPress }: FloodSeverityMarkersProps) {
  const { floodSeverity, settings } = useMapLayerSettings();

  // DEBUG: Check if component is rendering
  console.log("🔍 FloodSeverityMarkers:", {
    floodEnabled: settings.overlays.flood,
    hasData: !!floodSeverity,
    featureCount: floodSeverity?.features?.length || 0,
  });

  // Don't render if flood layer is disabled or no data
  if (!settings.overlays.flood || !floodSeverity?.features?.length) {
    console.log("⏭️ FloodSeverityMarkers: Skipping render");
    return null;
  }

  console.log("✅ FloodSeverityMarkers: Rendering", floodSeverity.features.length, "markers");

  return (
    <>
      {floodSeverity.features.map((feature) => {
        const { properties, geometry } = feature;
        const [longitude, latitude] = geometry.coordinates;
        const color = SEVERITY_COLORS[properties.severity] || SEVERITY_COLORS.unknown;
        const label = SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;

        console.log(`📍 Marker: ${properties.stationName} at lat=${latitude}, lng=${longitude}`);

        return (
          <Marker
            key={properties.stationId}
            coordinate={{ latitude, longitude }}
            pinColor={color}
            title={properties.stationName}
            description={`Mực nước: ${properties.waterLevel}${properties.unit} - ${label}`}
            onPress={() => onMarkerPress?.(feature)}
          />
        );
      })}
    </>
  );
}
