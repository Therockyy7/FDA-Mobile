// features/areas/components/WaterLevelAreaCard.tsx
// Compact, elegant area card with essential water level info
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { NotificationChannels } from "~/features/alerts/types/alert-settings.types";
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

// Status config
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Warning":
      return {
        color: "#EF4444",
        bg: "#FEE2E2",
        darkBg: "rgba(239,68,68,0.15)",
        label: "Cảnh báo",
        icon: "alert-circle" as const,
        gradient: ["#EF4444", "#DC2626"] as const,
      };
    case "Watch":
      return {
        color: "#F59E0B",
        bg: "#FEF3C7",
        darkBg: "rgba(245,158,11,0.15)",
        label: "Theo dõi",
        icon: "eye" as const,
        gradient: ["#F59E0B", "#D97706"] as const,
      };
    case "Unknown":
      return {
        color: "#6B7280",
        bg: "#F3F4F6",
        darkBg: "rgba(107,114,128,0.15)",
        label: "Chưa rõ",
        icon: "help-circle" as const,
        gradient: ["#6B7280", "#4B5563"] as const,
      };
    default:
      return {
        color: "#10B981",
        bg: "#D1FAE5",
        darkBg: "rgba(16,185,129,0.15)",
        label: "An toàn",
        icon: "checkmark-circle" as const,
        gradient: ["#10B981", "#059669"] as const,
      };
  }
};

const formatRadius = (m: number) =>
  m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;

const getWaterColor = (cm: number): string => {
  if (cm >= 40) return "#EF4444";
  if (cm >= 20) return "#F97316";
  if (cm >= 10) return "#EAB308";
  return "#22C55E";
};

const formatTime = (d?: string) => {
  if (!d) return "Mới tạo";
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 5) return "Vừa xong";
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  return `${Math.floor(h / 24)}d trước`;
};

export function WaterLevelAreaCard({
  area,
  status,
  onPress,
  onEdit,
  onDelete,
  onAlertSettings,
}: WaterLevelAreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const cfg = getStatusConfig(status?.status);

  const maxWater =
    status?.contributingStations?.reduce(
      (max, s) => (s.waterLevel > max ? s.waterLevel : max),
      0,
    ) || 0;
  const stationCount = status?.contributingStations?.length || 0;
  const waterColor = getWaterColor(maxWater);
  const waterPct = Math.min((maxWater / 50) * 100, 100);

  const c = {
    bg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E5E7EB",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    sub: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    muted: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    divider: isDarkColorScheme ? "#334155" : "#F3F4F6",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        backgroundColor: c.bg,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: status?.status === "Warning" ? `${cfg.color}60` : c.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        overflow: "hidden",
      }}
    >
      {/* ── Top Row: Name + Status ── */}
      <View style={{ padding: 16, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Name & Address */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: c.text,
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {area.name}
            </Text>
            {area.addressText ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <Ionicons name="location" size={11} color={c.sub} />
                <Text
                  style={{ fontSize: 11, color: c.sub, flex: 1 }}
                  numberOfLines={1}
                >
                  {area.addressText}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Right: Status Pill */}
          <View
            style={{
              backgroundColor: isDarkColorScheme ? cfg.darkBg : cfg.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderWidth: 1,
              borderColor: `${cfg.color}30`,
            }}
          >
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: cfg.color,
                letterSpacing: 0.3,
              }}
            >
              {cfg.label.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ── Water Level + Stats Compact Row ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 14,
            gap: 12,
          }}
        >
          {/* Water Level Circle — compact */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${waterColor}15`,
              borderWidth: 3,
              borderColor: waterColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {maxWater > 0 ? (
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: waterColor,
                    lineHeight: 22,
                    letterSpacing: -0.5,
                  }}
                >
                  {maxWater.toFixed(0)}
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: "800",
                    color: waterColor,
                    letterSpacing: 1,
                    opacity: 0.8,
                  }}
                >
                  CM
                </Text>
              </View>
            ) : (
              <Ionicons name="water-outline" size={22} color={c.sub} />
            )}
          </View>

          {/* Stats */}
          <View style={{ flex: 1, gap: 6 }}>
            {/* Progress bar */}
            {maxWater > 0 && (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{ fontSize: 10, fontWeight: "600", color: c.sub }}
                  >
                    Mực nước
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: waterColor,
                    }}
                  >
                    {maxWater.toFixed(1)} cm
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: isDarkColorScheme
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${waterPct}%`,
                      height: "100%",
                      backgroundColor: waterColor,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            )}

            {/* Mini stats row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="radius-outline"
                  size={13}
                  color="#007AFF"
                />
                <Text
                  style={{ fontSize: 11, fontWeight: "600", color: c.text }}
                >
                  {formatRadius(area.radiusMeters)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="analytics" size={13} color="#8B5CF6" />
                <Text
                  style={{ fontSize: 11, fontWeight: "600", color: c.text }}
                >
                  {stationCount} trạm
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#10B981",
                  }}
                />
                <Text
                  style={{ fontSize: 10, fontWeight: "500", color: c.sub }}
                >
                  {formatTime(status?.evaluatedAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ── Summary (if any) ── */}
      {status?.summary ? (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            backgroundColor: isDarkColorScheme
              ? `${cfg.color}12`
              : `${cfg.color}08`,
            borderRadius: 10,
            padding: 10,
            borderLeftWidth: 3,
            borderLeftColor: cfg.color,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: isDarkColorScheme ? c.text : "#374151",
              fontWeight: "500",
              lineHeight: 16,
            }}
            numberOfLines={2}
          >
            {status.summary}
          </Text>
        </View>
      ) : null}

      {/* ── Footer: Actions ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: c.divider,
          gap: 6,
        }}
      >
        {/* Alert settings */}
        {onAlertSettings && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onAlertSettings();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: isDarkColorScheme ? "#3A2F0A" : "#FFFBEB",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#F59E0B40",
            }}
          >
            <Ionicons name="notifications" size={14} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Edit */}
        {onEdit && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onEdit();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: isDarkColorScheme ? "#007AFF18" : "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "#007AFF40" : "#BFDBFE",
            }}
          >
            <Ionicons name="pencil" size={14} color="#007AFF" />
          </TouchableOpacity>
        )}

        {/* Delete */}
        {onDelete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: isDarkColorScheme ? "#EF444418" : "#FEF2F2",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDarkColorScheme ? "#EF444440" : "#FECACA",
            }}
          >
            <Ionicons name="trash" size={14} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Detail button */}
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <LinearGradient
            colors={cfg.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Ionicons name="eye" size={13} color="white" />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
              Chi tiết
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default WaterLevelAreaCard;
