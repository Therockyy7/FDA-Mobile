// features/map/components/stations/FloodZonePolygons.tsx
import React, { useMemo } from "react";
import { Polygon } from "react-native-maps";
import { useMapLayerSettings } from "../../hooks/useMapLayerSettings";
import {
  isPolygonFeature,
  type FloodZoneFeature,
} from "../../types/map-layers.types";

export function FloodZonePolygons() {
  const { floodSeverity, settings } = useMapLayerSettings();

  const zones = useMemo(() => {
    if (!settings.overlays.flood || !floodSeverity?.features?.length) return [];
    const polygons = floodSeverity.features.filter(
      (f): f is FloodZoneFeature => isPolygonFeature(f)
    );
    // console.log(`[FloodZonePolygons] total features: ${floodSeverity.features.length}, polygons: ${polygons.length}, geometry types: ${[...new Set(floodSeverity.features.map(f => f.geometry.type))]}`);
    return polygons;
  }, [settings.overlays.flood, floodSeverity?.features]);

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
            key={`flood-zone-${properties.stationId}`}
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
