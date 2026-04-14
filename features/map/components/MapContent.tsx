// features/map/components/MapContent.tsx
// MapView + all map children (markers, polygons, polylines).
// No business logic — all data/callbacks passed as props.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  AdminAreaPolygon,
  AreaCircleOverlay,
  AreaPreviewCircle,
} from "~/features/map/components/areas";
import { CommunityReportMarker } from "~/features/map/components/reports";
import {
  FloodWarningMarkers,
  RouteMarkers,
  SafeRoutePolylines,
  WaterFlowRoute,
} from "~/features/map/components/routes";
import { SatelliteFloodOverlay } from "~/features/map/components/satellite/SatelliteFloodOverlay";
import {
  FloodSeverityMarkers,
  FloodZonePolygons,
} from "~/features/map/components/stations";
import { DANANG_CENTER, FLOOD_ROUTES } from "~/features/map/constants/map-data";
import { STANDARD_MAP_STYLE } from "~/features/map/constants/map-style";
import type { FloodSeverityFeature } from "~/features/map/types/map-layers.types";
import { SHADOW } from "~/lib/design-tokens";

interface Props {
  mapRef: React.RefObject<MapView>;
  is3DEnabled: boolean;
  camera: any;
  locationPermission: boolean;
  settings: {
    baseMap: string;
    overlays: { flood: boolean; traffic: boolean; communityReports: boolean };
  };
  mapType: "standard" | "satellite" | "hybrid";
  viewMode: string;
  areaDisplayMode: string;
  areas: any[];
  adminAreas: any[];
  selectedArea: any;
  selectedAdminArea?: any;
  draftAreaCenter: any;
  draftAreaRadius: number;
  isAdjustingRadius: boolean;
  showCreateAreaSheet: boolean;
  selectedRoute: any;
  safeRoute: {
    hasResults: boolean;
    getAllRoutes: () => any[];
    selectedRouteIndex: number;
    floodWarnings: any[];
  };
  userLocation: any;
  isRoutingUIVisible: boolean;
  isUsingGPSOrigin: boolean;
  startCoord: any;
  originText: string;
  endCoord: any;
  destinationText: string;
  streetViewLocation: any;
  floodSeverity: any;
  communityReports: any[];
  selectedCommunityReport?: any;
  onRegionChangeComplete: (region: any) => void;
  onLongPress: (event: any) => void;
  onPress: (event: any) => void;
  onPanDrag: () => void;
  onAreaPress: (area: any) => void;
  onRoutePress: (route: any) => void;
  onCommunityReportPress: (report: any) => void;
  onFloodMarkerPress: (feature: FloodSeverityFeature) => void;
  openStreetView: (lat: number, lng: number) => void;
  onAdminAreaPress: (area: any) => void;
  onSafeRoutePress: (index: number) => void;
  onDraftAreaCenterChange: (center: any) => void;
}

export function MapContent({
  mapRef,
  is3DEnabled,
  camera,
  locationPermission,
  settings,
  mapType,
  viewMode,
  areaDisplayMode,
  areas,
  adminAreas,
  selectedArea,
  selectedAdminArea,
  draftAreaCenter,
  draftAreaRadius,
  isAdjustingRadius,
  showCreateAreaSheet,
  selectedRoute,
  safeRoute,
  userLocation,
  isRoutingUIVisible,
  isUsingGPSOrigin,
  startCoord,
  originText,
  endCoord,
  destinationText,
  streetViewLocation,
  floodSeverity,
  communityReports,
  selectedCommunityReport,
  onRegionChangeComplete,
  onLongPress,
  onPress,
  onPanDrag,
  onAreaPress,
  onRoutePress,
  onSafeRoutePress,
  onCommunityReportPress,
  onFloodMarkerPress,
  openStreetView,
  onAdminAreaPress,
  onDraftAreaCenterChange,
}: Props) {
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      initialRegion={DANANG_CENTER}
      camera={is3DEnabled ? camera : undefined}
      onRegionChangeComplete={onRegionChangeComplete}
      onLongPress={onLongPress}
      onPress={onPress}
      onPanDrag={onPanDrag}
      showsUserLocation={locationPermission}
      showsMyLocationButton={false}
      showsCompass={false}
      showsTraffic={settings?.overlays?.traffic}
      showsBuildings={true}
      pitchEnabled={true}
      rotateEnabled={true}
      mapType={settings?.baseMap === "satellite" ? "satellite" : mapType}
      customMapStyle={
        mapType === "standard" && !settings?.overlays?.traffic
          ? STANDARD_MAP_STYLE
          : undefined
      }
    >
      {/* User Areas */}
      {viewMode === "zones" &&
        areaDisplayMode === "user" &&
        areas.map((area) => (
          <AreaCircleOverlay
            key={`${area.id}-${area.status}-${area.severityLevel}`}
            area={area}
            isSelected={selectedArea?.id === area.id}
            onPress={() => onAreaPress(area)}
          />
        ))}

      {/* Admin Areas (Only Selected) */}
      {viewMode === "zones" &&
        areaDisplayMode === "admin" &&
        selectedAdminArea && (
          <AdminAreaPolygon
            key={selectedAdminArea.id}
            area={selectedAdminArea}
            onPress={onAdminAreaPress}
          />
        )}

      {/* Draft Area */}
      {draftAreaCenter && !isAdjustingRadius && (
        <AreaPreviewCircle
          center={draftAreaCenter}
          radiusMeters={draftAreaRadius}
          visible={isAdjustingRadius || showCreateAreaSheet}
          onCenterChange={
            isAdjustingRadius ? onDraftAreaCenterChange : undefined
          }
        />
      )}

      {/* Routes */}
      {viewMode === "routes" &&
        FLOOD_ROUTES.map((route) => (
          <WaterFlowRoute
            key={route.id}
            route={route}
            isSelected={selectedRoute?.id === route.id}
            onPress={() => onRoutePress(route)}
          />
        ))}

      {/* Safe Route */}
      {safeRoute.hasResults && (
        <SafeRoutePolylines
          routes={safeRoute.getAllRoutes()}
          selectedIndex={safeRoute.selectedRouteIndex}
          onRoutePress={onSafeRoutePress}
        />
      )}
      {safeRoute.hasResults && (
        <FloodWarningMarkers warnings={safeRoute.floodWarnings} />
      )}

      {/* Route Markers */}
      <RouteMarkers
        isRoutingUIVisible={isRoutingUIVisible}
        isUsingGPSOrigin={isUsingGPSOrigin}
        userLocation={userLocation}
        startCoord={startCoord}
        originText={originText}
        endCoord={endCoord}
        destinationText={destinationText}
      />

      {/* Street View Marker */}
      {streetViewLocation && (
        <Marker
          coordinate={streetViewLocation}
          onPress={() =>
            openStreetView(
              streetViewLocation.latitude,
              streetViewLocation.longitude,
            )
          }
        >
          <View style={styles.streetViewMarker}>
            <Ionicons name="eye" size={20} color="white" />
          </View>
        </Marker>
      )}

      {/* Flood */}
      <FloodZonePolygons floodSeverity={floodSeverity} />

      {/* Community Reports */}
      {settings?.overlays?.communityReports &&
        communityReports.map((report) => (
          <CommunityReportMarker
            key={`community-report-${report.id}`}
            report={report}
            mapRef={mapRef}
            onPress={onCommunityReportPress}
            isSelected={selectedCommunityReport?.id === report.id}
          />
        ))}
      {/* Render selected marker even if not in communityReports list (e.g. from navigation params) */}
      {selectedCommunityReport &&
        !communityReports.some((r) => r.id === selectedCommunityReport.id) && (
          <CommunityReportMarker
            key={`selected-community-report-${selectedCommunityReport.id}`}
            report={selectedCommunityReport}
            mapRef={mapRef}
            onPress={onCommunityReportPress}
            isSelected
          />
        )}

      {/* Flood Severity */}
      <FloodSeverityMarkers
        floodSeverity={floodSeverity}
        onMarkerPress={onFloodMarkerPress}
      />
      {/* 🛰️ AI Satellite Flood Polygons (Prithvi) */}
      <SatelliteFloodOverlay />
    </MapView>
  );
}

const styles = StyleSheet.create({
  streetViewMarker: {
    backgroundColor: "#F59E0B",
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: "white",
    ...SHADOW.sm,
  },
});
