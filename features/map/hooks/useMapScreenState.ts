// features/map/hooks/useMapScreenState.ts
// Aggregates all state from hooks into a single object.
// Reduces prop-drilling across MapScreen → child components.

import { useMemo, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import type { NearbyFloodReport } from "~/features/community/services/community.service";

import { useControlArea } from "~/features/areas/hooks/useControlArea";
import { useMapCamera } from "~/features/map/hooks/useMapCamera";
import { useMapData } from "~/features/map/hooks/useMapData";
import { useMapDisplay } from "~/features/map/hooks/useMapDisplay";
import { useNavigation } from "~/features/map/hooks/useNavigation";
import { useRoutingUI, useSafeRoute } from "~/features/map/hooks/routing";
import { useStreetView } from "~/features/map/hooks/useStreetView";
import { useUserLocation } from "~/features/map/hooks/useUserLocation";
import type { FloodSeverityFeature } from "~/features/map/types/map-layers.types";
import type { MapType } from "~/features/map/types/map-display.types";
import type { LatLng } from "~/features/map/types/safe-route.types";

export interface MapScreenState {
  // Router
  router: ReturnType<typeof useRouter>;
  params: {
    editAreaId?: string;
    editLat?: string;
    editLng?: string;
    editRadius?: string;
    editName?: string;
    editAddress?: string;
  };
  // UI state
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  showLayerSheet: boolean;
  setShowLayerSheet: (v: boolean) => void;
  showNavSearch: boolean;
  setShowNavSearch: (v: boolean) => void;
  selectedStationId: string | null;
  setSelectedStationId: (v: string | null) => void;
  areaDisplayMode: "user" | "admin";
  setAreaDisplayMode: (v: "user" | "admin") => void;
  showAdminAreaConfirmModal: boolean;
  setShowAdminAreaConfirmModal: (v: boolean) => void;
  selectedAdminArea: any;
  setSelectedAdminArea: (v: any) => void;
  showWardSelectionSheet: boolean;
  setShowWardSelectionSheet: (v: boolean) => void;
  showResultCard: boolean;
  setShowResultCard: (v: boolean) => void;
  showWarningsSheet: boolean;
  setShowWarningsSheet: (v: boolean) => void;
  selectedCommunityReport: NearbyFloodReport | null;
  setSelectedCommunityReport: (v: NearbyFloodReport | null) => void;
  // Data
  settings: any;
  areas: any[];
  floodSeverity: any;
  communityReports: any[];
  adminAreas: any[];
  refreshFloodSeverity: any;
  refreshAreas: any;
  refreshNearbyFloodReports: any;
  // Safe route
  safeRoute: ReturnType<typeof useSafeRoute>;
  selectedZone: any;
  setSelectedZone: any;
  selectedRoute: any;
  setSelectedRoute: any;
  showDetailPanels: boolean;
  setShowDetailPanels: any;
  // User location
  userLocation: LatLng | null;
  locationPermission: boolean;
  // Map camera
  mapRef: any;
  region: any;
  is3DEnabled: boolean;
  camera: any;
  onRegionChangeComplete: any;
  toggle3DView: any;
  rotateCamera: any;
  zoomIn: any;
  zoomOut: any;
  goToMyLocation: any;
  focusOnRoute: any;
  // Navigation
  nav: ReturnType<typeof useNavigation>;
  // Street view
  streetViewLocation: any;
  setStreetViewLocation: any;
  openStreetView: any;
  handleMapLongPress: any;
  // Routing UI
  isRoutingUIVisible: boolean;
  openRouting: any;
  closeRouting: any;
  transportMode: any;
  setTransportMode: any;
  originText: string;
  setOriginText: any;
  startCoord: LatLng | null;
  setStartCoord: any;
  destinationText: string;
  setDestinationText: any;
  endCoord: LatLng | null;
  setEndCoord: any;
  isUsingGPSOrigin: boolean;
  selectGPSAsOrigin: any;
  isUsingGPSDest: boolean;
  selectGPSAsDestination: any;
  pickingTarget: any;
  isPickingOnMap: boolean;
  startPickingOrigin: any;
  startPickingDestination: any;
  cancelPicking: any;
  setPointFromMap: any;
  swapOriginDestination: any;
  resetRouting: any;
  // Map display
  mapType: MapType;
  viewMode: string;
  setViewMode: any;
  showLegend: boolean;
  toggleLegend: any;
  stats: any;
  handleMapTypeChange: any;
  // Area control
  selectedArea: any;
  isAdjustingRadius: boolean;
  showCreateAreaSheet: boolean;
  isCreatingArea: boolean;
  draftAreaCenter: any;
  draftAreaRadius: number;
  editingArea: any;
  showCreationOptions: boolean;
  showAddressSearch: boolean;
  draftAddress: string;
  setSelectedArea: any;
  setDraftAreaRadius: any;
  setDraftAreaCenter: any;
  handleAreaPress: any;
  handleCloseAreaCard: any;
  handleDeleteArea: any;
  handleStartCreateArea: any;
  handleStartEditArea: any;
  handleStartEditAreaFromParams: any;
  handleConfirmLocation: any;
  handleCancelCreateArea: any;
  handleCreateAreaSubmit: any;
  handleCloseCreateArea: any;
  handleAreaMapPress: any;
  handleOptionSelect: any;
  handleAddressSelected: any;
  handleCloseCreationOptions: any;
  handleCloseAddressSearch: any;
  showPremiumLimitModal: boolean;
  currentAreaCount: number;
  freeAreaLimit: number;
  handleClosePremiumLimitModal: any;
  handleUpgradePremium: any;
  isCheckingLimit: boolean;
  isLoadingLocation: boolean;
  isLoadingSearch: boolean;
  areaError: any;
  handleCloseErrorModal: any;
  updateDraftAreaFromMapCenter: any;
  // Selected station
  selectedStation: FloodSeverityFeature | null;
  // Admin confirm
  handleCloseAdminConfirm: () => void;
}

export function useMapScreenState(): MapScreenState {
  const router = useRouter();
  const params = useLocalSearchParams<{
    editAreaId?: string;
    editLat?: string;
    editLng?: string;
    editRadius?: string;
    editName?: string;
    editAddress?: string;
  }>();

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showLayerSheet, setShowLayerSheet] = useState(false);
  const [showNavSearch, setShowNavSearch] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [areaDisplayMode, setAreaDisplayMode] = useState<"user" | "admin">("user");
  const [showAdminAreaConfirmModal, setShowAdminAreaConfirmModal] = useState(false);
  const [selectedAdminArea, setSelectedAdminArea] = useState<any>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [showWarningsSheet, setShowWarningsSheet] = useState(false);
  const [selectedCommunityReport, setSelectedCommunityReport] = useState<NearbyFloodReport | null>(null);
  const [showWardSelectionSheet, setShowWardSelectionSheet] = useState(false);

  // Data hooks
  const { settings, areas, floodSeverity, communityReports, adminAreas, refreshFloodSeverity, refreshAreas, refreshNearbyFloodReports } = useMapData();

  // Safe route
  const safeRoute = useSafeRoute();
  const { selectedZone, setSelectedZone, selectedRoute, setSelectedRoute, showDetailPanels, setShowDetailPanels } = safeRoute;

  // User location
  const { location: userLocation, permissionGranted: locationPermission } = useUserLocation();

  // Map camera
  const { mapRef, region, is3DEnabled, camera, onRegionChangeComplete, toggle3DView, rotateCamera, zoomIn, zoomOut, goToMyLocation, focusOnRoute } = useMapCamera();

  // Navigation
  const nav = useNavigation({ route: safeRoute.getSelectedRoute(), mapRef });

  // Street view
  const { streetViewLocation, setStreetViewLocation, openStreetView, handleMapLongPress } = useStreetView();

  // Routing UI
  const { isRoutingUIVisible, openRouting, closeRouting, transportMode, setTransportMode, originText, setOriginText, startCoord, setStartCoord, destinationText, setDestinationText, endCoord, setEndCoord, isUsingGPSOrigin, selectGPSAsOrigin, isUsingGPSDest, selectGPSAsDestination, pickingTarget, isPickingOnMap, startPickingOrigin, startPickingDestination, cancelPicking, setPointFromMap, swapOriginDestination, resetRouting } = useRoutingUI();

  // Map display
  const { mapType, viewMode, setViewMode, showLegend, toggleLegend, stats, handleMapTypeChange } = useMapDisplay();

  // Area control
  const { selectedArea, isAdjustingRadius, showCreateAreaSheet, isCreatingArea, draftAreaCenter, draftAreaRadius, editingArea, showCreationOptions, showAddressSearch, draftAddress, setSelectedArea, setDraftAreaRadius, setDraftAreaCenter, handleAreaPress, handleCloseAreaCard, handleDeleteArea, handleStartCreateArea, handleStartEditArea, handleStartEditAreaFromParams, handleConfirmLocation, handleCancelCreateArea, handleCreateAreaSubmit, handleCloseCreateArea, handleMapPress: handleAreaMapPress, handleOptionSelect, handleAddressSelected, handleCloseCreationOptions, handleCloseAddressSearch, showPremiumLimitModal, currentAreaCount, freeAreaLimit, handleClosePremiumLimitModal, handleUpgradePremium, isCheckingLimit, isLoadingLocation, isLoadingSearch, areaError, handleCloseErrorModal, updateDraftAreaFromMapCenter } = useControlArea({ mapRef, region, refreshAreas, clearSelections: () => { setSelectedRoute(null); setSelectedZone(null); setSelectedStationId(null); setSelectedCommunityReport(null); } });

  // Selected station
  const selectedStation = useMemo(() => {
    if (!selectedStationId || !floodSeverity?.features) return null;
    return floodSeverity.features.find((f: FloodSeverityFeature): f is FloodSeverityFeature => f.geometry.type === "Point" && f.properties.stationId === selectedStationId) ?? null;
  }, [selectedStationId, floodSeverity]);

  const handleCloseAdminConfirm = () => {
    setShowAdminAreaConfirmModal(false);
    // Keep selectedAdminArea to keep the polygon visible on map
  };

  return {
    router, params,
    isLoading, setIsLoading,
    showLayerSheet, setShowLayerSheet,
    showNavSearch, setShowNavSearch,
    selectedStationId, setSelectedStationId,
    areaDisplayMode, setAreaDisplayMode,
    showAdminAreaConfirmModal, setShowAdminAreaConfirmModal,
    selectedAdminArea, setSelectedAdminArea,
    showWardSelectionSheet, setShowWardSelectionSheet,
    showResultCard, setShowResultCard,
    showWarningsSheet, setShowWarningsSheet,
    selectedCommunityReport, setSelectedCommunityReport,
    settings, areas, floodSeverity, communityReports, adminAreas, refreshFloodSeverity, refreshAreas, refreshNearbyFloodReports,
    safeRoute,
    selectedZone, setSelectedZone, selectedRoute, setSelectedRoute, showDetailPanels, setShowDetailPanels,
    userLocation, locationPermission,
    mapRef, region, is3DEnabled, camera, onRegionChangeComplete, toggle3DView, rotateCamera, zoomIn, zoomOut, goToMyLocation, focusOnRoute,
    nav,
    streetViewLocation, setStreetViewLocation, openStreetView, handleMapLongPress,
    isRoutingUIVisible, openRouting, closeRouting, transportMode, setTransportMode, originText, setOriginText, startCoord, setStartCoord, destinationText, setDestinationText, endCoord, setEndCoord, isUsingGPSOrigin, selectGPSAsOrigin, isUsingGPSDest, selectGPSAsDestination, pickingTarget, isPickingOnMap, startPickingOrigin, startPickingDestination, cancelPicking, setPointFromMap, swapOriginDestination, resetRouting,
    mapType, viewMode, setViewMode, showLegend, toggleLegend, stats, handleMapTypeChange,
    selectedArea, isAdjustingRadius, showCreateAreaSheet, isCreatingArea, draftAreaCenter, draftAreaRadius, editingArea, showCreationOptions, showAddressSearch, draftAddress, setSelectedArea, setDraftAreaRadius, setDraftAreaCenter, handleAreaPress, handleCloseAreaCard, handleDeleteArea, handleStartCreateArea, handleStartEditArea, handleStartEditAreaFromParams, handleConfirmLocation, handleCancelCreateArea, handleCreateAreaSubmit, handleCloseCreateArea, handleAreaMapPress, handleOptionSelect, handleAddressSelected, handleCloseCreationOptions, handleCloseAddressSearch, showPremiumLimitModal, currentAreaCount, freeAreaLimit, handleClosePremiumLimitModal, handleUpgradePremium, isCheckingLimit, isLoadingLocation, isLoadingSearch, areaError, handleCloseErrorModal, updateDraftAreaFromMapCenter,
    selectedStation,
    handleCloseAdminConfirm,
  };
}
