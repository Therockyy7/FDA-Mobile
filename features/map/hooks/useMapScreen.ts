// features/map/hooks/useMapScreen.ts
// Extracts all event handlers and effects from MapScreen.
// Receives already-instantiated hook results as context object.

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Region } from "react-native-maps";
import type { MapPressEvent } from "react-native-maps";
import type { NearbyFloodReport } from "~/features/community/services/community.service";
import type { FloodRoute } from "../constants/map-data";
import { DANANG_CENTER } from "../constants/map-data";
import {
  debounce,
  getBufferedBounds,
  getZoomMode,
  isViewportOutsideBuffer,
  type MapZoomMode,
  type ViewportBounds,
} from "../lib/map-utils";
import { getRouteBounds } from "../lib/polyline-utils";
import { LocationService } from "../services/location.service";
import type { FloodSeverityFeature } from "../types/map-layers.types";
import type { FloodStatusParams, MapLayerSettings } from "../types/map-layers.types";
import type { FloodZone } from "../types/map-data.types";
import type { AreaWithStatus } from "../types/map-layers.types";
import type { TransportMode } from "../types/routing.types";
import type { LatLng } from "../types/safe-route.types";
import type { useNavigation } from "./useNavigation";
import type { useSafeRoute } from "./routing/useSafeRoute";
import type MapView from "react-native-maps";

interface EditAreaParams {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  addressText: string;
}

interface MapScreenCtx {
  // Data
  settings: MapLayerSettings;
  refreshFloodSeverity: (params?: FloodStatusParams) => void;
  refreshAreas: () => void;
  refreshNearbyFloodReports: (params: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    hours: number;
  }) => void;

  // Camera
  mapRef: React.RefObject<MapView | null>;
  focusOnRoute: (route: FloodRoute) => void;
  onRegionChangeComplete: (region: Region) => void;

  // Navigation
  nav: ReturnType<typeof useNavigation>;

  // Safe route
  safeRoute: ReturnType<typeof useSafeRoute>;

  // Routing UI
  isUsingGPSOrigin: boolean;
  startCoord: LatLng | null;
  endCoord: LatLng | null;
  transportMode: TransportMode;
  userLocation: LatLng | null;
  setEndCoord: (c: LatLng) => void;
  setDestinationText: (t: string) => void;
  setStartCoord: (c: LatLng) => void;
  selectGPSAsOrigin: () => void;
  selectGPSAsDestination: (loc: LatLng) => void;
  openRouting: () => void;
  closeRouting: () => void;
  resetRouting: () => void;
  startPickingOrigin: () => void;
  startPickingDestination: () => void;
  isPickingOnMap: boolean;
  setPointFromMap: (coord: LatLng, label: string) => void;

  // Area
  handleAreaMapPress: (event: MapPressEvent) => void;
  updateDraftAreaFromMapCenter: (region: Region) => void;
  setSelectedRoute: (r: FloodRoute | null) => void;
  setSelectedZone: (z: FloodZone | null) => void;
  setSelectedStationId: (id: string | null) => void;
  setSelectedArea: (a: AreaWithStatus | null) => void;
  setSelectedCommunityReport: (r: NearbyFloodReport | null) => void;
  setShowDetailPanels: (v: boolean) => void;
  handleStartEditAreaFromParams: (area: EditAreaParams) => void;

  // UI state setters
  setShowResultCard: (v: boolean) => void;
  setShowNavSearch: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  viewMode: string;

  // Edit params from navigation
  params: {
    editAreaId?: string;
    editLat?: string;
    editLng?: string;
    editRadius?: string;
    editName?: string;
    editAddress?: string;
  };
}

export function useMapScreen(ctx: MapScreenCtx) {
  const {
    settings,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
    mapRef,
    focusOnRoute,
    onRegionChangeComplete,
    nav,
    safeRoute,
    isUsingGPSOrigin,
    startCoord,
    endCoord,
    transportMode,
    userLocation,
    setEndCoord,
    setDestinationText,
    setStartCoord,
    selectGPSAsOrigin,
    selectGPSAsDestination,
    openRouting,
    closeRouting,
    resetRouting,
    startPickingOrigin,
    startPickingDestination,
    isPickingOnMap,
    setPointFromMap,
    handleAreaMapPress,
    updateDraftAreaFromMapCenter,
    setSelectedRoute,
    setSelectedZone,
    setSelectedStationId,
    setSelectedArea,
    setSelectedCommunityReport,
    setShowDetailPanels,
    handleStartEditAreaFromParams,
    setShowResultCard,
    setShowNavSearch,
    setIsLoading,
    viewMode,
    params,
  } = ctx;

  const loadedBoundsRef = useRef<ViewportBounds | null>(null);
  const lastZoomModeRef = useRef<MapZoomMode | null>(null);

  // ── Initialization ──────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  useEffect(() => {
    const initialBounds = getBufferedBounds(DANANG_CENTER);
    loadedBoundsRef.current = initialBounds;
    lastZoomModeRef.current = getZoomMode(DANANG_CENTER.latitudeDelta);

    if (settings?.overlays?.flood) {
      refreshFloodSeverity(initialBounds);
    }
    if (settings?.overlays?.communityReports) {
      const radiusMeters = (DANANG_CENTER.latitudeDelta / 2) * 111320;
      refreshNearbyFloodReports({
        latitude: DANANG_CENTER.latitude,
        longitude: DANANG_CENTER.longitude,
        radiusMeters: Math.round(radiusMeters),
        hours: 720,
      });
    }
    refreshAreas();
  }, [
    settings?.overlays?.flood,
    settings?.overlays?.communityReports,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  ]);

  // Clear selections when viewMode changes
  useEffect(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, [viewMode]);

  // Fit map to route after results arrive
  useEffect(() => {
    if (safeRoute.primaryRoute) {
      const bounds = getRouteBounds(safeRoute.primaryRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);
      const hasAlternatives = safeRoute.alternativeRoutes.length > 0;
      setShowResultCard(!hasAlternatives);
    }
  }, [safeRoute.primaryRoute, safeRoute.alternativeRoutes, mapRef]);

  // Handle edit params from Areas screen navigation
  useEffect(() => {
    if (params.editAreaId && params.editLat && params.editLng && params.editRadius) {
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

  // ── Navigation handlers ──────────────────────────────────────
  const handleStartNavigation = useCallback(() => {
    // Clear all selected items before starting navigation
    // to prevent empty sheets from re-appearing behind NavigationHUD
    setSelectedArea(null);
    setSelectedStationId(null);
    setSelectedCommunityReport(null);
    setSelectedRoute(null);
    setSelectedZone(null);
    setShowDetailPanels(false);
    setShowResultCard(false);
    nav.startNavigation();
  }, [nav, setSelectedArea, setSelectedStationId, setSelectedCommunityReport, setSelectedRoute, setSelectedZone, setShowDetailPanels, setShowResultCard]);

  const handleStopNavigation = useCallback(() => {
    nav.stopNavigation();
    const currentRoute = safeRoute.getSelectedRoute();
    if (currentRoute) {
      const bounds = getRouteBounds(currentRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);
    }
  }, [nav, safeRoute, mapRef]);

  // ── Safe route handlers ──────────────────────────────────────
  const handleFindRoute = useCallback(async () => {
    const start = isUsingGPSOrigin
      ? (userLocation ?? { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude })
      : (startCoord ?? userLocation ?? { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude });

    if (!endCoord) return;
    await safeRoute.findRoute(start, endCoord, transportMode);
  }, [isUsingGPSOrigin, startCoord, userLocation, endCoord, transportMode, safeRoute]);

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
    [safeRoute, mapRef, setShowResultCard],
  );

  const handleCloseRouteResults = useCallback(() => {
    if (safeRoute.getAllRoutes().length <= 1) {
      setShowResultCard(false);
      safeRoute.clearRoutes();
      closeRouting();
      resetRouting();
    } else {
      setShowResultCard(false);
    }
  }, [safeRoute, closeRouting, resetRouting, setShowResultCard]);

  const handleCloseRouting = useCallback(() => {
    if (nav.isNavigating) nav.stopNavigation();
    closeRouting();
    setShowResultCard(false);
    safeRoute.clearRoutes();
    resetRouting();
  }, [nav, closeRouting, setShowResultCard, safeRoute, resetRouting]);

  // ── Destination-first NAV FAB flow ───────────────────────────
  const handleNavDestinationSelected = useCallback(
    (coord: LatLng, label: string) => {
      setEndCoord(coord);
      setDestinationText(label);
      selectGPSAsOrigin();
      openRouting();
      mapRef.current?.animateToRegion(
        { latitude: coord.latitude, longitude: coord.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        500,
      );
      setShowNavSearch(false);
    },
    [setEndCoord, setDestinationText, selectGPSAsOrigin, openRouting, mapRef, setShowNavSearch],
  );

  // ── Pick on map ──────────────────────────────────────────────
  const handleConfirmPickOnMap = useCallback(async () => {
    if (!mapRef.current) return;
    try {
      const camera = await mapRef.current.getCamera();
      const { latitude, longitude } = camera.center;
      let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        label = await LocationService.reverseGeocode(latitude, longitude);
      } catch {
        // Keep coordinate label
      }
      setPointFromMap({ latitude, longitude }, label);
    } catch {
      // Camera read failed
    }
  }, [mapRef, setPointFromMap]);

  // ── Map press ────────────────────────────────────────────────
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (isPickingOnMap) return;
      handleAreaMapPress(event);
    },
    [isPickingOnMap, handleAreaMapPress],
  );

  // ── Route + station handlers ─────────────────────────────────
  const handleRoutePress = useCallback(
    (route: FloodRoute) => {
      setSelectedZone(null);
      setSelectedArea(null);
      setSelectedRoute(route);
      focusOnRoute(route);
    },
    [setSelectedZone, setSelectedArea, setSelectedRoute, focusOnRoute],
  );

  const handleFloodMarkerPress = useCallback(
    (feature: FloodSeverityFeature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      setSelectedArea(null);
      setSelectedRoute(null);
      setSelectedZone(null);
      setSelectedStationId(feature.properties.stationId);
      mapRef.current?.animateToRegion(
        { latitude: latitude - 0.008, longitude, latitudeDelta: 0.03, longitudeDelta: 0.02 },
        400,
      );
    },
    [setSelectedArea, setSelectedRoute, setSelectedZone, setSelectedStationId, mapRef],
  );

  const handleCommunityReportPress = useCallback(
    (report: NearbyFloodReport) => {
      setSelectedArea(null);
      setSelectedRoute(null);
      setSelectedZone(null);
      setSelectedStationId(null);
      setSelectedCommunityReport(report);
    },
    [setSelectedArea, setSelectedRoute, setSelectedZone, setSelectedStationId, setSelectedCommunityReport],
  );

  // ── Viewport-aware marker fetching ───────────────────────────
  const fetchMarkersInViewPort = useMemo(
    () =>
      debounce((newRegion: Region) => {
        if (!settings?.overlays?.flood && !settings?.overlays?.communityReports) return;

        const currentZoomMode = getZoomMode(newRegion.latitudeDelta);
        const zoomModeChanged = currentZoomMode !== lastZoomModeRef.current;

        if (!zoomModeChanged && !isViewportOutsideBuffer(newRegion, loadedBoundsRef.current)) return;

        const bufferedBounds = getBufferedBounds(newRegion);
        loadedBoundsRef.current = bufferedBounds;
        lastZoomModeRef.current = currentZoomMode;

        if (settings?.overlays?.flood) {
          refreshFloodSeverity(bufferedBounds);
        }
        if (settings?.overlays?.communityReports) {
          const radiusMeters = (newRegion.latitudeDelta / 2) * 111320;
          refreshNearbyFloodReports({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            radiusMeters: Math.round(radiusMeters),
            hours: 720,
          });
        }
      }, 400),
    [refreshFloodSeverity, refreshNearbyFloodReports, settings?.overlays?.flood, settings?.overlays?.communityReports],
  );

  const handleRegionChange = useCallback(
    (newRegion: Region) => {
      onRegionChangeComplete(newRegion);
      fetchMarkersInViewPort(newRegion);
      updateDraftAreaFromMapCenter(newRegion);
    },
    [onRegionChangeComplete, fetchMarkersInViewPort, updateDraftAreaFromMapCenter],
  );

  const handleMapTouchStart = useCallback(() => {
    if (nav.isNavigating && nav.isFollowingUser) {
      nav.setIsFollowingUser(false);
    }
  }, [nav]);

  return {
    handleStartNavigation,
    handleStopNavigation,
    handleFindRoute,
    handleSelectRoute,
    handleCloseRouteResults,
    handleCloseRouting,
    handleNavDestinationSelected,
    handleConfirmPickOnMap,
    handleMapPress,
    handleRoutePress,
    handleFloodMarkerPress,
    handleCommunityReportPress,
    fetchMarkersInViewPort,
    handleRegionChange,
    handleMapTouchStart,
  };
}
