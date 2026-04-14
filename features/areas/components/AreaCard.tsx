// features/areas/components/AreaCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
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
  const statusColors = getStatusConfig(area.status);
  const waterPercentage = calculateWaterPercentage(area.waterLevel, area.maxLevel);
  const severity = getSeverityFromWaterLevel(area.waterLevel, area.maxLevel);

  // Severity-based icon background colors — use dark: prefix for dark mode
  const getSeverityBg = () => {
    switch (severity) {
      case "critical":
        return "bg-red-100 dark:bg-red-500/15";
      case "warning":
        return "bg-orange-100 dark:bg-orange-500/15";
      case "caution":
        return "bg-yellow-100 dark:bg-yellow-500/15";
      default:
        return "bg-green-100 dark:bg-green-500/15";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1.5,
        borderColor: area.isFavorite ? statusColors.main : "transparent",
        overflow: "hidden",
        ...SHADOW.md,
      }}
      className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark"
      testID="area-card"
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
        testID="area-card-header"
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
              className="text-slate-900 dark:text-slate-100 font-extrabold tracking-tight flex-1"
              style={{
                fontSize: 18,
              }}
              numberOfLines={1}
              testID="area-card-name"
            >
              {area.name}
            </Text>
            <TouchableOpacity onPress={onFavoriteToggle} activeOpacity={0.7}>
              <Ionicons
                name={area.isFavorite ? "star" : "star-outline"}
                size={20}
                color={area.isFavorite ? "#F59E0B" : "#94A3B8"}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="location" size={13} color="#94A3B8" />
            <Text
              className="text-slate-500 dark:text-slate-400 flex-1 font-medium"
              style={{
                fontSize: 12,
              }}
              numberOfLines={1}
              testID="area-card-location"
            >
              {area.location}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Status Badge */}
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderWidth: 1,
              borderColor: `${statusColors.main}30`,
            }}
            className={getSeverityBg()}
            testID="area-card-status"
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
              borderWidth: 1,
            }}
            className="bg-slate-50 dark:bg-slate-900 border-border-light dark:border-border-dark"
            activeOpacity={0.7}
            testID="area-card-menu"
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Level Display */}
      <View
        style={{
          padding: 14,
          borderRadius: 14,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: `${statusColors.main}20`,
        }}
        className={getSeverityBg()}
        testID="area-card-water-level"
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
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              Giới hạn
            </Text>
            <Text className="text-slate-600 dark:text-slate-400 font-bold text-sm">
              {area.maxLevel}cm
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 8,
            borderRadius: 4,
            overflow: "hidden",
            borderWidth: 1,
          }}
          className="bg-white/60 dark:bg-white/10 border-white/5 dark:border-white/5"
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
                padding: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
              }}
              className="bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30"
            >
              <Ionicons name="thermometer" size={18} color="#D97706" />
              <Text className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold mt-1">
                Nhiệt độ
              </Text>
              <Text className="text-base font-extrabold text-yellow-800 dark:text-yellow-300">
                {area.temperature}°
              </Text>
            </View>
          )}

          {area.humidity && (
            <View
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
              }}
              className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"
            >
              <Ionicons name="water" size={18} color="#007AFF" />
              <Text className="text-xs text-blue-700 dark:text-blue-400 font-semibold mt-1">
                Độ ẩm
              </Text>
              <Text className="text-base font-extrabold text-blue-800 dark:text-blue-300">
                {area.humidity}%
              </Text>
            </View>
          )}

          {area.rainChance !== undefined && (
            <View
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
              }}
              className="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30"
            >
              <Ionicons name="rainy" size={18} color="#6366F1" />
              <Text className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold mt-1">
                Mưa
              </Text>
              <Text className="text-base font-extrabold text-indigo-800 dark:text-indigo-300">
                {area.rainChance}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Forecast Section */}
      <View
        style={{
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
        className="bg-slate-50 dark:bg-slate-900 border-border-light dark:border-border-dark"
        testID="area-card-forecast"
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
          className="bg-white dark:bg-slate-800"
        >
          <Ionicons name="partly-sunny" size={18} color="#64748B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            DỰ BÁO
          </Text>
          <Text className="text-sm text-slate-900 dark:text-slate-100 font-semibold" numberOfLines={1}>
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
        }}
        className="border-border-light dark:border-border-dark"
        testID="area-card-footer"
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
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
            borderWidth: 1,
            borderColor: `${statusColors.main}30`,
          }}
          className={getSeverityBg()}
          activeOpacity={0.7}
          testID="area-card-detail-button"
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
