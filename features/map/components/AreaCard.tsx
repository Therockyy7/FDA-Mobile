// features/map/components/AreaCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import {
  AREA_STATUS_COLORS,
  AREA_STATUS_ICONS,
  AREA_STATUS_LABELS,
  type AreaWithStatus,
} from "../types/map-layers.types";

interface AreaCardProps {
  area: AreaWithStatus;
  slideAnim: Animated.Value;
  onClose: () => void;
  onViewDetails?: () => void;
}

export function AreaCard({
  area,
  slideAnim,
  onClose,
  onViewDetails,
}: AreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  
  const statusColor = AREA_STATUS_COLORS[area.status] || AREA_STATUS_COLORS.Unknown;
  const statusLabel = AREA_STATUS_LABELS[area.status] || AREA_STATUS_LABELS.Unknown;
  const statusIcon = AREA_STATUS_ICONS[area.status] || AREA_STATUS_ICONS.Unknown;

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "Chưa cập nhật";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        transform: [{ translateY: slideAnim }],
        zIndex: 100,
      }}
    >
      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 20,
          overflow: "hidden",
          shadowColor: statusColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 12,
          maxHeight: 420,
        }}
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={[statusColor, `${statusColor}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 16 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              {/* Status Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.25)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                  alignSelf: "flex-start",
                  marginBottom: 8,
                  gap: 4,
                }}
              >
                <Ionicons name={statusIcon as any} size={14} color="white" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
                  {statusLabel}
                </Text>
              </View>

              {/* Area Name */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "white",
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {area.name}
              </Text>

              {/* Address */}
              {area.addressText && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="location" size={12} color="rgba(255,255,255,0.9)" />
                  <Text
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", flex: 1 }}
                    numberOfLines={1}
                  >
                    {area.addressText}
                  </Text>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={{ padding: 16 }}>
          {/* Summary */}
          {area.summary && (
            <View
              style={{
                backgroundColor: `${statusColor}15`,
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                borderLeftWidth: 3,
                borderLeftColor: statusColor,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.text,
                  lineHeight: 18,
                }}
              >
                {area.summary}
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {/* Radius */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.cardBg,
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="radius-outline"
                size={20}
                color={colors.subtext}
              />
              <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 4 }}>
                Bán kính
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                {area.radiusMeters >= 1000
                  ? `${(area.radiusMeters / 1000).toFixed(1)} km`
                  : `${area.radiusMeters} m`}
              </Text>
            </View>

            {/* Stations */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.cardBg,
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons
                name="broadcast"
                size={20}
                color={colors.subtext}
              />
              <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 4 }}>
                Trạm theo dõi
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                {area.contributingStations.length}
              </Text>
            </View>

            {/* Updated */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.cardBg,
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Ionicons name="time-outline" size={20} color={colors.subtext} />
              <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 4 }}>
                Cập nhật
              </Text>
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: colors.text }}
                numberOfLines={1}
              >
                {formatTime(area.evaluatedAt)}
              </Text>
            </View>
          </View>

          {/* Contributing Stations Preview */}
          {area.contributingStations.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.subtext,
                  marginBottom: 8,
                }}
              >
                Trạm ảnh hưởng:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {area.contributingStations.slice(0, 3).map((station, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.cardBg,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          station.severity === "critical"
                            ? "#EF4444"
                            : station.severity === "warning"
                            ? "#F97316"
                            : "#10B981",
                      }}
                    />
                    <Text style={{ fontSize: 11, color: colors.text, fontWeight: "600" }}>
                      {station.stationCode}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.subtext }}>
                      {station.waterLevel}cm
                    </Text>
                  </View>
                ))}
                {area.contributingStations.length > 3 && (
                  <View
                    style={{
                      backgroundColor: colors.cardBg,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.subtext }}>
                      +{area.contributingStations.length - 3}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* View Details Button */}
          {onViewDetails && (
            <TouchableOpacity
              onPress={onViewDetails}
              style={{
                backgroundColor: statusColor,
                paddingVertical: 12,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
                Xem chi tiết
              </Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
