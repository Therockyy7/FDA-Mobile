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
import { NearbyFloodReport } from "~/features/community/services/community.service";
import { AdminAreaConfirmModal } from "~/features/map/components/areas/AdminAreaConfirmModal";
import { PickOnMapOverlay } from "~/features/map/components/overlays/PickOnMapOverlay";
import { StreetViewHint } from "~/features/map/components/overlays/StreetViewHint";
import { CommunityReportMarker } from "~/features/map/components/reports/CommunityReportMarker";
import { CommunityReportSheet } from "~/features/map/components/reports/CommunityReportSheet";
import { RouteMarkers } from "~/features/map/components/routes/RouteMarkers";
import { STANDARD_MAP_STYLE } from "~/features/map/constants/map-style";

import { AreaCreationErrorModal } from "~/features/areas/components/AreaCreationErrorModal";
import { AreaCreationLoadingOverlay } from "~/features/areas/components/AreaCreationLoadingOverlay";
import { PremiumLimitModal } from "~/features/areas/components/PremiumLimitModal";
import { useControlArea } from "~/features/areas/hooks/useControlArea";
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
import { NavigationHUD } from "~/features/map/components/navigation/NavigationHUD";
import { MapLoadingOverlay } from "~/features/map/components/overlays/MapLoadingOverlay";
import { FloodWarningMarkers } from "~/features/map/components/routes/FloodWarningMarkers";
import { PlaceSearchSheet } from "~/features/map/components/routes/PlaceSearchSheet";
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
import { useMapCamera } from "~/features/map/hooks/useMapCamera";
import { useMapData } from "~/features/map/hooks/useMapData";
import { useMapDisplay } from "~/features/map/hooks/useMapDisplay";
import { useNavigation } from "~/features/map/hooks/useNavigation";
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
import type { LatLng } from "~/features/map/types/safe-route.types";

import type { MapType } from "~/features/map/types/map-display.types";

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    editAreaId?: string;
    editLat?: string;
    editLng?: string;
    editRadius?: string;
    editName?: string;
    editAddress?: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [showLayerSheet, setShowLayerSheet] = useState(false);
  const [showNavSearch, setShowNavSearch] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );
  const [areaDisplayMode, setAreaDisplayMode] = useState<"user" | "admin">(
    "user",
  );
  const [showAdminAreaConfirmModal, setShowAdminAreaConfirmModal] =
    useState(false);
  const [selectedAdminArea, setSelectedAdminArea] = useState<any>(null);

  const loadedBoundsRef = useRef<ViewportBounds | null>(null);
  const lastZoomModeRef = useRef<MapZoomMode | null>(null);

  // ── Data (settings, flood, areas, community reports, adminAreas, SignalR) ──
  const {

    settings,
    areas,
    floodSeverity,
    communityReports,
    adminAreas,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  } = useMapData();

  // ── Safe route + flood map selection (merged) ──
  const safeRoute = useSafeRoute();
  const {
    selectedZone,
    setSelectedZone,
    selectedRoute,
    setSelectedRoute,
    showDetailPanels,
  } = safeRoute;

  // ── User location ──
  const { location: userLocation, permissionGranted: locationPermission } =
    useUserLocation();

  const [showResultCard, setShowResultCard] = useState(false);
  const [showWarningsSheet, setShowWarningsSheet] = useState(false);

  // ── Map camera ──
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
    focusOnRoute,
  } = useMapCamera();

  // ── Turn-by-turn navigation ──
  const nav = useNavigation({
    route: safeRoute.getSelectedRoute(),
    mapRef,
  });

  const handleStartNavigation = useCallback(() => {
    nav.startNavigation();
  }, [nav]);

  const handleStopNavigation = useCallback(() => {
    nav.stopNavigation();
    const currentRoute = safeRoute.getSelectedRoute();
    if (currentRoute) {
      const bounds = getRouteBounds(currentRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);
    }
  }, [nav, safeRoute, mapRef]);

  // ── Selected station (derived from Redux via useMapData) ──
  const selectedStation = useMemo(() => {
    if (!selectedStationId || !floodSeverity?.features) return null;
    return (
      floodSeverity.features.find(
        (f): f is FloodSeverityFeature =>
          f.geometry.type === "Point" &&
          (f as FloodSeverityFeature).properties.stationId === selectedStationId,
      ) ?? null
    );
  }, [selectedStationId, floodSeverity]);

  const [selectedCommunityReport, setSelectedCommunityReport] =
    useState<NearbyFloodReport | null>(null);

  // ── Street view ──
  const {
    streetViewLocation,
    setStreetViewLocation,
    openStreetView,
    handleMapLongPress,
  } = useStreetView();

  // ── Routing UI (UI state + location data) ──
  const {
    isRoutingUIVisible,
    openRouting,
    closeRouting,
    transportMode,
    setTransportMode,
    originText,
    setOriginText,
    startCoord,
    setStartCoord,
    destinationText,
    setDestinationText,
    endCoord,
    setEndCoord,
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
  } = useRoutingUI();

  // ── Map display (view mode, map type, legend) ──
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
    // Load markers for initial region with buffer
    const initialBounds = getBufferedBounds(DANANG_CENTER);
    loadedBoundsRef.current = initialBounds;
    lastZoomModeRef.current = getZoomMode(DANANG_CENTER.latitudeDelta);

    if (settings.overlays.flood) {
      refreshFloodSeverity(initialBounds);
    }

    if (settings.overlays.communityReports) {
      const radiusMeters = (DANANG_CENTER.latitudeDelta / 2) * 111320;
      console.log("📢 Fetching community reports:", {
        lat: DANANG_CENTER.latitude,
        lng: DANANG_CENTER.longitude,
        radiusMeters: Math.round(radiusMeters),
      });
      refreshNearbyFloodReports({
        latitude: DANANG_CENTER.latitude,
        longitude: DANANG_CENTER.longitude,
        radiusMeters: Math.round(radiusMeters),
        hours: 720,
      });
    }

    // Load areas
    refreshAreas();
  }, [
    settings.overlays.flood,
    settings.overlays.communityReports,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  ]);

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
    if (nav.isNavigating) {
      nav.stopNavigation();
    }
    closeRouting();
    handleClearAllRoutes();
    resetRouting();
  }, [nav, closeRouting, handleClearAllRoutes, resetRouting]);

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
    updateDraftAreaFromMapCenter,
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
      setEndCoord(coord);
      setDestinationText(label);
      // Set origin as GPS by default
      selectGPSAsOrigin();
      // Open routing panel
      openRouting();
      // Zoom to destination
      mapRef.current?.animateToRegion(
        {
          latitude: coord.latitude,
          longitude: coord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
      setShowNavSearch(false);
    },
    [setEndCoord, setDestinationText, selectGPSAsOrigin, openRouting, mapRef],
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
        if (!settings.overlays.flood && !settings.overlays.communityReports)
          return;

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

        if (settings.overlays.flood) {
          refreshFloodSeverity(bufferedBounds);
        }

        if (settings.overlays.communityReports) {
          const radiusMeters = (newRegion.latitudeDelta / 2) * 111320;
          refreshNearbyFloodReports({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            radiusMeters: Math.round(radiusMeters),
            hours: 720, // 30 days
          });
        }
      }, 400),
    [
      refreshFloodSeverity,
      refreshNearbyFloodReports,
      settings.overlays.flood,
      settings.overlays.communityReports,
    ],
  );

  const handleRegionChange = useCallback(
    (newRegion: Region) => {
      onRegionChangeComplete(newRegion);
      fetchMarkersInViewPort(newRegion);
      updateDraftAreaFromMapCenter(newRegion);
    },
    [
      onRegionChangeComplete,
      fetchMarkersInViewPort,
      updateDraftAreaFromMapCenter,
    ],
  );

  // Detect user pan during navigation to disable camera follow
  const handleMapTouchStart = useCallback(() => {
    if (nav.isNavigating && nav.isFollowingUser) {
      nav.setIsFollowingUser(false);
    }
  }, [nav]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header: hide during navigation, show RouteDirectionPanel or MapHeader */}
      {nav.isNavigating ? null : isRoutingUIVisible &&
        !safeRoute.hasResults &&
        !isPickingOnMap ? (
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

        {/* Navigation HUD (shown during active navigation) */}
        {nav.isNavigating && (
          <NavigationHUD
            instruction={nav.currentInstruction}
            nextInstruction={nav.nextInstruction}
            distanceToNextTurn={nav.distanceToNextTurn}
            remainingDistance={nav.remainingDistance}
            remainingTime={nav.remainingTime}
            isOffRoute={nav.isOffRoute}
            isFollowingUser={nav.isFollowingUser}
            onExit={handleStopNavigation}
            onRecenter={nav.recenterCamera}
          />
        )}

        {/* Pick on Map: Center Pin (Grab-style) */}
        <PickOnMapOverlay
          visible={isPickingOnMap}
          pickingTarget={pickingTarget}
          onConfirm={handleConfirmPickOnMap}
          onCancel={cancelPicking}
        />

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
          onPanDrag={handleMapTouchStart}
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
              ? STANDARD_MAP_STYLE
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
            adminAreas.map((area) => {
              return (
                <AdminAreaPolygon
                  key={area.id}
                  area={area}
                  onPress={(selectedArea) => {
                    setSelectedAdminArea(selectedArea);
                    setShowAdminAreaConfirmModal(true);
                  }}
                />
              );
            })}

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

          {/* Origin & Destination Pins */}
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

          {/* Community Reports */}
          {settings.overlays.communityReports &&
            communityReports.map((report) => (
              <CommunityReportMarker
                key={`community-report-${report.id}`}
                report={report}
                mapRef={mapRef}
                onPress={(r) => {
                  setSelectedArea(null);
                  setSelectedRoute(null);
                  setSelectedZone(null);
                  setSelectedStationId(null);
                  setSelectedCommunityReport(r);
                }}
              />
            ))}

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

        {/* Legend */}
        {showLegend && !isRoutingUIVisible && <Legend />}

        {/* Street View Hint */}
        <StreetViewHint visible={!!streetViewLocation && !isRoutingUIVisible} />

        {/* Map Controls - Hide during create area mode and when timeline is active */}
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
            selectGPSAsOrigin();
            openRouting();
            startPickingDestination();
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

        {/* Community Report Bottom Sheet */}
        <MapBottomSheet
          isOpen={!!selectedCommunityReport}
          onClose={() => setSelectedCommunityReport(null)}
          snapPoints={["60%", "90%"]}
        >
          {selectedCommunityReport && (
            <CommunityReportSheet
              report={selectedCommunityReport}
              onClose={() => setSelectedCommunityReport(null)}
            />
          )}
        </MapBottomSheet>

        {/* Safe Route Bottom Panel (alternatives + result card) — hidden during navigation */}
        {safeRoute.hasResults &&
          safeRoute.overallSafetyStatus &&
          !nav.isNavigating && (
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
                  onStartNavigation={handleStartNavigation}
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
        <AdminAreaConfirmModal
          visible={showAdminAreaConfirmModal}
          adminArea={selectedAdminArea}
          onClose={() => {
            setShowAdminAreaConfirmModal(false);
            setSelectedAdminArea(null);
          }}
        />

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
