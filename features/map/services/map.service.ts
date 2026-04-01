// features/map/services/map.service.ts
import { apiClient } from "~/lib/api-client";
import type {
  FloodSeverityGeoJSON,
  FloodStatusParams,
  MapLayerSettings,
  MapPreferencesResponse,
} from "../types/map-layers.types";
import { MapServiceError } from "./map-service-error";

function buildFloodStatusQuery(params?: FloodStatusParams): string {
  const q = new URLSearchParams();
  if (params?.minLat !== undefined) q.append("minLat", params.minLat.toString());
  if (params?.maxLat !== undefined) q.append("maxLat", params.maxLat.toString());
  if (params?.minLng !== undefined) q.append("minLng", params.minLng.toString());
  if (params?.maxLng !== undefined) q.append("maxLng", params.maxLng.toString());
  if (params?.status) q.append("status", params.status);
  const qs = q.toString();
  return qs ? `/api/v1/map/current-status?${qs}` : "/api/v1/map/current-status";
}

export const MapService = {
  getMapLayerPreferences: async (): Promise<MapLayerSettings> => {
    try {
      const res = await apiClient.get<MapPreferencesResponse>(
        "/api/v1/preferences/map-layers",
      );
      return res.data.data;
    } catch (error: any) {
      throw new MapServiceError(
        error?.response?.data?.message || error?.message || "Failed to load map preferences",
        error?.response?.status,
      );
    }
  },

  updateMapLayerPreferences: async (settings: MapLayerSettings): Promise<void> => {
    try {
      await apiClient.put("/api/v1/preferences/map-layers", settings);
    } catch (error: any) {
      throw new MapServiceError(
        error?.response?.data?.message || error?.message || "Failed to save map preferences",
        error?.response?.status,
      );
    }
  },

  getFloodSeverity: async (params?: FloodStatusParams): Promise<FloodSeverityGeoJSON> => {
    try {
      const url = buildFloodStatusQuery(params);
      const res = await apiClient.get<{
        success: boolean;
        message: string;
        data: FloodSeverityGeoJSON;
      }>(url);
      return res.data.data;
    } catch (error: any) {
      throw new MapServiceError(
        error?.response?.data?.message || error?.message || "Failed to fetch flood severity",
        error?.response?.status,
      );
    }
  },
};
