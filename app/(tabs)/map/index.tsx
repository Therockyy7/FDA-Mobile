// app/(tabs)/map/index.tsx
// Thin orchestrator: wires hooks into a single state object, renders components.

import { Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";

import { Text } from "~/components/ui/text";
import {
  MapLoadingOverlay,
  NavigationHUD,
  PickOnMapOverlay,
  StreetViewHint,
} from "~/features/map/components/overlays";
import {
  ewkbToLatLngArray,
  getBoundsFromCoords,
} from "~/features/map/lib/ewkb-parser";
import type { LatLng } from "~/features/map/types/safe-route.types";
import { DANANG_CENTER } from "~/features/map/constants/map-data";
import type { TransportMode } from "~/features/map/types/routing.types";

import { ConfirmDeleteModal } from "~/features/areas/components/ConfirmDeleteModal";
import { useIsAuthenticated } from "~/features/auth/hooks/useAuth";
import { StaticAreaTarget } from "~/features/map/components/areas/overlays/StaticAreaTarget";
import { MapContent } from "~/features/map/components/MapContent";
import { MapFloatingUI } from "~/features/map/components/MapFloatingUI";
import { MapHeaderSwitch } from "~/features/map/components/MapHeaderSwitch";
import { MapSheets } from "~/features/map/components/MapSheets";
import { useMapScreen } from "~/features/map/hooks/useMapScreen";
import { useMapScreenState } from "~/features/map/hooks/useMapScreenState";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";


export default function MapScreen() {
  // Single aggregated state
  const s = useMapScreenState();

  const router = useRouter();
  const isGuest = !useIsAuthenticated();

  // All handlers — useMapScreen now accepts the full MapScreenState
  const {
    handleStartNavigation,
    handleStopNavigation,
    handleFindRoute,
    handleSelectRoute,
    handleCloseRouteResults,
    handleCloseRouting,
    handleConfirmPickOnMap,
    handleMapPress,
    handleRoutePress,
    handleFloodMarkerPress,
    handleCommunityReportPress,
    handleCloseCommunityReport,
    handleRegionChange,
    handleMapTouchStart,
  } = useMapScreen({
    settings: s.settings,
    refreshFloodSeverity: s.refreshFloodSeverity,
    refreshAreas: s.refreshAreas,
    refreshNearbyFloodReports: s.refreshNearbyFloodReports,
    mapRef: s.mapRef,
    focusOnRoute: s.focusOnRoute,
    onRegionChangeComplete: s.onRegionChangeComplete,
    nav: s.nav,
    safeRoute: s.safeRoute,
    isUsingGPSOrigin: s.isUsingGPSOrigin,
    startCoord: s.startCoord,
    endCoord: s.endCoord,
    transportMode: s.transportMode,
    userLocation: s.userLocation,
    setEndCoord: s.setEndCoord,
    setDestinationText: s.setDestinationText,
    setStartCoord: s.setStartCoord,
    selectGPSAsOrigin: s.selectGPSAsOrigin,
    selectGPSAsDestination: s.selectGPSAsDestination,
    openRouting: s.openRouting,
    closeRouting: s.closeRouting,
    resetRouting: s.resetRouting,
    startPickingOrigin: s.startPickingOrigin,
    startPickingDestination: s.startPickingDestination,
    isPickingOnMap: s.isPickingOnMap,
    setPointFromMap: s.setPointFromMap,
    handleAreaMapPress: s.handleAreaMapPress,
    updateDraftAreaFromMapCenter: s.updateDraftAreaFromMapCenter,
    setSelectedRoute: s.setSelectedRoute,
    setSelectedZone: s.setSelectedZone,
    setSelectedStationId: s.setSelectedStationId,
    setSelectedArea: s.setSelectedArea,
    setSelectedAdminArea: s.setSelectedAdminArea,
    setSelectedCommunityReport: s.setSelectedCommunityReport,
    setShowDetailPanels: s.setShowDetailPanels,
    handleStartEditAreaFromParams: s.handleStartEditAreaFromParams,
    setShowResultCard: s.setShowResultCard,
    setShowNavSearch: s.setShowNavSearch,
    setIsLoading: s.setIsLoading,
    setShowCommunityReportSheet: s.setShowCommunityReportSheet,
    setShowWarningsSheet: s.setShowWarningsSheet,
    areaDisplayMode: s.areaDisplayMode,
    setAreaDisplayMode: s.setAreaDisplayMode,
    setIsFindingArea: s.setIsFindingArea,
    adminAreas: s.adminAreas,
    viewMode: s.viewMode,
    params: s.params,
    floodSeverity: s.floodSeverity,
  });

  // Reset station card khi user rời khỏi tab map
  const { setSelectedStationId } = s;
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedStationId(null);
      };
    }, [setSelectedStationId]),
  );

  /**
   * Đổi phương tiện và tự động tìm lại tuyến đường ngay — không cần quay lại màn hình chọn.
   * Gọi findRoute trực tiếp với mode mới thay vì dựa vào state cũ trong closure.
   */
  const handleSwitchModeAndFind = useCallback(
    async (newMode: TransportMode) => {
      s.setTransportMode(newMode);
      const fallback = { latitude: DANANG_CENTER.latitude, longitude: DANANG_CENTER.longitude };
      const start = s.isUsingGPSOrigin
        ? (s.userLocation ?? fallback)
        : (s.startCoord ?? s.userLocation ?? fallback);
      if (!s.endCoord) return;
      await s.safeRoute.findRoute(start, s.endCoord, newMode, 2, !isGuest);
    },
    [s.isUsingGPSOrigin, s.userLocation, s.startCoord, s.endCoord, s.setTransportMode, s.safeRoute, isGuest],
  );

  const handleSelectWard = (area: any) => {
    s.setShowWardSelectionSheet(false);
    s.setSelectedAdminArea(area);
    if (area.geometry) {
      const coords = ewkbToLatLngArray(area.geometry);
      const bounds = getBoundsFromCoords(coords);
      if (bounds && s.mapRef.current) {
        s.mapRef.current.animateToRegion(bounds, 1000);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B1A33" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Tabs.Screen
        options={{
          tabBarStyle:
            (s.isAdjustingRadius && !s.nav.isNavigating) ||
            s.isRoutingUIVisible ||
            s.safeRoute.hasResults ||
            s.showResultCard ||
            s.nav.isNavigating
              ? { display: "none" }
              : undefined,
        }}
      />

      {/* Header — hide when community report sheet is open or viewing AI Prediction Map */}
      {!s.showCommunityReportSheet && !s.params.returnToPrediction && (
        <MapHeaderSwitch
          isRoutingUIVisible={s.isRoutingUIVisible}
          openRouting={s.openRouting}
          navIsNavigating={s.nav.isNavigating}
          safeRouteHasResults={s.safeRoute.hasResults}
          originText={s.originText}
          onOriginChange={s.setOriginText}
          onOriginClear={() => {
            s.setOriginText("");
            s.setStartCoord(null);
          }}
          isUsingGPSOrigin={s.isUsingGPSOrigin}
          onUseGPSAsOrigin={s.selectGPSAsOrigin}
          onPickOriginOnMap={s.startPickingOrigin}
          hasOriginCoord={s.startCoord !== null}
          onOriginPlaceSelected={(coord: LatLng) => {
            s.setStartCoord(coord);
            s.openRouting();
            s.mapRef.current?.animateToRegion(
              {
                latitude: coord.latitude,
                longitude: coord.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              500,
            );
          }}
          destinationText={s.destinationText}
          onDestinationChange={s.setDestinationText}
          onDestinationClear={() => {
            s.setDestinationText("");
            s.setEndCoord(null);
          }}
          isUsingGPSDest={s.isUsingGPSDest}
          onUseGPSAsDest={() => {
            if (s.userLocation) {
              s.selectGPSAsDestination(s.userLocation);
              s.openRouting();
            }
          }}
          onPickDestinationOnMap={s.startPickingDestination}
          hasDestinationCoord={s.endCoord !== null}
          onDestinationPlaceSelected={(coord: LatLng) => {
            s.setEndCoord(coord);
            s.openRouting();
            s.mapRef.current?.animateToRegion(
              {
                latitude: coord.latitude,
                longitude: coord.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              500,
            );
          }}
          onSwap={s.swapOriginDestination}
          transportMode={s.transportMode}
          onModeChange={s.setTransportMode}
          onFindRoute={handleFindRoute}
          safeRouteIsLoading={s.safeRoute.isLoading}
          safeRouteError={s.safeRoute.error}
          onCloseRouting={handleCloseRouting}
          userLocation={s.userLocation}
          selectGPSAsDestination={s.selectGPSAsDestination}
        />
      )}

      <View style={{ flex: 1, position: "relative" }}>
        {/* Return to Prediction Button */}
        {s.params.returnToPrediction && !s.nav.isNavigating && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const dest = s.params.returnToPrediction;
              if (!dest) return;
              // Clear Map view states
              s.setSelectedAdminArea(null);
              s.setAreaDisplayMode("user");

              // PERF: Release all satellite polygons immediately to free up RAM.
              // This is crucial to reduce the heavy memory footprint of thousands of Polygons
              useSatelliteFloodStore.getState().clear();

              // Clear URL search params visually and state-wise
              router.setParams({ returnToPrediction: "", satelliteBbox: "" });

              // Move forward to the prediction screen on next tick for a snappy UX
              InteractionManager.runAfterInteractions(() => {
                router.push(`/prediction/${dest}` as any);
              });
            }}
            style={{
              position: "absolute",
              top: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 56,
              left: 16,
              zIndex: 100,
              backgroundColor: "#A855F7",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 100,
              shadowColor: "#A855F7",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#FFFFFF" }}>
              Quay lại AI
            </Text>
          </TouchableOpacity>
        )}

        {/* Loading Overlay */}
        <MapLoadingOverlay visible={s.isLoading} />

        {/* AI Finding Area Overlay */}
        {s.isFindingArea && (
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: [{ translateX: -70 }, { translateY: -35 }],
              backgroundColor: "rgba(11, 26, 51, 0.8)",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              zIndex: 1000,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <ActivityIndicator size="small" color="#A855F7" />
            <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
              Tìm khu vực...
            </Text>
          </View>
        )}

        {/* Navigation HUD */}
        {s.nav.isNavigating && (
          <NavigationHUD
            instruction={s.nav.currentInstruction}
            nextInstruction={s.nav.nextInstruction}
            distanceToNextTurn={s.nav.distanceToNextTurn}
            remainingDistance={s.nav.remainingDistance}
            remainingTime={s.nav.remainingTime}
            isOffRoute={s.nav.isOffRoute}
            isFollowingUser={s.nav.isFollowingUser}
            onExit={handleStopNavigation}
            onRecenter={s.nav.recenterCamera}
          />
        )}

        {/* Pick on Map */}
        <PickOnMapOverlay
          visible={s.isPickingOnMap}
          pickingTarget={s.pickingTarget}
          onConfirm={handleConfirmPickOnMap}
          onCancel={s.cancelPicking}
        />

        {/* Map View */}
        <MapContent
          mapRef={s.mapRef}
          is3DEnabled={s.is3DEnabled}
          camera={s.camera}
          locationPermission={s.locationPermission}
          settings={s.settings}
          mapType={s.mapType}
          viewMode={s.viewMode}
          areaDisplayMode={s.areaDisplayMode}
          areas={s.areas}
          adminAreas={s.adminAreas}
          selectedArea={s.selectedArea}
          selectedAdminArea={s.selectedAdminArea}
          draftAreaCenter={s.draftAreaCenter}
          draftAreaRadius={s.draftAreaRadius}
          isAdjustingRadius={s.isAdjustingRadius}
          showCreateAreaSheet={s.showCreateAreaSheet}
          selectedRoute={s.selectedRoute}
          safeRoute={s.safeRoute}
          userLocation={s.userLocation}
          isRoutingUIVisible={s.isRoutingUIVisible}
          isUsingGPSOrigin={s.isUsingGPSOrigin}
          startCoord={s.startCoord}
          originText={s.originText}
          endCoord={s.endCoord}
          destinationText={s.destinationText}
          streetViewLocation={s.streetViewLocation}
          floodSeverity={s.floodSeverity}
          communityReports={s.communityReports}
          selectedCommunityReport={s.selectedCommunityReport}
          onRegionChangeComplete={handleRegionChange}
          onLongPress={s.handleMapLongPress}
          onPress={handleMapPress}
          onPanDrag={handleMapTouchStart}
          onAreaPress={s.handleAreaPress}
          onRoutePress={handleRoutePress}
          onCommunityReportPress={handleCommunityReportPress}
          onFloodMarkerPress={handleFloodMarkerPress}
          openStreetView={s.openStreetView}
          onAdminAreaPress={(area) => {
            s.setSelectedAdminArea(area);
            s.setShowAdminAreaConfirmModal(true);
          }}
          onSafeRoutePress={handleSelectRoute}
          onDraftAreaCenterChange={s.setDraftAreaCenter}
        />

        {/* Static center crosshair and radius overlay used while adjusting radius */}
        {s.isAdjustingRadius && (
          <StaticAreaTarget
            radiusMeters={s.draftAreaRadius}
            region={s.region}
          />
        )}

        {/* Floating UI — hide when sheet open, ward selection, or viewing AI Prediction Map */}
        {!s.showWardSelectionSheet &&
          !s.showCommunityReportSheet &&
          !s.params.returnToPrediction && (
            <MapFloatingUI
              selectedRoute={s.selectedRoute}
              selectedZone={s.selectedZone}
              selectedArea={s.selectedArea}
              selectedStationId={s.selectedStationId}
              isRoutingUIVisible={s.isRoutingUIVisible}
              safeRouteHasResults={s.safeRoute.hasResults}
              isAdjustingRadius={s.isAdjustingRadius}
              showCreateAreaSheet={s.showCreateAreaSheet}
              showCreateAreaButton={
                !isGuest &&
                s.viewMode === "zones" &&
                !s.isRoutingUIVisible &&
                !s.selectedArea &&
                !s.isAdjustingRadius &&
                !s.showCreateAreaSheet
              }
              onCreateArea={s.handleStartCreateArea}
              onZoomIn={s.zoomIn}
              onZoomOut={s.zoomOut}
              onMyLocation={() => s.goToMyLocation(s.userLocation)}
              is3DEnabled={s.is3DEnabled}
              onToggle3D={s.toggle3DView}
              showLegendState={s.showLegend}
              onShowLegend={s.toggleLegend}
              onRotateLeft={() => s.rotateCamera("left")}
              onRotateRight={() => s.rotateCamera("right")}
              streetViewLocation={s.streetViewLocation}
              onClearStreetView={() => s.setStreetViewLocation(null)}
              onShowLayers={() => s.setShowLayerSheet(true)}
              showAiSelectButton={
                !isGuest &&
                s.areaDisplayMode === "admin" &&
                !s.isRoutingUIVisible
              }
              onShowWardSelection={() => s.setShowWardSelectionSheet(true)}
              selectedAdminAreaName={
                s.selectedAdminArea ? (s.selectedAdminArea as any).name : null
              }
              onClearAdminArea={() => {
                s.setSelectedAdminArea(null);
                s.setShowAdminAreaConfirmModal(false);
              }}
            />
          )}

        {/* Street View Hint */}
        <StreetViewHint
          visible={!!s.streetViewLocation && !s.isRoutingUIVisible}
        />

        {/* Camera FAB — quick flood report */}
        {!s.isRoutingUIVisible &&
          !s.nav.isNavigating &&
          !s.selectedArea &&
          !s.selectedRoute &&
          !s.showCreateAreaSheet &&
          !s.showWardSelectionSheet &&
          !s.showCommunityReportSheet &&
          !s.params.returnToPrediction && (
            <TouchableOpacity
              onPress={() =>
                router.push("/community/create-post?openCamera=true" as any)
              }
              activeOpacity={0.85}
              style={{
                position: "absolute",
                left: 16,
                bottom: 24,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#6366F1",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#6366F1",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
                borderWidth: 2.5,
                borderColor: "white",
              }}
            >
              <Ionicons name="camera" size={26} color="white" />
            </TouchableOpacity>
          )}

        {/* Sheets */}
        {!s.nav.isNavigating && !s.params.returnToPrediction && (
          <MapSheets
            showLayerSheet={s.showLayerSheet}
            selectedStationId={s.selectedStationId}
            selectedArea={s.selectedArea}
            isAdjustingRadius={s.isAdjustingRadius}
            showCreateAreaSheet={s.showCreateAreaSheet}
            isCreatingArea={s.isCreatingArea}
            draftAreaRadius={s.draftAreaRadius}
            editingArea={s.editingArea}
            showCreationOptions={s.showCreationOptions}
            showAddressSearch={s.showAddressSearch}
            draftAddress={s.draftAddress}
            showPremiumLimitModal={s.showPremiumLimitModal}
            currentAreaCount={s.currentAreaCount}
            freeAreaLimit={s.freeAreaLimit}
            isCheckingLimit={s.isCheckingLimit}
            isLoadingLocation={s.isLoadingLocation}
            isLoadingSearch={s.isLoadingSearch}
            areaError={s.areaError}
            selectedStation={s.selectedStation}
            showWarningsSheet={s.showWarningsSheet}
            showResultCard={s.showResultCard}
            selectedRoute={s.selectedRoute}
            showDetailPanels={s.showDetailPanels}
            selectedCommunityReport={s.selectedCommunityReport}
            showCommunityReportSheet={s.showCommunityReportSheet}
            showAdminAreaConfirmModal={s.showAdminAreaConfirmModal}
            selectedAdminArea={s.selectedAdminArea}
            showWardSelectionSheet={s.showWardSelectionSheet}
            adminAreas={s.adminAreas}
            areaDisplayMode={s.areaDisplayMode}
            safeRoute={s.safeRoute}
            nav={s.nav}
            router={s.router}
            isUsingGPSOrigin={s.isUsingGPSOrigin}
            transportMode={s.transportMode}
            onModeChange={handleSwitchModeAndFind}
            onFindRoute={handleFindRoute}
            onCloseAreaCard={s.handleCloseAreaCard}
            onStartEditArea={s.handleStartEditArea}
            onDeleteArea={s.handleDeleteArea}
            onCloseStation={() => s.setSelectedStationId(null)}
            onCloseRoute={() => s.setSelectedRoute(null)}
            onCloseCommunityReport={handleCloseCommunityReport}
            onCloseWarnings={() => s.setShowWarningsSheet(false)}
            onSelectRoute={handleSelectRoute}
            onExitRouting={handleCloseRouting}
            onCloseRouteResults={handleCloseRouteResults}
            onShowWarnings={() => s.setShowWarningsSheet(true)}
            onStartNavigation={handleStartNavigation}
            onCloseLayerSheet={() => s.setShowLayerSheet(false)}
            onAreaDisplayModeChange={s.setAreaDisplayMode}
            onConfirmRadius={s.handleConfirmLocation}
            onCancelCreation={s.handleCancelCreateArea}
            onCloseCreateArea={s.handleCloseCreateArea}
            onCreateAreaSubmit={s.handleCreateAreaSubmit}
            onOptionSelect={s.handleOptionSelect}
            onAddressSelected={s.handleAddressSelected}
            onCloseCreationOptions={s.handleCloseCreationOptions}
            onCloseAddressSearch={s.handleCloseAddressSearch}
            onClosePremiumLimit={s.handleClosePremiumLimitModal}
            onUpgradePremium={s.handleUpgradePremium}
            onCloseError={s.handleCloseErrorModal}
            onChangeLocation={s.handleCancelCreateArea}
            onCloseAdminConfirm={s.handleCloseAdminConfirm}
            onCloseWardSelectionSheet={() => s.setShowWardSelectionSheet(false)}
            onSelectWard={handleSelectWard}
            setDraftAreaRadius={s.setDraftAreaRadius}
            isGuest={isGuest}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          visible={!!s.deleteModalVisible}
          areaName={s.selectedArea?.name || ""}
          isDeleting={s.isDeletingArea}
          onConfirm={s.handleConfirmDelete}
          onCancel={s.handleCancelDelete}
        />
      </View>
    </View>
  );
}
