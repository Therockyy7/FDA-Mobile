// features/map/components/MapFloatingUI.tsx
// Floating controls and legend outside MapView.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
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
  showAiSelectButton?: boolean;
  onShowWardSelection?: () => void;
  selectedAdminAreaName?: string | null;
  onClearAdminArea?: () => void;
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
  showAiSelectButton,
  onShowWardSelection,
  selectedAdminAreaName,
  onClearAdminArea,
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

          {/* AI Ward Selection Button */}
          {showAiSelectButton && onShowWardSelection && (
            <TouchableOpacity
              onPress={onShowWardSelection}
              style={[styles.createAreaButton, { backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" }]}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={24} color="white" />
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

      {/* Selected Admin Area Banner */}
      {selectedAdminAreaName && onClearAdminArea && !isRoutingUIVisible && (
        <View style={styles.selectedAdminAreaBanner}>
          <Ionicons name="analytics" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
          <Text style={styles.selectedAdminAreaText} numberOfLines={1}>
            {selectedAdminAreaName}
          </Text>
          <TouchableOpacity onPress={onClearAdminArea} style={styles.clearAdminAreaButton} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color="#64748B" />
          </TouchableOpacity>
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
  selectedAdminAreaBanner: {
    position: "absolute",
    top: 100, // Below header
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 20,
    maxWidth: "80%",
  },
  selectedAdminAreaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginRight: 8,
  },
  clearAdminAreaButton: {
    padding: 2,
  },
});
