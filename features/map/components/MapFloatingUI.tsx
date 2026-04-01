// features/map/components/MapFloatingUI.tsx
// Floating controls and legend outside MapView.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Legend, MapControls } from "~/features/map/components/controls";

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
  showCreateAreaButton: boolean;
  onCreateArea: () => void;
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
  onShowLayers: () => void;
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
  showCreateAreaButton,
  onCreateArea,
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
  onShowLayers,
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

  return (
    <>
      {/* Map Controls */}
      {showControls && (
        <View
          style={[
            styles.controlsContainer,
            {
              bottom:
                selectedZone || selectedRoute || safeRouteHasResults ? 180 : 24,
            },
          ]}
        >
          {/* Create Area Button */}
          {showCreateAreaButton && onCreateArea && (
            <TouchableOpacity
              onPress={onCreateArea}
              style={styles.createAreaButton}
              activeOpacity={0.8}
            >
              <Ionicons name="location" size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* My Location Button */}
          <TouchableOpacity
            onPress={onMyLocation}
            style={styles.myLocationButton}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={22} color="#3B82F6" />
          </TouchableOpacity>

          <MapControls
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            is3DEnabled={is3DEnabled}
            onToggle3D={onToggle3D}
            showLegend={showLegendState}
            onShowLegend={onShowLegend}
            onRotateLeft={onRotateLeft}
            onRotateRight={onRotateRight}
            streetViewLocation={streetViewLocation}
            onClearStreetView={onClearStreetView}
            onShowLayers={onShowLayers}
          />
        </View>
      )}

      {/* Legend */}
      {showLegendState && !isRoutingUIVisible && <Legend />}
    </>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    alignItems: "center",
    gap: 10,
  },
  createAreaButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#3B82F6",
    marginTop: 10,
  },
  myLocationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
});
