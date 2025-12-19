// features/map/components/WaterFlowRoute.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, ColorValue, Linking, TouchableOpacity, View } from "react-native";
import { Callout, Marker, Polyline } from "react-native-maps";
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
  const router = useRouter();
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

  // Dynamic water color based on depth
  const getGradientColors = (): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    const depth = route.waterLevel;
    if (depth > 50) return ["#DC2626", "#EF4444"]; // Danger - Red
    if (depth > 35) return ["#F59E0B", "#FBBF24"]; // Warning - Orange
    return ["#3B82F6", "#60A5FA"]; // Safe - Blue
  };

  const getStatusText = () => {
    if (route.status === "safe") return "AN TOÀN";
    if (route.status === "warning") return "CẢNH BÁO";
    return "NGUY HIỂM";
  };

  const getDirectionText = () => {
    const directions = {
      north: "Bắc",
      south: "Nam",
      east: "Đông",
      west: "Tây",
    };
    return directions[route.direction];
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

      {/* Premium water level markers with Callout */}
      {route.coordinates
        .filter((_, index) => index % 4 === 0)
        .map((coord, index) => (
          <Marker
            key={`marker-${route.id}-${index}`}
            coordinate={coord}
            // anchor={{ x: 0.5, y: 1 }}
            // tracksViewChanges={false}
            // zIndex={100}
            
          >
            {/* Custom Marker View */}
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <View style={{ alignItems: "center" }}>
                {/* Main Badge */}
                <LinearGradient
                  colors={getGradientColors()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    // paddingHorizontal: 12,
                    // paddingVertical: 8,
                    borderRadius: 14,
                    shadowColor: colors.main,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 10,
                    borderWidth: 2,
                    borderColor: "white",
                    width:35,
                    height:30,
                    alignItems: "center",
                  }}
                >
                  {/* Wave icon */}
                  <MaterialCommunityIcons
                    name="waves"
                    size={9}
                    color="white"
                    style={{ marginTop:2, opacity: 0.9 }}
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
                        fontSize: 9,
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
                    borderTopColor: getGradientColors()[1] as string,
                    marginTop: -1.5,
                  }}
                />
              </View>
            </Animated.View>

            {/* Custom Callout */}
            <Callout tooltip>
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 14,
                  minWidth: 220,
                  maxWidth: 300,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {/* Header với Status Badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#1F2937",
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {route.name}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: colors.bg,
                      marginLeft: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        color: colors.main,
                      }}
                    >
                      {getStatusText()}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    marginBottom: 10,
                    lineHeight: 18,
                  }}
                  numberOfLines={2}
                >
                  {route.description}
                </Text>

                {/* Water Level Info Card */}
                <View
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="waves"
                        size={16}
                        color={colors.main}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#4B5563",
                          marginLeft: 6,
                          fontWeight: "500",
                        }}
                      >
                        Mực nước:
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: colors.main,
                      }}
                    >
                      {route.waterLevel}cm
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min((route.waterLevel / route.maxLevel) * 100, 100)}%`,
                        height: "100%",
                        backgroundColor: colors.main,
                        borderRadius: 3,
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                      }}
                    >
                      0cm
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                      }}
                    >
                      Max: {route.maxLevel}cm
                    </Text>
                  </View>
                </View>

                {/* Stats Grid */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {/* Flow Speed */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#EFF6FF",
                      padding: 8,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="speedometer" size={16} color="#3B82F6" />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#60A5FA",
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      Tốc độ
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#1E40AF",
                      }}
                    >
                      {route.flowSpeed}m/s
                    </Text>
                  </View>

                  {/* Direction */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#F0FDF4",
                      padding: 8,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="compass" size={16} color="#10B981" />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#34D399",
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      Hướng
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#047857",
                      }}
                    >
                      {getDirectionText()}
                    </Text>
                  </View>

                  {/* Length */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FEF3C7",
                      padding: 8,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="resize" size={16} color="#F59E0B" />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#FBBF24",
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      Chiều dài
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#D97706",
                      }}
                    >
                      {route.length}km
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  {/* Chỉ đường Google Maps */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#3B82F6",
                      borderRadius: 8,
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                    onPress={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${coord.latitude},${coord.longitude}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="navigate" size={16} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      Chỉ đường
                    </Text>
                  </TouchableOpacity>

                  {/* Xem chi tiết */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 8,
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                    onPress={() => {
                      router.push(`/area-detail/${route.id}` as any);
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={16}
                      color="#1F2937"
                    />
                    <Text
                      style={{
                        color: "#1F2937",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      Chi tiết
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
    </>
  );
}
