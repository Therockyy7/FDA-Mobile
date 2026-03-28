// features/map/services/location.service.ts
// Wraps Expo Location calls — hooks should call this instead of Expo directly

import * as Location from "expo-location";
import type { LatLng } from "../types/safe-route.types";
import { MapServiceError } from "./map-service-error";

export class LocationService {
  /** Request foreground location permission. Returns true if granted. */
  static async requestForegroundPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }

  /** Get current GPS position. Throws MapServiceError if unavailable. */
  static async getCurrentPosition(): Promise<LatLng> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error: any) {
      throw new MapServiceError(
        error?.message || "Failed to get current location",
      );
    }
  }

  /**
   * Reverse geocode coordinates to a human-readable address string.
   * Returns coordinate string as fallback if geocoding fails.
   */
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results.length > 0) {
        const place = results[0];
        const parts = [place.street, place.district, place.city].filter(Boolean);
        if (parts.length > 0) return parts.join(", ");
      }
    } catch {
      // Fall through to coordinate fallback
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  /**
   * Start watching GPS position for navigation.
   * Returns a LocationSubscription — caller must call .remove() to stop.
   */
  static async watchPosition(
    callback: (location: Location.LocationObject) => void,
    options?: Location.LocationOptions,
  ): Promise<Location.LocationSubscription> {
    try {
      return await Location.watchPositionAsync(
        options ?? {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1500,
          distanceInterval: 5,
        },
        callback,
      );
    } catch (error: any) {
      throw new MapServiceError(
        error?.message || "Failed to start location watch",
      );
    }
  }
}
