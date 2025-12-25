// features/map/components/WaterFlowRoute.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
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
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const colors = getStatusColor(route.status);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getMainColor = (route) => {
    if (route.status === "danger") return "#EF4444"; // Red 500
    if (route.status === "warning") return "#F59E0B";
    return "#3B82F6"; // Blue 500
  };

  const getHighlightColor = (route) => {
    if (route.status === "danger") return "#FECACA";
    if (route.status === "warning") return "#FDE68A";
    return "#BFDBFE";
  };

  const routeSensors = useMemo(() => {
    if (!route.sensorIds) return [];
    // Lọc từ MOCK_SENSORS những id nằm trong route.sensorIds
    return MOCK_SENSORS.filter((s) => route.sensorIds?.includes(s.id));
  }, [route.sensorIds]);

  // Tính toán vị trí marker (lấy điểm giữa tuyến đường)
  const midPointIndex = Math.floor(route.coordinates.length / 2);
  const midCoordinate =
    route.coordinates[midPointIndex] || route.coordinates[0];

  return (
    <>
      <Polyline
        coordinates={route.coordinates}
        strokeColor="white"
        strokeWidth={route.strokeWidth + 4}
        lineJoin="round"
        lineCap="round"
        zIndex={10}
      />

      <Polyline
        coordinates={route.coordinates}
        strokeColor={getMainColor(route)}
        strokeWidth={route.strokeWidth}
        lineJoin="round"
        lineCap="round"
        zIndex={11}
        tappable
        onPress={onPress}
      />

      <Polyline
        coordinates={route.coordinates}
        strokeColor={getHighlightColor(route)}
        strokeWidth={route.strokeWidth * 0.4}
        lineJoin="round"
        lineCap="round"
        zIndex={12}
      />

      <Polyline
        coordinates={route.coordinates}
        strokeColor="rgba(255,255,255,0.6)"
        strokeWidth={route.strokeWidth * 0.4}
        lineDashPattern={[15, 25]}
        lineCap="round"
        zIndex={13}
      />

      {isSelected && (
        <Polyline
          coordinates={route.coordinates}
          strokeColor={colors.main}
          strokeWidth={1}
          lineDashPattern={[10, 10]}
          zIndex={14}
        />
      )}


      {routeSensors.map((sensor, idx) => {
        // Lấy màu sắc riêng cho từng sensor
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
            <View style={{ padding: 6 }}>
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1],
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 2,
                    right: 5,
                    bottom: 2,
                    borderWidth: 1.5,
                    borderColor: sensorColors.main,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 10, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                    elevation: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name="waves"
                    size={10}
                    color={sensorColors.main}
                    style={{ marginRight: 3 }}
                  />

                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: "#1F2937",
                      includeFontPadding: false,
                    }}
                  >
                    {sensor.waterLevel}cm
                  </Text>
                </View>
              </Animated.View>
            </View>
          </Marker>
        );
      })}
    </>
  );
}
