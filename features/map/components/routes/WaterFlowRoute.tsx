// features/map/components/WaterFlowRoute.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodRoute, MOCK_SENSORS } from "../../constants/map-data";
import { getStatusColor } from "../../lib/map-utils";
import { FloodedRoutePolyline } from "./FloodedRoutePolyline";

interface WaterFlowRouteProps {
  route: FloodRoute;
  isSelected: boolean;
  onPress: () => void;
}

export function WaterFlowRoute({
  route,
  isSelected,
  onPress,
}: WaterFlowRouteProps) {
  // Extract start and end for snap-to-road API
  const startPoint = route.coordinates[0];
  const endPoint = route.coordinates[route.coordinates.length - 1];

  const routeSensors = useMemo(() => {
    if (!route.sensorIds) return [];
    return MOCK_SENSORS.filter((s) => route.sensorIds?.includes(s.id));
  }, [route.sensorIds]);

  return (
    <>
      {/* Snap-to-road Polyline */}
      <FloodedRoutePolyline
        start={startPoint}
        end={endPoint}
        status={route.status}
        strokeWidth={route.strokeWidth || 6}
        isSelected={isSelected}
        onPress={onPress}
        zIndex={10}
      />

      {/* Compact Sensor Markers */}
      {routeSensors.map((sensor) => {
        const sensorColors = getStatusColor(sensor.status);

        return (
          <Marker
            key={`sensor-${sensor.id}`}
            coordinate={{
              latitude: sensor.latitude,
              longitude: sensor.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={20}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                paddingHorizontal: 3,
                paddingVertical: 2,
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                borderWidth: 1,
                borderColor: sensorColors.main,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons
                name="waves"
                size={10}
                color={sensorColors.main}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: "#1F2937",
                }}
              >
                {sensor.waterLevel}cm
              </Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
}
