// features/map/types/map-layers.types.ts

export type BaseMapType = "standard" | "satellite";

export interface OverlaySettings {
  flood: boolean;
  traffic: boolean;
  weather: boolean;
}

export interface OpacitySettings {
  flood: number; // 0-100
  weather: number; // 0-100
}

export interface MapLayerSettings {
  baseMap: BaseMapType;
  overlays: OverlaySettings;
  opacity: OpacitySettings;
}

// API Response types
export interface MapPreferencesResponse {
  success: boolean;
  message: string;
  data: MapLayerSettings;
}

// GeoJSON types for flood severity (FeatG30)
export interface FloodSeverityProperties {
  stationId: string;
  stationCode: string;
  stationName: string;
  waterLevel: number | null;
  unit: string;
  severity: "safe" | "caution" | "warning" | "critical" | "unknown";
  severityLevel: number;
  lastUpdated: string | null;
  status: string;
}

export interface FloodSeverityFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: FloodSeverityProperties;
}

export interface FloodSeverityMetadata {
  totalStations: number;
  generatedAt: string;
  bounds?: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  };
}

export interface FloodSeverityGeoJSON {
  type: "FeatureCollection";
  features: FloodSeverityFeature[];
  metadata: FloodSeverityMetadata;
}

// Severity color mapping
export const SEVERITY_COLORS = {
  safe: "#10B981", // Green
  caution: "#FBBF24", // Yellow
  warning: "#F97316", // Orange
  critical: "#EF4444", // Red
  unknown: "#64748B", // Gray
} as const;

export const SEVERITY_LABELS = {
  safe: "An toàn",
  caution: "Cẩn thận",
  warning: "Cảnh báo",
  critical: "Nguy hiểm",
  unknown: "Không xác định",
} as const;
