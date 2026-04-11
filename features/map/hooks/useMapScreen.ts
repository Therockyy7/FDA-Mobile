// features/map/hooks/useMapScreen.ts
// Extracts all event handlers and effects from MapScreen.
// Receives the full MapScreenState as context.

import { useCallback, useEffect, useRef } from "react";
import MapView, { Region } from "react-native-maps";
import type { MapPressEvent } from "react-native-maps";
import type { NearbyFloodReport } from "~/features/community/services/community.service";
import type { FloodRoute, FloodZone } from "../constants/map-data";
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
import type { AreaWithStatus, FloodSeverityFeature, FloodStatusParams, MapLayerSettings } from "../types/map-layers.types";
import type { MapScreenState } from "./useMapScreenState";
import { useNavigation } from "./useNavigation";
import { useSafeRoute } from "./routing";
import type { LatLng } from "../types/safe-route.types";
import { TransportMode } from "../types";
import { useSatelliteFloodStore } from "../stores/useSatelliteFloodStore";
import { useIsAuthenticated } from "~/features/auth/hooks/useAuth";

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
  setSelectedAdminArea: (area: any) => void;
  setSelectedCommunityReport: (r: NearbyFloodReport | null) => void;
  setShowDetailPanels: (v: boolean) => void;
  handleStartEditAreaFromParams: (area: EditAreaParams) => void;

  // UI state setters
  setShowResultCard: (v: boolean) => void;
  setShowNavSearch: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setShowCommunityReportSheet: (v: boolean) => void;
  setShowWarningsSheet: (v: boolean) => void;
  setAreaDisplayMode: (v: "user" | "admin") => void;
  viewMode: string;
  adminAreas: any[];

  // Edit params from navigation
  params: {
    editAreaId?: string;
    editLat?: string;
    editLng?: string;
    editRadius?: string;
    editName?: string;
    editAddress?: string;
    stationId?: string;
    reportId?: string;
    reportLat?: string;
    reportLng?: string;
    reportSeverity?: string;
    reportCreatedAt?: string;
    satelliteBbox?: string; // Format: "min_lon,min_lat,max_lon,max_lat"
    returnToPrediction?: string;
    focusLat?: string;
    focusLng?: string;
    focusRadius?: string;
  };
  floodSeverity: any;
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
    selectGPSAsOrigin,
    openRouting,
    closeRouting,
    resetRouting,
    isPickingOnMap,
    setPointFromMap,
    handleAreaMapPress,
    updateDraftAreaFromMapCenter,
    setSelectedRoute,
    setSelectedZone,
    setSelectedStationId,
    setSelectedArea,
    setSelectedCommunityReport,
    setShowCommunityReportSheet,
    setSelectedAdminArea,
    setShowDetailPanels,
    handleStartEditAreaFromParams,
    setShowResultCard,
    setShowNavSearch,
    setIsLoading,
    setShowWarningsSheet,
    setAreaDisplayMode,
    adminAreas,
    viewMode,
    params,
    floodSeverity,
  } = ctx;

  const loadedBoundsRef = useRef<ViewportBounds | null>(null);
  const lastZoomModeRef = useRef<MapZoomMode | null>(null);

  // ── Initialization ──────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setIsLoading is a stable setter from useState

  useEffect(() => {
    const initialBounds = getBufferedBounds(DANANG_CENTER);
    loadedBoundsRef.current = initialBounds;
    lastZoomModeRef.current = getZoomMode(DANANG_CENTER.latitudeDelta);

    if (settings?.overlays?.flood) {
      refreshFloodSeverity(initialBounds);
    }
    if (settings?.overlays?.communityReports) {
      const radiusMeters = (DANANG_CENTER.latitudeDelta / 2) * 111320 * 1.5;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]); // setters are stable, intentionally omitted

  // Fit map to route after results arrive
  useEffect(() => {
    if (safeRoute.primaryRoute) {
      const bounds = getRouteBounds(safeRoute.primaryRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);
      const hasAlternatives = safeRoute.alternativeRoutes.length > 0;
      setShowResultCard(!hasAlternatives);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRoute.primaryRoute, safeRoute.alternativeRoutes, mapRef]); // setShowResultCard is stable

  // Handle edit area params from Areas screen navigation
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

  // Handle focus area params from AreaDetailScreen back navigation
  useEffect(() => {
    if (params.focusLat && params.focusLng && params.focusRadius) {
      const lat = parseFloat(params.focusLat);
      const lng = parseFloat(params.focusLng);
      const radius = parseFloat(params.focusRadius);

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: (radius / 111320) * 4 || 0.01,
          longitudeDelta: (radius / 111320) * 4 || 0.01,
        },
        500,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.focusLat, params.focusLng, params.focusRadius]);

  // Handle report params from Community screen → navigate to map + show marker
  useEffect(() => {
    if (params.reportId && params.reportLat && params.reportLng) {
      const lat = parseFloat(params.reportLat);
      const lng = parseFloat(params.reportLng);

      const report: NearbyFloodReport = {
        id: params.reportId,
        latitude: lat,
        longitude: lng,
        severity: (params.reportSeverity as any) || "medium",
        createdAt: params.reportCreatedAt || new Date().toISOString(),
        distanceMeters: 0,
      };

      // Set the selected report → marker appears
      setSelectedCommunityReport(report);
      // Open the sheet
      setShowCommunityReportSheet(true);

      // Animate map to the report location (with offset for bottom sheet)
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: lat - 0.0015,
            longitude: lng,
            latitudeDelta: 0.004,
            longitudeDelta: 0.004,
          },
          1000,
        );
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.reportId, params.reportLat, params.reportLng]);
  // Handle stationId param from notifications or other screens
  useEffect(() => {
    if (params.stationId && floodSeverity?.features?.length > 0) {
      const feature = floodSeverity.features.find(
        (f: any) => f.properties?.stationId === params.stationId,
      );
      if (feature) {
        handleFloodMarkerPress(feature);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.stationId, floodSeverity]);

  // Handle satellite verification bounds
  useEffect(() => {
    if (!params.satelliteBbox) return;

    const doAnimate = () => {
      try {
        const [minLon, minLat, maxLon, maxLat] = params.satelliteBbox!.split(",").map(parseFloat);
        if (!isNaN(minLon) && !isNaN(minLat) && !isNaN(maxLon) && !isNaN(maxLat)) {
          const ANIMATION_DURATION = 1000;
          const padding = 0.02;

          const animate = () => {
            if (!mapRef.current) return;
            mapRef.current.animateToRegion(
              {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLon + maxLon) / 2,
                latitudeDelta: Math.abs(maxLat - minLat) + padding,
                longitudeDelta: Math.abs(maxLon - minLon) + padding,
              },
              ANIMATION_DURATION,
            );

            // Commit (make visible) the pre-staged satellite polygons AFTER
            // the camera animation completes so the heavy GeoJSON rendering
            // does not block the JS thread during the pan/zoom.
            setTimeout(() => {
              useSatelliteFloodStore.getState().commitLayers();
            }, ANIMATION_DURATION + 200);
          };

          // If mapRef isn't ready yet (e.g. tab just mounted), retry briefly
          if (mapRef.current) {
            animate();
          } else {
            const retryTimer = setTimeout(animate, 400);
            return () => clearTimeout(retryTimer);
          }

          if (params.returnToPrediction && adminAreas) {
            const matchedArea = adminAreas.find((a: any) => a.id === params.returnToPrediction);
            if (matchedArea) {
              setSelectedAdminArea(matchedArea);
              setAreaDisplayMode("admin");
            }
          }
        }
      } catch {
        // failed to parse bbox
      }
    };

    doAnimate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.satelliteBbox, params.returnToPrediction, adminAreas, mapRef, setSelectedAdminArea, setAreaDisplayMode]);

  // ── Navigation handlers ──────────────────────────────────────
  const handleStartNavigation = useCallback(() => {
    setSelectedArea(null);
    setSelectedStationId(null);
    setSelectedCommunityReport(null);
    setShowCommunityReportSheet(false);
    setSelectedRoute(null);
    setSelectedZone(null);
    setShowDetailPanels(false);
    setShowResultCard(false);
    setShowWarningsSheet(false);
    nav.startNavigation();
  }, [
    nav,
    setSelectedArea, setSelectedStationId, setSelectedCommunityReport, setShowCommunityReportSheet,
    setSelectedRoute, setSelectedZone, setShowDetailPanels, setShowResultCard,
    setShowWarningsSheet,
  ]);

  const handleStopNavigation = useCallback(() => {
    nav.stopNavigation();
    setSelectedArea(null);
    setSelectedStationId(null);
    setSelectedCommunityReport(null);
    setShowCommunityReportSheet(false);
    setSelectedRoute(null);
    setSelectedZone(null);
    setShowDetailPanels(false);
    setShowResultCard(false);
    const currentRoute = safeRoute.getSelectedRoute();
    if (currentRoute) {
      const bounds = getRouteBounds(currentRoute.coordinates);
      mapRef.current?.animateToRegion(bounds, 600);
    }
  }, [
    nav, safeRoute, mapRef,
    setSelectedArea, setSelectedStationId, setSelectedCommunityReport, setShowCommunityReportSheet,
    setSelectedRoute, setSelectedZone, setShowDetailPanels, setShowResultCard,
  ]);

  // ── Safe route handlers ──────────────────────────────────────
  const isAuthenticated = useIsAuthenticated();

  const handleFindRoute = useCallback(async () => {
    const start = isUsingGPSOrigin
      ? (userLocation ?? { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude })
      : (startCoord ?? userLocation ?? { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude });
    if (!endCoord) return;
    await safeRoute.findRoute(start, endCoord, transportMode, 2, isAuthenticated);
  }, [isUsingGPSOrigin, startCoord, userLocation, endCoord, transportMode, safeRoute, isAuthenticated]);

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
    (coord: { latitude: number; longitude: number }, label: string) => {
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
      openRouting();
    } catch {
      // Camera read failed
    }
  }, [mapRef, setPointFromMap, openRouting]);

  // ── Map press ────────────────────────────────────────────────
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (isPickingOnMap) return;
      handleAreaMapPress(event);
      setSelectedAdminArea(null);
    },
    [isPickingOnMap, handleAreaMapPress, setSelectedAdminArea],
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

  // ── Community report handlers ────────────────────────────────
  const handleCommunityReportPress = useCallback(
    (report: NearbyFloodReport) => {
      setSelectedArea(null);
      setSelectedRoute(null);
      setSelectedZone(null);
      setSelectedStationId(null);
      // Set report data → marker stays on map
      setSelectedCommunityReport(report);
      // Show the bottom sheet
      setShowCommunityReportSheet(true);
    },
    [setSelectedArea, setSelectedRoute, setSelectedZone, setSelectedStationId, setSelectedCommunityReport, setShowCommunityReportSheet],
  );

  // Close sheet BUT keep selectedCommunityReport → marker stays
  const handleCloseCommunityReport = useCallback(() => {
    setShowCommunityReportSheet(false);
    // DO NOT clear selectedCommunityReport — marker must persist
  }, [setShowCommunityReportSheet]);

  // ── Viewport-aware marker fetching ───────────────────────────
  // Keep latest callbacks in refs so the stable debounced fn always calls current version
  const refreshFloodSeverityRef = useRef(refreshFloodSeverity);
  refreshFloodSeverityRef.current = refreshFloodSeverity;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // PERF: Create the debounced fn exactly once (stored in a ref) so the same instance
  // persists across renders. Recreating it on every render via useMemo would reset the
  // debounce timer and potentially fire multiple simultaneous API calls.
  const fetchMarkersInViewPort = useRef(
    debounce((newRegion: Region) => {
      if (!settingsRef.current?.overlays?.flood && !settingsRef.current?.overlays?.communityReports) return;

      const currentZoomMode = getZoomMode(newRegion.latitudeDelta);
      const zoomModeChanged = currentZoomMode !== lastZoomModeRef.current;

      if (!zoomModeChanged && !isViewportOutsideBuffer(newRegion, loadedBoundsRef.current)) return;

      const bufferedBounds = getBufferedBounds(newRegion);
      loadedBoundsRef.current = bufferedBounds;
      lastZoomModeRef.current = currentZoomMode;

      if (settingsRef.current?.overlays?.flood) {
        refreshFloodSeverityRef.current(bufferedBounds);
      }
      // Community reports are driven by region in useMapData via useMemo(communityParams)
      // so no manual refresh needed here — React Query refetches when params change
    }, 400)
  ).current;

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
    handleCloseCommunityReport,
    fetchMarkersInViewPort,
    handleRegionChange,
    handleMapTouchStart,
  };
}
