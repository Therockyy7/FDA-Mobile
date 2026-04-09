// features/map/components/stations/FloodZonePolygons.tsx
import React, { useMemo } from "react";
import { Polygon } from "react-native-maps";
import { useMapSettings } from "../../../stores/useMapSettingsStore";
import {
  isPolygonFeature,
  type FloodSeverityGeoJSON,
  type FloodZoneFeature,
} from "../../../types/map-layers.types";

interface FloodZonePolygonsProps {
  floodSeverity: FloodSeverityGeoJSON | null;
}

export function FloodZonePolygons({ floodSeverity }: FloodZonePolygonsProps) {
  const settings = useMapSettings();

  const zones = useMemo(() => {
    if (!settings?.overlays?.flood || !floodSeverity?.features?.length) return [];
    return floodSeverity.features.filter(
      (f): f is FloodZoneFeature => isPolygonFeature(f)
    );
  }, [settings?.overlays?.flood, floodSeverity?.features]);

  if (zones.length === 0) return null;

  return (
    <>
      {zones.map((zone) => {
        const { properties, geometry } = zone;
        // GeoJSON Polygon: first ring is outer boundary
        const outerRing = geometry.coordinates[0];
        const coordinates = outerRing.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        }));

        return (
          <Polygon
            key={`flood-zone-${properties.stationId}-${properties.severityLevel}-${properties.fillColor}`}
            coordinates={coordinates}
            fillColor={hexToRgba(properties.fillColor, properties.fillOpacity)}
            strokeColor={hexToRgba(properties.fillColor, 0.8)}
            strokeWidth={2}
            tappable={false}
          />
        );
      })}
    </>
  );
}

/** Convert hex color + opacity to rgba string */
function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
