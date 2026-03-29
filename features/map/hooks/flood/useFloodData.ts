// features/map/hooks/flood/useFloodData.ts
// Merges REST flood data (React Query) with SignalR real-time updates (Zustand)

import { useMemo } from "react";
import { useFloodRealtimeStore } from "../../stores/useFloodRealtimeStore";
import type {
  FloodSeverityFeature,
  FloodSeverityGeoJSON,
  SensorUpdateData,
} from "../../types/map-layers.types";
import type { FloodStatusParams } from "../../types/map-layers.types";
import { useFloodSeverityQuery } from "../queries/useFloodSeverityQuery";

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
    if (feature.geometry.type !== "Point") return feature;
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
