import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodZoneCard } from "~/features/map/components/FloodZoneCard";
import { FloodZoneOverlay } from "~/features/map/components/FloodZoneOverlay";
import Legend from "~/features/map/components/Legend";
import { MapControls } from "~/features/map/components/MapControls";
import { MapHeader } from "~/features/map/components/MapHeader";
import { MapTopControls } from "~/features/map/components/MapTopControls";
import { RouteDetailCard } from "~/features/map/components/RouteDetailCard";
import {
  RouteDirectionPanel
} from "~/features/map/components/RouteDirectionPanel";
import { WaterFlowRoute } from "~/features/map/components/WaterFlowRoute";
import {
  DANANG_CENTER,
  FLOOD_ROUTES,
  FLOOD_ZONES,
  FloodRoute,
  FloodZone,
} from "~/features/map/constants/map-data";
import { useFloodSelection } from "~/features/map/hooks/useFloodSelection";
import { useMapCamera } from "~/features/map/hooks/useMapCamera";
import { useMapDisplay } from "~/features/map/hooks/useMapDisplay";
import { useRoutingUI } from "~/features/map/hooks/useRoutingUI";
import { useStreetView } from "~/features/map/hooks/useStreetView";

type MapType = "standard" | "satellite" | "hybrid";

export default function MapScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  

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
    setTimeout(() => setIsLoading(false), 600);
  }, []);

  useEffect(() => {
    if (selectedZone || selectedRoute) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedZone, selectedRoute, slideAnim]);

  useEffect(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, [viewMode]);

  const handleZonePress = (zone: FloodZone) => {
    setSelectedRoute(null);
    setSelectedZone(zone);
    focusOnZone(zone);
  };
  const handleRoutePress = (route: FloodRoute) => {
    setSelectedZone(null);
    setSelectedRoute(route);
    focusOnRoute(route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MapHeader
        stats={stats}
        mapType={mapType as MapType}
        onMapTypeChange={handleMapTypeChange}
      />

      <View style={{ flex: 1, position: "relative" }}>
        {/* Loading Overlay */}
        {isLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
            <Text
              style={{
                color: "#1F2937",
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Đang tải bản đồ...
            </Text>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              Flood monitoring system
            </Text>
          </View>
        )}

        {/* Map View */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          initialRegion={DANANG_CENTER}
          camera={is3DEnabled ? camera : undefined}
          onRegionChangeComplete={setRegion}
          onLongPress={handleMapLongPress}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsTraffic={false}
          showsBuildings={true}
          pitchEnabled={true}
          rotateEnabled={true}
          mapType={mapType}
          customMapStyle={
            mapType === "standard"
              ? [
                  {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#C6E2FF" }],
                  },
                  {
                    featureType: "landscape",
                    elementType: "geometry",
                    stylers: [{ color: "#F9FAFB" }],
                  },
                ]
              : undefined
          }
        >
          {/* ZONES MODE */}
          {viewMode === "zones" &&
            FLOOD_ZONES.map((zone) => (
              <FloodZoneOverlay
                key={zone.id}
                zone={zone}
                isSelected={selectedZone?.id === zone.id}
                onPress={() => handleZonePress(zone)}
              />
            ))}

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
              title="Street View"
              description="Nhấn để xem Street View"
              pinColor="#F59E0B"
              onPress={() =>
                openStreetView(
                  streetViewLocation.latitude,
                  streetViewLocation.longitude
                )
              }
            />
          )}
        </MapView>

        {!isRoutingUIVisible && (
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
              top: 260,
              right: 16,
              backgroundColor: "rgba(245, 158, 11, 0.95)",
              borderRadius: 12,
              padding: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
              maxWidth: 180,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "white",
                textAlign: "center",
              }}
            >
              📍 Nhấn vào marker màu cam để xem Street View
            </Text>
          </View>
        )}

        {/* Map Controls */}
        <View
          style={{
            position: "absolute",
            bottom: selectedZone || selectedRoute ? 360 : 140,
            right: 16,
            zIndex: 10,
          }}
        >
          {!selectedRoute && !selectedZone && !isRoutingUIVisible && (
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
            />
          )}
        </View>

        {/* Selected Zone Card */}
        {selectedZone && showDetailPanels && (
          <FloodZoneCard
            zone={selectedZone}
            slideAnim={slideAnim}
            onClose={() => setSelectedZone(null)}
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

        {/* Panel chỉ đường */}
        <RouteDirectionPanel
          visible={isRoutingUIVisible}
          onClose={closeRouting}
          originLabel={originLabel}
          destinationText={destinationText}
          onDestinationChange={setDestinationText}
          transportMode={transportMode}
          onModeChange={setTransportMode}
          onFindRoute={() => {
            // TODO: geocode destination + chọn route tránh ngập
            closeRouting;
          }}
        />
      </View>
    </View>
  );
}
