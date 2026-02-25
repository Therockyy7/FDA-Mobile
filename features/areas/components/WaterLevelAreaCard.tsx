// features/areas/components/WaterLevelAreaCard.tsx
// Premium water level focused area card with modern glassmorphism design
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertChannelsStatus } from "~/features/alerts/components/AlertChannelsStatus";
import { NotificationChannels } from "~/features/alerts/types/alert-settings.types";
import type {
  Area,
  AreaStatusResponse,
} from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface WaterLevelAreaCardProps {
  area: Area;
  status?: AreaStatusResponse;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAlertSettings?: () => void;
  alertChannels?: NotificationChannels;
}

// Get status config based on AreaStatus
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Warning":
      return {
        main: "#EF4444",
        secondary: "#FCA5A5",
        bg: "#FEE2E2",
        darkBg: "rgba(239, 68, 68, 0.15)",
        gradient: ["#EF4444", "#DC2626"] as const,
        waveGradient: ["#EF4444", "#B91C1C"] as const,
        text: "Cảnh báo",
        icon: "alert-circle" as const,
        pulseColor: "#EF4444",
      };
    case "Watch":
      return {
        main: "#F59E0B",
        secondary: "#FCD34D",
        bg: "#FEF3C7",
        darkBg: "rgba(245, 158, 11, 0.15)",
        gradient: ["#F59E0B", "#D97706"] as const,
        waveGradient: ["#FBBF24", "#D97706"] as const,
        text: "Theo dõi",
        icon: "eye" as const,
        pulseColor: "#F59E0B",
      };
    case "Unknown":
      return {
        main: "#6B7280",
        secondary: "#9CA3AF",
        bg: "#F3F4F6",
        darkBg: "rgba(107, 114, 128, 0.15)",
        gradient: ["#6B7280", "#4B5563"] as const,
        waveGradient: ["#9CA3AF", "#6B7280"] as const,
        text: "Không rõ",
        icon: "help-circle" as const,
        pulseColor: "#6B7280",
      };
    case "Normal":
    default:
      return {
        main: "#10B981",
        secondary: "#6EE7B7",
        bg: "#D1FAE5",
        darkBg: "rgba(16, 185, 129, 0.15)",
        gradient: ["#10B981", "#059669"] as const,
        waveGradient: ["#34D399", "#10B981"] as const,
        text: "An toàn",
        icon: "checkmark-circle" as const,
        pulseColor: "#10B981",
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

// Get water level percentage for progress bar
const getWaterLevelPercentage = (
  waterLevel: number,
  maxLevel = 100,
): number => {
  return Math.min((waterLevel / maxLevel) * 100, 100);
};

// Get progress bar color based on percentage
const getProgressColor = (percentage: number): readonly [string, string] => {
  if (percentage >= 80) return ["#EF4444", "#DC2626"] as const;
  if (percentage >= 60) return ["#F97316", "#EA580C"] as const;
  if (percentage >= 40) return ["#F59E0B", "#D97706"] as const;
  return ["#10B981", "#059669"] as const;
};

export function WaterLevelAreaCard({
  area,
  status,
  onPress,
  onEdit,
  onDelete,
  onAlertSettings,
  alertChannels,
}: WaterLevelAreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const statusConfig = getStatusConfig(status?.status);

  // Pulse animation for warnings
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Get max water level from contributing stations
  const maxWaterLevel =
    status?.contributingStations?.reduce((max, station) => {
      return station.waterLevel > max ? station.waterLevel : max;
    }, 0) || 0;

  const stationCount = status?.contributingStations?.length || 0;
  const waterLevelPercentage = getWaterLevelPercentage(maxWaterLevel);
  const progressColor = getProgressColor(waterLevelPercentage);

  // Pulse animation for warning status
  useEffect(() => {
    if (status?.status === "Warning" || status?.status === "Watch") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [status?.status, pulseAnim, waveAnim]);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBorder: isDarkColorScheme ? "#334155" : "#E5E7EB",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    mutedBg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    divider: isDarkColorScheme ? "#334155" : "#F3F4F6",
    waterBg: isDarkColorScheme
      ? "rgba(6, 182, 212, 0.12)"
      : "rgba(6, 182, 212, 0.08)",
    glassBg: isDarkColorScheme
      ? "rgba(30, 41, 59, 0.9)"
      : "rgba(255, 255, 255, 0.95)",
  };

  const channels: NotificationChannels = alertChannels || {
    push: true,
    email: false,
    sms: false,
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor:
            status?.status === "Warning"
              ? statusConfig.main
              : colors.cardBorder,
          shadowColor: statusConfig.main,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: status?.status === "Warning" ? 0.25 : 0.12,
          shadowRadius: 20,
          elevation: status?.status === "Warning" ? 10 : 6,
          overflow: "hidden",
        }}
      >
        {/* Water Level Hero Section */}
        <LinearGradient
          colors={
            isDarkColorScheme ? ["#0F172A", "#1E293B"] : ["#F0F9FF", "#E0F2FE"]
          }
          style={{
            paddingTop: 64,
            paddingHorizontal: 20,
            paddingBottom: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Wave Animation */}
          <LottieView
            source={require("../../../assets/animations/water-rise.json")}
            autoPlay
            loop
            speed={0.4}
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              right: -60,
              bottom: -60,
              opacity: 0.12,
            }}
          />

          {/* Top-right row: Status Badge + Alert Settings Button */}
          <View
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              left: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {/* Status Badge */}
            <View
              style={{
                backgroundColor: isDarkColorScheme
                  ? statusConfig.darkBg
                  : statusConfig.bg,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                borderWidth: 1,
                borderColor: `${statusConfig.main}40`,
              }}
            >
              <Ionicons
                name={statusConfig.icon}
                size={13}
                color={statusConfig.main}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: statusConfig.main,
                  letterSpacing: 0.3,
                }}
              >
                {statusConfig.text.toUpperCase()}
              </Text>
            </View>

            {/* Alert Settings Button */}
            {onAlertSettings && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  onAlertSettings();
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isDarkColorScheme ? "#3A2F0A" : "#FFFBEB",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#F59E0B",
                }}
              >
                <Ionicons name="notifications" size={15} color="#F59E0B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Water Level Display - Center */}
          <View style={{ alignItems: "center" }}>
            {maxWaterLevel > 0 ? (
              <>
                {/* Circular Water Level Indicator */}
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: isDarkColorScheme
                      ? `${statusConfig.main}20`
                      : `${statusConfig.main}15`,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: statusConfig.main,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Inner Wave Effect */}
                  <LottieView
                    source={require("../../../assets/animations/water-rise.json")}
                    autoPlay
                    loop
                    speed={0.6}
                    style={{
                      position: "absolute",
                      width: 160,
                      height: 160,
                      opacity: 0.25,
                    }}
                  />

                  {/* Water Level Value */}
                  <View style={{ alignItems: "center", zIndex: 1 }}>
                    <MaterialCommunityIcons
                      name="waves"
                      size={22}
                      color={statusConfig.main}
                      style={{ marginBottom: 2 }}
                    />
                    <Text
                      style={{
                        fontSize: 36,
                        fontWeight: "900",
                        color: statusConfig.main,
                        lineHeight: 40,
                        letterSpacing: -1,
                      }}
                    >
                      {maxWaterLevel.toFixed(1)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: statusConfig.main,
                        letterSpacing: 2,
                        opacity: 0.9,
                      }}
                    >
                      CM
                    </Text>
                  </View>
                </View>

                {/* Water Level Label */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: colors.subtext,
                    marginTop: 12,
                    letterSpacing: 1,
                  }}
                >
                  MỰC NƯỚC CAO NHẤT
                </Text>

                {/* Progress Bar */}
                <View
                  style={{
                    width: "100%",
                    height: 10,
                    backgroundColor: isDarkColorScheme
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.06)",
                    borderRadius: 5,
                    marginTop: 14,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: isDarkColorScheme
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  }}
                >
                  <LinearGradient
                    colors={progressColor}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${waterLevelPercentage}%`,
                      height: "100%",
                      borderRadius: 5,
                    }}
                  />
                </View>
              </>
            ) : (
              // No data state
              <View style={{ alignItems: "center", paddingVertical: 16 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.mutedBg,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: colors.divider,
                  }}
                >
                  <Ionicons
                    name="water-outline"
                    size={36}
                    color={colors.subtext}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.subtext,
                    marginTop: 12,
                    fontWeight: "600",
                  }}
                >
                  Chưa có dữ liệu mực nước
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Area Info Section */}
        <View style={{ padding: 18 }}>
          {/* Area Name & Location */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.3,
                marginBottom: 6,
              }}
              numberOfLines={1}
            >
              {area.name}
            </Text>
            {area.addressText && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Ionicons name="location" size={13} color={colors.subtext} />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.subtext,
                    flex: 1,
                    fontWeight: "500",
                  }}
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
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            {/* Radius */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <MaterialCommunityIcons
                name="radius-outline"
                size={20}
                color="#3B82F6"
              />
              <Text
                style={{
                  fontSize: 9,
                  color: colors.subtext,
                  marginTop: 4,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                BÁN KÍNH
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "800", color: colors.text }}
              >
                {formatRadius(area.radiusMeters)}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                backgroundColor: colors.divider,
                marginVertical: 4,
              }}
            />

            {/* Severity */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Ionicons
                name="speedometer"
                size={20}
                color={statusConfig.main}
              />
              <Text
                style={{
                  fontSize: 9,
                  color: colors.subtext,
                  marginTop: 4,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                MỨC ĐỘ
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: statusConfig.main,
                }}
              >
                {status?.severityLevel ?? 0}/5
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                backgroundColor: colors.divider,
                marginVertical: 4,
              }}
            />

            {/* Stations */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Ionicons name="analytics" size={20} color="#8B5CF6" />
              <Text
                style={{
                  fontSize: 9,
                  color: colors.subtext,
                  marginTop: 4,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                }}
              >
                TRẠM ĐO
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "800", color: colors.text }}
              >
                {stationCount}
              </Text>
            </View>
          </View>

          {/* Summary (if exists) */}
          {status?.summary && (
            <View
              style={{
                backgroundColor: isDarkColorScheme
                  ? `${statusConfig.main}12`
                  : `${statusConfig.main}08`,
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: statusConfig.main,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkColorScheme ? colors.text : "#374151",
                  fontWeight: "500",
                  lineHeight: 19,
                }}
                numberOfLines={2}
              >
                {status.summary}
              </Text>
            </View>
          )}

          {/* Alert channels */}
          <AlertChannelsStatus channels={channels} />

          {/* Footer */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Update time */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#10B981",
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subtext,
                  fontWeight: "500",
                }}
              >
                {formatRelativeTime(status?.evaluatedAt) || "Mới tạo"}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: isDarkColorScheme
                      ? "#3B82F620"
                      : "#EFF6FF",
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
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: isDarkColorScheme
                      ? "#EF444420"
                      : "#FEF2F2",
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
                    gap: 6,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <Ionicons name="eye" size={14} color="white" />
                  <Text
                    style={{ fontSize: 13, fontWeight: "700", color: "white" }}
                  >
                    Chi tiết
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default WaterLevelAreaCard;
