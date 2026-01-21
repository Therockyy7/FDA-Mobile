// features/areas/components/ApiAreaCard.tsx
// Premium area card with animated water level display
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { Area, AreaStatusResponse } from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface ApiAreaCardProps {
  area: Area;
  status?: AreaStatusResponse;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Get status config based on AreaStatus
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Warning":
      return {
        main: "#EF4444",
        secondary: "#FCA5A5",
        bg: "#FEE2E2",
        gradient: ["#EF4444", "#DC2626"] as const,
        text: "Cảnh báo",
        icon: "alert-circle" as const,
      };
    case "Watch":
      return {
        main: "#F59E0B",
        secondary: "#FCD34D",
        bg: "#FEF3C7",
        gradient: ["#F59E0B", "#D97706"] as const,
        text: "Theo dõi",
        icon: "eye" as const,
      };
    case "Unknown":
      return {
        main: "#6B7280",
        secondary: "#9CA3AF",
        bg: "#F3F4F6",
        gradient: ["#6B7280", "#4B5563"] as const,
        text: "Không rõ",
        icon: "help-circle" as const,
      };
    case "Normal":
    default:
      return {
        main: "#10B981",
        secondary: "#6EE7B7",
        bg: "#D1FAE5",
        gradient: ["#10B981", "#059669"] as const,
        text: "An toàn",
        icon: "checkmark-circle" as const,
      };
  }
};

// Format radius
const formatRadius = (meters: number) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
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
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

export function ApiAreaCard({
  area,
  status,
  onPress,
  onEdit,
  onDelete,
}: ApiAreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const statusConfig = getStatusConfig(status?.status);
  
  // Pulse animation for warnings
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get max water level from contributing stations
  const maxWaterLevel = status?.contributingStations?.reduce((max, station) => {
    return station.waterLevel > max ? station.waterLevel : max;
  }, 0) || 0;

  // Pulse animation for warning status
  useEffect(() => {
    if (status?.status === "Warning") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status?.status, pulseAnim]);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBorder: isDarkColorScheme ? "#334155" : "#E5E7EB",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    mutedBg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    divider: isDarkColorScheme ? "#334155" : "#F3F4F6",
    waterBg: isDarkColorScheme ? "rgba(6, 182, 212, 0.15)" : "rgba(6, 182, 212, 0.1)",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        shadowColor: statusConfig.main,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        overflow: "hidden",
      }}
    >
      {/* Animated Background Lottie for Warning Status */}
      {status?.status === "Warning" && (
        <LottieView
          source={require("../../../assets/animations/water-rise.json")}
          autoPlay
          loop
          speed={0.4}
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            right: -50,
            top: -30,
            opacity: 0.1,
          }}
        />
      )}

      {/* Top Section: Water Level Hero */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <LinearGradient
          colors={isDarkColorScheme 
            ? ["#0F172A", "#1E293B"] 
            : ["#F0F9FF", "#E0F2FE"]}
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 16,
            
          }}
        >
          {/* Water Level Display - HERO */}
          <View style={{ alignItems: "center", marginBottom: 12
           }}>
            {maxWaterLevel > 0 ? (
              <View
                style={{
                  alignItems: "center",
                }}
              >
                {/* Circular Water Level Indicator */}
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: colors.waterBg,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: statusConfig.main,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Animated Wave Effect */}
                  <LottieView
                    source={require("../../../assets/animations/water-rise.json")}
                    autoPlay
                    loop
                    speed={0.5}
                    style={{
                      position: "absolute",
                      width: 120,
                      height: 120,
                      opacity: 0.3,
                    }}
                  />
                  
                  {/* Water Level Value */}
                  <View style={{ alignItems: "center", zIndex: 1 }}>
                    <MaterialCommunityIcons 
                      name="waves" 
                      size={20} 
                      color={statusConfig.main}
                      style={{ marginBottom: 2 }}
                    />
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: "900",
                        color: statusConfig.main,
                        lineHeight: 30,
                      }}
                    >
                      {maxWaterLevel.toFixed(1)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: statusConfig.main,
                        letterSpacing: 1,
                      }}
                    >
                      CM
                    </Text>
                  </View>
                </View>

                {/* Status Label Below */}
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: isDarkColorScheme 
                      ? `${statusConfig.main}25` 
                      : statusConfig.bg,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    borderWidth: 1,
                    borderColor: `${statusConfig.main}30`,
                  }}
                >
                  <Ionicons name={statusConfig.icon} size={14} color={statusConfig.main} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: statusConfig.main,
                    }}
                  >
                    {statusConfig.text}
                  </Text>
                </View>
              </View>
            ) : (
              // No water level data
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: colors.mutedBg,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: colors.divider,
                  }}
                >
                  <Ionicons name="water-outline" size={28} color={colors.subtext} />
                </View>
                <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 8 }}>
                  Chưa có dữ liệu
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content Section */}
      <View style={{ padding: 18, paddingTop: 14 }}>
        {/* Area Name & Location */}
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.3,
              marginBottom: 4,
              textAlign: "center",
            }}
            numberOfLines={1}
          >
            {area.name}
          </Text>
          {area.addressText && (
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
              <Ionicons name="location" size={12} color={colors.subtext} />
              <Text
                style={{ fontSize: 12, color: colors.subtext, textAlign: "center" }}
                numberOfLines={1}
              >
                {area.addressText}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.mutedBg,
            borderRadius: 14,
            padding: 12,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: colors.divider,
          }}
        >
          {/* Radius */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <MaterialCommunityIcons name="radius-outline" size={18} color="#3B82F6" />
            <Text style={{ fontSize: 9, color: colors.subtext, marginTop: 3, fontWeight: "600" }}>
              BÁN KÍNH
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>
              {formatRadius(area.radiusMeters)}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: colors.divider, marginVertical: 4 }} />

          {/* Severity */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="speedometer" size={18} color={statusConfig.main} />
            <Text style={{ fontSize: 9, color: colors.subtext, marginTop: 3, fontWeight: "600" }}>
              MỨC ĐỘ
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: statusConfig.main }}>
              {status?.severityLevel ?? 0}/5
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: colors.divider, marginVertical: 4 }} />

          {/* Stations */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="analytics" size={18} color="#8B5CF6" />
            <Text style={{ fontSize: 9, color: colors.subtext, marginTop: 3, fontWeight: "600" }}>
              TRẠM ĐO
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text }}>
              {status?.contributingStations?.length ?? 0}
            </Text>
          </View>
        </View>

        {/* Summary */}
        {status?.summary && (
          <View
            style={{
              backgroundColor: isDarkColorScheme 
                ? `${statusConfig.main}15` 
                : `${statusConfig.main}10`,
              borderRadius: 12,
              padding: 12,
              marginBottom: 14,
              borderLeftWidth: 3,
              borderLeftColor: statusConfig.main,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: isDarkColorScheme ? colors.text : "#374151",
                fontWeight: "500",
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {status.summary}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Update time */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#10B981",
              }}
            />
            <Text style={{ fontSize: 11, color: colors.subtext, fontWeight: "500" }}>
              {formatRelativeTime(status?.evaluatedAt)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: isDarkColorScheme ? "#3B82F620" : "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: isDarkColorScheme ? "#3B82F640" : "#BFDBFE",
                }}
              >
                <Ionicons name="pencil" size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: isDarkColorScheme ? "#EF444420" : "#FEF2F2",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: isDarkColorScheme ? "#EF444440" : "#FECACA",
                }}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              <LinearGradient
                colors={statusConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <Ionicons name="chevron-forward" size={14} color="white" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
                  Chi tiết
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default ApiAreaCard;
