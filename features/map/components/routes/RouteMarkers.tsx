import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import type { LatLng } from "~/features/map/types/safe-route.types";

interface RouteMarkersProps {
  isRoutingUIVisible: boolean;
  isUsingGPSOrigin: boolean;
  userLocation: LatLng | null;
  startCoord: LatLng | null;
  originText: string;
  endCoord: LatLng | null;
  destinationText: string;
}

const PinDot = () => (
  <View
    style={{
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#374151",
      marginTop: -4,
    }}
  />
);

export function RouteMarkers({
  isRoutingUIVisible,
  isUsingGPSOrigin,
  userLocation,
  startCoord,
  originText,
  endCoord,
  destinationText,
}: RouteMarkersProps) {
  if (!isRoutingUIVisible) return null;

  const originMarkerCoord = isUsingGPSOrigin ? userLocation : startCoord;

  return (
    <>
      {/* Origin Pin */}
      {originMarkerCoord && (
        <Marker
          coordinate={originMarkerCoord}
          title="Điểm đi"
          description={isUsingGPSOrigin ? "Vị trí hiện tại" : originText}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={{ alignItems: "center" }}>
            <Ionicons name="location-sharp" size={40} color="#16A34A" />
            <PinDot />
          </View>
        </Marker>
      )}

      {/* Destination Pin */}
      {endCoord && (
        <Marker
          coordinate={endCoord}
          title="Điểm đến"
          description={destinationText}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={{ alignItems: "center" }}>
            <Ionicons name="location-sharp" size={40} color="#4F46E5" />
            <PinDot />
          </View>
        </Marker>
      )}
    </>
  );
}
