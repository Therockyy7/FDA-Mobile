// features/map/hooks/useUserLocation.ts

import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LatLng } from "../types/safe-route.types";

export function useUserLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const subscriberRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

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

        // Lấy vị trí ngay lập tức lần đầu
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          setLoading(false);
        }

        // Watch liên tục để cập nhật vị trí mới nhất
        subscriberRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10, // cập nhật khi di chuyển >= 10m
            timeInterval: 5000,   // hoặc mỗi 5 giây
          },
          (newLoc) => {
            if (!cancelled) {
              setLocation({
                latitude: newLoc.coords.latitude,
                longitude: newLoc.coords.longitude,
              });
            }
          },
        );
      } catch {
        if (!cancelled) {
          setError("Không thể lấy vị trí");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      subscriberRef.current?.remove();
      subscriberRef.current = null;
    };
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
