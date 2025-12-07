// app/(tabs)/map.tsx
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StatusBar, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodZoneCard } from "~/features/map/components/FloodZoneCard";
import { FloodZoneOverlay } from "~/features/map/components/FloodZoneOverlay";
import { MapControls } from "~/features/map/components/MapControls";
import { MapHeader } from "~/features/map/components/MapHeader";
import { MapSearch } from "~/features/map/components/MapSearch";
import { RouteDetailCard } from "~/features/map/components/RouteDetailCard";
import {
  ViewMode,
  ViewModeSelector,
} from "~/features/map/components/ViewModeSelector";
import { WaterFlowRoute } from "~/features/map/components/WaterFlowRoute";
import {
  DANANG_CENTER,
  FLOOD_ROUTES,
  FLOOD_ZONES,
  FloodRoute,
  FloodZone,
} from "~/features/map/constants/map-data";

type MapType = "standard" | "satellite" | "hybrid";

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FloodRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState(DANANG_CENTER);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [viewMode, setViewMode] = useState<ViewMode>("zones");
  const slideAnim = useRef(new Animated.Value(300)).current;

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
  }, [selectedZone, selectedRoute]);

  // Clear selections when switching modes
  useEffect(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, [viewMode]);

  const handleZonePress = (zone: FloodZone) => {
    setSelectedRoute(null);
    setSelectedZone(zone);

    // Calculate zone center
    const latSum = zone.coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
    const lngSum = zone.coordinates.reduce((sum, coord) => sum + coord.longitude, 0);
    const center = {
      latitude: latSum / zone.coordinates.length,
      longitude: lngSum / zone.coordinates.length,
    };

    mapRef.current?.animateToRegion(
      {
        ...center,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      500
    );
  };

  const handleRoutePress = (route: FloodRoute) => {
    setSelectedZone(null);
    setSelectedRoute(route);

    // Center on route midpoint
    const midIndex = Math.floor(route.coordinates.length / 2);
    const midPoint = route.coordinates[midIndex];

    mapRef.current?.animateToRegion(
      {
        latitude: midPoint.latitude,
        longitude: midPoint.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      },
      500
    );
  };

  const handleMapTypeChange = () => {
    const types: MapType[] = ["standard", "satellite", "hybrid"];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 0.5,
      longitudeDelta: region.longitudeDelta * 0.5,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: Math.min(region.latitudeDelta * 1.5, 0.5),
      longitudeDelta: Math.min(region.longitudeDelta * 1.5, 0.5),
    };
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const handleMyLocation = () => {
    mapRef.current?.animateToRegion(DANANG_CENTER, 600);
    setSelectedZone(null);
    setSelectedRoute(null);
  };

  const getStats = () => {
    const items = viewMode === "zones" ? FLOOD_ZONES : FLOOD_ROUTES;
    const safe = items.filter((item) => item.status === "safe").length;
    const warning = items.filter((item) => item.status === "warning").length;
    const danger = items.filter((item) => item.status === "danger").length;
    return { safe, warning, danger };
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <MapHeader
        stats={getStats()}
        mapType={mapType}
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
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          showsTraffic={false}
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
          {/* ZONES MODE - Water Areas */}
          {viewMode === "zones" &&
            FLOOD_ZONES.map((zone) => (
              <FloodZoneOverlay
                key={zone.id}
                zone={zone}
                isSelected={selectedZone?.id === zone.id}
                onPress={() => handleZonePress(zone)}
              />
            ))}

          {/* ROUTES MODE - Water on Roads */}
          {viewMode === "routes" &&
            FLOOD_ROUTES.map((route) => (
              <WaterFlowRoute
                key={route.id}
                route={route}
                isSelected={selectedRoute?.id === route.id}
                onPress={() => handleRoutePress(route)}
              />
            ))}
        </MapView>

        {/* Search Bar */}
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <MapSearch
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>

        {/* View Mode Selector */}
        <View
          style={{
            position: "absolute",
            top: 80,
            left: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <ViewModeSelector mode={viewMode} onModeChange={setViewMode} />
        </View>

        {/* Legend */}
        <View
          style={{
            position: "absolute",
            top: 150,
            right: 16,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 16,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            minWidth: 120,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            MỰC NƯỚC
          </Text>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 20,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#10B981",
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 11, color: "#374151", fontWeight: "600" }}>
                {"< 35cm"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 20,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#F59E0B",
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 11, color: "#374151", fontWeight: "600" }}>
                35-50cm
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 20,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#EF4444",
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 11, color: "#374151", fontWeight: "600" }}>
                {"> 50cm"}
              </Text>
            </View>
          </View>
        </View>

        {/* Map Controls */}
        <View
          style={{
            position: "absolute",
            bottom: selectedZone || selectedRoute ? 360 : 140,
            right: 16,
            zIndex: 10,
          }}
        >
          {!selectedRoute && 
            (<MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onMyLocation={handleMyLocation}
            />)
          }
         
        </View>

        {/* Selected Zone Card */}
        {selectedZone && (
          <FloodZoneCard
            zone={selectedZone}
            slideAnim={slideAnim}
            onClose={() => setSelectedZone(null)}
          />
        )}

        {/* Selected Route Card */}
        {selectedRoute && (
          <RouteDetailCard
            route={selectedRoute}
            slideAnim={slideAnim}
            onClose={() => setSelectedRoute(null)}
          />
        )}
      </View>
    </View>
  );
}
