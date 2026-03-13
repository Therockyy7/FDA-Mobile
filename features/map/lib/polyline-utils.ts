// features/map/lib/polyline-utils.ts

import type {
  DecodedRoute,
  FloodWarningDto,
  FloodZoneProperties,
  LatLng,
  RouteFeatureProperties,
  RouteMetadata,
  RouteSafetyStatus,
  SafeRouteApiResponse,
} from "../types/safe-route.types";
import { SAFETY_STATUS_FROM_API } from "../types/safe-route.types";

/**
 * Map floodRiskScore to safety status.
 * 0 = safe, higher = more dangerous, capped at 100.
 */
function getStatusFromRiskScore(score: number): RouteSafetyStatus {
  if (score === 0) return "Safe";
  if (score <= 20) return "Caution";
  if (score < 100) return "Dangerous";
  return "Blocked";
}

/**
 * Convert GeoJSON [lng, lat] coordinates to LatLng[].
 */
export function geoJsonCoordsToLatLng(coords: number[][]): LatLng[] {
  return coords.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
}

/**
 * Parse the full GeoJSON FeatureCollection response from the API.
 */
export function parseRouteResponse(response: SafeRouteApiResponse): {
  primaryRoute: DecodedRoute | null;
  alternativeRoutes: DecodedRoute[];
  floodWarnings: FloodWarningDto[];
  metadata: RouteMetadata;
} {
  const overallStatus: RouteSafetyStatus =
    SAFETY_STATUS_FROM_API[response.metadata.safetyStatus] ?? "Caution";

  let primaryRoute: DecodedRoute | null = null;
  const alternativeRoutes: DecodedRoute[] = [];
  const floodWarnings: FloodWarningDto[] = [];

  for (const feature of response.features) {
    const props = feature.properties;

    if (props.name === "safeRoute" && feature.geometry.type === "LineString") {
      const routeProps = props as RouteFeatureProperties;
      primaryRoute = {
        coordinates: geoJsonCoordsToLatLng(
          feature.geometry.coordinates as number[][]
        ),
        distance: routeProps.distanceMeters,
        time: routeProps.durationSeconds * 1000, // convert to ms
        safetyStatus: getStatusFromRiskScore(routeProps.floodRiskScore),
        floodRiskScore: routeProps.floodRiskScore,
        instructions: routeProps.instructions,
        isPrimary: true,
      };
    } else if (
      (props.name.startsWith("alternativeRoute") ||
        props.name.startsWith("normalRoute")) &&
      feature.geometry.type === "LineString"
    ) {
      const routeProps = props as RouteFeatureProperties;
      alternativeRoutes.push({
        coordinates: geoJsonCoordsToLatLng(
          feature.geometry.coordinates as number[][]
        ),
        distance: routeProps.distanceMeters,
        time: routeProps.durationSeconds * 1000,
        safetyStatus: getStatusFromRiskScore(routeProps.floodRiskScore),
        floodRiskScore: routeProps.floodRiskScore,
        instructions: routeProps.instructions,
        isPrimary: false,
      });
    } else if (
      props.name === "floodZone" &&
      feature.geometry.type === "Polygon"
    ) {
      const zoneProps = props as FloodZoneProperties;
      const polygonRing = (feature.geometry.coordinates as number[][][])[0];
      floodWarnings.push({
        stationId: zoneProps.stationId,
        stationCode: zoneProps.stationCode,
        stationName: zoneProps.stationName,
        latitude: zoneProps.latitude,
        longitude: zoneProps.longitude,
        waterLevel: zoneProps.waterLevel,
        unit: zoneProps.unit,
        severity: zoneProps.severity,
        severityLevel: zoneProps.severityLevel,
        distanceFromRoute: zoneProps.distanceFromRouteMeters,
        polygonCoordinates: geoJsonCoordsToLatLng(polygonRing),
      });
    }
  }

  const metadata: RouteMetadata = {
    safetyStatus: overallStatus,
    totalFloodZones: response.metadata.totalFloodZones,
    alternativeRouteCount: response.metadata.alternativeRouteCount,
    generatedAt: response.metadata.generatedAt,
    startInFloodZone: response.metadata.startInFloodZone ?? false,
    endInFloodZone: response.metadata.endInFloodZone ?? false,
  };

  return { primaryRoute, alternativeRoutes, floodWarnings, metadata };
}

/**
 * Calculate a bounding region that fits all coordinates with padding.
 */
export function getRouteBounds(
  coordinates: LatLng[],
  padding = 0.01
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  if (coordinates.length === 0) {
    return {
      latitude: 16.065,
      longitude: 108.21,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  }

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: maxLat - minLat + padding * 2,
    longitudeDelta: maxLng - minLng + padding * 2,
  };
}

/**
 * Format distance in meters to human-readable Vietnamese string.
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format time in milliseconds to human-readable Vietnamese string.
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} phút`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
}
