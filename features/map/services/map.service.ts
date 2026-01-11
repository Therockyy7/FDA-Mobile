// features/map/services/map.service.ts
import { apiClient } from "~/lib/api-client";
import type {
  FloodSeverityGeoJSON,
  MapLayerSettings,
  MapPreferencesResponse,
} from "../types/map-layers.types";

// Mock data for testing when API is not available
const MOCK_FLOOD_SEVERITY_DATA: FloodSeverityGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.2208, 16.0544], // Đà Nẵng - Sông Hàn
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440000",
        stationCode: "ST_DN_01",
        stationName: "Trạm Sông Hàn",
        waterLevel: 2.5,
        unit: "m",
        severity: "warning",
        severityLevel: 2,
        lastUpdated: "2026-01-10T10:30:00Z",
        status: "active",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.1893, 16.0678], // Đà Nẵng - Cầu Rồng
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440001",
        stationCode: "ST_DN_02",
        stationName: "Trạm Thuận Phước",
        waterLevel: 0.8,
        unit: "m",
        severity: "safe",
        severityLevel: 0,
        lastUpdated: "2026-01-10T10:28:00Z",
        status: "active",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.2142, 16.0398], // Đà Nẵng - Cầu Thuận Phước
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440002",
        stationCode: "ST_DN_03",
        stationName: "Trạm Thuận Phước",
        waterLevel: 3.2,
        unit: "m",
        severity: "critical",
        severityLevel: 3,
        lastUpdated: "2026-01-10T10:25:00Z",
        status: "active",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.2023, 16.0789], // Đà Nẵng - Ngũ Hành Sơn
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440003",
        stationCode: "ST_DN_04",
        stationName: "Trạm Ngũ Hành Sơn",
        waterLevel: 1.5,
        unit: "m",
        severity: "caution",
        severityLevel: 1,
        lastUpdated: "2026-01-10T10:20:00Z",
        status: "active",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [108.1756, 16.0456], // Đà Nẵng - Hải Châu
      },
      properties: {
        stationId: "550e8400-e29b-41d4-a716-446655440004",
        stationCode: "ST_DN_05",
        stationName: "Trạm Hải Châu",
        waterLevel: 0.5,
        unit: "m",
        severity: "safe",
        severityLevel: 0,
        lastUpdated: "2026-01-10T10:15:00Z",
        status: "active",
      },
    },
  ],
  metadata: {
    totalStations: 5,
    generatedAt: new Date().toISOString(),
    bounds: {
      minLat: 16.0,
      minLng: 108.1,
      maxLat: 16.1,
      maxLng: 108.3,
    },
  },
};

export const MapService = {
  /**
   * FeatG28: Get user's map layer preferences
   * Returns saved settings or defaults if not found
   */
  getMapLayerPreferences: async (): Promise<MapLayerSettings> => {
    const res = await apiClient.get<MapPreferencesResponse>(
      "/api/v1/preferences/map-layers"
    );
    return res.data.data;
  },

  /**
   * FeatG29: Update user's map layer preferences
   * Creates new record if doesn't exist, updates if exists
   */
  updateMapLayerPreferences: async (
    settings: MapLayerSettings
  ): Promise<void> => {
    await apiClient.put("/api/v1/preferences/map-layers", settings);
  },

  /**
   * FeatG30: Get flood severity layer data (GeoJSON)
   * Returns FeatureCollection with station locations and severity
   * @param bounds - Optional viewport bounding box: "minLat,minLng,maxLat,maxLng"
   * @param zoom - Optional map zoom level for optimization
   */
  getFloodSeverity: async (
    bounds?: string,
    zoom?: number
  ): Promise<FloodSeverityGeoJSON> => {
    try {
      const params = new URLSearchParams();
      if (bounds) params.append("bounds", bounds);
      if (zoom !== undefined) params.append("zoom", zoom.toString());

      const queryString = params.toString();
      const url = queryString
        ? `/api/v1/map/flood-severity?${queryString}`
        : "/api/v1/map/flood-severity";

      console.log("🌐 Calling API:", url);
      const res = await apiClient.get<FloodSeverityGeoJSON>(url);
      
      return res.data;
    } catch {
      // Fallback to mock data when API is not available
      console.log("⚠️ API not available, using mock flood severity data");
      
      // Filter mock data by bounds if provided
      if (bounds) {
        const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(Number);
        console.log("📍 Filtering mock data by bounds:", { minLat, minLng, maxLat, maxLng });
        
        const filteredFeatures = MOCK_FLOOD_SEVERITY_DATA.features.filter(feature => {
          const [lng, lat] = feature.geometry.coordinates;
          const isInBounds = lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
          console.log(`  - ${feature.properties.stationName}: lat=${lat}, lng=${lng}, inBounds=${isInBounds}`);
          return isInBounds;
        });
        
        console.log(`✅ Found ${filteredFeatures.length} markers in viewport`);
        
        return {
          ...MOCK_FLOOD_SEVERITY_DATA,
          features: filteredFeatures,
          metadata: {
            ...MOCK_FLOOD_SEVERITY_DATA.metadata,
            totalStations: filteredFeatures.length,
          },
        };
      }
      
      return MOCK_FLOOD_SEVERITY_DATA;
    }
  },
};