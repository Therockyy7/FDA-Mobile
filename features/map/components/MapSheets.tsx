// app/(tabs)/MapSheets.tsx
// All bottom sheets outside MapView.
// Each renders only its content when active.

import React from "react";
import { View } from "react-native";
import { MapBottomSheet } from "~/features/map/components/common/MapBottomSheet";
import {
  AreaCard,
  RadiusAdjustBar,
  CreateAreaSheet,
  AreaCreationOptionSheet,
  AddressSearchSheet,
  AdminAreaConfirmModal,
  WardSelectionSheet,
} from "~/features/map/components/areas";
import { LayerToggleSheet } from "~/features/map/components/controls";
import { FloodStationCard } from "~/features/map/components/stations";
import { useFloodRealtimeStore } from "~/features/map/stores/useFloodRealtimeStore";
import {
  RouteDetailCard,
  SafeRouteAlternatives,
  SafeRouteResultCard,
  SafeRouteWarnings,
} from "~/features/map/components/routes";
import { CommunityReportSheet } from "~/features/map/components/reports";
import { AreaCreationErrorModal } from "~/features/areas/components/AreaCreationErrorModal";
import { AreaCreationLoadingOverlay } from "~/features/areas/components/AreaCreationLoadingOverlay";
import { PremiumLimitModal } from "~/features/areas/components/PremiumLimitModal";

interface Props {
  selectedArea: any;
  selectedRoute: any;
  showDetailPanels: boolean;
  selectedStation: any;
  selectedStationId: string | null;
  selectedCommunityReport: any;
  showCommunityReportSheet: boolean;
  areaError: any;
  showWarningsSheet: boolean;
  showResultCard: boolean;
  showLayerSheet: boolean;
  isAdjustingRadius: boolean;
  draftAreaRadius: number;
  editingArea: any;
  draftAddress: string;
  showCreateAreaSheet: boolean;
  isCreatingArea: boolean;
  showCreationOptions: boolean;
  isLoadingLocation: boolean;
  isLoadingSearch: boolean;
  showAddressSearch: boolean;
  showPremiumLimitModal: boolean;
  currentAreaCount: number;
  freeAreaLimit: number;
  isCheckingLimit: boolean;
  showAdminAreaConfirmModal: boolean;
  selectedAdminArea: any;
  showWardSelectionSheet: boolean;
  adminAreas: any[];
  areaDisplayMode: "user" | "admin";
  safeRoute: {
    hasResults: boolean;
    overallSafetyStatus: any;
    getAllRoutes: () => any[];
    selectedRouteIndex: number;
    getSelectedRoute: () => any;
    floodWarnings: any[];
    metadata: any;
    isLoading: boolean;
  };
  transportMode: any;
  onModeChange: (m: any) => void;
  onFindRoute: () => void;
  nav: { isNavigating: boolean };
  router: { push: (path: any) => void };
  isUsingGPSOrigin: boolean;
  onCloseAreaCard: () => void;
  onStartEditArea: () => void;
  onDeleteArea: () => void;
  onCloseStation: () => void;
  onCloseRoute: () => void;
  onCloseCommunityReport: () => void;
  onCloseWarnings: () => void;
  onSelectRoute: (index: number) => void;
  onExitRouting: () => void;
  onCloseRouteResults: () => void;
  onShowWarnings: () => void;
  onStartNavigation: () => void;
  onCloseLayerSheet: () => void;
  onAreaDisplayModeChange: (mode: "user" | "admin") => void;
  onConfirmRadius: () => void;
  onCancelCreation: () => void;
  onCloseCreateArea: () => void;
  onCreateAreaSubmit: (data: { name: string; addressText: string }) => Promise<void>;
  onOptionSelect: (option: string) => void;
  onAddressSelected: (data: { latitude: number; longitude: number; address: string }) => void;
  onCloseCreationOptions: () => void;
  onCloseAddressSearch: () => void;
  onClosePremiumLimit: () => void;
  onUpgradePremium: () => void;
  onCloseError: () => void;
  onChangeLocation: () => void;
  onCloseAdminConfirm: () => void;
  onCloseWardSelectionSheet: () => void;
  onSelectWard: (area: any) => void;
  setDraftAreaRadius: (r: number) => void;
  isGuest?: boolean;
}

export function MapSheets({
  selectedArea,
  selectedRoute,
  showDetailPanels,
  selectedStation,
  selectedStationId,
  selectedCommunityReport,
  showCommunityReportSheet,
  areaError,
  showWarningsSheet,
  showResultCard,
  showLayerSheet,
  isAdjustingRadius,
  draftAreaRadius,
  editingArea,
  draftAddress,
  showCreateAreaSheet,
  isCreatingArea,
  showCreationOptions,
  isLoadingLocation,
  isLoadingSearch,
  showAddressSearch,
  showPremiumLimitModal,
  currentAreaCount,
  freeAreaLimit,
  isCheckingLimit,
  showAdminAreaConfirmModal,
  selectedAdminArea,
  showWardSelectionSheet,
  adminAreas,
  areaDisplayMode,
  safeRoute,
  nav,
  router,
  isUsingGPSOrigin,
  transportMode,
  onModeChange,
  onFindRoute,
  onCloseAreaCard,
  onStartEditArea,
  onDeleteArea,
  onCloseStation,
  onCloseRoute,
  onCloseCommunityReport,
  onCloseWarnings,
  onSelectRoute,
  onExitRouting,
  onCloseRouteResults,
  isGuest = false,
  onShowWarnings,
  onStartNavigation,
  onCloseLayerSheet,
  onAreaDisplayModeChange,
  onConfirmRadius,
  onCancelCreation,
  onCloseCreateArea,
  onCreateAreaSubmit,
  onOptionSelect,
  onAddressSelected,
  onCloseCreationOptions,
  onCloseAddressSearch,
  onClosePremiumLimit,
  onUpgradePremium,
  onCloseError,
  onChangeLocation,
  onCloseAdminConfirm,
  onCloseWardSelectionSheet,
  onSelectWard,
  setDraftAreaRadius,
}: Props) {
  return (
    <>
      {/* Layer Sheet */}
      <LayerToggleSheet visible={showLayerSheet && !nav.isNavigating} onClose={onCloseLayerSheet} areaDisplayMode={areaDisplayMode} onAreaDisplayModeChange={onAreaDisplayModeChange} />

      {/* Ward Selection Sheet */}
      <WardSelectionSheet isOpen={showWardSelectionSheet && !nav.isNavigating} onClose={onCloseWardSelectionSheet} adminAreas={adminAreas} onSelectWard={onSelectWard} />

      {/* Admin Area Confirm */}
      <AdminAreaConfirmModal visible={showAdminAreaConfirmModal && !nav.isNavigating} adminArea={selectedAdminArea} onClose={onCloseAdminConfirm} />

      {/* Radius Adjust */}
      <RadiusAdjustBar visible={isAdjustingRadius && !nav.isNavigating} radius={draftAreaRadius} onRadiusChange={setDraftAreaRadius} onConfirm={onConfirmRadius} onCancel={onCancelCreation} />

      {/* Create Area */}
      <CreateAreaSheet
        visible={showCreateAreaSheet && !nav.isNavigating}
        onClose={onCloseCreateArea}
        onSubmit={onCreateAreaSubmit}
        radiusMeters={draftAreaRadius}
        isLoading={isCreatingArea}
        initialValues={editingArea ? { name: editingArea.name, addressText: editingArea.addressText || "" } : draftAddress ? { name: "", addressText: draftAddress } : undefined}
      />

      {/* Creation Options */}
      <AreaCreationOptionSheet visible={showCreationOptions && !nav.isNavigating} onClose={onCloseCreationOptions} onSelectOption={onOptionSelect} isLoadingGps={isLoadingLocation} isLoadingSearch={isLoadingSearch} />

      {/* Address Search */}
      <AddressSearchSheet visible={showAddressSearch && !nav.isNavigating} onClose={onCloseAddressSearch} onSelectLocation={onAddressSelected} />

      {/* Premium Limit */}
      <PremiumLimitModal visible={showPremiumLimitModal && !nav.isNavigating} onClose={onClosePremiumLimit} onUpgrade={onUpgradePremium} currentCount={currentAreaCount} maxCount={freeAreaLimit} />

      {/* Creation Loading */}
      <AreaCreationLoadingOverlay visible={isCheckingLimit && !nav.isNavigating} message="Đang kiểm tra..." subMessage="Đang xác minh giới hạn vùng của bạn" />

      {/* Error Modal */}
      <AreaCreationErrorModal visible={!!areaError && !nav.isNavigating} error={areaError} onClose={onCloseError} onChangeLocation={onChangeLocation} />

      {/* Area Sheet */}
      <MapBottomSheet isOpen={!!selectedArea && !nav.isNavigating} onClose={onCloseAreaCard} snapPoints={["50%", "75%"]}>
        {selectedArea && (
          <AreaCard
            area={selectedArea}
            onClose={onCloseAreaCard}
            onEdit={() => onStartEditArea()}
            onDelete={onDeleteArea}
            onViewDetails={() => {
              onCloseAreaCard();
              router.push({ pathname: "/areas/[id]", params: { id: selectedArea.id, source: "map" } });
            }}
          />
        )}
      </MapBottomSheet>

      {/* Route */}
      <MapBottomSheet isOpen={!!selectedRoute && showDetailPanels && !nav.isNavigating} onClose={onCloseRoute} snapPoints={["45%", "75%"]}>
        {selectedRoute && <RouteDetailCard route={selectedRoute} onClose={onCloseRoute} />}
      </MapBottomSheet>

      {/* Community Report */}
      <MapBottomSheet isOpen={showCommunityReportSheet && !nav.isNavigating} onClose={onCloseCommunityReport} snapPoints={["60%", "90%"]}>
        {selectedCommunityReport && <CommunityReportSheet report={selectedCommunityReport} onClose={onCloseCommunityReport} />}
      </MapBottomSheet>

      {/* Safe Route Results */}
      {safeRoute.hasResults && safeRoute.overallSafetyStatus && !nav.isNavigating && (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 35, paddingBottom: 16, gap: 10 }}>
          <SafeRouteAlternatives
            routes={safeRoute.getAllRoutes()}
            selectedIndex={safeRoute.selectedRouteIndex}
            onSelectRoute={onSelectRoute}
            onExitRouting={onExitRouting}
            transportMode={transportMode}
            onModeChange={(m) => { onModeChange(m); }}
            onFindRoute={onFindRoute}
            isLoading={safeRoute.isLoading}
          />
          {showResultCard && (
            <SafeRouteResultCard
              route={safeRoute.getSelectedRoute()!}
              floodWarnings={safeRoute.floodWarnings}
              metadata={safeRoute.metadata}
              onClose={onCloseRouteResults}
              onShowWarnings={onShowWarnings}
              onStartNavigation={onStartNavigation}
              isUsingGPSOrigin={isUsingGPSOrigin}
              isGuest={isGuest}
              transportMode={transportMode}
              onModeChange={(m) => { onModeChange(m); }}
              onFindRoute={onFindRoute}
              isLoading={safeRoute.isLoading}
            />
          )}
        </View>
      )}

      {/* Station */}
      <MapBottomSheet isOpen={!!selectedStationId && !nav.isNavigating} onClose={onCloseStation} snapPoints={["40%", "55%"]}>
        {selectedStationId && selectedStation && (
          <FloodStationCard
            station={selectedStation}
            onClose={onCloseStation}
            onViewDetails={() => {
              useFloodRealtimeStore.getState().setSelectedStation(selectedStation);
              onCloseStation();
              router.push(`/map/${selectedStationId}`);
            }}
          />
        )}
      </MapBottomSheet>

      {/* Warnings */}
      <SafeRouteWarnings warnings={safeRoute.floodWarnings} visible={showWarningsSheet && !nav.isNavigating} onClose={onCloseWarnings} />
    </>
  );
}
