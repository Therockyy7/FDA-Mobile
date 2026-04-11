// features/map/components/routes/cards/SafeRouteResultCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { formatDistance, formatDuration } from "~/features/map/lib/polyline-utils";
import { CARD_SHADOW, STATUS_BADGE, RADIUS } from "~/features/map/lib/map-ui-utils";
import type { DecodedRoute, FloodWarningDto, RouteMetadata } from "~/features/map/types/safe-route.types";
import {
  SAFETY_STATUS_COLORS,
  SAFETY_STATUS_ICONS,
  SAFETY_STATUS_LABELS,
} from "~/features/map/types/safe-route.types";
import { RouteRiskBar } from "./RouteRiskBar";
import { FloodZoneBanner } from "./FloodZoneBanner";

interface SafeRouteResultCardProps {
  route: DecodedRoute;
  floodWarnings: FloodWarningDto[];
  metadata: RouteMetadata | null;
  onClose: () => void;
  onShowWarnings: () => void;
  onStartNavigation?: () => void;
  isUsingGPSOrigin?: boolean;
  /** True when the current user is not logged in — shows a login hint banner */
  isGuest?: boolean;
}

export function SafeRouteResultCard({
  route,
  floodWarnings,
  metadata,
  onClose,
  onShowWarnings,
  onStartNavigation,
  isUsingGPSOrigin = false,
  isGuest = false,
}: SafeRouteResultCardProps) {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const statusColor = SAFETY_STATUS_COLORS[route.safetyStatus];
  const statusLabel = SAFETY_STATUS_LABELS[route.safetyStatus];
  const statusIcon = SAFETY_STATUS_ICONS[route.safetyStatus] as any;

  const riskColor =
    route.floodRiskScore > 60 ? "#EF4444"
    : route.floodRiskScore > 30 ? "#F59E0B"
    : "#10B981";

  const bg = isDark ? "rgba(30,41,59,0.95)" : "rgba(255,255,255,0.97)";
  const text = isDark ? "#F1F5F9" : "#1E293B";
  const muted = isDark ? "#64748B" : "#94A3B8";
  const border = isDark ? "#334155" : "#F1F5F9";

  return (
    <View style={[styles.card, CARD_SHADOW, { backgroundColor: bg, borderColor: border }]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Ionicons name={statusIcon} size={STATUS_BADGE.fontSize + 2} color={statusColor} />
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {statusLabel.toUpperCase()}
          </Text>
        </View>

        {/* Close */}
        <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
          <Ionicons name="close-circle" size={22} color={muted} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statItem, { backgroundColor: isDark ? "#334155" : "#F8FAFC" }]}>
          <Ionicons name="speedometer-outline" size={16} color={muted} />
          <Text style={[styles.statValue, { color: text }]}>{formatDistance(route.distance)}</Text>
          <Text style={[styles.statLabel, { color: muted }]}>Khoảng cách</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: isDark ? "#334155" : "#F8FAFC" }]}>
          <Ionicons name="time-outline" size={16} color={muted} />
          <Text style={[styles.statValue, { color: text }]}>{formatDuration(route.time)}</Text>
          <Text style={[styles.statLabel, { color: muted }]}>Thời gian</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: isDark ? "#334155" : "#F8FAFC" }]}>
          <Ionicons name="shield-outline" size={16} color={muted} />
          <Text style={[styles.statValue, { color: riskColor }]}>{route.floodRiskScore}</Text>
          <Text style={[styles.statLabel, { color: muted }]}>Rủi ro</Text>
        </View>
      </View>

      {/* Risk bar */}
      <RouteRiskBar floodRiskScore={route.floodRiskScore} />

      {/* Flood zone banners */}
      {metadata && (metadata.startInFloodZone || metadata.endInFloodZone) && (
        <View style={{ gap: 6, marginBottom: 10 }}>
          {metadata.startInFloodZone && <FloodZoneBanner type="start" />}
          {metadata.endInFloodZone && <FloodZoneBanner type="end" />}
        </View>
      )}

      {/* Footer: warnings + meta */}
      <View style={styles.footer}>
        {floodWarnings.length > 0 ? (
          <TouchableOpacity
            onPress={onShowWarnings}
            style={styles.warningPill}
            activeOpacity={0.8}
          >
            <Ionicons name="warning" size={13} color="#D97706" />
            <Text style={styles.warningText}>{floodWarnings.length} cảnh báo ngập</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.safePill}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.safeText}>Không có cảnh báo</Text>
          </View>
        )}

        {metadata && (
          <Text style={[styles.metaText, { color: muted }]}>
            {metadata.totalFloodZones} vùng ngập gần đây
          </Text>
        )}
      </View>

      {/* Guest login hint — only show to unauthenticated users with flood risk */}
      {isGuest && route.safetyStatus !== "Safe" && (
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in")}
          style={styles.loginHintPill}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-closed-outline" size={13} color="#1D4ED8" />
          <Text style={styles.loginHintText}>Đăng nhập để tự động tránh vùng ngập</Text>
        </TouchableOpacity>
      )}

      {/* Navigation button */}
      {onStartNavigation && isUsingGPSOrigin && (
        <TouchableOpacity
          onPress={onStartNavigation}
          activeOpacity={0.85}
          style={styles.navBtn}
        >
          <Ionicons name="navigate" size={17} color="white" />
          <Text style={styles.navBtnText}>Bắt đầu dẫn đường</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: STATUS_BADGE.borderRadius,
    paddingHorizontal: STATUS_BADGE.paddingHorizontal,
    paddingVertical: STATUS_BADGE.paddingVertical,
    gap: 5,
  },
  statusDot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: STATUS_BADGE.fontSize,
    fontWeight: STATUS_BADGE.fontWeight,
    letterSpacing: STATUS_BADGE.letterSpacing,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    padding: 10,
    borderRadius: RADIUS.chip,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  warningPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 5,
  },
  warningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  safePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  safeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  metaText: {
    fontSize: 11,
  },
  navBtn: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  navBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  loginHintPill: {
    marginTop: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loginHintText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "600",
  },
});