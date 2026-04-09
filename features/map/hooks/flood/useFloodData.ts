// features/map/hooks/flood/useFloodData.ts
// Merges REST flood data (React Query) with SignalR real-time updates (Zustand)

import { useMemo } from "react";
import { useFloodRealtimeStore } from "../../stores/useFloodRealtimeStore";
import type {
  FloodSeverityFeature,
  FloodSeverityGeoJSON,
  FloodZoneFeature,
  SensorUpdateData,
} from "../../types/map-layers.types";
import { SEVERITY_COLORS } from "../../types/map-layers.types";
import type { FloodStatusParams } from "../../types/map-layers.types";
import { useFloodSeverityQuery } from "../queries/useFloodSeverityQuery";

// Map sensor severity → floodZone fillColor (same palette as SEVERITY_COLORS)
const FLOOD_ZONE_SEVERITY_COLORS: Record<string, string> = {
  warning: SEVERITY_COLORS.warning,   // "#F97316"
  critical: SEVERITY_COLORS.critical, // "#EF4444"
};

/**
 * Merges real-time Zustand updates into the GeoJSON REST response.
 * - Existing stations are updated in-place (realtime wins over REST).
 * - New stations (not in REST result) are appended.
 * This is a pure function extracted from the old Redux applyRealtimeUpdate reducer.
 */
function mergeRealtimeIntoGeoJSON(
  base: FloodSeverityGeoJSON | null | undefined,
  updates: Record<string, SensorUpdateData>,
): FloodSeverityGeoJSON | null {
  if (!base) return null;
  if (Object.keys(updates).length === 0) return base;

  const updatedFeatures = base.features.map((feature) => {
    // Update FloodZone polygon color when its station's severity changes
    if (feature.geometry.type === "Polygon") {
      const zone = feature as FloodZoneFeature;
      const update = updates[zone.properties.stationId];
      if (!update) return feature;

      // If station severity dropped below warning, the zone should disappear —
      // server will remove it on next REST fetch. For now keep the polygon but
      // update its color to reflect the new severity.
      const newFillColor =
        FLOOD_ZONE_SEVERITY_COLORS[update.severity] ?? zone.properties.fillColor;

      return {
        ...zone,
        properties: {
          ...zone.properties,
          severity: update.severity as FloodZoneFeature["properties"]["severity"],
          severityLevel: update.severityLevel,
          waterLevel: update.waterLevel,
          fillColor: newFillColor,
        },
      } as FloodZoneFeature;
    }

    const f = feature as FloodSeverityFeature;
    const update = updates[f.properties.stationId];
    if (!update) return feature;

    return {
      ...f,
      geometry: {
        ...f.geometry,
        coordinates: [update.longitude, update.latitude] as [number, number],
      },
      properties: {
        ...f.properties,
        waterLevel: update.waterLevel,
        distance: update.distance,
        sensorHeight: update.sensorHeight,
        unit: update.unit,
        severity: update.severity,
        severityLevel: update.severityLevel,
        markerColor: update.markerColor,
        alertLevel: update.alertLevel,
        measuredAt: update.measuredAt,
      },
    } as FloodSeverityFeature;
  });

  // Append new stations not present in REST data
  const knownIds = new Set(
    base.features
      .filter((f): f is FloodSeverityFeature => f.geometry.type === "Point")
      .map((f) => f.properties.stationId),
  );
  const newFeatures: FloodSeverityFeature[] = Object.values(updates)
    .filter((u) => !knownIds.has(u.stationId))
    .map((update) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [update.longitude, update.latitude] as [number, number],
      },
      properties: {
        stationId: update.stationId,
        stationCode: update.stationCode,
        stationName: update.stationName,
        locationDesc: null,
        roadName: null,
        waterLevel: update.waterLevel,
        distance: update.distance,
        sensorHeight: update.sensorHeight,
        unit: update.unit,
        measuredAt: update.measuredAt,
        severity: update.severity,
        severityLevel: update.severityLevel,
        stationStatus: "active",
        lastSeenAt: null,
        markerColor: update.markerColor,
        alertLevel: update.alertLevel,
      },
    }));

  return {
    ...base,
    features: [...updatedFeatures, ...newFeatures],
    metadata: {
      ...base.metadata,
      totalStations: base.metadata.totalStations + newFeatures.length,
    },
  };
}

export function useFloodData(
  params: FloodStatusParams | null | undefined,
  enabled: boolean,
) {
  const { data: restData, isLoading, isFetching, refetch } = useFloodSeverityQuery(params ?? null, enabled);
  const realtimeUpdates = useFloodRealtimeStore((s) => s.updates);

  const floodSeverity = useMemo(
    () => mergeRealtimeIntoGeoJSON(restData, realtimeUpdates),
    [restData, realtimeUpdates],
  );

  return { floodSeverity, isLoading, isFetching, refetch };
}
