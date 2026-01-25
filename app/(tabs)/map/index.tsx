// app/(tabs)/map/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StatusBar, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { PremiumLimitModal } from "~/features/areas/components/PremiumLimitModal";
import { useControlArea } from "~/features/areas/hooks/useControlArea";
import { AddressSearchSheet } from "~/features/map/components/areas/AddressSearchSheet";
import { AreaCard } from "~/features/map/components/areas/AreaCard";
import { AreaCircleOverlay } from "~/features/map/components/areas/AreaCircleOverlay";
import { AreaCreationOptionSheet } from "~/features/map/components/areas/AreaCreationOptionSheet";
import { AreaPreviewCircle } from "~/features/map/components/areas/AreaPreviewCircle";
import { CreateAreaSheet } from "~/features/map/components/areas/CreateAreaSheet";
import { RadiusAdjustBar } from "~/features/map/components/areas/RadiusAdjustBar";
import { LayerToggleSheet } from "~/features/map/components/controls/LayerToggleSheet";
import Legend from "~/features/map/components/controls/Legend";
import { MapControls } from "~/features/map/components/controls/MapControls";
import { MapTopControls } from "~/features/map/components/controls/MapTopControls";
import { MapLoadingOverlay } from "~/features/map/components/overlays/MapLoadingOverlay";
import { RouteDetailCard } from "~/features/map/components/routes/RouteDetailCard";
import { RouteDirectionPanel } from "~/features/map/components/routes/RouteDirectionPanel";
import { WaterFlowRoute } from "~/features/map/components/routes/WaterFlowRoute";
import { FloodSeverityMarkers } from "~/features/map/components/stations/FloodSeverityMarkers";
import { FloodStationCard } from "~/features/map/components/stations/FloodStationCard";
import { MapHeader } from "~/features/map/components/ui/MapHeader";
import {
  DANANG_CENTER,
  FLOOD_ROUTES,
  FloodRoute,
} from "~/features/map/constants/map-data";
import { useFloodSelection } from "~/features/map/hooks/useFloodSelection";
import { useMapCamera } from "~/features/map/hooks/useMapCamera";
import { useMapDisplay } from "~/features/map/hooks/useMapDisplay";
import { useMapLayerSettings } from "~/features/map/hooks/useMapLayerSettings";
import { useRoutingUI } from "~/features/map/hooks/useRoutingUI";
import { useStreetView } from "~/features/map/hooks/useStreetView";
import {
  debounce,
  MapRegion,
  shouldFetchNewMarkers,
} from "~/features/map/lib/map-utils";
import { FloodSeverityFeature } from "~/features/map/types/map-layers.types";

type MapType = "standard" | "satellite" | "hybrid";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showLayerSheet, setShowLayerSheet] = useState(false);
  const [selectedStation, setSelectedStation] =
    useState<FloodSeverityFeature | null>(null);
  const stationCardAnim = useRef(new Animated.Value(300)).current;

  const lastFetchedRegionRef = useRef<MapRegion | null>(null);

  const { settings, areas, refreshFloodSeverity, refreshAreas } =
    useMapLayerSettings();

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

  const {
    isRoutingUIVisible,
    openRouting,
    closeRouting,
    transportMode,
    setTransportMode,
    originLabel,
    setOriginLabel,
    destinationText,
    setDestinationText,
  } = useRoutingUI();

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
      // Load markers for initial region (DANANG_CENTER)
      refreshFloodSeverity({
        minLat: DANANG_CENTER.latitude - DANANG_CENTER.latitudeDelta / 2,
        minLng: DANANG_CENTER.longitude - DANANG_CENTER.longitudeDelta / 2,
        maxLat: DANANG_CENTER.latitude + DANANG_CENTER.latitudeDelta / 2,
        maxLng: DANANG_CENTER.longitude + DANANG_CENTER.longitudeDelta / 2,
      });
      // Load areas
      refreshAreas();
    }
  }, [settings.overlays.flood, refreshFloodSeverity, refreshAreas]);

  useEffect(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, [viewMode]);

  // Area control hook - all area-related state and handlers
  const {
    selectedArea,
    areaCardAnim,
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
    handleMapPress,
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
    isLoadingLocation,
  } = useControlArea({
    mapRef,
    region,
    refreshAreas: () => {
      refreshAreas();
    },
    clearSelections: () => {
      setSelectedRoute(null);
      setSelectedZone(null);
      setSelectedStation(null);
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
      // Enter edit mode with the area data
      const lat = parseFloat(params.editLat);
      const lng = parseFloat(params.editLng);
      const radius = parseFloat(params.editRadius);

      // Trigger edit mode - this sets all draft values and shows adjust bar
      handleStartEditAreaFromParams({
        id: params.editAreaId,
        name: params.editName || "",
        latitude: lat,
        longitude: lng,
        radiusMeters: radius,
        addressText: params.editAddress || "",
      });

      // Focus map on the area
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

  // Keep old handlers for routes
  const handleRoutePress = (route: FloodRoute) => {
    setSelectedZone(null);
    setSelectedArea(null);
    setSelectedRoute(route);
    focusOnRoute(route);
  };

  // Ray-casting algorithm for point in polygon
  function isPointInPolygon(
    point: { latitude: number; longitude: number },
    polygon: { latitude: number; longitude: number }[],
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

  // function getSensorsForZone(zoneId: string): Sensor[] {
  //   const zone = FLOOD_ZONES.find((z) => z.id === zoneId);
  //   if (!zone) return [];
  //   return MOCK_SENSORS.filter((sensor) =>
  //     isPointInPolygon(
  //       { latitude: sensor.latitude, longitude: sensor.longitude },
  //       zone.coordinates
  //     )
  //   );
  // }

  const fetchMarkersInViewPort = useMemo(
    () =>
      debounce((newRegion: Region) => {
        if (!settings.overlays.flood) return;

        // Check if region has changed enough to warrant a new fetch
        if (!shouldFetchNewMarkers(newRegion, lastFetchedRegionRef.current)) {
          console.log("⏭️ Skip fetch - region change too small");
          return;
        }

        // Update last fetched region
        lastFetchedRegionRef.current = newRegion;

        const params = {
          minLat: newRegion.latitude - newRegion.latitudeDelta / 2,
          minLng: newRegion.longitude - newRegion.longitudeDelta / 2,
          maxLat: newRegion.latitude + newRegion.latitudeDelta / 2,
          maxLng: newRegion.longitude + newRegion.longitudeDelta / 2,
        };

        console.log("📍 Fetching markers in viewport:", params);
        refreshFloodSeverity(params);
      }, 1000), // Increased debounce to 1s for stability
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

      <View style={{ flex: 1, position: "relative" }}>
        {/* Loading Overlay */}
        <MapLoadingOverlay visible={isLoading} />

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
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsTraffic={settings.overlays.traffic}
          showsBuildings={true}
          pitchEnabled={true}
          rotateEnabled={true}
          mapType={settings.baseMap === "satellite" ? "satellite" : mapType}
          customMapStyle={
            // Disable custom style when traffic is ON (traffic needs default road colors)
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

          {/* Flood Severity Markers from API */}
          <FloodSeverityMarkers
            onMarkerPress={useCallback(
              (feature) => {
                // Get marker coordinates
                const [longitude, latitude] = feature.geometry.coordinates;

                // Clear other selections and set new station
                setSelectedArea(null);
                setSelectedRoute(null);
                setSelectedZone(null);
                setSelectedStation(feature);

                // Animate card slide in immediately (same as handleAreaPress)
                Animated.timing(stationCardAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();

                // Focus camera on marker with offset so popup is visible
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
              [stationCardAnim, mapRef],
            )}
          />
        </MapView>

        {/* Top Controls - Hide during create area mode */}
        {!isRoutingUIVisible && !isAdjustingRadius && !showCreateAreaSheet && (
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

        {/* Map Controls - Hide during create area mode */}
        <View
          style={{
            position: "absolute",
            bottom: selectedZone || selectedRoute ? 180 : 24,
            right: 16,
            zIndex: 10,
          }}
        >
          {!selectedRoute &&
            !selectedZone &&
            !isRoutingUIVisible &&
            !isAdjustingRadius &&
            !showCreateAreaSheet && (
              <MapControls
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onMyLocation={goToMyLocation}
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
            onEdit={handleStartEditArea}
            onDelete={handleDeleteArea}
            onViewDetails={() => {
              Animated.timing(areaCardAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                router.push({
                  pathname: "/areas/[id]",
                  params: { id: selectedArea.id },
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
          visible={isRoutingUIVisible}
          onClose={closeRouting}
          originLabel={originLabel}
          destinationText={destinationText}
          onDestinationChange={setDestinationText}
          transportMode={transportMode}
          onModeChange={setTransportMode}
          onFindRoute={() => {
            closeRouting;
          }}
        />

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
              // Store stationId before closing card
              const stationId = selectedStation.properties.stationId;

              // Close the card first
              Animated.timing(stationCardAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                setSelectedStation(null);
                // Navigate after card is closed and state is cleared
                router.push(`/map/${stationId}`);
              });
            }}
          />
        )}

        {/* Layer Toggle Sheet */}
        <LayerToggleSheet
          visible={showLayerSheet}
          onClose={() => setShowLayerSheet(false)}
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

        {/* NEW: Area Creation Option Sheet */}
        <AreaCreationOptionSheet
          visible={showCreationOptions}
          onClose={handleCloseCreationOptions}
          onSelectOption={handleOptionSelect}
          isLoadingGps={isLoadingLocation}
        />

        {/* NEW: Address Search Sheet */}
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
      </View>
    </View>
  );
}
