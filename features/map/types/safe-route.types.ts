// features/map/types/safe-route.types.ts

import type { TransportMode } from "../components/routes/RouteDirectionPanel";

// ==================== ENUMS & CONSTANTS ====================

export type RouteProfile = "car" | "motorcycle" | "bike" | "foot";

export type RouteSafetyStatus = "Safe" | "Caution" | "Dangerous" | "Blocked";

// Map safetyStatus number from API → RouteSafetyStatus
export const SAFETY_STATUS_FROM_API: Record<number, RouteSafetyStatus> = {
  0: "Safe",
  1: "Caution",
  2: "Dangerous",
  3: "Blocked",
};

// Map UI transport mode → API route profile
export const TRANSPORT_MODE_TO_PROFILE: Record<TransportMode, RouteProfile> = {
  car: "car",
  motorbike: "motorcycle",
  bicycle: "bike",
  walk: "foot",
};

export const SAFETY_STATUS_COLORS: Record<RouteSafetyStatus, string> = {
  Safe: "#10B981",
  Caution: "#FBBF24",
  Dangerous: "#EF4444",
  Blocked: "#6B7280",
};

export const SAFETY_STATUS_LABELS: Record<RouteSafetyStatus, string> = {
  Safe: "An toàn",
  Caution: "Cẩn thận",
  Dangerous: "Nguy hiểm",
  Blocked: "Bị chặn",
};

export const SAFETY_STATUS_ICONS: Record<RouteSafetyStatus, string> = {
  Safe: "shield-checkmark",
  Caution: "warning",
  Dangerous: "alert-circle",
  Blocked: "close-circle",
};

// ==================== COORDINATE ====================

export interface LatLng {
  latitude: number;
  longitude: number;
}

// ==================== REQUEST ====================

export interface SafeRouteRequest {
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  routeProfile: RouteProfile;
  maxAlternatives: number;
  avoidFloodedAreas: boolean;
}

// ==================== GeoJSON API RESPONSE ====================

export interface GeoJsonInstruction {
  distance: number; // meters
  time: number; // milliseconds
  text: string;
}

// Route feature properties (safeRoute or alternativeRoute_N)
export interface RouteFeatureProperties {
  name: string;
  distanceMeters: number;
  durationSeconds: number;
  floodRiskScore: number;
  instructions: GeoJsonInstruction[];
}

// Flood zone feature properties
export interface FloodZoneProperties {
  name: "floodZone";
  stationId: string;
  stationCode: string;
  stationName: string;
  severity: "warning" | "critical";
  severityLevel: number;
  waterLevel: number;
  unit: string;
  latitude: number;
  longitude: number;
  distanceFromRouteMeters: number;
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "LineString" | "Polygon";
    coordinates: number[][] | number[][][];
  };
  properties: RouteFeatureProperties | FloodZoneProperties;
}

export interface SafeRouteApiResponse {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
  metadata: {
    safetyStatus: number;
    totalFloodZones: number;
    alternativeRouteCount: number;
    generatedAt: string;
    startInFloodZone: boolean;
    endInFloodZone: boolean;
  };
}

// API wrapper response
export interface SafeRouteResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SafeRouteApiResponse;
}

// ==================== DECODED (for map rendering) ====================

export interface DecodedRoute {
  coordinates: LatLng[];
  distance: number; // meters
  time: number; // milliseconds
  safetyStatus: RouteSafetyStatus;
  floodRiskScore: number;
  instructions: GeoJsonInstruction[];
  isPrimary: boolean;
}

export interface FloodWarningDto {
  stationId: string;
  stationCode: string;
  stationName: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  unit: string;
  severity: "warning" | "critical";
  severityLevel: number;
  distanceFromRoute: number;
  polygonCoordinates: LatLng[];
}

export interface RouteMetadata {
  safetyStatus: RouteSafetyStatus;
  totalFloodZones: number;
  alternativeRouteCount: number;
  generatedAt: string;
  startInFloodZone: boolean;
  endInFloodZone: boolean;
}
