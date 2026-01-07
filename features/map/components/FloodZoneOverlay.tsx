// features/map/components/FloodZoneOverlay.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Marker, Polygon } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodZone } from "../constants/map-data";
import { getStatusColor } from "../lib/map-utils";

interface FloodZoneOverlayProps {
  zone: FloodZone;
  isSelected: boolean;
  onPress: () => void;
}

// Calculate center of polygon
function getPolygonCenter(coordinates: { latitude: number; longitude: number }[]) {
  const sumLat = coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
  const sumLng = coordinates.reduce((sum, coord) => sum + coord.longitude, 0);
  return {
    latitude: sumLat / coordinates.length,
    longitude: sumLng / coordinates.length,
  };
}

export function FloodZoneOverlay({
  zone,
  isSelected,
  onPress,
}: FloodZoneOverlayProps) {
  const colors = getStatusColor(zone.status);
  const center = getPolygonCenter(zone.coordinates);

  const getStatusIcon = () => {
    switch (zone.status) {
      case "safe":
        return "checkmark-circle";
      case "warning":
        return "alert-circle";
      case "danger":
        return "warning";
      default:
        return "water";
    }
  };

  return (
    <>
      {/* Base layer */}
      <Polygon
        coordinates={zone.coordinates}
        fillColor={`${colors.main}25`}
        strokeColor={colors.main}
        strokeWidth={isSelected ? 3 : 2}
        tappable
        onPress={onPress}
      />

      {/* Highlight when selected */}
      {isSelected && (
        <Polygon
          coordinates={zone.coordinates}
          fillColor="transparent"
          strokeColor="white"
          strokeWidth={2}
          lineDashPattern={[8, 8]}
        />
      )}

      {/* Compact Zone Label Marker */}
      <Marker
        coordinate={center}
        anchor={{ x: 0.5, y: 1 }}
        onPress={onPress}
      >
        <View style={{ alignItems: "center" }}>
          {/* Compact Badge */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              paddingHorizontal: 2,
              paddingVertical: 1,
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
              borderWidth: 1,
              borderColor: colors.main,
            }}
          >
            {/* Status Icon */}
            <Ionicons name={getStatusIcon() as any} size={12} color={colors.main} />

            {/* Water Level */}
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: colors.main,
              }}
            >
              {zone.waterLevel}cm
            </Text>
          </View>

          {/* Small Pointer */}
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 4,
              borderRightWidth: 4,
              borderTopWidth: 5,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: colors.main,
              marginTop: -1,
            }}
          />
        </View>
      </Marker>
    </>
  );
}
