// features/map/components/SensorMarker.tsx
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { Sensor } from "../constants/map-data";

interface SensorMarkerProps {
  sensor: Sensor;
  onPress?: () => void;
}

function getStatusColor(status: "safe" | "warning" | "danger") {
  switch (status) {
    case "safe":
      return "#10B981";
    case "warning":
      return "#F59E0B";
    case "danger":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

export function SensorMarker({ sensor, onPress }: SensorMarkerProps) {
  const color = getStatusColor(sensor.status);

  return (
    <Marker
      coordinate={{
        latitude: sensor.latitude,
        longitude: sensor.longitude,
      }}
      title={sensor.name}
      description={`Mực nước: ${sensor.waterLevel}cm - ${sensor.statusText}`}
      onPress={onPress}
    >
      <View style={{ alignItems: "center" }}>
        {/* Compact Bubble */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: color,
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#111827",
            }}
          >
            {sensor.waterLevel}cm
          </Text>
        </View>

        {/* Arrow pointer */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 5,
            borderRightWidth: 5,
            borderTopWidth: 8,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "white",
          }}
        />

        {/* Dot */}
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            marginTop: 1,
          }}
        />
      </View>
    </Marker>
  );
}
