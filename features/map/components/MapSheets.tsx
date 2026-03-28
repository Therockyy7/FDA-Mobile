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
} from "~/features/map/components/areas";
import {
  AdminAreaConfirmModal,
} from "~/features/map/components/areas";
import { LayerToggleSheet } from "~/features/map/components/controls";
import { FloodStationCard } from "~/features/map/components/stations";
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
  areaDisplayMode: "user" | "admin";
  safeRoute: {
    hasResults: boolean;
    overallSafetyStatus: any;
    getAllRoutes: () => any[];
    selectedRouteIndex: number;
    getSelectedRoute: () => any;
    floodWarnings: any[];
    metadata: any;
  };
  nav: { isNavigating: boolean };
  router: { push: (path: any) => void };
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
  setDraftAreaRadius: (r: number) => void;
}

export function MapSheets({
  selectedArea,
  selectedRoute,
  showDetailPanels,
  selectedStation,
  selectedStationId,
  selectedCommunityReport,
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
  areaDisplayMode,
  safeRoute,
  nav,
  router,
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
  setDraftAreaRadius,
}: Props) {
  return (
    <>
      {/* Layer Sheet */}
      <LayerToggleSheet visible={showLayerSheet} onClose={onCloseLayerSheet} areaDisplayMode={areaDisplayMode} onAreaDisplayModeChange={onAreaDisplayModeChange} />

      {/* Admin Area Confirm */}
      <AdminAreaConfirmModal visible={showAdminAreaConfirmModal} adminArea={selectedAdminArea} onClose={onCloseAdminConfirm} />

      {/* Radius Adjust */}
      <RadiusAdjustBar visible={isAdjustingRadius} radius={draftAreaRadius} onRadiusChange={setDraftAreaRadius} onConfirm={onConfirmRadius} onCancel={onCancelCreation} />

      {/* Create Area */}
      <CreateAreaSheet
        visible={showCreateAreaSheet}
        onClose={onCloseCreateArea}
        onSubmit={onCreateAreaSubmit}
        radiusMeters={draftAreaRadius}
        isLoading={isCreatingArea}
        initialValues={editingArea ? { name: editingArea.name, addressText: editingArea.addressText || "" } : draftAddress ? { name: "", addressText: draftAddress } : undefined}
      />

      {/* Creation Options */}
      <AreaCreationOptionSheet visible={showCreationOptions} onClose={onCloseCreationOptions} onSelectOption={onOptionSelect} isLoadingGps={isLoadingLocation} isLoadingSearch={isLoadingSearch} />

      {/* Address Search */}
      <AddressSearchSheet visible={showAddressSearch} onClose={onCloseAddressSearch} onSelectLocation={onAddressSelected} />

      {/* Premium Limit */}
      <PremiumLimitModal visible={showPremiumLimitModal} onClose={onClosePremiumLimit} onUpgrade={onUpgradePremium} currentCount={currentAreaCount} maxCount={freeAreaLimit} />

      {/* Creation Loading */}
      <AreaCreationLoadingOverlay visible={isCheckingLimit} message="Đang kiểm tra..." subMessage="Đang xác minh giới hạn vùng của bạn" />

      {/* Error Modal */}
      <AreaCreationErrorModal visible={!!areaError} error={areaError} onClose={onCloseError} onChangeLocation={onChangeLocation} />

      {/* Area Sheet */}
      <MapBottomSheet isOpen={!!selectedArea} onClose={onCloseAreaCard} snapPoints={["50%", "75%"]}>
        {selectedArea && (
          <AreaCard
            area={selectedArea}
            onClose={onCloseAreaCard}
            onEdit={() => onStartEditArea()}
            onDelete={onDeleteArea}
            onViewDetails={() => {
              onCloseAreaCard();
              router.push({ pathname: "/areas/[id]", params: { id: selectedArea.id } });
            }}
          />
        )}
      </MapBottomSheet>

      {/* Route */}
      <MapBottomSheet isOpen={!!selectedRoute && showDetailPanels} onClose={onCloseRoute} snapPoints={["45%", "75%"]}>
        {selectedRoute && <RouteDetailCard route={selectedRoute} onClose={onCloseRoute} />}
      </MapBottomSheet>

      {/* Community Report */}
      <MapBottomSheet isOpen={!!selectedCommunityReport} onClose={onCloseCommunityReport} snapPoints={["60%", "90%"]}>
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
          />
          {showResultCard && (
            <SafeRouteResultCard
              route={safeRoute.getSelectedRoute()!}
              floodWarnings={safeRoute.floodWarnings}
              metadata={safeRoute.metadata}
              onClose={onCloseRouteResults}
              onShowWarnings={onShowWarnings}
              onStartNavigation={onStartNavigation}
            />
          )}
        </View>
      )}

      {/* Station */}
      <MapBottomSheet isOpen={!!selectedStationId} onClose={onCloseStation} snapPoints={["40%", "55%"]}>
        {selectedStationId && selectedStation && (
          <FloodStationCard
            station={selectedStation}
            onClose={onCloseStation}
            onViewDetails={() => {
              onCloseStation();
              router.push(`/map/${selectedStationId}`);
            }}
          />
        )}
      </MapBottomSheet>

      {/* Warnings */}
      <SafeRouteWarnings warnings={safeRoute.floodWarnings} visible={showWarningsSheet} onClose={onCloseWarnings} />
    </>
  );
}
