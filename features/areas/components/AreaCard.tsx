// features/areas/components/AreaCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { calculateWaterPercentage, getStatusConfig, getStatusIcon } from "../lib/areas-utils";
import { Area } from "../types/areas-types";

interface AreaCardProps {
  area: Area;
  onPress: () => void;
  onMenuPress: () => void;
  onFavoriteToggle: () => void;
}

// Severity thresholds (matching flood severity)
const getSeverityFromWaterLevel = (waterLevel: number, maxLevel: number) => {
  const percentage = (waterLevel / maxLevel) * 100;
  if (percentage >= 80) return "critical";
  if (percentage >= 60) return "warning";
  if (percentage >= 40) return "caution";
  return "safe";
};

export function AreaCard({
  area,
  onPress,
  onMenuPress,
  onFavoriteToggle,
}: AreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const statusColors = getStatusConfig(area.status);
  const waterPercentage = calculateWaterPercentage(area.waterLevel, area.maxLevel);
  const severity = getSeverityFromWaterLevel(area.waterLevel, area.maxLevel);

  // Theme colors
  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBorder: isDarkColorScheme ? "#334155" : "#E5E7EB",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    mutedBg: isDarkColorScheme ? "#0F172A" : "#F9FAFB",
    divider: isDarkColorScheme ? "#334155" : "#F3F4F6",
  };

  // Severity-based icon background colors
  const getSeverityBg = () => {
    if (isDarkColorScheme) {
      switch (severity) {
        case "critical": return "rgba(239, 68, 68, 0.15)";
        case "warning": return "rgba(249, 115, 22, 0.15)";
        case "caution": return "rgba(234, 179, 8, 0.15)";
        default: return "rgba(34, 197, 94, 0.15)";
      }
    }
    return statusColors.bg;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1.5,
        borderColor: area.isFavorite ? statusColors.main : colors.cardBorder,
        shadowColor: statusColors.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: area.isFavorite ? 0.15 : 0.05,
        shadowRadius: 12,
        elevation: area.isFavorite ? 8 : 3,
        overflow: "hidden",
      }}
    >
      {/* Background Lottie for danger/warning status */}
      {(severity === "critical" || severity === "warning") && (
        <LottieView
          source={require("../../../assets/animations/water-rise.json")}
          autoPlay
          loop
          speed={0.3}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            right: -20,
            bottom: -20,
            opacity: 0.15,
          }}
        />
      )}

      {/* Header Section */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.3,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {area.name}
            </Text>
            <TouchableOpacity onPress={onFavoriteToggle} activeOpacity={0.7}>
              <Ionicons
                name={area.isFavorite ? "star" : "star-outline"}
                size={20}
                color={area.isFavorite ? "#F59E0B" : colors.subtext}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
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
              {area.location}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Status Badge */}
          <View
            style={{
              backgroundColor: getSeverityBg(),
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderWidth: 1,
              borderColor: `${statusColors.main}30`,
            }}
          >
            <Ionicons
              name={getStatusIcon(area.status)}
              size={12}
              color={statusColors.main}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: statusColors.main,
                letterSpacing: 0.3,
              }}
            >
              {area.statusText.toUpperCase()}
            </Text>
          </View>

          {/* Menu Button */}
          <TouchableOpacity
            onPress={onMenuPress}
            style={{
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: colors.mutedBg,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Level Display */}
      <View
        style={{
          backgroundColor: getSeverityBg(),
          padding: 14,
          borderRadius: 14,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: `${statusColors.main}20`,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: statusColors.main,
                letterSpacing: -1,
                lineHeight: 34,
              }}
            >
              {area.waterLevel}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: statusColors.text }}>
              cm
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 10, color: colors.subtext, fontWeight: "600" }}>
              Giới hạn
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.subtext }}>
              {area.maxLevel}cm
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: isDarkColorScheme ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)",
            borderRadius: 4,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
          }}
        >
          <LinearGradient
            colors={statusColors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: `${waterPercentage}%`,
              height: "100%",
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Weather Info Grid */}
      {(area.temperature || area.humidity || area.rainChance !== undefined) && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {area.temperature && (
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkColorScheme ? "rgba(251, 191, 36, 0.1)" : "#FEF3C7",
                padding: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(251, 191, 36, 0.2)" : "#FDE68A",
              }}
            >
              <Ionicons name="thermometer" size={18} color="#D97706" />
              <Text style={{ fontSize: 9, color: isDarkColorScheme ? "#FCD34D" : "#92400E", marginTop: 4, fontWeight: "600" }}>
                Nhiệt độ
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkColorScheme ? "#FBBF24" : "#B45309" }}>
                {area.temperature}°
              </Text>
            </View>
          )}

          {area.humidity && (
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkColorScheme ? "rgba(59, 130, 246, 0.1)" : "#DBEAFE",
                padding: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(59, 130, 246, 0.2)" : "#BFDBFE",
              }}
            >
              <Ionicons name="water" size={18} color="#3B82F6" />
              <Text style={{ fontSize: 9, color: isDarkColorScheme ? "#93C5FD" : "#1E40AF", marginTop: 4, fontWeight: "600" }}>
                Độ ẩm
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkColorScheme ? "#60A5FA" : "#1D4ED8" }}>
                {area.humidity}%
              </Text>
            </View>
          )}

          {area.rainChance !== undefined && (
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkColorScheme ? "rgba(99, 102, 241, 0.1)" : "#E0E7FF",
                padding: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDarkColorScheme ? "rgba(99, 102, 241, 0.2)" : "#C7D2FE",
              }}
            >
              <Ionicons name="rainy" size={18} color="#6366F1" />
              <Text style={{ fontSize: 9, color: isDarkColorScheme ? "#A5B4FC" : "#3730A3", marginTop: 4, fontWeight: "600" }}>
                Mưa
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkColorScheme ? "#818CF8" : "#4338CA" }}>
                {area.rainChance}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Forecast Section */}
      <View
        style={{
          backgroundColor: colors.mutedBg,
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.divider,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: colors.cardBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="partly-sunny" size={18} color={colors.subtext} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: colors.subtext, marginBottom: 2, fontWeight: "600" }}>
            DỰ BÁO
          </Text>
          <Text style={{ fontSize: 13, color: colors.text, fontWeight: "600" }} numberOfLines={1}>
            {area.forecast}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: statusColors.main,
            }}
          />
          <Text style={{ fontSize: 11, color: colors.subtext, fontWeight: "500" }}>
            Cập nhật {area.lastUpdate}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: getSeverityBg(),
            borderWidth: 1,
            borderColor: `${statusColors.main}30`,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="eye" size={14} color={statusColors.main} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: statusColors.main }}>
            Chi tiết
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
