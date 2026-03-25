// features/map/components/routes/SafeRoutePolylines.tsx

import React from "react";
import { Polyline } from "react-native-maps";
import type { DecodedRoute } from "../../types/safe-route.types";
import { SAFETY_STATUS_COLORS } from "../../types/safe-route.types";

interface SafeRoutePolylinesProps {
  routes: DecodedRoute[];
  selectedIndex: number;
  onRoutePress: (index: number) => void;
}

export function SafeRoutePolylines({
  routes,
  selectedIndex,
  onRoutePress,
}: SafeRoutePolylinesProps) {
  if (routes.length === 0) return null;

  return (
    <>
      {routes.map((route, index) => {
        const isSelected = index === selectedIndex;
        const color =
          SAFETY_STATUS_COLORS[route.safetyStatus] || "#007AFF";

        if (isSelected) {
          return (
            <React.Fragment key={`route-${index}`}>
              {/* White border for visibility */}
              <Polyline
                coordinates={route.coordinates}
                strokeColor="white"
                strokeWidth={8}
                zIndex={10}
              />
              {/* Main route color */}
              <Polyline
                coordinates={route.coordinates}
                strokeColor={color}
                strokeWidth={5}
                zIndex={11}
                tappable
                onPress={() => onRoutePress(index)}
              />
            </React.Fragment>
          );
        }

        // Non-selected: gray and thinner
        return (
          <Polyline
            key={`route-${index}`}
            coordinates={route.coordinates}
            strokeColor="#9CA3AF"
            strokeWidth={3}
            lineDashPattern={[8, 4]}
            zIndex={5}
            tappable
            onPress={() => onRoutePress(index)}
          />
        );
      })}
    </>
  );
}
