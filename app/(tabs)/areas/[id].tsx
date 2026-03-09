// app/(tabs)/areas/[id].tsx
// Premium Area Detail Screen with collapsible header and water level display
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { FloodHistorySection } from "~/features/areas/components/charts";
import { EditAreaSheet } from "~/features/areas/components/EditAreaSheet";
import { AreaService } from "~/features/areas/services/area.service";
import type {
  Area,
  AreaStatusResponse,
} from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

// Header dimensions
const HEADER_MAX_HEIGHT = 280;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format radius
const formatRadius = (meters: number) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters}m`;
};

// Format relative time
const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 5) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return formatDate(dateString);
};

// Get status config with gradient
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Warning":
      return {
        main: "#EF4444",
        bg: "#FEE2E2",
        gradient: ["#EF4444", "#DC2626"] as const,
        headerGradient: ["#EF4444", "#B91C1C", "#991B1B"] as const,
        text: "Cảnh báo",
        icon: "alert-circle" as const,
      };
    case "Watch":
      return {
        main: "#F59E0B",
        bg: "#FEF3C7",
        gradient: ["#F59E0B", "#D97706"] as const,
        headerGradient: ["#F59E0B", "#D97706", "#B45309"] as const,
        text: "Theo dõi",
        icon: "eye" as const,
      };
    case "Unknown":
      return {
        main: "#6B7280",
        bg: "#F3F4F6",
        gradient: ["#6B7280", "#4B5563"] as const,
        headerGradient: ["#6B7280", "#4B5563", "#374151"] as const,
        text: "Không rõ",
        icon: "help-circle" as const,
      };
    case "Normal":
    default:
      return {
        main: "#10B981",
        bg: "#D1FAE5",
        gradient: ["#10B981", "#059669"] as const,
        headerGradient: ["#10B981", "#059669", "#047857"] as const,
        text: "An toàn",
        icon: "checkmark-circle" as const,
      };
  }
};

export default function AreaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  // Scroll animation
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // State
  const [area, setArea] = useState<Area | null>(null);
  const [status, setStatus] = useState<AreaStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    mutedBg: isDarkColorScheme ? "#0F172A" : "#F1F5F9",
  };

  const statusConfig = getStatusConfig(status?.status);

  // Calculate max water level
  const maxWaterLevel =
    status?.contributingStations?.reduce((max, station) => {
      return station.waterLevel > max ? station.waterLevel : max;
    }, 0) || 0;

  // Header height animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  // Full water level fades out
  const waterLevelAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE * 0.5],
      [1, 0.7],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ scale }] };
  });

  // Collapsed info fades in
  const collapsedInfoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_SCROLL_DISTANCE * 0.4, HEADER_SCROLL_DISTANCE * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      const [areaData, statusData] = await Promise.all([
        AreaService.getAreaById(id),
        AreaService.getAreaStatus(id).catch(() => null),
      ]);

      setArea(areaData);
      setStatus(statusData);
    } catch (error) {
      console.error("Failed to fetch area:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin vùng", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(() => {
    if (!area) return;

    Alert.alert(
      "Xóa vùng theo dõi",
      `Bạn có chắc chắn muốn xóa "${area.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await AreaService.deleteArea(area.id);
              router.back();
            } catch (error: any) {
              Alert.alert("Lỗi", error?.message || "Không thể xóa vùng");
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [area, router]);

  const handleEditSubmit = useCallback(
    async (data: { name: string; addressText: string }) => {
      if (!area) return;

      setIsEditing(true);
      try {
        const updated = await AreaService.updateArea(area.id, {
          name: data.name,
          addressText: data.addressText,
        });
        setArea(updated);
        setEditingArea(null);
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể cập nhật vùng");
      } finally {
        setIsEditing(false);
      }
    },
    [area],
  );

  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;

  // Loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LottieView
          source={require("../../../assets/animations/water-rise.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
        <Text
          style={{
            color: colors.subtext,
            marginTop: 16,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (!area) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="location-outline" size={64} color={colors.subtext} />
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
          }}
        >
          Không tìm thấy vùng
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            backgroundColor: "#3B82F6",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Collapsible Header */}
      <Animated.View
        style={[
          {
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          },
          headerAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={statusConfig.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            paddingTop: statusBarHeight + 10,
            paddingHorizontal: 16,
          }}
        >
          {/* Background Lottie */}
          <LottieView
            source={require("../../../assets/animations/water-rise.json")}
            autoPlay
            loop
            speed={0.3}
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              right: -100,
              bottom: -100,
              opacity: 0.15,
            }}
          />

          {/* Top Bar - Always visible */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            {/* Collapsed Info - Shows on scroll */}
            <Animated.View
              style={[
                {
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 12,
                },
                collapsedInfoAnimatedStyle,
              ]}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <MaterialCommunityIcons name="waves" size={16} color="white" />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "white" }}
                numberOfLines={1}
              >
                {maxWaterLevel > 0 ? `${maxWaterLevel.toFixed(1)}m` : area.name}
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "700", color: "white" }}
                >
                  {statusConfig.text.toUpperCase()}
                </Text>
              </View>
            </Animated.View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to map with edit mode
                  router.push({
                    pathname: "/map",
                    params: {
                      editAreaId: area.id,
                      editLat: area.latitude.toString(),
                      editLng: area.longitude.toString(),
                      editRadius: area.radiusMeters.toString(),
                      editName: area.name,
                      editAddress: area.addressText || "",
                    },
                  });
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="pencil" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Water Level Display - Fades out on scroll */}
          <Animated.View
            style={[
              {
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: 20,
              },
              waterLevelAnimatedStyle,
            ]}
          >
            {/* Water Level Circle */}
            {maxWaterLevel > 0 ? (
              <View style={{ alignItems: "center", top: -20 }}>
                <View
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <LottieView
                    source={require("../../../assets/animations/water-rise.json")}
                    autoPlay
                    loop
                    speed={0.5}
                    style={{
                      position: "absolute",
                      width: 140,
                      height: 140,
                      opacity: 0.3,
                    }}
                  />
                  <MaterialCommunityIcons
                    name="waves"
                    size={20}
                    color="rgba(255,255,255,0.9)"
                    style={{ marginBottom: 2 }}
                  />
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "900",
                      color: "white",
                      lineHeight: 36,
                    }}
                  >
                    {maxWaterLevel.toFixed(1)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "rgba(255,255,255,0.8)",
                      letterSpacing: 1,
                    }}
                  >
                    CM
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 10,
                  }}
                >
                  MỰC NƯỚC CAO NHẤT
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="location" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: "white",
                      }}
                    >
                      {area.name}
                    </Text>
                    {area.addressText && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.8)",
                        }}
                        numberOfLines={1}
                      >
                        {area.addressText}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Status Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                top: -20,
              }}
            >
              <Ionicons name={statusConfig.icon} size={14} color="white" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
                {statusConfig.text}
              </Text>
              {status?.severityLevel !== undefined && (
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                  • Mức {status.severityLevel}/5
                </Text>
              )}
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT,
          paddingHorizontal: 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
      >
        {/* Area Name Card (when water level exists) */}
        {maxWaterLevel > 0 && (
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: 18,
              padding: 16,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${statusConfig.main}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="location" size={22} color={statusConfig.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: colors.text }}
              >
                {area.name}
              </Text>
              {area.addressText && (
                <Text
                  style={{ fontSize: 12, color: colors.subtext }}
                  numberOfLines={1}
                >
                  {area.addressText}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Summary Card */}
        {status?.summary && (
          <View
            style={{
              backgroundColor: isDarkColorScheme
                ? `${statusConfig.main}15`
                : statusConfig.bg,
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
              borderLeftWidth: 4,
              borderLeftColor: statusConfig.main,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="information-circle"
                size={18}
                color={statusConfig.main}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: statusConfig.main,
                }}
              >
                Tình trạng hiện tại
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: isDarkColorScheme ? colors.text : "#374151",
                lineHeight: 20,
              }}
            >
              {status.summary}
            </Text>
            <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 8 }}>
              Cập nhật {formatRelativeTime(status.evaluatedAt)}
            </Text>
          </View>
        )}

        {/* Info Grid */}
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: 18,
            padding: 16,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 14,
            }}
          >
            Thông tin vùng
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <View
              style={{
                width: "48%",
                backgroundColor: colors.mutedBg,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <MaterialCommunityIcons
                name="radius-outline"
                size={20}
                color="#3B82F6"
              />
              <Text
                style={{ fontSize: 10, color: colors.subtext, marginTop: 6 }}
              >
                BÁN KÍNH
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: colors.text }}
              >
                {formatRadius(area.radiusMeters)}
              </Text>
            </View>
            <View
              style={{
                width: "48%",
                backgroundColor: colors.mutedBg,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <Ionicons name="navigate" size={20} color="#8B5CF6" />
              <Text
                style={{ fontSize: 10, color: colors.subtext, marginTop: 6 }}
              >
                TỌA ĐỘ
              </Text>
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: colors.text }}
              >
                {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
              </Text>
            </View>
            <View
              style={{
                width: "48%",
                backgroundColor: colors.mutedBg,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <Ionicons name="calendar" size={20} color="#10B981" />
              <Text
                style={{ fontSize: 10, color: colors.subtext, marginTop: 6 }}
              >
                NGÀY TẠO
              </Text>
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: colors.text }}
              >
                {formatDate(area.createdAt)}
              </Text>
            </View>
            <View
              style={{
                width: "48%",
                backgroundColor: colors.mutedBg,
                borderRadius: 12,
                padding: 14,
              }}
            >
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text
                style={{ fontSize: 10, color: colors.subtext, marginTop: 6 }}
              >
                CẬP NHẬT
              </Text>
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: colors.text }}
              >
                {formatDate(area.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contributing Stations */}
        {status?.contributingStations &&
          status.contributingStations.length > 0 && (
            <View
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Ionicons name="analytics" size={18} color="#3B82F6" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Trạm quan trắc ({status.contributingStations.length})
                </Text>
              </View>

              {status.contributingStations.map((station, index) => {
                const cfg = getStatusConfig(station.severity);
                return (
                  <View
                    key={station.stationCode}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      borderTopWidth: index > 0 ? 1 : 0,
                      borderTopColor: colors.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <LinearGradient
                        colors={cfg.gradient}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="water" size={18} color="white" />
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: colors.text,
                          }}
                        >
                          {station.stationCode}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.subtext }}>
                          Cách {station.distance}m
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "900",
                          color: cfg.main,
                        }}
                      >
                        {station.waterLevel}m
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "700",
                          color: cfg.main,
                        }}
                      >
                        {cfg.text.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

        {/* Flood History Charts Section */}
        <FloodHistorySection
          areaId={id}
          stationIds={
            status?.contributingStations
              ?.map((s) => s.stationId)
              .filter(Boolean) as string[] | undefined
          }
          isDark={isDarkColorScheme}
        />

        {/* View on Map Button */}
        <TouchableOpacity
          onPress={() => router.push("/map")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Ionicons name="map" size={20} color="white" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "white" }}>
              Xem trên bản đồ
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Edit Modal */}
      <EditAreaSheet
        visible={!!editingArea}
        area={editingArea}
        onClose={() => setEditingArea(null)}
        onSubmit={handleEditSubmit}
        isLoading={isEditing}
      />
    </View>
  );
}
