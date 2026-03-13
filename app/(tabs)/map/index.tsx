// app/(tabs)/map/index.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Text } from "~/components/ui/text";
import { AreaCreationErrorModal } from "~/features/areas/components/AreaCreationErrorModal";
import { AreaCreationLoadingOverlay } from "~/features/areas/components/AreaCreationLoadingOverlay";
import { PremiumLimitModal } from "~/features/areas/components/PremiumLimitModal";
import { useControlArea } from "~/features/areas/hooks/useControlArea";
import { fetchAdminAreas } from "~/features/areas/stores/admin-area.slice";
import { AddressSearchSheet } from "~/features/map/components/areas/AddressSearchSheet";
import { AdminAreaPolygon } from "~/features/map/components/areas/AdminAreaPolygon";
import { AreaCard } from "~/features/map/components/areas/AreaCard";
import { AreaCircleOverlay } from "~/features/map/components/areas/AreaCircleOverlay";
import { AreaCreationOptionSheet } from "~/features/map/components/areas/AreaCreationOptionSheet";
import { AreaPreviewCircle } from "~/features/map/components/areas/AreaPreviewCircle";
import { CreateAreaSheet } from "~/features/map/components/areas/CreateAreaSheet";
import { RadiusAdjustBar } from "~/features/map/components/areas/RadiusAdjustBar";
import { MapBottomSheet } from "~/features/map/components/common/MapBottomSheet";
import { LayerToggleSheet } from "~/features/map/components/controls/LayerToggleSheet";
import Legend from "~/features/map/components/controls/Legend";
import { MapControls } from "~/features/map/components/controls/MapControls";
import { MapLoadingOverlay } from "~/features/map/components/overlays/MapLoadingOverlay";
import { PlaceSearchSheet } from "~/features/map/components/routes/PlaceSearchSheet";
import type { LatLng } from "~/features/map/types/safe-route.types";
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
import { FloodZonePolygons } from "~/features/map/components/stations/FloodZonePolygons";
import { MapHeader } from "~/features/map/components/ui/MapHeader";
import {
  DANANG_CENTER,
  FLOOD_ROUTES,
  FloodRoute,
} from "~/features/map/constants/map-data";
import { useFloodSelection } from "~/features/map/hooks/useFloodSelection";
import { useFloodSignalR } from "~/features/map/hooks/useFloodSignalR";
import { useMapCamera } from "~/features/map/hooks/useMapCamera";
import { useMapDisplay } from "~/features/map/hooks/useMapDisplay";
import { useMapLayerSettings } from "~/features/map/hooks/useMapLayerSettings";
import { useRoutingUI } from "~/features/map/hooks/useRoutingUI";
import { useSafeRoute } from "~/features/map/hooks/useSafeRoute";
import { useStreetView } from "~/features/map/hooks/useStreetView";
import { useUserLocation } from "~/features/map/hooks/useUserLocation";
import {
  debounce,
  getBufferedBounds,
  getZoomMode,
  isViewportOutsideBuffer,
  type MapZoomMode,
  type ViewportBounds,
} from "~/features/map/lib/map-utils";
import { getRouteBounds } from "~/features/map/lib/polyline-utils";
import { FloodSeverityFeature } from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

type MapType = "standard" | "satellite" | "hybrid";

export default function MapScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const params = useLocalSearchParams<{
    editAreaId?: string;
    editLat?: string;
    editLng?: string;
    editRadius?: string;
    editName?: string;
    editAddress?: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLayerSheet, setShowLayerSheet] = useState(false);
  const [showNavSearch, setShowNavSearch] = useState(false);
  const [selectedStationId, setSelectedStationId] =
    useState<string | null>(null);
  const [areaDisplayMode, setAreaDisplayMode] = useState<"user" | "admin">(
    "user",
  );
  const [showAdminAreaConfirmModal, setShowAdminAreaConfirmModal] =
    useState(false);
  const [selectedAdminArea, setSelectedAdminArea] = useState<any>(null);

  const dispatch = useAppDispatch();
  const { items: adminAreas } = useAppSelector((state) => state.adminAreas);

  const loadedBoundsRef = useRef<ViewportBounds | null>(null);
  const lastZoomModeRef = useRef<MapZoomMode | null>(null);

  const { settings, areas, floodSeverity, refreshFloodSeverity, refreshAreas } =
    useMapLayerSettings();

  // Get selected station from Redux store (real-time updates via SignalR)
  const selectedStation = useMemo(() => {
    if (!selectedStationId || !floodSeverity?.features) return null;
    return floodSeverity.features.find(
      (f): f is FloodSeverityFeature =>
        f.geometry.type === "Point" &&
        (f as FloodSeverityFeature).properties.stationId === selectedStationId
    ) ?? null;
  }, [selectedStationId, floodSeverity]);

  // Connect to SignalR for real-time flood updates
  useFloodSignalR(settings.overlays.flood);

  // Safe route state
  const safeRoute = useSafeRoute();
  const { location: userLocation, permissionGranted: locationPermission } =
    useUserLocation();
  const [showResultCard, setShowResultCard] = useState(false);
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
    setGPSAsOrigin,
    destinationText,
    setDestinationText,
    endCoord,
    useCurrentLocationAsDest,
    setGPSAsDestination,
    isUsingGPSOrigin,
    selectGPSAsOrigin,
    isUsingGPSDest,
    selectGPSAsDestination,
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
      // Load markers for initial region with buffer
      const initialBounds = getBufferedBounds(DANANG_CENTER);
      loadedBoundsRef.current = initialBounds;
      lastZoomModeRef.current = getZoomMode(DANANG_CENTER.latitudeDelta);
      refreshFloodSeverity(initialBounds);
      // Load areas
      refreshAreas();
    }
  }, [settings.overlays.flood, refreshFloodSeverity, refreshAreas]);

  // Fetch Admin Areas if not already loaded
  useEffect(() => {
    if (adminAreas.length === 0) {
      dispatch(fetchAdminAreas({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, adminAreas.length]);

  useEffect(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, [viewMode]);

  // ==================== SAFE ROUTE HANDLERS ====================

  const handleFindRoute = useCallback(async () => {
    const start = isUsingGPSOrigin
      ? (userLocation ?? {
          latitude: DANANG_CENTER.latitude,
          longitude: DANANG_CENTER.longitude,
        })
      : (startCoord ??
        userLocation ?? {
          latitude: DANANG_CENTER.latitude,
          longitude: DANANG_CENTER.longitude,
        });

    if (!endCoord) return;

    await safeRoute.findRoute(start, endCoord, transportMode);
  }, [
    isUsingGPSOrigin,
    startCoord,
    userLocation,
    endCoord,
    transportMode,
    safeRoute,
  ]);

  // Fit map to route after results arrive
  useEffect(() => {
    if (safeRoute.primaryRoute) {
      const bounds = getRouteBounds(safeRoute.primaryRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);

      const hasAlternatives = safeRoute.alternativeRoutes.length > 0;
      if (!hasAlternatives) {
        // Only 1 route → show result card immediately
        setShowResultCard(true);
      } else {
        // Multiple routes → hide result card, let user pick from alternatives
        setShowResultCard(false);
      }
    }
  }, [safeRoute.primaryRoute, safeRoute.alternativeRoutes, mapRef]);

  const handleSelectRoute = useCallback(
    (index: number) => {
      safeRoute.selectRoute(index);
      const allRoutes = safeRoute.getAllRoutes();
      const selected = allRoutes[index];
      if (selected) {
        const bounds = getRouteBounds(selected.coordinates);
        mapRef.current?.animateToRegion(bounds, 400);
      }
      setShowResultCard(true);
    },
    [safeRoute, mapRef],
  );

  const handleCloseRouteResults = useCallback(() => {
    // If only 1 route, close entire routing mode
    if (safeRoute.getAllRoutes().length <= 1) {
      setShowResultCard(false);
      safeRoute.clearRoutes();
      closeRouting();
      resetRouting();
    } else {
      setShowResultCard(false);
    }
  }, [safeRoute, closeRouting, resetRouting]);

  const handleClearAllRoutes = useCallback(() => {
    setShowResultCard(false);
    safeRoute.clearRoutes();
  }, [safeRoute]);

  const handleCloseRouting = useCallback(() => {
    closeRouting();
    handleClearAllRoutes();
    resetRouting();
  }, [closeRouting, handleClearAllRoutes, resetRouting]);

  // ==================== AREA CONTROL ====================

  // Area control hook - all area-related state and handlers
  const {
    selectedArea,
    isAdjustingRadius,
    showCreateAreaSheet,
    isCreatingArea,
    draftAreaCenter,
    draftAreaRadius,
    editingArea,
    // NEW: Option selection states
    showCreationOptions,
    showAddressSearch,
    draftAddress,
    setSelectedArea,
    setDraftAreaRadius,
    setDraftAreaCenter,
    handleAreaPress,
    handleCloseAreaCard,
    handleDeleteArea,
    handleStartCreateArea,
    handleStartEditArea,
    handleStartEditAreaFromParams,
    handleConfirmLocation,
    handleCancelCreateArea,
    handleCreateAreaSubmit,
    handleCloseCreateArea,
    handleMapPress: handleAreaMapPress,
    // NEW: Option selection handlers
    handleOptionSelect,
    handleAddressSelected,
    handleCloseCreationOptions,
    handleCloseAddressSearch,
    // Premium limit states and handlers
    showPremiumLimitModal,
    currentAreaCount,
    freeAreaLimit,
    handleClosePremiumLimitModal,
    handleUpgradePremium,
    // Loading states
    isCheckingLimit,
    isLoadingLocation,
    isLoadingSearch,
    // Error states and handlers
    areaError,
    handleCloseErrorModal,
  } = useControlArea({
    mapRef,
    region,
    refreshAreas: () => {
      refreshAreas();
    },
    clearSelections: () => {
      setSelectedRoute(null);
      setSelectedZone(null);
      setSelectedStationId(null);
    },
  });

  // Handle edit params from Areas screen navigation
  useEffect(() => {
    if (
      params.editAreaId &&
      params.editLat &&
      params.editLng &&
      params.editRadius
    ) {
      const lat = parseFloat(params.editLat);
      const lng = parseFloat(params.editLng);
      const radius = parseFloat(params.editRadius);

      handleStartEditAreaFromParams({
        id: params.editAreaId,
        name: params.editName || "",
        latitude: lat,
        longitude: lng,
        radiusMeters: radius,
        addressText: params.editAddress || "",
      });

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: (radius / 111320) * 4,
          longitudeDelta: (radius / 111320) * 4,
        },
        500,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.editAreaId]);

  // ==================== NAV FAB: destination-first flow ====================
  const handleNavDestinationSelected = useCallback(
    (coord: LatLng, label: string) => {
      // Set destination
      routingUI.setEndCoord(coord);
      routingUI.setDestinationText(label);
      // Set origin as GPS by default
      routingUI.selectGPSAsOrigin();
      // Open routing panel
      routingUI.openRouting();
      // Zoom to destination
      mapRef.current?.animateToRegion(
        {
          latitude: coord.latitude,
          longitude: coord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
      setShowNavSearch(false);
    },
    [routingUI]
  );

  // ==================== PICK ON MAP: confirm center pin ====================
  const handleConfirmPickOnMap = useCallback(async () => {
    if (!mapRef.current) return;
    try {
      const camera = await mapRef.current.getCamera();
      const { latitude, longitude } = camera.center;

      let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (results.length > 0) {
          const place = results[0];
          const parts = [place.street, place.district, place.city].filter(
            Boolean,
          );
          if (parts.length > 0) label = parts.join(", ");
        }
      } catch {
        // Keep coordinate label
      }

      setPointFromMap({ latitude, longitude }, label);
    } catch {
      // Camera read failed
    }
  }, [setPointFromMap]);

  // ==================== MAP PRESS (combined) ====================

  const handleMapPress = useCallback(
    async (event: MapPressEvent) => {
      // During pick-on-map mode, ignore taps (user uses center pin + confirm button)
      if (isPickingOnMap) return;

      // Otherwise delegate to area creation
      handleAreaMapPress(event);
    },
    [isPickingOnMap, handleAreaMapPress],
  );

  // ==================== EXISTING HANDLERS ====================

  const handleRoutePress = (route: FloodRoute) => {
    setSelectedZone(null);
    setSelectedArea(null);
    setSelectedRoute(route);
    focusOnRoute(route);
  };

  const fetchMarkersInViewPort = useMemo(
    () =>
      debounce((newRegion: Region) => {
        if (!settings.overlays.flood) return;

        const currentZoomMode = getZoomMode(newRegion.latitudeDelta);
        const zoomModeChanged = currentZoomMode !== lastZoomModeRef.current;

        if (
          !zoomModeChanged &&
          !isViewportOutsideBuffer(newRegion, loadedBoundsRef.current)
        ) {
          return;
        }

        const bufferedBounds = getBufferedBounds(newRegion);

        loadedBoundsRef.current = bufferedBounds;
        lastZoomModeRef.current = currentZoomMode;

        console.log(
          `📍 Fetching markers [${currentZoomMode}]:`,
          bufferedBounds,
        );
        refreshFloodSeverity(bufferedBounds);
      }, 400),
    [refreshFloodSeverity, settings.overlays.flood],
  );

  const handleRegionChange = useCallback(
    (newRegion: Region) => {
      onRegionChangeComplete(newRegion);
      fetchMarkersInViewPort(newRegion);
    },
    [onRegionChangeComplete, fetchMarkersInViewPort],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header: show MapHeader normally, hide when routing panel is visible */}
      {isRoutingUIVisible && !safeRoute.hasResults && !isPickingOnMap ? (
        <RouteDirectionPanel
          visible={true}
          onClose={handleCloseRouting}
          // Origin
          originText={isUsingGPSOrigin ? "" : originText}
          onOriginChange={setOriginText}
          isUsingGPSOrigin={isUsingGPSOrigin}
          onUseGPSAsOrigin={selectGPSAsOrigin}
          onPickOriginOnMap={startPickingOrigin}
          hasOriginCoord={startCoord !== null}
          onOriginPlaceSelected={(coord) => {
            routingUI.setStartCoord(coord);
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
          // Destination
          destinationText={destinationText}
          onDestinationChange={setDestinationText}
          isUsingGPSDest={isUsingGPSDest}
          onUseGPSAsDest={() => {
            if (userLocation) selectGPSAsDestination(userLocation);
          }}
          onPickDestinationOnMap={startPickingDestination}
          hasDestinationCoord={endCoord !== null}
          onDestinationPlaceSelected={(coord) => {
            routingUI.setEndCoord(coord);
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
          // Swap
          onSwap={swapOriginDestination}
          // Transport & Action
          transportMode={transportMode}
          onModeChange={setTransportMode}
          onFindRoute={handleFindRoute}
          isLoading={safeRoute.isLoading}
          error={safeRoute.error}
        />
      ) : (
        <MapHeader
          stats={stats}
          mapType={mapType as MapType}
          onMapTypeChange={handleMapTypeChange}
          onShowLayers={() => setShowLayerSheet(true)}
          onCreateArea={handleStartCreateArea}
          showCreateAreaButton={
            viewMode === "zones" &&
            !isRoutingUIVisible &&
            !selectedArea &&
            !isAdjustingRadius &&
            !showCreateAreaSheet
          }
        />
      )}

      <View style={{ flex: 1, position: "relative" }}>
        {/* Loading Overlay */}
        <MapLoadingOverlay visible={isLoading} />

        {/* Pick on Map: Center Pin (Grab-style) */}
        {isPickingOnMap && (
          <>
            {/* Center pin marker */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 36 }}>
                <Ionicons
                  name="location-sharp"
                  size={40}
                  color={pickingTarget === "origin" ? "#16A34A" : "#4F46E5"}
                />
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#374151",
                    marginTop: -4,
                  }}
                />
              </View>
            </View>

            {/* Bottom confirm card */}
            <View
              style={{
                position: "absolute",
                bottom: 24,
                left: 16,
                right: 16,
                zIndex: 50,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                {pickingTarget === "origin" ? "Chọn điểm đi" : "Chọn điểm đến"}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  marginBottom: 12,
                }}
              >
                Di chuyển bản đồ để đặt vị trí tại điểm ghim
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={cancelPicking}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 999,
                    backgroundColor: "#F3F4F6",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmPickOnMap}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 999,
                    backgroundColor:
                      pickingTarget === "origin" ? "#16A34A" : "#4F46E5",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
                    Xác nhận
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
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
          {/* ZONES MODE - User Created Areas */}
          {viewMode === "zones" &&
            areaDisplayMode === "user" &&
            areas.map((area) => (
              <AreaCircleOverlay
                key={area.id}
                area={area}
                isSelected={selectedArea?.id === area.id}
                onPress={() => handleAreaPress(area)}
              />
            ))}

          {/* Admin Areas Polygons */}
          {viewMode === "zones" &&
            areaDisplayMode === "admin" &&
            adminAreas.map((area) => (
              <AdminAreaPolygon
                key={area.id}
                area={area}
                onPress={(selectedArea) => {
                  setSelectedAdminArea(selectedArea);
                  setShowAdminAreaConfirmModal(true);
                }}
              />
            ))}

          {/* Draft Area Preview Circle - Draggable during Step 1 */}
          {draftAreaCenter && (
            <AreaPreviewCircle
              center={draftAreaCenter}
              radiusMeters={draftAreaRadius}
              visible={isAdjustingRadius || showCreateAreaSheet}
              onCenterChange={
                isAdjustingRadius ? setDraftAreaCenter : undefined
              }
            />
          )}

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

          {/* Origin Pin */}
          {isRoutingUIVisible && (() => {
            const originMarkerCoord = isUsingGPSOrigin ? userLocation : startCoord;
            if (!originMarkerCoord) return null;
            return (
              <Marker
                coordinate={originMarkerCoord}
                title="Điểm đi"
                description={isUsingGPSOrigin ? "Vị trí hiện tại" : originText}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="location-sharp" size={40} color="#16A34A" />
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "#374151",
                      marginTop: -4,
                    }}
                  />
                </View>
              </Marker>
            );
          })()}

          {/* Destination Pin */}
          {endCoord && isRoutingUIVisible && (
            <Marker
              coordinate={endCoord}
              title="Điểm đến"
              description={destinationText}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={{ alignItems: "center" }}>
                <Ionicons name="location-sharp" size={40} color="#4F46E5" />
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#374151",
                    marginTop: -4,
                  }}
                />
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
                  streetViewLocation.longitude,
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

          {/* Flood Zone Polygons (rendered below station markers) */}
          <FloodZonePolygons />

          {/* Flood Severity Markers from API */}
          <FloodSeverityMarkers
            onMarkerPress={useCallback(
              (feature) => {
                const [longitude, latitude] = feature.geometry.coordinates;

                setSelectedArea(null);
                setSelectedRoute(null);
                setSelectedZone(null);
                setSelectedStationId(feature.properties.stationId);

                const LATITUDE_OFFSET = 0.008;
                mapRef.current?.animateToRegion(
                  {
                    latitude: latitude - LATITUDE_OFFSET,
                    longitude: longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.02,
                  },
                  400,
                );
              },
              [mapRef],
            )}
          />
        </MapView>

        {/* Top Controls - Hide during create area mode and picking */}
        {/* {!isRoutingUIVisible &&
          !isPickingOnMap &&
          !isAdjustingRadius &&
          !showCreateAreaSheet && (
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
          )} */}

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

        {/* Map Controls - Hide during create area mode */}
        <View
          style={{
            position: "absolute",
            bottom:
              selectedZone || selectedRoute || safeRoute.hasResults ? 180 : 24,
            right: 16,
            zIndex: 10,
          }}
        >
          {!selectedRoute &&
            !selectedZone &&
            !selectedArea &&
            !selectedStationId &&
            !isRoutingUIVisible &&
            !safeRoute.hasResults &&
            !isAdjustingRadius &&
            !showCreateAreaSheet && (
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

        {/* Navigation FAB (Google Maps style) */}
        {!isRoutingUIVisible &&
          !isPickingOnMap &&
          !safeRoute.hasResults &&
          !selectedRoute &&
          !selectedZone &&
          !selectedArea &&
          !selectedStationId &&
          !isAdjustingRadius &&
          !showCreateAreaSheet && (
            <TouchableOpacity
              onPress={() => setShowNavSearch(true)}
              activeOpacity={0.8}
              style={{
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
              }}
            >
              <Ionicons name="navigate" size={24} color="white" />
            </TouchableOpacity>
          )}

        {/* Nav FAB: Destination search sheet */}
        <PlaceSearchSheet
          visible={showNavSearch}
          onClose={() => setShowNavSearch(false)}
          onSelectPlace={handleNavDestinationSelected}
          onPickOnMap={() => {
            setShowNavSearch(false);
            routingUI.selectGPSAsOrigin();
            routingUI.openRouting();
            routingUI.startPickingDestination();
          }}
          onUseGPS={() => setShowNavSearch(false)}
          showGPSOption={false}
          placeholder="Bạn muốn đi đâu?"
          accentColor="#2563EB"
        />

        {/* Selected Area Bottom Sheet */}
        <MapBottomSheet
          isOpen={!!selectedArea}
          onClose={() => setSelectedArea(null)}
          snapPoints={["50%", "75%"]}
        >
          {selectedArea && (
            <AreaCard
              area={selectedArea}
              onClose={() => setSelectedArea(null)}
              onEdit={handleStartEditArea}
              onDelete={handleDeleteArea}
              onViewDetails={() => {
                setSelectedArea(null);
                router.push({
                  pathname: "/areas/[id]",
                  params: { id: selectedArea.id },
                });
              }}
            />
          )}
        </MapBottomSheet>

        {/* Selected Route Bottom Sheet */}
        <MapBottomSheet
          isOpen={!!selectedRoute && showDetailPanels}
          onClose={() => setSelectedRoute(null)}
          snapPoints={["45%", "75%"]}
        >
          {selectedRoute && (
            <RouteDetailCard
              route={selectedRoute}
              onClose={() => setSelectedRoute(null)}
            />
          )}
        </MapBottomSheet>

        {/* Safe Route Bottom Panel (alternatives + result card) */}
        {safeRoute.hasResults && safeRoute.overallSafetyStatus && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 35,
              paddingBottom: 16,
              gap: 10,
            }}
          >
            <SafeRouteAlternatives
              routes={safeRoute.getAllRoutes()}
              selectedIndex={safeRoute.selectedRouteIndex}
              onSelectRoute={handleSelectRoute}
              onExitRouting={handleCloseRouting}
            />
            {showResultCard && (
              <SafeRouteResultCard
                route={safeRoute.getSelectedRoute()!}
                floodWarnings={safeRoute.floodWarnings}
                metadata={safeRoute.metadata}
                onClose={handleCloseRouteResults}
                onShowWarnings={() => setShowWarningsSheet(true)}
              />
            )}
          </View>
        )}

        {/* Flood Station Bottom Sheet */}
        <MapBottomSheet
          isOpen={!!selectedStationId}
          onClose={() => setSelectedStationId(null)}
          snapPoints={["40%", "55%"]}
        >
          {selectedStationId && selectedStation && (
            <FloodStationCard
              station={selectedStation}
              onClose={() => setSelectedStationId(null)}
              onViewDetails={() => {
                setSelectedStationId(null);
                router.push(`/map/${selectedStationId}`);
              }}
            />
          )}
        </MapBottomSheet>

        {/* Layer Toggle Sheet */}
        <LayerToggleSheet
          visible={showLayerSheet}
          onClose={() => setShowLayerSheet(false)}
          areaDisplayMode={areaDisplayMode}
          onAreaDisplayModeChange={setAreaDisplayMode}
        />

        {/* Admin Area Confirmation Modal */}
        {showAdminAreaConfirmModal && selectedAdminArea && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <View
              style={{
                backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
                borderRadius: 24,
                padding: 24,
                marginHorizontal: 20,
                width: "90%",
                maxWidth: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#3B82F620",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="analytics" size={32} color="#3B82F6" />
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Xem Dự báo AI
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Bạn có muốn xem phân tích rủi ro ngập lụt của AI cho khu vực{" "}
                  <Text style={{ fontWeight: "700", color: "#3B82F6" }}>
                    {selectedAdminArea.name}
                  </Text>
                  ?
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAdminAreaConfirmModal(false);
                    router.push({
                      pathname: "/prediction/[id]",
                      params: {
                        id: selectedAdminArea.id,
                        name: selectedAdminArea.name,
                      },
                    });
                  }}
                  style={{
                    backgroundColor: "#3B82F6",
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Xem Dự báo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowAdminAreaConfirmModal(false);
                    setSelectedAdminArea(null);
                  }}
                  style={{
                    backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: isDarkColorScheme ? "#F1F5F9" : "#64748B",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Hủy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Step 1: Radius Adjust Bar */}
        <RadiusAdjustBar
          visible={isAdjustingRadius}
          radius={draftAreaRadius}
          onRadiusChange={setDraftAreaRadius}
          onConfirm={handleConfirmLocation}
          onCancel={handleCancelCreateArea}
        />

        {/* Step 2: Create Area Sheet (Name + Address only) */}
        <CreateAreaSheet
          visible={showCreateAreaSheet}
          onClose={handleCloseCreateArea}
          onSubmit={handleCreateAreaSubmit}
          radiusMeters={draftAreaRadius}
          isLoading={isCreatingArea}
          initialValues={
            editingArea
              ? {
                  name: editingArea.name,
                  addressText: editingArea.addressText || "",
                }
              : draftAddress
                ? { name: "", addressText: draftAddress }
                : undefined
          }
        />

        {/* Area Creation Option Sheet */}
        <AreaCreationOptionSheet
          visible={showCreationOptions}
          onClose={handleCloseCreationOptions}
          onSelectOption={handleOptionSelect}
          isLoadingGps={isLoadingLocation}
          isLoadingSearch={isLoadingSearch}
        />

        {/* Address Search Sheet */}
        <AddressSearchSheet
          visible={showAddressSearch}
          onClose={handleCloseAddressSearch}
          onSelectLocation={handleAddressSelected}
        />

        {/* Premium Limit Modal */}
        <PremiumLimitModal
          visible={showPremiumLimitModal}
          onClose={handleClosePremiumLimitModal}
          onUpgrade={handleUpgradePremium}
          currentCount={currentAreaCount}
          maxCount={freeAreaLimit}
        />

        {/* Area Creation Loading Overlay */}
        <AreaCreationLoadingOverlay
          visible={isCheckingLimit}
          message="Đang kiểm tra..."
          subMessage="Đang xác minh giới hạn vùng của bạn"
        />

        {/* Area Creation Error Modal */}
        <AreaCreationErrorModal
          visible={!!areaError}
          error={areaError}
          onClose={handleCloseErrorModal}
          onChangeLocation={handleCancelCreateArea}
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
