// features/map/components/AreaCircleOverlay.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Circle, Marker } from "react-native-maps";
import {
  AREA_STATUS_COLORS,
  AREA_STATUS_ICONS,
  type AreaWithStatus,
} from "../../types/map-layers.types";

interface AreaCircleOverlayProps {
  area: AreaWithStatus;
  isSelected: boolean;
  onPress: () => void;
}

export function AreaCircleOverlay({
  area,
  isSelected,
  onPress,
}: AreaCircleOverlayProps) {
  const statusColor = AREA_STATUS_COLORS[area.status] || AREA_STATUS_COLORS.Unknown;
  const statusIcon = AREA_STATUS_ICONS[area.status] || AREA_STATUS_ICONS.Unknown;

  const center = {
    latitude: area.latitude,
    longitude: area.longitude,
  };

  return (
    <>
      {/* Circle overlay */}
      <Circle
        center={center}
        radius={area.radiusMeters}
        fillColor={`${statusColor}25`}
        strokeColor={statusColor}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Selected highlight circle */}
      {isSelected && (
        <Circle
          center={center}
          radius={area.radiusMeters}
          fillColor="transparent"
          strokeColor="white"
          strokeWidth={2}
          lineDashPattern={[10, 10]}
        />
      )}

      {/* Tappable center marker with status icon */}
      <Marker
        coordinate={center}
        anchor={{ x: 0.5, y: 1 }}
        onPress={onPress}
      >
        <View style={{ alignItems: "center" }}>
          {/* Badge */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
              borderWidth: 2,
              borderColor: statusColor,
            }}
          >
            <Ionicons name={statusIcon as any} size={14} color={statusColor} />
          </View>

          {/* Pointer */}
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 8,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: statusColor,
              marginTop: -1,
            }}
          />
        </View>
      </Marker>
    </>
  );
}
