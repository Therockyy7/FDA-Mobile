// app/(tabs)/MapHeaderSwitch.tsx
// Conditionally renders RouteDirectionPanel or MapHeader based on navigation state.

import React from "react";
import { MapHeader } from "~/features/map/components/controls";
import { RouteDirectionPanel } from "~/features/map/components/routes";
import type { MapType } from "~/features/map/types/map-display.types";
import type { TransportMode } from "~/features/map/types/routing.types";
import type { LatLng } from "~/features/map/types/safe-route.types";

interface Props {
  navIsNavigating: boolean;
  isRoutingUIVisible: boolean;
  safeRouteHasResults: boolean;
  isPickingOnMap: boolean;
  // RouteDirectionPanel
  originText: string;
  onOriginChange: (t: string) => void;
  isUsingGPSOrigin: boolean;
  onUseGPSAsOrigin: () => void;
  onPickOriginOnMap: () => void;
  hasOriginCoord: boolean;
  onOriginPlaceSelected: (coord: LatLng) => void;
  destinationText: string;
  onDestinationChange: (t: string) => void;
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
  setStartCoord: (c: LatLng) => void;
  setEndCoord: (c: LatLng) => void;
  userLocation: LatLng | null;
  selectGPSAsDestination: (loc: LatLng) => void;
  mapRef: { current: { animateToRegion: (r: any, d: number) => void } | null };
  // MapHeader
  stats: { safe: number; caution: number; warning: number; critical: number };
  mapType: MapType;
  onMapTypeChange: () => void;
  onShowLayers: () => void;
  onCreateArea: () => void;
  showCreateAreaButton: boolean;
}

export function MapHeaderSwitch({
  navIsNavigating,
  isRoutingUIVisible,
  safeRouteHasResults,
  isPickingOnMap,
  originText,
  onOriginChange,
  isUsingGPSOrigin,
  onUseGPSAsOrigin,
  onPickOriginOnMap,
  hasOriginCoord,
  onOriginPlaceSelected,
  destinationText,
  onDestinationChange,
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
  setStartCoord,
  setEndCoord,
  userLocation,
  selectGPSAsDestination,
  mapRef,
  stats,
  mapType,
  onMapTypeChange,
  onShowLayers,
  onCreateArea,
  showCreateAreaButton,
}: Props) {
  if (navIsNavigating) return null;

  if (isRoutingUIVisible && !safeRouteHasResults && !isPickingOnMap) {
    return (
      <RouteDirectionPanel
        visible={true}
        onClose={onCloseRouting}
        originText={isUsingGPSOrigin ? "" : originText}
        onOriginChange={onOriginChange}
        isUsingGPSOrigin={isUsingGPSOrigin}
        onUseGPSAsOrigin={onUseGPSAsOrigin}
        onPickOriginOnMap={onPickOriginOnMap}
        hasOriginCoord={hasOriginCoord}
        onOriginPlaceSelected={(coord) => {
          setStartCoord(coord);
          mapRef.current?.animateToRegion(
            {
              latitude: coord.latitude,
              longitude: coord.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            500,
          );
        }}
        destinationText={destinationText}
        onDestinationChange={onDestinationChange}
        isUsingGPSDest={isUsingGPSDest}
        onUseGPSAsDest={() => {
          if (userLocation) selectGPSAsDestination(userLocation);
        }}
        onPickDestinationOnMap={onPickDestinationOnMap}
        hasDestinationCoord={hasDestinationCoord}
        onDestinationPlaceSelected={(coord) => {
          setEndCoord(coord);
          mapRef.current?.animateToRegion(
            {
              latitude: coord.latitude,
              longitude: coord.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            500,
          );
        }}
        onSwap={onSwap}
        transportMode={transportMode}
        onModeChange={onModeChange}
        onFindRoute={onFindRoute}
        isLoading={safeRouteIsLoading}
        error={safeRouteError}
      />
    );
  }

  return (
    <MapHeader
      stats={stats}
      mapType={mapType}
      onMapTypeChange={onMapTypeChange}
      onShowLayers={onShowLayers}
      onCreateArea={onCreateArea}
      showCreateAreaButton={showCreateAreaButton}
    />
  );
}
