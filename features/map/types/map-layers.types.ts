// features/map/types/map-layers.types.ts

export type BaseMapType = "standard" | "satellite" | "hybrid";

export interface OverlaySettings {
  flood: boolean;
  traffic: boolean;
  weather: boolean;
  communityReports: boolean;
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

// Flood zone polygon around stations with severity >= warning
export interface FloodZoneProperties {
  featureType: "floodZone";
  stationId: string;
  stationCode: string;
  stationName: string;
  severity: "warning" | "critical";
  severityLevel: number;
  waterLevel: number;
  fillColor: string;
  fillOpacity: number;
}

export interface FloodZoneFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][]; // array of rings, each ring is array of [lng, lat]
  };
  properties: FloodZoneProperties;
}

// Union type for all features in the flood FeatureCollection
export type FloodFeature = FloodSeverityFeature | FloodZoneFeature;

// Type guards
export function isPointFeature(f: FloodFeature): f is FloodSeverityFeature {
  return f.geometry.type === "Point";
}
export function isPolygonFeature(f: FloodFeature): f is FloodZoneFeature {
  return f.geometry.type === "Polygon";
}

export interface FloodSeverityMetadata {
  totalStations: number;
  floodZones?: number;
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
  features: FloodFeature[];
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
export type AreaStatus = "Critical" | "Warning" | "Caution" | "Safe" | "Unknown";

// Area status response from /api/v1/areas/{id}/status
export interface AreaStatusResponse {
  areaId: string;
  status: AreaStatus;
  severityLevel: number;
  summary?: string;
  contributingStations: ContributingStation[];
  evaluatedAt: string;
}

// Combined area with status for display
export interface AreaWithStatus extends Area {
  status: AreaStatus;
  severityLevel: number;
  summary?: string;
  contributingStations: ContributingStation[];
  evaluatedAt: string | null;
}

// Contributing station from area status API (internal)
interface ContributingStation {
  stationId: string;
  stationCode: string;
  distance: number;
  waterLevel: number;
  severity: string;
  weight: number;
}

// Area status color mapping
export const AREA_STATUS_COLORS: Record<AreaStatus, string> = {
  Critical: "#EF4444", // Đỏ
  Warning: "#F97316", // Cam
  Caution: "#FBBF24", // Vàng
  Safe: "#10B981", // Xanh
  Unknown: "#9CA3AF", // Xám
};

export const AREA_STATUS_LABELS: Record<AreaStatus, string> = {
  Critical: "Nguy hiểm",
  Warning: "Cảnh báo",
  Caution: "Theo dõi",
  Safe: "Bình thường",
  Unknown: "Không xác định",
};

export const AREA_STATUS_ICONS: Record<AreaStatus, string> = {
  Critical: "alert-circle",
  Warning: "warning",
  Caution: "eye",
  Safe: "checkmark-circle",
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

// ==================== SIGNALR TYPES ====================

/** Data payload from SignalR sensor update events */
export interface SensorUpdateData {
  stationId: string;
  stationCode: string;
  stationName: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  distance: number;
  sensorHeight: number;
  unit: string;
  status: number;
  severity: "safe" | "caution" | "warning" | "critical";
  severityLevel: 0 | 1 | 2 | 3;
  markerColor: string;
  alertLevel: "SAFE" | "CAUTION" | "WARNING" | "CRITICAL";
  measuredAt: string;
}

/** Wrapper payload from SignalR ReceiveSensorUpdate / ReceiveStationUpdate */
export interface SensorUpdatePayload {
  type: "sensor_update";
  timestamp: string;
  data: SensorUpdateData;
}
