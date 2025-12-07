// features/map/components/WaterFlowRoute.tsx (Premium Version)
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, ColorValue, View } from "react-native";
import { Marker, Polyline } from "react-native-maps";
import { Text } from "~/components/ui/text";
import { FloodRoute } from "../constants/map-data";
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
  const waveAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colors = getStatusColor(route.status);

  useEffect(() => {
    // Wave animation
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  // Dynamic water color based on depth
  const getGradientColors = (): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
  const depth = route.waterLevel;
  if (depth > 50)
    return ["#DC2626", "#EF4444"]; // Danger - Red gradient
  if (depth > 35)
    return ["#F59E0B", "#FBBF24"]; // Warning - Orange gradient
  return ["#3B82F6", "#60A5FA"]; // Safe - Blue gradient
};

  return (
    <>
      {/* Outer glow - creates depth */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor={`${colors.main}25`}
        strokeWidth={route.strokeWidth + 14}
        lineCap="round"
        lineJoin="round"
        zIndex={0}
      />

      {/* Shadow layer */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor="rgba(0, 0, 0, 0.2)"
        strokeWidth={route.strokeWidth + 5}
        lineCap="round"
        lineJoin="round"
        zIndex={1}
      />

      {/* Main water body */}
        <Polyline
            coordinates={route.coordinates}
            strokeColor={getGradientColors()[0] as string}
            strokeWidth={route.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tappable
            onPress={onPress}
            zIndex={2}
        />

      {/* Highlight shimmer */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor="rgba(255, 255, 255, 0.5)"
        strokeWidth={route.strokeWidth * 0.35}
        lineCap="round"
        lineJoin="round"
        zIndex={3}
      />

      {/* Flow pattern */}
      <Polyline
        coordinates={route.coordinates}
        strokeColor={`${colors.main}BB`}
        strokeWidth={route.strokeWidth * 0.5}
        lineCap="round"
        lineJoin="round"
        lineDashPattern={[28, 18]}
        zIndex={4}
      />

      {/* Selection ring */}
      {isSelected && (
        <>
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#3B82F6"
            strokeWidth={route.strokeWidth + 12}
            lineCap="round"
            lineJoin="round"
            lineDashPattern={[22, 12]}
            zIndex={-1}
          />
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#FFFFFF"
            strokeWidth={route.strokeWidth + 9}
            lineCap="round"
            lineJoin="round"
            lineDashPattern={[22, 12]}
            zIndex={-2}
          />
        </>
      )}

      {/* Premium water level markers */}
      {route.coordinates
        .filter((_, index) => index % 4 === 0)
        .map((coord, index) => (
          <Marker
            key={`marker-${route.id}-${index}`}
            coordinate={coord}
            anchor={{ x: 0.5, y: 1.1 }}
            tracksViewChanges={false}
            zIndex={100}
          >
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }, { translateY }],
              }}
            >
              <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 14,
                  shadowColor: colors.main,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 10,
                  borderWidth: 2.5,
                  borderColor: "white",
                  minWidth: 65,
                  alignItems: "center",
                }}
              >
                {/* Wave icon */}
                <MaterialCommunityIcons
                  name="waves"
                  size={12}
                  color="white"
                  style={{ marginBottom: 2, opacity: 0.9 }}
                />

                {/* Water level */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "900",
                      color: "white",
                      letterSpacing: -0.5,
                      textShadowColor: "rgba(0, 0, 0, 0.2)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {route.waterLevel}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "800",
                      color: "rgba(255,255,255,0.95)",
                      marginLeft: 2,
                    }}
                  >
                    cm
                  </Text>
                </View>
              </LinearGradient>

              {/* Pointer triangle */}
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 6,
                  borderRightWidth: 6,
                  borderTopWidth: 8,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: getGradientColors()[1],
                  alignSelf: "center",
                  marginTop: -1.5,
                }}
              />
            </Animated.View>
          </Marker>
        ))}
    </>
  );
}
