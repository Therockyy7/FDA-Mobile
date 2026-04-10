// features/map/components/routes/SafeRouteWarnings.tsx
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import type { FloodWarningDto } from "~/features/map/types/safe-route.types";
import { CARD_SHADOW, RADIUS, STATUS_BADGE, useMapColors } from "~/features/map/lib/map-ui-utils";

interface SafeRouteWarningsProps {
  warnings: FloodWarningDto[];
  visible: boolean;
  onClose: () => void;
}

function WarningItem({ warning }: { warning: FloodWarningDto }) {
  const colors = useMapColors();
  const isCritical = warning.severity === "critical";
  const accentColor = isCritical ? "#EF4444" : "#F97316";
  const bgColor = isCritical ? "#FEF2F2" : "#FFF7ED";
  const darkBgColor = "#1A2540";
  const isDark = colors.background === "#0F172A";
  const itemBg = isDark ? darkBgColor : bgColor;

  return (
    <View
      style={[
        CARD_SHADOW,
        styles.warningItem,
        {
          backgroundColor: itemBg,
          borderLeftColor: accentColor,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.itemHeader}>
        <View style={[styles.iconBadge, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={isCritical ? "alert-circle" : "warning"} size={14} color={accentColor} />
        </View>
        <Text style={[styles.stationName, { color: isDark ? "#F1F5F9" : "#1F2937" }]}>
          {warning.stationName}
        </Text>
        {/* Standard badge */}
        <View style={[styles.badge, { backgroundColor: `${accentColor}18` }]}>
          <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.badgeText, { color: accentColor }]}>
            {isCritical ? "NGUY HIỂM" : "CẢNH BÁO"}
          </Text>
        </View>
      </View>

      {/* Detail row */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Ionicons name="water" size={12} color={isDark ? "#64748B" : "#94A3B8"} />
          <Text style={[styles.detailLabel, { color: colors.muted }]}>Mực nước</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {warning.waterLevel} {warning.unit}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="navigate-outline" size={12} color={isDark ? "#64748B" : "#94A3B8"} />
          <Text style={[styles.detailLabel, { color: colors.muted }]}>Khoảng cách</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {Math.round(warning.distanceFromRoute)}m
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={12} color={isDark ? "#64748B" : "#94A3B8"} />
          <Text style={[styles.detailLabel, { color: colors.muted }]}>Mức độ</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {warning.severityLevel === 3 ? "Nghiêm trọng" : "Cảnh báo"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function SafeRouteWarnings({ warnings, visible, onClose }: SafeRouteWarningsProps) {
  const colors = useMapColors();
  const isDark = colors.background === "#0F172A";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Animated backdrop */}
      <Pressable
        style={[styles.backdrop, { backgroundColor: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)" }]}
        onPress={onClose}
      />

      {/* Sheet */}
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        {/* Handle */}
        <View style={styles.handleArea}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconBadge, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="warning" size={16} color="#D97706" />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Cảnh báo ngập
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                {warnings.length} vị trí dọc tuyến đường
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Warning list */}
        <ScrollView
          style={{ maxHeight: 420 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {warnings.map((w) => (
            <WarningItem key={w.stationId} warning={w} />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  handleArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 6,
  },
  handleBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  warningItem: {
    borderRadius: RADIUS.chip,
    padding: 14,
    borderLeftWidth: 4,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stationName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: STATUS_BADGE.borderRadius,
    paddingHorizontal: STATUS_BADGE.paddingHorizontal,
    paddingVertical: STATUS_BADGE.paddingVertical,
    gap: 4,
  },
  badgeDot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: STATUS_BADGE.fontSize,
    fontWeight: STATUS_BADGE.fontWeight,
    letterSpacing: STATUS_BADGE.letterSpacing,
  },
  detailRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
});