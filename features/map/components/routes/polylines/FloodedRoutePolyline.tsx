// features/map/components/routes/FloodedRoutePolyline.tsx
import polyline from "@mapbox/polyline";
import React, { useEffect, useState } from "react";
import { Polyline } from "react-native-maps";
import type { LatLng } from "~/features/map/types/safe-route.types";
import { getStatusColor } from "~/features/map/lib/map-utils";

const OSRM_API_URL = "http://router.project-osrm.org/route/v1/driving";

interface FloodedRoutePolylineProps {
  start: LatLng;
  end: LatLng;
  status: "safe" | "warning" | "danger";
  strokeWidth: number;
  isSelected: boolean;
  onPress: () => void;
  zIndex?: number;
}

export function FloodedRoutePolyline({
  start,
  end,
  status,
  strokeWidth,
  isSelected,
  onPress,
  zIndex = 0,
}: FloodedRoutePolylineProps) {
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const startStr = `${start.longitude},${start.latitude}`;
        const endStr = `${end.longitude},${end.latitude}`;
        const url = `${OSRM_API_URL}/${startStr};${endStr}?overview=full&geometries=polyline`;

        const response = await fetch(url);
        const data = await response.json();

        if (cancelled) return;

        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
          setCoordinates([]);
          return;
        }

        const encodedPolyline = data.routes[0].geometry;
        const points = polyline.decode(encodedPolyline);

        setCoordinates(
          points.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
        );
      } catch {
        if (cancelled) return;
        setCoordinates([]);
      }
    };

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [start.latitude, start.longitude, end.latitude, end.longitude]);

  if (coordinates.length === 0) return null;

  const colors = getStatusColor(status);

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={isSelected ? "#3B82F6" : colors.main}
      strokeWidth={isSelected ? strokeWidth + 2 : strokeWidth}
      tappable
      onPress={onPress}
      zIndex={isSelected ? zIndex + 1 : zIndex}
    />
  );
}
