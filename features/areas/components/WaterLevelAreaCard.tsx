// features/areas/components/WaterLevelAreaCard.tsx
// Compact, elegant area card with essential water level info
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AlertChannelsStatus } from "~/features/alerts/components/AlertChannelsStatus";
import { SHADOW } from "~/lib/design-tokens";
import type { NotificationChannels } from "~/features/alerts/types/alert-settings.types";
import type {
  Area,
  AreaStatusResponse,
} from "~/features/map/types/map-layers.types";

interface WaterLevelAreaCardProps {
  area: Area;
  status?: AreaStatusResponse;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAlertSettings?: () => void;
  alertChannels?: NotificationChannels;
}

// Status config — use flood-* tokens for colors
const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Critical":
      return {
        color: "#EF4444",
        bg: "#FEE2E2",
        darkBg: "rgba(239,68,68,0.15)",
        label: "Nguy hiểm",
        icon: "alert-circle" as const,
        gradient: ["#EF4444", "#DC2626"] as const,
      };
    case "Warning":
      return {
        color: "#F97316",
        bg: "#FFF7ED",
        darkBg: "rgba(249,115,22,0.15)",
        label: "Cảnh báo",
        icon: "warning" as const,
        gradient: ["#F97316", "#EA580C"] as const,
      };
    case "Caution":
      return {
        color: "#FBBF24",
        bg: "#FEF9C3",
        darkBg: "rgba(251,191,36,0.15)",
        label: "Theo dõi",
        icon: "eye" as const,
        gradient: ["#FBBF24", "#F59E0B"] as const,
      };
    case "Unknown":
      return {
        color: "#6B7280",
        bg: "#F3F4F6",
        darkBg: "rgba(107,114,128,0.15)",
        label: "Không rõ",
        icon: "help-circle" as const,
        gradient: ["#6B7280", "#4B5563"] as const,
      };
    default: // Safe
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
  alertChannels,
}: WaterLevelAreaCardProps) {
  const cfg = getStatusConfig(status?.status);

  const maxWater =
    status?.contributingStations?.reduce(
      (max, s) => (s.waterLevel > max ? s.waterLevel : max),
      0,
    ) || 0;
  const stationCount = status?.contributingStations?.length || 0;
  const waterColor = getWaterColor(maxWater);
  const waterPct = Math.min((maxWater / 50) * 100, 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: ["Warning", "Critical"].includes(status?.status ?? "") ? `${cfg.color}60` : undefined,
        overflow: "hidden",
        ...SHADOW.md,
      }}
      className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark"
      testID="water-level-area-card"
    >
      {/* ── Top Row: Name + Status ── */}
      <View style={{ padding: 16, paddingBottom: 12 }} testID="water-level-area-card-header">
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
              className="text-slate-900 dark:text-slate-100 font-extrabold tracking-tight"
              style={{ fontSize: 16 }}
              numberOfLines={1}
              testID="water-level-area-card-name"
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
                <Ionicons name="location" size={11} className="text-slate-400 dark:text-slate-500" />
                <Text
                  className="text-slate-500 dark:text-slate-400 flex-1"
                  style={{ fontSize: 11 }}
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
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderWidth: 1,
              borderColor: `${cfg.color}30`,
            }}
            className="bg-slate-50 dark:bg-slate-800"
            testID="water-level-area-card-status"
          >
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text
              style={{ fontSize: 10, fontWeight: "700", color: cfg.color, letterSpacing: 0.3 }}
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
              borderWidth: 3,
              borderColor: waterColor,
              alignItems: "center",
              justifyContent: "center",
            }}
            className="bg-red-100/15 dark:bg-red-500/15"
            testID="water-level-area-card-water-circle"
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
              <Ionicons name="water-outline" size={22} className="text-slate-400 dark:text-slate-500" />
            )}
          </View>

          {/* Stats */}
          <View style={{ flex: 1, gap: 6 }}>
            {/* Progress bar */}
            {maxWater > 0 && (
              <View testID="water-level-area-card-progress">
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    className="text-slate-500 dark:text-slate-400 font-semibold"
                    style={{ fontSize: 11 }}
                  >
                    Mực nước
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
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
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                  className="bg-slate-200/60 dark:bg-slate-700"
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
              testID="water-level-area-card-mini-stats"
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
                  className="text-slate-900 dark:text-slate-100 font-semibold"
                  style={{ fontSize: 11 }}
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
                  className="text-slate-900 dark:text-slate-100 font-semibold"
                  style={{ fontSize: 11 }}
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
                  className="text-slate-500 dark:text-slate-400 font-medium"
                  style={{ fontSize: 10 }}
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
            borderRadius: 10,
            padding: 10,
            borderLeftWidth: 3,
            borderLeftColor: cfg.color,
          }}
          className={cfg.color === "#EF4444" ? "bg-red-50 dark:bg-red-500/10" : cfg.color === "#F97316" ? "bg-orange-50 dark:bg-orange-500/10" : cfg.color === "#FBBF24" ? "bg-yellow-50 dark:bg-yellow-500/10" : cfg.color === "#6B7280" ? "bg-gray-50 dark:bg-gray-500/10" : "bg-green-50 dark:bg-green-500/10"}
          testID="water-level-area-card-summary"
        >
          <Text
            className="text-slate-900 dark:text-slate-100 font-medium"
            style={{
              fontSize: 11,
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
          gap: 6,
        }}
        className="border-slate-200 dark:border-slate-700"
        testID="water-level-area-card-footer"
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
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
            }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/40"
            testID="water-level-area-card-alert-settings"
          >
            <Ionicons name="notifications" size={14} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Alert channels status */}
        {alertChannels && <AlertChannelsStatus channels={alertChannels} />}

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
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
            }}
            className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/40"
            testID="water-level-area-card-edit"
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
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
            }}
            className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40"
            testID="water-level-area-card-delete"
          >
            <Ionicons name="trash" size={14} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Detail button */}
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} testID="water-level-area-card-detail">
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
