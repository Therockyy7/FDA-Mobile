// features/map/components/routes/WaterFlowRoute.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodRoute, MOCK_SENSORS } from "~/features/map/constants/map-data";
import { getStatusColor } from "~/features/map/lib/map-utils";
import { SHADOW } from "~/lib/design-tokens";
import { FloodedRoutePolyline } from "./FloodedRoutePolyline";

interface WaterFlowRouteProps {
  route: FloodRoute;
  isSelected: boolean;
  onPress: () => void;
}

export const WaterFlowRoute = React.memo(function WaterFlowRoute({
  route,
  isSelected,
  onPress,
}: WaterFlowRouteProps) {
  const startPoint = route.coordinates[0];
  const endPoint = route.coordinates[route.coordinates.length - 1];

  const routeSensors = useMemo(() => {
    if (!route.sensorIds) return [];
    return MOCK_SENSORS.filter((s) => route.sensorIds?.includes(s.id));
  }, [route.sensorIds]);

  return (
    <>
      <FloodedRoutePolyline
        start={startPoint}
        end={endPoint}
        status={route.status}
        strokeWidth={route.strokeWidth || 6}
        isSelected={isSelected}
        onPress={onPress}
        zIndex={10}
      />

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
            {/* Marker child view — borderColor uses sensorColors.main (MAP_COLORS exception) */}
            <View
              style={[
                SHADOW.sm,
                {
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingHorizontal: 3,
                  paddingVertical: 2,
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  borderWidth: 1,
                  borderColor: sensorColors.main,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="waves"
                size={10}
                color={sensorColors.main}
              />
              <Text className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100">
                {sensor.waterLevel}cm
              </Text>
            </View>
          </Marker>
        );
      })}
    </>
  );
});
