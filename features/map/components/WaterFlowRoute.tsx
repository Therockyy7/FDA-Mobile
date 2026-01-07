// features/map/components/WaterFlowRoute.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Marker, Polyline } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodRoute, MOCK_SENSORS } from "../constants/map-data";
import { getStatusColor } from "../lib/map-utils";

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
  const colors = getStatusColor(route.status);

  const getMainColor = () => {
    if (route.status === "danger") return "#EF4444";
    if (route.status === "warning") return "#F59E0B";
    return "#3B82F6";
  };

  const getHighlightColor = () => {
    if (route.status === "danger") return "#FECACA";
    if (route.status === "warning") return "#FDE68A";
    return "#BFDBFE";
  };

  const routeSensors = useMemo(() => {
    if (!route.sensorIds) return [];
    return MOCK_SENSORS.filter((s) => route.sensorIds?.includes(s.id));
  }, [route.sensorIds]);

  return (
    <>
      {/* White border */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor="white"
        strokeWidth={(route.strokeWidth || 6) + 4}
        lineJoin="round"
        lineCap="round"
        zIndex={10}
      />

      {/* Main route color */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor={getMainColor()}
        strokeWidth={route.strokeWidth || 6}
        lineJoin="round"
        lineCap="round"
        zIndex={11}
        tappable
        onPress={onPress}
      />

      {/* Inner highlight */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor={getHighlightColor()}
        strokeWidth={(route.strokeWidth || 6) * 0.4}
        lineJoin="round"
        lineCap="round"
        zIndex={12}
      />

      {/* Flow dots */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor="rgba(255,255,255,0.6)"
        strokeWidth={(route.strokeWidth || 6) * 0.4}
        lineDashPattern={[15, 25]}
        lineCap="round"
        zIndex={13}
      />

      {/* Selected state */}
      {isSelected && (
        <Polyline
          coordinates={route.coordinates}
          strokeColor={colors.main}
          strokeWidth={1}
          lineDashPattern={[10, 10]}
          zIndex={14}
        />
      )}

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
