// features/map/hooks/flood/useFloodData.ts
// Merges REST flood data (React Query) with SignalR real-time updates (Zustand)

import { useMemo } from "react";
import { useFloodRealtimeStore } from "../../stores/useFloodRealtimeStore";
import type {
  FloodSeverityFeature,
  FloodSeverityGeoJSON,
  FloodStatusParams,
  FloodZoneFeature,
  SensorUpdateData,
} from "../../types/map-layers.types";
import { useFloodSeverityQuery } from "../queries/useFloodSeverityQuery";

/**
 * Merges real-time Zustand updates into the GeoJSON REST response.
 * - Point features: updated in-place (realtime wins over REST).
 * - Polygon features: upserted from floodZone payload (geometry + properties replaced),
 *   or removed when floodZone is null (station back to safe/caution).
 * - New stations/polygons not in REST data are appended.
 */
function mergeRealtimeIntoGeoJSON(
  base: FloodSeverityGeoJSON | null | undefined,
  updates: Record<string, SensorUpdateData>,
): FloodSeverityGeoJSON | null {
  if (!base) return null;
  if (Object.keys(updates).length === 0) return base;

  // stationIds whose polygon should be removed (floodZone === null)
  const removePolygonIds = new Set(
    Object.values(updates)
      .filter((u) => u.floodZone === null)
      .map((u) => u.stationId),
  );

  // stationId → FloodZonePayload for upsert (floodZone !== null)
  const upsertPolygons = new Map(
    Object.values(updates)
      .filter((u) => u.floodZone !== null)
      .map((u) => [u.stationId, u.floodZone!]),
  );

  const existingPolygonIds = new Set(
    base.features
      .filter((f): f is FloodZoneFeature => f.geometry.type === "Polygon")
      .map((f) => f.properties.stationId),
  );

  // Process existing features
  const updatedFeatures = base.features
    .map((feature) => {
      if (feature.geometry.type === "Polygon") {
        const zone = feature as FloodZoneFeature;
        const stationId = zone.properties.stationId;

        if (removePolygonIds.has(stationId)) return null;

        const upsert = upsertPolygons.get(stationId);
        if (upsert) {
          return {
            type: "Feature",
            geometry: upsert.geometry,
            properties: {
              featureType: "floodZone" as const,
              stationId: upsert.stationId,
              stationCode: upsert.stationCode,
              stationName: upsert.stationName,
              severity: upsert.severity,
              severityLevel: upsert.severityLevel,
              waterLevel: upsert.waterLevel,
              fillColor: upsert.fillColor,
              fillOpacity: upsert.fillOpacity,
            },
          } as FloodZoneFeature;
        }

        return feature;
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
          stationStatus: update.stationStatus,
        },
      } as FloodSeverityFeature;
    })
    .filter((f) => f !== null);

  // Append new polygons for stations not yet in REST data
  const newPolygons: FloodZoneFeature[] = [];
  upsertPolygons.forEach((upsert, stationId) => {
    if (!existingPolygonIds.has(stationId)) {
      newPolygons.push({
        type: "Feature",
        geometry: upsert.geometry,
        properties: {
          featureType: "floodZone" as const,
          stationId: upsert.stationId,
          stationCode: upsert.stationCode,
          stationName: upsert.stationName,
          severity: upsert.severity,
          severityLevel: upsert.severityLevel,
          waterLevel: upsert.waterLevel,
          fillColor: upsert.fillColor,
          fillOpacity: upsert.fillOpacity,
        },
      });
    }
  });

  // Append new station Point features not present in REST data
  const knownStationIds = new Set(
    base.features
      .filter((f): f is FloodSeverityFeature => f.geometry.type === "Point")
      .map((f) => f.properties.stationId),
  );
  const newStations: FloodSeverityFeature[] = Object.values(updates)
    .filter((u) => !knownStationIds.has(u.stationId))
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
        stationStatus: update.stationStatus,
        lastSeenAt: update.measuredAt,
        markerColor: update.markerColor,
        alertLevel: update.alertLevel,
      },
    }));

  return {
    ...base,
    features: [...updatedFeatures, ...newPolygons, ...newStations],
    metadata: {
      ...base.metadata,
      totalStations: base.metadata.totalStations + newStations.length,
    },
  };
}

export function useFloodData(
  params: FloodStatusParams | null | undefined,
  enabled: boolean,
) {
  const {
    data: restData,
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
    fetchStatus,
  } = useFloodSeverityQuery(params ?? null, enabled);
  const realtimeUpdates = useFloodRealtimeStore((s) => s.updates);

  const floodSeverity = useMemo(
    () => mergeRealtimeIntoGeoJSON(restData, realtimeUpdates),
    [restData, realtimeUpdates],
  );

  return { floodSeverity, isLoading, isFetching, refetch, dataUpdatedAt, fetchStatus };
}
