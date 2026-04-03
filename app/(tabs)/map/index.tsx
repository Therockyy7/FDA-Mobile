// app/(tabs)/map/index.tsx
// Thin orchestrator: wires hooks into a single state object, renders components.

import React from "react";
import { StatusBar, View } from "react-native";

import {
  MapLoadingOverlay,
  NavigationHUD,
  PickOnMapOverlay,
  StreetViewHint,
} from "~/features/map/components/overlays";
import { ewkbToLatLngArray, getBoundsFromCoords } from "~/features/map/lib/ewkb-parser";
import type { LatLng } from "~/features/map/types/safe-route.types";

import { CommunityFloatingHint } from "~/features/map/components/CommunityFloatingHint";
import { MapContent } from "~/features/map/components/MapContent";
import { MapFloatingUI } from "~/features/map/components/MapFloatingUI";
import { MapHeaderSwitch } from "~/features/map/components/MapHeaderSwitch";
import { MapSheets } from "~/features/map/components/MapSheets";
import { useMapScreen } from "~/features/map/hooks/useMapScreen";
import { useMapScreenState } from "~/features/map/hooks/useMapScreenState";

export default function MapScreen() {
  const s = useMapScreenState();

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
    viewMode: s.viewMode,
    params: s.params,
  });

  const handleSelectWard = (area: any) => {
    s.setShowWardSelectionSheet(false);
    s.setSelectedAdminArea(area);
    
    // Parse coordinates and animate map
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

      {/* Header */}
      {!s.selectedCommunityReport && (
        <MapHeaderSwitch
        navIsNavigating={s.nav.isNavigating}
        safeRouteHasResults={s.safeRoute.hasResults}
        originText={s.originText}
        onOriginChange={s.setOriginText}
        onOriginClear={() => { s.setOriginText(""); s.setStartCoord(null); }}
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
        onDestinationClear={() => { s.setDestinationText(""); s.setEndCoord(null); }}
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
        {/* Loading Overlay */}
        <MapLoadingOverlay visible={s.isLoading} />

        {/* Navigation HUD (during active navigation) */}
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

        {/* Floating UI */}
        {(!s.showWardSelectionSheet && !s.selectedCommunityReport) && (
          <MapFloatingUI
            selectedRoute={s.selectedRoute}
            selectedZone={s.selectedZone}
            selectedArea={s.selectedArea}
            selectedStationId={s.selectedStationId}
            isRoutingUIVisible={s.isRoutingUIVisible}
            safeRouteHasResults={s.safeRoute.hasResults}
            isAdjustingRadius={s.isAdjustingRadius}
            showCreateAreaSheet={s.showCreateAreaSheet}
            showCreateAreaButton={s.viewMode === "zones" && !s.isRoutingUIVisible && !s.selectedArea && !s.isAdjustingRadius && !s.showCreateAreaSheet}
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
            showAiSelectButton={s.areaDisplayMode === "admin" && !s.isRoutingUIVisible}
            onShowWardSelection={() => s.setShowWardSelectionSheet(true)}
            selectedAdminAreaName={s.selectedAdminArea ? (s.selectedAdminArea as any).name : null}
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

        {/* Community Floating Hint */}
        <CommunityFloatingHint
          visible={
            !s.isRoutingUIVisible &&
            !s.nav.isNavigating &&
            !s.selectedArea &&
            !s.selectedRoute &&
            !s.showCreateAreaSheet &&
            !s.showWardSelectionSheet &&
            !s.selectedCommunityReport
          }
        />

        {/* Hide all sheets during navigation */}
        {!s.nav.isNavigating && (
          <MapSheets
            selectedArea={s.selectedArea}
            selectedRoute={s.selectedRoute}
            showDetailPanels={s.showDetailPanels}
            selectedStation={s.selectedStation}
            selectedStationId={s.selectedStationId}
            selectedCommunityReport={s.selectedCommunityReport}
            areaError={s.areaError}
            showWarningsSheet={s.showWarningsSheet}
            showResultCard={s.showResultCard}
            showLayerSheet={s.showLayerSheet}
            isAdjustingRadius={s.isAdjustingRadius}
            draftAreaRadius={s.draftAreaRadius}
            editingArea={s.editingArea}
            draftAddress={s.draftAddress}
            showCreateAreaSheet={s.showCreateAreaSheet}
            isCreatingArea={s.isCreatingArea}
            showCreationOptions={s.showCreationOptions}
            isLoadingLocation={s.isLoadingLocation}
            isLoadingSearch={s.isLoadingSearch}
            showAddressSearch={s.showAddressSearch}
            showPremiumLimitModal={s.showPremiumLimitModal}
            currentAreaCount={s.currentAreaCount}
            freeAreaLimit={s.freeAreaLimit}
            isCheckingLimit={s.isCheckingLimit}
            showAdminAreaConfirmModal={s.showAdminAreaConfirmModal}
            selectedAdminArea={s.selectedAdminArea}
            showWardSelectionSheet={s.showWardSelectionSheet}
            adminAreas={s.adminAreas}
            areaDisplayMode={s.areaDisplayMode}
            safeRoute={s.safeRoute}
            nav={s.nav}
            router={s.router}
            isUsingGPSOrigin={s.isUsingGPSOrigin}
            onCloseAreaCard={() => s.setSelectedArea(null)}
            onStartEditArea={s.handleStartEditArea}
            onDeleteArea={s.handleDeleteArea}
            onCloseStation={() => s.setSelectedStationId(null)}
            onCloseRoute={() => s.setSelectedRoute(null)}
            onCloseCommunityReport={() => s.setSelectedCommunityReport(null)}
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
          />
        )}
      </View>
    </View>
  );
}
