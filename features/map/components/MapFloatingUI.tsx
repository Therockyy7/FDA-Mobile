// features/map/components/MapFloatingUI.tsx
// Floating controls and legend outside MapView.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { CARD_SHADOW, OVERLAY_SHADOW } from "~/features/map/lib/map-ui-utils";
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
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

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
        <View
          style={[
            styles.selectedAdminAreaBanner,
            {
              backgroundColor: isDark ? "#1E293B" : "white",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
        >
          <Ionicons name="analytics" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
          <Text
            style={[
              styles.selectedAdminAreaText,
              { color: isDark ? "#F1F5F9" : "#1E293B" },
            ]}
            numberOfLines={1}
          >
            {selectedAdminAreaName}
          </Text>
          <TouchableOpacity onPress={onClearAdminArea} style={styles.clearAdminAreaButton} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={isDark ? "#64748B" : "#64748B"} />
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
    ...OVERLAY_SHADOW,
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
    ...OVERLAY_SHADOW,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  selectedAdminAreaBanner: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...CARD_SHADOW,
    borderWidth: 1,
    zIndex: 20,
    maxWidth: "80%",
  },
  selectedAdminAreaText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  clearAdminAreaButton: {
    padding: 2,
  },
});
