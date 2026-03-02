// app/(tabs)/map/index.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, StatusBar, TouchableOpacity, View } from "react-native";
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { AreaCard } from "~/features/map/components/areas/AreaCard";
import { AreaCircleOverlay } from "~/features/map/components/areas/AreaCircleOverlay";
import { LayerToggleSheet } from "~/features/map/components/controls/LayerToggleSheet";
import Legend from "~/features/map/components/controls/Legend";
import { MapControls } from "~/features/map/components/controls/MapControls";
import { MapTopControls } from "~/features/map/components/controls/MapTopControls";
import { MapLoadingOverlay } from "~/features/map/components/overlays/MapLoadingOverlay";
import { FloodWarningMarkers } from "~/features/map/components/routes/FloodWarningMarkers";
import { RouteDetailCard } from "~/features/map/components/routes/RouteDetailCard";
import { RouteDirectionPanel } from "~/features/map/components/routes/RouteDirectionPanel";
import { SafeRouteAlternatives } from "~/features/map/components/routes/SafeRouteAlternatives";
import { SafeRoutePolylines } from "~/features/map/components/routes/SafeRoutePolylines";
import { SafeRouteResultCard } from "~/features/map/components/routes/SafeRouteResultCard";
import { SafeRouteWarnings } from "~/features/map/components/routes/SafeRouteWarnings";
import { WaterFlowRoute } from "~/features/map/components/routes/WaterFlowRoute";
import { FloodSeverityMarkers } from "~/features/map/components/stations/FloodSeverityMarkers";
import { FloodStationCard } from "~/features/map/components/stations/FloodStationCard";
import { MapHeader } from "~/features/map/components/ui/MapHeader";
import {
  DANANG_CENTER,
  FLOOD_ROUTES,
  FloodRoute
} from "~/features/map/constants/map-data";
import { useFloodSelection } from "~/features/map/hooks/useFloodSelection";
import { useMapCamera } from "~/features/map/hooks/useMapCamera";
import { useMapDisplay } from "~/features/map/hooks/useMapDisplay";
import { useMapLayerSettings } from "~/features/map/hooks/useMapLayerSettings";
import { useRoutingUI } from "~/features/map/hooks/useRoutingUI";
import { useSafeRoute } from "~/features/map/hooks/useSafeRoute";
import { useStreetView } from "~/features/map/hooks/useStreetView";
import { useUserLocation } from "~/features/map/hooks/useUserLocation";
import { debounce, MapRegion, shouldFetchNewMarkers } from "~/features/map/lib/map-utils";
import { getRouteBounds } from "~/features/map/lib/polyline-utils";
import { AreaWithStatus, FloodSeverityFeature } from "~/features/map/types/map-layers.types";

type MapType = "standard" | "satellite" | "hybrid";

export default function MapScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLayerSheet, setShowLayerSheet] = useState(false);
  const [selectedStation, setSelectedStation] = useState<FloodSeverityFeature | null>(null);
  const stationCardAnim = useRef(new Animated.Value(300)).current;

  // Track last fetched region to avoid unnecessary API calls
  const lastFetchedRegionRef = useRef<MapRegion | null>(null);

  // Map layer settings hook
  const { settings, areas, refreshFloodSeverity, refreshAreas } = useMapLayerSettings();

  // Area selection state
  const [selectedArea, setSelectedArea] = useState<AreaWithStatus | null>(null);
  const areaCardAnim = useRef(new Animated.Value(300)).current;

  // Safe route state
  const safeRoute = useSafeRoute();
  const { location: userLocation, permissionGranted: locationPermission } = useUserLocation();
  const routeResultCardAnim = useRef(new Animated.Value(300)).current;
  const [showWarningsSheet, setShowWarningsSheet] = useState(false);

  const {
    mapRef,
    region,
    is3DEnabled,
    camera,
    onRegionChangeComplete,
    toggle3DView,
    rotateCamera,
    zoomIn,
    zoomOut,
    goToMyLocation,
    setRegion,
    focusOnZone,
    focusOnRoute,
  } = useMapCamera();

  const {
    selectedZone,
    setSelectedZone,
    selectedRoute,
    setSelectedRoute,
    showDetailPanels,
    slideAnim,
    clearSelection,
  } = useFloodSelection();

  const {
    streetViewLocation,
    setStreetViewLocation,
    openStreetView,
    handleMapLongPress,
  } = useStreetView();

  const routingUI = useRoutingUI();
  const {
    isRoutingUIVisible,
    openRouting,
    closeRouting,
    transportMode,
    setTransportMode,
    originText,
    setOriginText,
    startCoord,
    useCurrentLocationAsOrigin,
    useGPSAsOrigin,
    destinationText,
    setDestinationText,
    endCoord,
    useCurrentLocationAsDest,
    useGPSAsDestination,
    pickingTarget,
    isPickingOnMap,
    startPickingOrigin,
    startPickingDestination,
    cancelPicking,
    setPointFromMap,
    swapOriginDestination,
    resetRouting,
  } = routingUI;

  const {
    mapType,
    viewMode,
    setViewMode,
    showLegend,
    toggleLegend,
    stats,
    handleMapTypeChange,
  } = useMapDisplay();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Initial load of flood severity markers and areas when component mounts
  useEffect(() => {
    if (settings.overlays.flood) {
      refreshFloodSeverity({
        minLat: DANANG_CENTER.latitude - DANANG_CENTER.latitudeDelta / 2,
        minLng: DANANG_CENTER.longitude - DANANG_CENTER.longitudeDelta / 2,
        maxLat: DANANG_CENTER.latitude + DANANG_CENTER.latitudeDelta / 2,
        maxLng: DANANG_CENTER.longitude + DANANG_CENTER.longitudeDelta / 2,
      });
      refreshAreas();
    }
  }, [settings.overlays.flood, refreshFloodSeverity, refreshAreas]);

  useEffect(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, [viewMode]);

  // ==================== SAFE ROUTE HANDLERS ====================

  const handleFindRoute = useCallback(async () => {
    // Determine start: custom coord > GPS > fallback
    const start = useCurrentLocationAsOrigin
      ? (userLocation ?? { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude })
      : (startCoord ?? userLocation ?? { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude });

    if (!endCoord) return;

    await safeRoute.findRoute(start, endCoord, transportMode);
  }, [useCurrentLocationAsOrigin, startCoord, userLocation, endCoord, transportMode, safeRoute]);

  // Fit map to route after results arrive
  useEffect(() => {
    if (safeRoute.primaryRoute) {
      const bounds = getRouteBounds(safeRoute.primaryRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);

      Animated.timing(routeResultCardAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [safeRoute.primaryRoute, mapRef, routeResultCardAnim]);

  const handleMapPress = useCallback(
    async (event: MapPressEvent) => {
      if (!isPickingOnMap) return;

      const { latitude, longitude } = event.nativeEvent.coordinate;

      // Try reverse geocode for a readable label
      let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0) {
          const place = results[0];
          const parts = [place.street, place.district, place.city].filter(Boolean);
          if (parts.length > 0) label = parts.join(", ");
        }
      } catch {
        // Keep coordinate label as fallback
      }

      setPointFromMap({ latitude, longitude }, label);
    },
    [isPickingOnMap, setPointFromMap]
  );

  const handleSelectRoute = useCallback(
    (index: number) => {
      safeRoute.selectRoute(index);
      const allRoutes = safeRoute.getAllRoutes();
      const selected = allRoutes[index];
      if (selected) {
        const bounds = getRouteBounds(selected.coordinates);
        mapRef.current?.animateToRegion(bounds, 400);
      }
    },
    [safeRoute, mapRef]
  );

  const handleCloseRouteResults = useCallback(() => {
    Animated.timing(routeResultCardAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      safeRoute.clearRoutes();
    });
  }, [safeRoute, routeResultCardAnim]);

  const handleCloseRouting = useCallback(() => {
    closeRouting();
    handleCloseRouteResults();
    resetRouting();
  }, [closeRouting, handleCloseRouteResults, resetRouting]);

  // ==================== EXISTING HANDLERS ====================

  const handleAreaPress = (area: AreaWithStatus) => {
    setSelectedRoute(null);
    setSelectedZone(null);
    setSelectedArea(area);
    Animated.timing(areaCardAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    mapRef.current?.animateToRegion({
      latitude: area.latitude,
      longitude: area.longitude,
      latitudeDelta: (area.radiusMeters / 111320) * 3,
      longitudeDelta: (area.radiusMeters / 111320) * 3,
    }, 500);
  };

  const handleRoutePress = (route: FloodRoute) => {
    setSelectedZone(null);
    setSelectedArea(null);
    setSelectedRoute(route);
    focusOnRoute(route);
  };

  function isPointInPolygon(
    point: { latitude: number; longitude: number },
    polygon: { latitude: number; longitude: number }[]
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude;
      const yi = polygon[i].longitude;
      const xj = polygon[j].latitude;
      const yj = polygon[j].longitude;

      const intersect =
        yi > point.longitude !== yj > point.longitude &&
        point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const fetchMarkersInViewPort = useMemo(() => debounce((newRegion: Region) => {
    if (!settings.overlays.flood) return;

    if (!shouldFetchNewMarkers(newRegion, lastFetchedRegionRef.current)) {
      return;
    }

    lastFetchedRegionRef.current = newRegion;

    const params = {
      minLat: newRegion.latitude - newRegion.latitudeDelta / 2,
      minLng: newRegion.longitude - newRegion.longitudeDelta / 2,
      maxLat: newRegion.latitude + newRegion.latitudeDelta / 2,
      maxLng: newRegion.longitude + newRegion.longitudeDelta / 2,
    };

    refreshFloodSeverity(params);
  }, 1000),
  [refreshFloodSeverity, settings.overlays.flood]
  );

  const handleRegionChange = useCallback(
    (newRegion: Region) => {
      onRegionChangeComplete(newRegion);
      fetchMarkersInViewPort(newRegion);
    },
    [onRegionChangeComplete, fetchMarkersInViewPort]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MapHeader
        stats={stats}
        mapType={mapType as MapType}
        onMapTypeChange={handleMapTypeChange}
        onShowLayers={() => setShowLayerSheet(true)}
      />

      <View style={{ flex: 1, position: "relative" }}>
        {/* Loading Overlay */}
        <MapLoadingOverlay visible={isLoading} />

        {/* Pick on Map Banner */}
        {isPickingOnMap && (
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              zIndex: 50,
              backgroundColor: pickingTarget === "origin" ? "#16A34A" : "#4F46E5",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              shadowColor: pickingTarget === "origin" ? "#16A34A" : "#4F46E5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="location" size={18} color="white" />
            <Text style={{ flex: 1, color: "white", fontSize: 13, fontWeight: "600" }}>
              {pickingTarget === "origin"
                ? "Nhấn vào bản đồ để chọn điểm đi"
                : "Nhấn vào bản đồ để chọn điểm đến"}
            </Text>
            <TouchableOpacity onPress={cancelPicking} hitSlop={8}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Map View */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={DANANG_CENTER}
          camera={is3DEnabled ? camera : undefined}
          onRegionChangeComplete={handleRegionChange}
          onLongPress={handleMapLongPress}
          onPress={handleMapPress}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsCompass={false}
          showsTraffic={settings.overlays.traffic}
          showsBuildings={true}
          pitchEnabled={true}
          rotateEnabled={true}
          mapType={settings.baseMap === "satellite" ? "satellite" : mapType}
          customMapStyle={
            mapType === "standard" && !settings.overlays.traffic
              ? [
                  {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#A5D8FF" }],
                  },
                  {
                    featureType: "landscape",
                    elementType: "geometry",
                    stylers: [{ color: "#F1F5F9" }],
                  },
                  {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [{ color: "#FFFFFF" }],
                  },
                  {
                    featureType: "road",
                    elementType: "geometry.stroke",
                    stylers: [{ color: "#E2E8F0" }],
                  },
                ]
              : undefined
          }
        >
          {/* ZONES MODE - API Areas */}
          {viewMode === "zones" &&
            areas.map((area) => (
              <AreaCircleOverlay
                key={area.id}
                area={area}
                isSelected={selectedArea?.id === area.id}
                onPress={() => handleAreaPress(area)}
              />
            ))}

          {/* ROUTES MODE */}
          {viewMode === "routes" &&
            FLOOD_ROUTES.map((route) => (
              <WaterFlowRoute
                key={route.id}
                route={route}
                isSelected={selectedRoute?.id === route.id}
                onPress={() => handleRoutePress(route)}
              />
            ))}

          {/* Safe Route Polylines */}
          {safeRoute.hasResults && (
            <SafeRoutePolylines
              routes={safeRoute.getAllRoutes()}
              selectedIndex={safeRoute.selectedRouteIndex}
              onRoutePress={handleSelectRoute}
            />
          )}

          {/* Flood Warning Markers (safe route) */}
          {safeRoute.hasResults && (
            <FloodWarningMarkers warnings={safeRoute.floodWarnings} />
          )}

          {/* Destination Pin (when user has picked a destination) */}
          {endCoord && isRoutingUIVisible && (
            <Marker
              coordinate={endCoord}
              title="Điểm đến"
              description={destinationText}
            >
              <View
                style={{
                  backgroundColor: "#4F46E5",
                  borderRadius: 20,
                  padding: 8,
                  borderWidth: 3,
                  borderColor: "white",
                  elevation: 6,
                }}
              >
                <Ionicons name="flag" size={18} color="white" />
              </View>
            </Marker>
          )}

          {/* Street View Marker */}
          {streetViewLocation && (
            <Marker
              coordinate={streetViewLocation}
              onPress={() =>
                openStreetView(
                  streetViewLocation.latitude,
                  streetViewLocation.longitude
                )
              }
            >
              <View
                style={{
                  backgroundColor: "#F59E0B",
                  borderRadius: 20,
                  padding: 8,
                  borderWidth: 3,
                  borderColor: "white",
                  shadowColor: "#F59E0B",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="eye" size={20} color="white" />
              </View>
            </Marker>
          )}

          {/* Flood Severity Markers from API */}
          <FloodSeverityMarkers
            onMarkerPress={useCallback((feature) => {
              const [longitude, latitude] = feature.geometry.coordinates;

              setSelectedArea(null);
              setSelectedRoute(null);
              setSelectedZone(null);
              setSelectedStation(feature);

              Animated.timing(stationCardAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start();

              const LATITUDE_OFFSET = 0.008;
              mapRef.current?.animateToRegion({
                latitude: latitude - LATITUDE_OFFSET,
                longitude: longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.02,
              }, 400);
            }, [stationCardAnim, mapRef])}
          />
        </MapView>

        {/* Top Controls */}
        {!isRoutingUIVisible && !isPickingOnMap && (
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <MapTopControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </View>
        )}

        {/* Legend */}
        {showLegend && !isRoutingUIVisible && <Legend />}

        {/* Street View Hint */}
        {streetViewLocation && !isRoutingUIVisible && (
          <View
            style={{
              position: "absolute",
              top: 80,
              right: 16,
              backgroundColor: "rgba(245, 158, 11, 0.95)",
              borderRadius: 16,
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
              maxWidth: 200,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="eye" size={16} color="white" />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "white",
                flex: 1,
              }}
            >
              Nhấn marker để xem Street View
            </Text>
          </View>
        )}

        {/* Map Controls */}
        <View
          style={{
            position: "absolute",
            bottom: selectedZone || selectedRoute || safeRoute.hasResults ? 180 : 24,
            right: 16,
            zIndex: 10,
          }}
        >
          {!selectedRoute && !selectedZone && !isRoutingUIVisible && !safeRoute.hasResults && (
            <MapControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onMyLocation={() => goToMyLocation(userLocation)}
              is3DEnabled={is3DEnabled}
              onToggle3D={toggle3DView}
              showLegend={showLegend}
              onShowLegend={toggleLegend}
              onRotateLeft={() => rotateCamera("left")}
              onRotateRight={() => rotateCamera("right")}
              streetViewLocation={streetViewLocation}
              onClearStreetView={() => setStreetViewLocation(null)}
              onShowIsRouting={openRouting}
              onShowLayers={() => setShowLayerSheet(true)}
            />
          )}
        </View>

        {/* Selected Zone Card - now uses AreaCard */}
        {selectedArea && (
          <AreaCard
            area={selectedArea}
            slideAnim={areaCardAnim}
            onClose={() => {
              Animated.timing(areaCardAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
              }).start(() => setSelectedArea(null));
            }}
            onViewDetails={() => {
              Animated.timing(areaCardAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                router.push({
                  pathname: "/map/area/[areaId]",
                  params: { areaId: selectedArea.id }
                });
              });
            }}
          />
        )}

        {/* Selected Route Card */}
        {selectedRoute && showDetailPanels && (
          <RouteDetailCard
            route={selectedRoute}
            slideAnim={slideAnim}
            onClose={() => setSelectedRoute(null)}
          />
        )}

        {/* Routing Panel */}
        <RouteDirectionPanel
          visible={isRoutingUIVisible && !safeRoute.hasResults}
          onClose={handleCloseRouting}
          // Origin
          originText={useCurrentLocationAsOrigin ? "" : originText}
          onOriginChange={setOriginText}
          useCurrentLocationAsOrigin={useCurrentLocationAsOrigin}
          onUseGPSAsOrigin={useGPSAsOrigin}
          onPickOriginOnMap={startPickingOrigin}
          hasOriginCoord={startCoord !== null}
          // Destination
          destinationText={destinationText}
          onDestinationChange={setDestinationText}
          useCurrentLocationAsDest={useCurrentLocationAsDest}
          onUseGPSAsDest={() => {
            if (userLocation) useGPSAsDestination(userLocation);
          }}
          onPickDestinationOnMap={startPickingDestination}
          hasDestinationCoord={endCoord !== null}
          // Swap
          onSwap={swapOriginDestination}
          // Transport & Action
          transportMode={transportMode}
          onModeChange={setTransportMode}
          onFindRoute={handleFindRoute}
          isLoading={safeRoute.isLoading}
          error={safeRoute.error}
        />

        {/* Safe Route Results */}
        {safeRoute.hasResults && safeRoute.overallSafetyStatus && (
          <>
            <SafeRouteAlternatives
              routes={safeRoute.getAllRoutes()}
              selectedIndex={safeRoute.selectedRouteIndex}
              onSelectRoute={handleSelectRoute}
            />
            <SafeRouteResultCard
              route={safeRoute.getSelectedRoute()!}
              floodWarnings={safeRoute.floodWarnings}
              metadata={safeRoute.metadata}
              overallSafetyStatus={safeRoute.overallSafetyStatus}
              onClose={handleCloseRouteResults}
              onShowWarnings={() => setShowWarningsSheet(true)}
              slideAnim={routeResultCardAnim}
            />
          </>
        )}

        {/* Flood Station Detail Card */}
        {selectedStation && (
          <FloodStationCard
            station={selectedStation}
            slideAnim={stationCardAnim}
            onClose={() => {
              Animated.timing(stationCardAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
              }).start(() => setSelectedStation(null));
            }}
            onViewDetails={() => {
              Animated.timing(stationCardAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                router.push({
                  pathname: "/map/[stationId]",
                  params: { stationId: selectedStation.properties.stationId }
                });
              });
            }}
          />
        )}

        {/* Layer Toggle Sheet */}
        <LayerToggleSheet
          visible={showLayerSheet}
          onClose={() => setShowLayerSheet(false)}
        />

        {/* Safe Route Warnings Sheet */}
        <SafeRouteWarnings
          warnings={safeRoute.floodWarnings}
          visible={showWarningsSheet}
          onClose={() => setShowWarningsSheet(false)}
        />
      </View>
    </View>
  );
}
