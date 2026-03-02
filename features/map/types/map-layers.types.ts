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

// API params for flood status endpoint
export interface FloodStatusParams {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  status?: string;
}

// GeoJSON types for flood severity (FeatG30)
export interface FloodSeverityProperties {
  stationId: string;
  stationCode: string;
  stationName: string;
  locationDesc: string | null;
  roadName: string | null;
  waterLevel: number | null;
  distance: number | null;
  sensorHeight: number | null;
  unit: string;
  measuredAt: string | null;
  severity: "safe" | "caution" | "warning" | "critical" | "unknown";
  severityLevel: number;
  stationStatus: string;
  lastSeenAt: string | null;
  markerColor: string;
  alertLevel: string;
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
  stationsWithData?: number;
  stationsNoData?: number;
  generatedAt: string;
  bounds?: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  } | null;
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

// ==================== AREA TYPES ====================

// Area from API /api/v1/areas
export interface Area {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  addressText: string;
  createdAt?: string;
  updatedAt?: string;
}

// Area status types
export type AreaStatus = "Normal" | "Watch" | "Warning" | "Unknown";

// Contributing station from area status API
export interface ContributingStation {
  stationId: string; // UUID of the station
  stationCode: string;
  distance: number;
  waterLevel: number;
  severity: string;
  weight: number;
}

// Area status response from /api/v1/areas/{id}/status
export interface AreaStatusResponse {
  areaId: string;
  status: AreaStatus;
  severityLevel: number;
  summary: string;
  contributingStations: ContributingStation[];
  evaluatedAt: string;
}

// Combined area with status for display
export interface AreaWithStatus extends Area {
  status: AreaStatus;
  severityLevel: number;
  summary: string;
  contributingStations: ContributingStation[];
  evaluatedAt: string | null;
}

// Area status color mapping
export const AREA_STATUS_COLORS: Record<AreaStatus, string> = {
  Normal: "#10B981", // Green
  Watch: "#FBBF24", // Yellow
  Warning: "#EF4444", // Red
  Unknown: "#9CA3AF", // Gray
};

export const AREA_STATUS_LABELS: Record<AreaStatus, string> = {
  Normal: "Bình thường",
  Watch: "Theo dõi",
  Warning: "Cảnh báo",
  Unknown: "Không xác định",
};

export const AREA_STATUS_ICONS: Record<AreaStatus, string> = {
  Normal: "checkmark-circle",
  Watch: "eye",
  Warning: "warning",
  Unknown: "help-circle",
};

// ==================== AREA CREATION TYPES ====================

export interface CreateAreaRequest {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  addressText?: string;
}

export interface CreateAreaResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Area;
}
