// features/map/components/routes/polylines/NavigationPolyline.tsx
// Renders a route split into traveled (gray) and remaining (safety color) segments.

import React from "react";
import { Polyline } from "react-native-maps";
import type { DecodedRoute } from "~/features/map/types/safe-route.types";
import { SAFETY_STATUS_COLORS } from "~/features/map/types/safe-route.types";
import { splitRouteAtProgress } from "~/features/map/lib/polyline-geometry";

interface NavigationPolylineProps {
  route: DecodedRoute;
  progressMeters: number;
  segmentCumulativeDist: number[];
}

export function NavigationPolyline({
  route,
  progressMeters,
  segmentCumulativeDist,
}: NavigationPolylineProps) {
  const { traveled, remaining } = splitRouteAtProgress(
    route.coordinates,
    segmentCumulativeDist,
    progressMeters,
  );

  const remainingColor = SAFETY_STATUS_COLORS[route.safetyStatus] || "#007AFF";

  return (
    <>
      {traveled.length >= 2 && (
        <Polyline
          coordinates={traveled}
          strokeColor="#9CA3AF"
          strokeWidth={4}
          zIndex={10}
        />
      )}
      {remaining.length >= 2 && (
        <>
          <Polyline
            coordinates={remaining}
            strokeColor="white"
            strokeWidth={8}
            zIndex={11}
          />
          <Polyline
            coordinates={remaining}
            strokeColor={remainingColor}
            strokeWidth={5}
            zIndex={12}
          />
        </>
      )}
    </>
  );
}
