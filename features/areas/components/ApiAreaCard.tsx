// features/areas/components/ApiAreaCard.tsx
// Premium area card with animated water level display
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertChannelsStatus } from "~/features/alerts/components/AlertChannelsStatus";
import type { NotificationChannels } from "~/features/alerts/types/alert-settings.types";
import type { Area, AreaStatusResponse } from "~/features/map/types/map-layers.types";
import { SHADOW } from "~/lib/design-tokens";
import { useColorScheme } from "~/lib/useColorScheme";

interface ApiAreaCardProps {
  area: Area;
  status?: AreaStatusResponse;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAlertSettings?: () => void;
  alertChannels?: NotificationChannels;
}

// Get status config based on AreaStatus — use flood-* tokens for colors
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Critical":
      return {
        main: "#EF4444",
        secondary: "#FCA5A5",
        bg: "#FEE2E2",
        gradient: ["#EF4444", "#DC2626"] as const,
        text: "Nguy hiểm",
        icon: "alert-circle" as const,
      };
    case "Warning":
      return {
        main: "#F97316",
        secondary: "#FDBA74",
        bg: "#FFF7ED",
        gradient: ["#F97316", "#EA580C"] as const,
        text: "Cảnh báo",
        icon: "warning" as const,
      };
    case "Caution":
      return {
        main: "#FBBF24",
        secondary: "#FDE68A",
        bg: "#FEF9C3",
        gradient: ["#FBBF24", "#F59E0B"] as const,
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
    default: // Safe
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

// Map severity color to background class for NativeWind
const getStatusBgClass = (colorCode: string) => {
  switch (colorCode) {
    case "#EF4444": return "bg-red-50 dark:bg-red-500/15";
    case "#F97316": return "bg-orange-50 dark:bg-orange-500/15";
    case "#FBBF24": return "bg-yellow-50 dark:bg-yellow-500/15";
    case "#6B7280": return "bg-gray-50 dark:bg-gray-500/15";
    default: return "bg-green-50 dark:bg-green-500/15";
  }
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
  onAlertSettings,
  alertChannels,
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
    if (["Warning", "Critical"].includes(status?.status ?? "")) {
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

  const channels: NotificationChannels = alertChannels || {
    push: true,
    email: false,
    sms: false,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      style={{
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        overflow: "hidden",
        ...SHADOW.lg,
      }}
      className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark"
      testID="api-area-card"
    >
      {/* Animated Background Lottie for Warning Status */}
      {["Warning", "Critical"].includes(status?.status ?? "") && (
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
          colors={statusConfig.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
          className="dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800"
        >
          {onAlertSettings && (
            <TouchableOpacity
              onPress={onAlertSettings}
              style={{
                position: "absolute",
                right: 16,
                top: 16,
                width: 34,
                height: 34,
                borderRadius: 12,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
                borderColor: "#F59E0B",
              }}
              className="bg-yellow-50 dark:bg-yellow-900/20"
              testID="api-area-card-alert-settings"
            >
              <Ionicons name="notifications" size={16} color="#F59E0B" />
            </TouchableOpacity>
          )}

          {/* Water Level Display - HERO */}
          <View style={{ alignItems: "center", marginBottom: 12 }} testID="api-area-card-hero">
            {maxWaterLevel > 0 ? (
              <View style={{ alignItems: "center" }}>
                {/* Circular Water Level Indicator */}
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: statusConfig.main,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="bg-cyan-100/15 dark:bg-cyan-500/15"
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
                  <View style={{ alignItems: "center", zIndex: 1 }} testID="api-area-card-water-value">
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
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    borderWidth: 1,
                    borderColor: `${statusConfig.main}30`,
                  }}
                  className={getStatusBgClass(statusConfig.main)}
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
              <View style={{ alignItems: "center", paddingVertical: 10 }} testID="api-area-card-no-data">
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                  }}
                  className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                >
                  <Ionicons name="water-outline" size={28} className="text-slate-400 dark:text-slate-500" />
                </View>
                <Text className="text-slate-500 dark:text-slate-400 mt-2" style={{ fontSize: 12 }}>
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
        <View style={{ marginBottom: 14 }} testID="api-area-card-name-location">
          <Text
            className="text-slate-900 dark:text-slate-100 font-extrabold text-center tracking-tight"
            style={{ fontSize: 18, marginBottom: 4 }}
            numberOfLines={1}
          >
            {area.name}
          </Text>
          {area.addressText && (
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
              <Ionicons name="location" size={12} className="text-slate-400 dark:text-slate-500" />
              <Text
                className="text-slate-500 dark:text-slate-400 text-center"
                style={{ fontSize: 12 }}
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
            borderRadius: 14,
            padding: 12,
            marginBottom: 14,
            borderWidth: 1,
          }}
          className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          testID="api-area-card-stats"
        >
          {/* Radius */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <MaterialCommunityIcons name="radius-outline" size={18} color="#007AFF" />
            <Text className="text-slate-400 dark:text-slate-500 font-semibold mt-0.5" style={{ fontSize: 11 }}>
              BÁN KÍNH
            </Text>
            <Text className="text-slate-900 dark:text-slate-100 font-extrabold" style={{ fontSize: 14 }}>
              {formatRadius(area.radiusMeters)}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, marginVertical: 4 }} className="bg-slate-300 dark:bg-slate-600" />

          {/* Severity */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="speedometer" size={18} color={statusConfig.main} />
            <Text className="text-slate-400 dark:text-slate-500 font-semibold mt-0.5" style={{ fontSize: 11 }}>
              MỨC ĐỘ
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: statusConfig.main }}>
              {status?.severityLevel ?? 0}/5
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, marginVertical: 4 }} className="bg-slate-300 dark:bg-slate-600" />

          {/* Stations */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="analytics" size={18} color="#8B5CF6" />
            <Text className="text-slate-400 dark:text-slate-500 font-semibold mt-0.5" style={{ fontSize: 11 }}>
              TRẠM ĐO
            </Text>
            <Text className="text-slate-900 dark:text-slate-100 font-extrabold" style={{ fontSize: 14 }}>
              {status?.contributingStations?.length ?? 0}
            </Text>
          </View>
        </View>

        {/* Summary */}
        {status?.summary && (
          <View
            style={{
              borderRadius: 12,
              padding: 12,
              marginBottom: 14,
              borderLeftWidth: 3,
              borderLeftColor: statusConfig.main,
            }}
            className={statusConfig.main === "#EF4444" ? "bg-red-50 dark:bg-red-500/10" : statusConfig.main === "#F97316" ? "bg-orange-50 dark:bg-orange-500/10" : statusConfig.main === "#FBBF24" ? "bg-yellow-50 dark:bg-yellow-500/10" : statusConfig.main === "#6B7280" ? "bg-gray-50 dark:bg-gray-500/10" : "bg-green-50 dark:bg-green-500/10"}
            testID="api-area-card-summary"
          >
            <Text
              className="text-slate-900 dark:text-slate-100 font-medium"
              style={{ fontSize: 12, lineHeight: 18 }}
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
          testID="api-area-card-footer"
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
            <Text className="text-slate-500 dark:text-slate-400 font-medium" style={{ fontSize: 11 }}>
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
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
                className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/40"
                testID="api-area-card-edit"
              >
                <Ionicons name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
                className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40"
                testID="api-area-card-delete"
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onPress} activeOpacity={0.8} testID="api-area-card-detail">
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
