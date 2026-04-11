// features/map/components/MapHeaderSwitch.tsx
// Thin wrapper — reads user from auth store and renders RouteDirectionPanel.

import React from "react";
import { useRouter } from "expo-router";
import { RouteDirectionPanel } from "~/features/map/components/routes";
import { useUser } from "~/features/auth/stores/hooks";
import type { TransportMode } from "~/features/map/types/routing.types";
import type { LatLng } from "~/features/map/types/safe-route.types";

interface Props {
  navIsNavigating: boolean;
  safeRouteHasResults: boolean;
  // RouteDirectionPanel
  originText: string;
  onOriginChange: (t: string) => void;
  onOriginClear: () => void;
  isUsingGPSOrigin: boolean;
  onUseGPSAsOrigin: () => void;
  onPickOriginOnMap: () => void;
  hasOriginCoord: boolean;
  onOriginPlaceSelected: (coord: LatLng) => void;
  destinationText: string;
  onDestinationChange: (t: string) => void;
  onDestinationClear: () => void;
  isUsingGPSDest: boolean;
  onUseGPSAsDest: () => void;
  onPickDestinationOnMap: () => void;
  hasDestinationCoord: boolean;
  onDestinationPlaceSelected: (coord: LatLng) => void;
  onSwap: () => void;
  transportMode: TransportMode;
  onModeChange: (m: TransportMode) => void;
  onFindRoute: () => void;
  safeRouteIsLoading: boolean;
  safeRouteError: string | null;
  onCloseRouting: () => void;
  userLocation: LatLng | null;
  selectGPSAsDestination: (loc: LatLng) => void;
}

export function MapHeaderSwitch({
  navIsNavigating,
  safeRouteHasResults,
  originText,
  onOriginChange,
  onOriginClear,
  isUsingGPSOrigin,
  onUseGPSAsOrigin,
  onPickOriginOnMap,
  hasOriginCoord,
  onOriginPlaceSelected,
  destinationText,
  onDestinationChange,
  onDestinationClear,
  isUsingGPSDest,
  onUseGPSAsDest,
  onPickDestinationOnMap,
  hasDestinationCoord,
  onDestinationPlaceSelected,
  onSwap,
  transportMode,
  onModeChange,
  onFindRoute,
  safeRouteIsLoading,
  safeRouteError,
  onCloseRouting,
  userLocation,
  selectGPSAsDestination,
}: Props) {
  const user = useUser();
  const router = useRouter();
  const isGuest = user === null;

  if (navIsNavigating || safeRouteHasResults) return null;

  return (
    <RouteDirectionPanel
      visible={true}
      onClose={onCloseRouting}
      originText={isUsingGPSOrigin ? "" : originText}
      onOriginChange={onOriginChange}
      onOriginClear={onOriginClear}
      isUsingGPSOrigin={isUsingGPSOrigin}
      onUseGPSAsOrigin={onUseGPSAsOrigin}
      onPickOriginOnMap={onPickOriginOnMap}
      hasOriginCoord={hasOriginCoord}
      onOriginPlaceSelected={onOriginPlaceSelected}
      destinationText={destinationText}
      onDestinationChange={onDestinationChange}
      onDestinationClear={onDestinationClear}
      isUsingGPSDest={isUsingGPSDest}
      onUseGPSAsDest={() => {
        if (userLocation) selectGPSAsDestination(userLocation);
      }}
      onPickDestinationOnMap={onPickDestinationOnMap}
      hasDestinationCoord={hasDestinationCoord}
      onDestinationPlaceSelected={onDestinationPlaceSelected}
      onSwap={onSwap}
      transportMode={transportMode}
      onModeChange={onModeChange}
      onFindRoute={onFindRoute}
      isLoading={safeRouteIsLoading}
      error={safeRouteError}
      user={user ?? null}
      onProfilePress={() => router.push("/(tabs)/profile")}
      isGuest={isGuest}
      onLoginPress={() => router.push("/(auth)/sign-in")}
    />
  );
}
