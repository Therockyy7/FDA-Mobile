// features/map/components/routes/cards/SafeRouteResultCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatDistance, formatDuration } from "../../../lib/polyline-utils";
import type {
  DecodedRoute,
  FloodWarningDto,
  RouteMetadata,
} from "../../../types/safe-route.types";
import {
  SAFETY_STATUS_COLORS,
  SAFETY_STATUS_ICONS,
  SAFETY_STATUS_LABELS,
} from "../../../types/safe-route.types";
import { RouteStatBox } from "./RouteStatBox";
import { RouteRiskBar } from "./RouteRiskBar";
import { FloodZoneBanner } from "./FloodZoneBanner";

interface SafeRouteResultCardProps {
  route: DecodedRoute;
  floodWarnings: FloodWarningDto[];
  metadata: RouteMetadata | null;
  onClose: () => void;
  onShowWarnings: () => void;
  onStartNavigation?: () => void;
}

export function SafeRouteResultCard({
  route,
  floodWarnings,
  metadata,
  onClose,
  onShowWarnings,
  onStartNavigation,
}: SafeRouteResultCardProps) {
  const statusColor = SAFETY_STATUS_COLORS[route.safetyStatus];
  const statusLabel = SAFETY_STATUS_LABELS[route.safetyStatus];
  const statusIcon = SAFETY_STATUS_ICONS[route.safetyStatus] as any;

  const riskColor =
    route.floodRiskScore > 60
      ? "#EF4444"
      : route.floodRiskScore > 30
        ? "#F59E0B"
        : "#10B981";

  return (
    <View>
      <View
        style={{
          marginHorizontal: 12,
          backgroundColor: "white",
          borderRadius: 20,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* Header: Status + Close */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: statusColor + "20",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              gap: 6,
            }}
          >
            <Ionicons name={statusIcon} size={16} color={statusColor} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close-circle" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Route Info Grid */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <RouteStatBox icon="speedometer-outline" label="Khoảng cách" value={formatDistance(route.distance)} />
          <RouteStatBox icon="time-outline" label="Thời gian" value={formatDuration(route.time)} />
          <RouteStatBox icon="shield-outline" label="Rủi ro" value={`${route.floodRiskScore}/100`} valueColor={riskColor} />
        </View>

        <RouteRiskBar floodRiskScore={route.floodRiskScore} />

        {/* Flood Zone Banners */}
        {metadata && (metadata.startInFloodZone || metadata.endInFloodZone) && (
          <View style={{ gap: 6, marginBottom: 12 }}>
            {metadata.startInFloodZone && <FloodZoneBanner type="start" />}
            {metadata.endInFloodZone && <FloodZoneBanner type="end" />}
          </View>
        )}

        {/* Footer: Warnings + Metadata */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {floodWarnings.length > 0 ? (
            <TouchableOpacity
              onPress={onShowWarnings}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#FEF3C7",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Ionicons name="warning" size={14} color="#D97706" />
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#92400E" }}>
                {floodWarnings.length} cảnh báo ngập
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={{ fontSize: 12, fontWeight: "500", color: "#059669" }}>
                Không có cảnh báo
              </Text>
            </View>
          )}

          {metadata && (
            <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
              {metadata.totalFloodZones} vùng ngập gần đây
            </Text>
          )}
        </View>

        {/* Start Navigation Button */}
        {onStartNavigation && (
          <TouchableOpacity
            onPress={onStartNavigation}
            activeOpacity={0.85}
            style={{
              marginTop: 12,
              backgroundColor: "#2563EB",
              borderRadius: 999,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Ionicons name="navigate" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
              Bắt đầu dẫn đường
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
