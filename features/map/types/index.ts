// features/map/types/index.ts — barrel export for all types

// Area
export type { CreationOption } from "./area.types";
export type { SearchResult } from "./area.types";

// Map data
export type { SensorStatus, Sensor, FloodZone, FloodRoute } from "./map-data.types";

// Map display
export type { MapType, ViewMode } from "./map-display.types";

// Map layers
export type {
  BaseMapType,
  OverlaySettings,
  OpacitySettings,
  MapLayerSettings,
  MapPreferencesResponse,
  FloodStatusParams,
  FloodSeverityProperties,
  FloodSeverityFeature,
  FloodZoneProperties,
  FloodZoneFeature,
  FloodFeature,
  FloodSeverityMetadata,
  FloodSeverityGeoJSON,
  Area,
  AreaStatus,
  AreaStatusResponse,
  AreaWithStatus,
  CreateAreaRequest,
  CreateAreaResponse,
  SensorUpdateData,
  SensorUpdatePayload,
} from "./map-layers.types";
export {
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  AREA_STATUS_COLORS,
  AREA_STATUS_LABELS,
  AREA_STATUS_ICONS,
} from "./map-layers.types";

// Map viewport
export type { MapRegion, ViewportBounds, MapZoomMode } from "./map-viewport.types";

// Navigation
export type { VoiceLevel } from "./navigation.types";
export type { UseNavigationParams } from "./navigation.types";

// Routing
export type { TransportMode, PickingTarget, PlacePrediction, PlaceDetail } from "./routing.types";
export type { RouteDirectionPanelProps } from "./routing.types";

// Safe route
export type {
  RouteSafetyStatus,
  LatLng,
  SafeRouteRequest,
  GeoJsonInstruction,
  RouteFeatureProperties,
  RouteFloodZoneProperties,
  GeoJsonFeature,
  SafeRouteApiResponse,
  SafeRouteResponse,
  DecodedRoute,
  FloodWarningDto,
  RouteMetadata,
} from "./safe-route.types";
export {
  SAFETY_STATUS_FROM_API,
  TRANSPORT_MODE_TO_PROFILE,
  SAFETY_STATUS_COLORS,
  SAFETY_STATUS_LABELS,
  SAFETY_STATUS_ICONS,
} from "./safe-route.types";
