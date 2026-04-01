// features/map/hooks/navigation/useGPSWatcher.ts
// Manages GPS position watching using LocationService.

import { useCallback, useRef } from "react";
import * as Location from "expo-location";
import { LocationService } from "../../services/location.service";
import type { LatLng } from "../../types/safe-route.types";

type LocationCallback = (location: Location.LocationObject) => void;

export function useGPSWatcher() {
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  const startWatching = useCallback(async (onLocation: LocationCallback): Promise<boolean> => {
    try {
      const sub = await LocationService.watchPosition(onLocation, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1500,
        distanceInterval: 5,
      });
      watcherRef.current = sub;
      return true;
    } catch {
      return false;
    }
  }, []);

  const stopWatching = useCallback(() => {
    watcherRef.current?.remove();
    watcherRef.current = null;
  }, []);

  return { startWatching, stopWatching };
}
