// features/map/components/FloodStationCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import {
    FloodSeverityFeature,
    SEVERITY_COLORS,
    SEVERITY_LABELS,
} from "../types/map-layers.types";

interface FloodStationCardProps {
  station: FloodSeverityFeature;
  slideAnim: Animated.Value;
  onClose: () => void;
  onViewDetails?: () => void;
}

export function FloodStationCard({
  station,
  slideAnim,
  onClose,
  onViewDetails,
}: FloodStationCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const { properties } = station;
  
  const severityColor = SEVERITY_COLORS[properties.severity] || SEVERITY_COLORS.unknown;
  const severityLabel = SEVERITY_LABELS[properties.severity] || SEVERITY_LABELS.unknown;

  const colors = {
    background: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#334155" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#475569" : "#E2E8F0",
  };

  // Get severity icon and gradient
  const getSeverityIcon = () => {
    switch (properties.severity) {
      case "critical":
        return { name: "alert-circle" as const, gradient: ["#EF4444", "#DC2626"] };
      case "warning":
        return { name: "alert" as const, gradient: ["#F97316", "#EA580C"] };
      case "caution":
        return { name: "information-circle" as const, gradient: ["#EAB308", "#CA8A04"] };
      default:
        return { name: "checkmark-circle" as const, gradient: ["#22C55E", "#16A34A"] };
    }
  };

  const severityConfig = getSeverityIcon();

  // Format last updated time
  const formatTime = (dateStr: string) => {
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
          shadowColor: severityColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        {/* Top gradient strip */}
        <View
          style={{
            height: 4,
            backgroundColor: severityColor,
          }}
        />

        <View style={{ padding: 16 }}>
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            {/* Station Info */}
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: `${severityColor}20`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <MaterialCommunityIcons name="water" size={24} color={severityColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {properties.stationName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.subtext }}>
                  {properties.stationCode}
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                backgroundColor: colors.cardBg,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {/* Water Level Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: `${severityColor}15`,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: `${severityColor}30`,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Ionicons name="water" size={14} color={severityColor} />
                <Text style={{ fontSize: 11, color: colors.subtext, marginLeft: 4 }}>
                  Mực nước
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    color: severityColor,
                  }}
                >
                  {typeof properties.waterLevel === 'number' 
                    ? properties.waterLevel.toFixed(2) 
                    : properties.waterLevel}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: severityColor,
                    marginLeft: 2,
                  }}
                >
                  {properties.unit}
                </Text>
              </View>
            </View>

            {/* Status Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.cardBg,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Ionicons name={severityConfig.name} size={14} color={colors.subtext} />
                <Text style={{ fontSize: 11, color: colors.subtext, marginLeft: 4 }}>
                  Trạng thái
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: `${severityColor}20`,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: severityColor,
                    marginRight: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: severityColor,
                  }}
                >
                  {severityLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Last Updated */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={14} color={colors.subtext} />
              <Text style={{ fontSize: 12, color: colors.subtext, marginLeft: 4 }}>
                Cập nhật: {formatTime(properties.lastUpdated)}
              </Text>
            </View>

            {/* View Details Button */}
            {onViewDetails && (
              <TouchableOpacity
                onPress={onViewDetails}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: severityColor,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>
                  Chi tiết
                </Text>
                <Ionicons name="chevron-forward" size={14} color="white" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
