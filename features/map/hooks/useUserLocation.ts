// features/map/hooks/useUserLocation.ts

import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import type { LatLng } from "../types/safe-route.types";

export function useUserLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Quyền vị trí bị từ chối");
          setPermissionGranted(false);
          setLoading(false);
          return;
        }
        setPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        setError("Không thể lấy vị trí");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setError(null);
    } catch {
      setError("Không thể lấy vị trí");
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, error, loading, permissionGranted, refresh };
}
