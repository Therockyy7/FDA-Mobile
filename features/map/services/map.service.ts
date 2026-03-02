// features/map/services/map.service.ts
import { apiClient } from "~/lib/api-client";
import type {
  FloodSeverityGeoJSON,
  FloodStatusParams,
  MapLayerSettings,
  MapPreferencesResponse
} from "../types/map-layers.types";

// Mock data for testing when API is not available
const MOCK_FLOOD_SEVERITY_DATA: FloodSeverityGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.2208, 16.0544],
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440000",
        stationCode: "ST_DN_01",
        stationName: "Trạm Sông Hàn",
        locationDesc: "Gần cầu Sông Hàn",
        roadName: "Đường Bạch Đằng",
        waterLevel: 2.5,
        distance: 30,
        sensorHeight: 43,
        unit: "m",
        measuredAt: "2026-01-10T10:30:00Z",
        severity: "warning",
        severityLevel: 2,
        stationStatus: "active",
        lastSeenAt: null,
        markerColor: "#F97316",
        alertLevel: "WARNING",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.1893, 16.0678],
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440001",
        stationCode: "ST_DN_02",
        stationName: "Trạm Thuận Phước",
        locationDesc: "Gần cầu Thuận Phước",
        roadName: "Đường Nguyễn Tất Thành",
        waterLevel: 0.8,
        distance: 15,
        sensorHeight: 35,
        unit: "m",
        measuredAt: "2026-01-10T10:28:00Z",
        severity: "safe",
        severityLevel: 0,
        stationStatus: "active",
        lastSeenAt: null,
        markerColor: "#10B981",
        alertLevel: "SAFE",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.2142, 16.0398],
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440002",
        stationCode: "ST_DN_03",
        stationName: "Trạm Cầu Rồng",
        locationDesc: "Phía Tây cầu Rồng",
        roadName: "Đường 2 tháng 9",
        waterLevel: 3.2,
        distance: 22,
        sensorHeight: 45,
        unit: "m",
        measuredAt: "2026-01-10T10:25:00Z",
        severity: "critical",
        severityLevel: 3,
        stationStatus: "active",
        lastSeenAt: null,
        markerColor: "#EF4444",
        alertLevel: "CRITICAL",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.2023, 16.0789],
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440003",
        stationCode: "ST_DN_04",
        stationName: "Trạm Ngũ Hành Sơn",
        locationDesc: "Gần núi Ngũ Hành Sơn",
        roadName: "Đường Trường Sa",
        waterLevel: 1.5,
        distance: 18,
        sensorHeight: 38,
        unit: "m",
        measuredAt: "2026-01-10T10:20:00Z",
        severity: "caution",
        severityLevel: 1,
        stationStatus: "active",
        lastSeenAt: null,
        markerColor: "#FBBF24",
        alertLevel: "CAUTION",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.1756, 16.0456],
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440004",
        stationCode: "ST_DN_05",
        stationName: "Trạm Hải Châu",
        locationDesc: "Trung tâm quận Hải Châu",
        roadName: "Đường Lê Duẩn",
        waterLevel: 0.5,
        distance: 12,
        sensorHeight: 32,
        unit: "m",
        measuredAt: "2026-01-10T10:15:00Z",
        severity: "safe",
        severityLevel: 0,
        stationStatus: "active",
        lastSeenAt: null,
        markerColor: "#10B981",
        alertLevel: "SAFE",
      },
    },
  ],
  metadata: {
    totalStations: 5,
    stationsWithData: 5,
    stationsNoData: 0,
    generatedAt: new Date().toISOString(),
    bounds: null,
  },
};

export const MapService = {
  getMapLayerPreferences: async (): Promise<MapLayerSettings> => {
    const res = await apiClient.get<MapPreferencesResponse>(
      "/api/v1/preferences/map-layers"
    );
    return res.data.data;
  },

  updateMapLayerPreferences: async (
    settings: MapLayerSettings
  ): Promise<void> => {
    await apiClient.put("/api/v1/preferences/map-layers", settings);
  },

  getFloodSeverity: async (
    params?: FloodStatusParams
  ): Promise<FloodSeverityGeoJSON> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.minLat !== undefined) queryParams.append("minLat", params.minLat.toString());
      if (params?.maxLat !== undefined) queryParams.append("maxLat", params.maxLat.toString());
      if (params?.minLng !== undefined) queryParams.append("minLng", params.minLng.toString());
      if (params?.maxLng !== undefined) queryParams.append("maxLng", params.maxLng.toString());
      if (params?.status) queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/api/map/current-status?${queryString}`
        : "/api/map/current-status";

   
      const res = await apiClient.get<{ success: boolean; message: string; data: FloodSeverityGeoJSON }>(url);
      
      return res.data.data;
    } catch {

      
      if (params?.minLat !== undefined && params?.maxLat !== undefined && 
          params?.minLng !== undefined && params?.maxLng !== undefined) {
        const { minLat, maxLat, minLng, maxLng } = params;
        
        const filteredFeatures = MOCK_FLOOD_SEVERITY_DATA.features.filter(feature => {
          const [lng, lat] = feature.geometry.coordinates;
          return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
        });
        
        return {
          ...MOCK_FLOOD_SEVERITY_DATA,
          features: filteredFeatures,
          metadata: {
            ...MOCK_FLOOD_SEVERITY_DATA.metadata,
            totalStations: filteredFeatures.length,
            stationsWithData: filteredFeatures.length,
            stationsNoData: 0,
          },
        };
      }
      
      return MOCK_FLOOD_SEVERITY_DATA;
    }
  },
};
