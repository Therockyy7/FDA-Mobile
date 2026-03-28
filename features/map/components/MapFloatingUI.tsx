// app/(tabs)/MapFloatingUI.tsx
// Floating controls, FAB, and place search sheet outside MapView.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Legend, MapControls } from "~/features/map/components/controls";
import { PlaceSearchSheet } from "~/features/map/components/routes";
import type { LatLng } from "~/features/map/types/safe-route.types";

interface Props {
  // Controls visibility guard
  selectedRoute: any;
  selectedZone: any;
  selectedArea: any;
  selectedStationId: string | null;
  isRoutingUIVisible: boolean;
  safeRouteHasResults: boolean;
  isAdjustingRadius: boolean;
  showCreateAreaSheet: boolean;
  // Controls callbacks
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  is3DEnabled: boolean;
  onToggle3D: () => void;
  showLegendState: boolean;
  onShowLegend: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  streetViewLocation: any;
  onClearStreetView: () => void;
  onShowRouting: () => void;
  onShowLayers: () => void;
  // Nav FAB
  onNavFabPress: () => void;
  isPickingOnMap: boolean;
  // Place search sheet
  showNavSearch: boolean;
  onCloseNavSearch: () => void;
  onSelectPlace: (coord: LatLng, label: string) => void;
  onPickOnMap: () => void;
  onUseGPS: () => void;
  userLocation: LatLng | null;
  openRouting: () => void;
  selectGPSAsOrigin: () => void;
  startPickingDestination: () => void;
}

export function MapFloatingUI({
  selectedRoute,
  selectedZone,
  selectedArea,
  selectedStationId,
  isRoutingUIVisible,
  safeRouteHasResults,
  isAdjustingRadius,
  showCreateAreaSheet,
  onZoomIn,
  onZoomOut,
  onMyLocation,
  is3DEnabled,
  onToggle3D,
  showLegendState,
  onShowLegend,
  onRotateLeft,
  onRotateRight,
  streetViewLocation,
  onClearStreetView,
  onShowRouting,
  onShowLayers,
  onNavFabPress,
  isPickingOnMap,
  showNavSearch,
  onCloseNavSearch,
  onSelectPlace,
  onPickOnMap,
  onUseGPS,
  userLocation,
  openRouting,
  selectGPSAsOrigin,
  startPickingDestination,
}: Props) {
  const showControls =
    !selectedRoute &&
    !selectedZone &&
    !selectedArea &&
    !selectedStationId &&
    !isRoutingUIVisible &&
    !safeRouteHasResults &&
    !isAdjustingRadius &&
    !showCreateAreaSheet;

  const showFAB =
    !isRoutingUIVisible &&
    !isPickingOnMap &&
    !safeRouteHasResults &&
    !selectedRoute &&
    !selectedZone &&
    !selectedArea &&
    !selectedStationId &&
    !isAdjustingRadius &&
    !showCreateAreaSheet;

  return (
    <>
      {/* Map Controls */}
      {showControls && (
        <View style={styles.controlsContainer}>
          <MapControls
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onMyLocation={onMyLocation}
            is3DEnabled={is3DEnabled}
            onToggle3D={onToggle3D}
            showLegend={showLegendState}
            onShowLegend={onShowLegend}
            onRotateLeft={onRotateLeft}
            onRotateRight={onRotateRight}
            streetViewLocation={streetViewLocation}
            onClearStreetView={onClearStreetView}
            onShowIsRouting={onShowRouting}
            onShowLayers={onShowLayers}
          />
        </View>
      )}

      {/* Navigation FAB (Google Maps style) */}
      {showFAB && (
        <TouchableOpacity
          onPress={onNavFabPress}
          activeOpacity={0.8}
          style={styles.navFab}
        >
          <Ionicons name="navigate" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Legend */}
      {showLegendState && !isRoutingUIVisible && <Legend />}

      {/* Nav FAB: Destination search sheet */}
      <PlaceSearchSheet
        visible={showNavSearch}
        onClose={onCloseNavSearch}
        onSelectPlace={onSelectPlace}
        onPickOnMap={() => {
          onCloseNavSearch();
          selectGPSAsOrigin();
          openRouting();
          startPickingDestination();
        }}
        onUseGPS={() => onCloseNavSearch()}
        showGPSOption={false}
        placeholder="Bạn muốn đi đâu?"
        accentColor="#2563EB"
      />
    </>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    bottom: 24,
    right: 16,
    zIndex: 10,
  },
  navFab: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 15,
  },
});
