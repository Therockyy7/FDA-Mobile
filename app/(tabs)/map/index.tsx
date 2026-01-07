// app/(tabs)/map/index.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodZoneCard } from "~/features/map/components/FloodZoneCard";
import { FloodZoneOverlay } from "~/features/map/components/FloodZoneOverlay";
import Legend from "~/features/map/components/Legend";
import { MapControls } from "~/features/map/components/MapControls";
import { MapHeader } from "~/features/map/components/MapHeader";
import { MapLoadingOverlay } from "~/features/map/components/MapLoadingOverlay";
import { MapTopControls } from "~/features/map/components/MapTopControls";
import { RouteDetailCard } from "~/features/map/components/RouteDetailCard";
import { RouteDirectionPanel } from "~/features/map/components/RouteDirectionPanel";
import { SensorMarker } from "~/features/map/components/SensorMarker";
import { WaterFlowRoute } from "~/features/map/components/WaterFlowRoute";
import {
    DANANG_CENTER,
    FLOOD_ROUTES,
    FLOOD_ZONES,
    FloodRoute,
    FloodZone,
    MOCK_SENSORS,
    Sensor,
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
    setTimeout(() => setIsLoading(false), 800);
  }, []);

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

  // Ray-casting algorithm for point in polygon
  function isPointInPolygon(
    point: { latitude: number; longitude: number },
    polygon: { latitude: number; longitude: number }[]
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

  function getSensorsForZone(zoneId: string): Sensor[] {
    const zone = FLOOD_ZONES.find((z) => z.id === zoneId);
    if (!zone) return [];
    return MOCK_SENSORS.filter((sensor) =>
      isPointInPolygon(
        { latitude: sensor.latitude, longitude: sensor.longitude },
        zone.coordinates
      )
    );
  }

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
          onMapReady={() => console.log("Map ready")}
          customMapStyle={
            mapType === "standard"
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

          {/* Sensors for selected zone */}
          {viewMode === "zones" &&
            selectedZone &&
            getSensorsForZone(selectedZone.id).map((sensor) => (
              <SensorMarker key={sensor.id} sensor={sensor} />
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
              onPress={() =>
                openStreetView(
                  streetViewLocation.latitude,
                  streetViewLocation.longitude
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
        </MapView>

        {/* Top Controls */}
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

        {/* Map Controls */}
        <View
          style={{
            position: "absolute",
            bottom: selectedZone || selectedRoute ? 180 : 24,
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
      </View>
    </View>
  );
}
