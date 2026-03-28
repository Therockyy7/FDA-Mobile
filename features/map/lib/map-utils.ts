// features/map/lib/map-utils.ts
import type { MapRegion, MapZoomMode, ViewportBounds } from "../types/map-viewport.types";
export type { MapRegion, MapZoomMode, ViewportBounds };

export function getStatusColor(status: "safe" | "warning" | "danger") {
  switch (status) {
    case "safe":
      return {
        main: "#10B981",
        bg: "#D1FAE5",
        text: "#065F46",
      };
    case "warning":
      return {
        main: "#F59E0B",
        bg: "#FEF3C7",
        text: "#92400E",
      };
    case "danger":
      return {
        main: "#EF4444",
        bg: "#FEE2E2",
        text: "#991B1B",
      };
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as NodeJS.Timeout;
  };
}

// Throttle function - ensures function is called at most once per interval
// Unlike debounce, throttle guarantees execution at regular intervals
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args; // Store latest args to call after throttle ends
    }
  };
}


// ==================== BUFFER ZONE STRATEGY ====================
// Load data with a 20% buffer around the visible viewport.
// Only re-fetch when the viewport moves outside the buffered zone.

const BUFFER_RATIO = 0.2; // 20% extra on each side

/**
 * Calculate viewport bounds with a buffer zone around the visible region.
 * The buffer ensures we have data ready before the user scrolls to the edge.
 */
export function getBufferedBounds(region: MapRegion): ViewportBounds {
  const latBuffer = region.latitudeDelta * BUFFER_RATIO;
  const lngBuffer = region.longitudeDelta * BUFFER_RATIO;

  return {
    minLat: region.latitude - region.latitudeDelta / 2 - latBuffer,
    maxLat: region.latitude + region.latitudeDelta / 2 + latBuffer,
    minLng: region.longitude - region.longitudeDelta / 2 - lngBuffer,
    maxLng: region.longitude + region.longitudeDelta / 2 + lngBuffer,
  };
}

/**
 * Check if the current viewport is still within the previously loaded buffer zone.
 * Returns true if we need to fetch new data (viewport escaped the buffer).
 */
export function isViewportOutsideBuffer(
  currentRegion: MapRegion,
  loadedBounds: ViewportBounds | null
): boolean {
  if (!loadedBounds) return true;

  // Current viewport edges (without buffer)
  const viewMinLat = currentRegion.latitude - currentRegion.latitudeDelta / 2;
  const viewMaxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2;
  const viewMinLng = currentRegion.longitude - currentRegion.longitudeDelta / 2;
  const viewMaxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2;

  // Check if any edge of the visible viewport is outside the loaded buffer
  return (
    viewMinLat < loadedBounds.minLat ||
    viewMaxLat > loadedBounds.maxLat ||
    viewMinLng < loadedBounds.minLng ||
    viewMaxLng > loadedBounds.maxLng
  );
}

// ==================== ZOOM LEVEL STRATEGY ====================

/**
 * Approximate zoom level from latitudeDelta.
 * Google Maps zoom levels: 0 (world) to 21 (building).
 * latitudeDelta ~= 360 / 2^zoom
 */
export function getZoomLevel(latitudeDelta: number): number {
  return Math.round(Math.log2(360 / latitudeDelta));
}


/**
 * Determine the display mode based on zoom level:
 * - cluster (zoom < 10): Show clustered markers, fewer details
 * - individual (zoom 10-13): Show individual markers with SignalR
 * - detailed (zoom > 13): Show markers + flood road lines with SignalR
 */
export function getZoomMode(latitudeDelta: number): MapZoomMode {
  const zoom = getZoomLevel(latitudeDelta);
  if (zoom < 10) return "cluster";
  if (zoom <= 13) return "individual";
  return "detailed";
}

// Legacy function kept for backwards compatibility
export function shouldFetchNewMarkers(
  newRegion: MapRegion,
  lastRegion: MapRegion | null
): boolean {
  if (!lastRegion) return true;

  const latChange = Math.abs(newRegion.latitude - lastRegion.latitude);
  const lngChange = Math.abs(newRegion.longitude - lastRegion.longitude);
  const zoomChange = Math.abs(
    newRegion.latitudeDelta - lastRegion.latitudeDelta
  );

  const MINIMUM_REGION_DELTA = 0.005;
  return (
    latChange > MINIMUM_REGION_DELTA ||
    lngChange > MINIMUM_REGION_DELTA ||
    zoomChange > MINIMUM_REGION_DELTA * 2
  );
}
