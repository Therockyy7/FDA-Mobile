// features/map/components/areas/cards/AreaCard.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatTime } from "~/features/map/lib/formatters";
import { RADIUS } from "~/features/map/lib/map-ui-utils";
import {
  AREA_STATUS_COLORS,
  AREA_STATUS_ICONS,
  AREA_STATUS_LABELS,
  type AreaWithStatus,
} from "~/features/map/types/map-layers.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface AreaCardProps {
  area: AreaWithStatus;
  onClose: () => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function severityColor(status: string) {
  return (
    AREA_STATUS_COLORS[status as keyof typeof AREA_STATUS_COLORS] || "#9CA3AF"
  );
}
function severityLabel(status: string) {
  return (
    AREA_STATUS_LABELS[status as keyof typeof AREA_STATUS_LABELS] || "Không rõ"
  );
}
function severityIcon(status: string) {
  return (
    AREA_STATUS_ICONS[status as keyof typeof AREA_STATUS_ICONS] || "help-circle"
  );
}
function waterColor(level: number) {
  if (level >= 40) return "#EF4444";
  if (level >= 20) return "#F97316";
  if (level >= 10) return "#FBBF24";
  return "#10B981";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StationChip({
  code,
  level,
  color,
}: {
  code: string;
  level: number;
  color: string;
}) {
  return (
    <View style={styles.chip}>
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text style={styles.chipCode}>{code}</Text>
      <Text style={[styles.chipLevel, { color }]}>{level}cm</Text>
    </View>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export function AreaCard({
  area,
  onClose,
  onViewDetails,
  onEdit,
  onDelete,
}: AreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const color = severityColor(area.status);
  const label = severityLabel(area.status);
  const icon = severityIcon(area.status);

  const maxLevel =
    area.contributingStations?.reduce(
      (m, s) => (s.waterLevel > m ? s.waterLevel : m),
      0,
    ) ?? 0;
  const wc = waterColor(maxLevel);
  const fill = Math.min((maxLevel / 150) * 100, 100);

  const c = {
    bg: isDark ? "#0F172A" : "#FFFFFF",
    surface: isDark ? "#1E293B" : "#F8FAFC",
    text: isDark ? "#F1F5F9" : "#1E2937",
    muted: isDark ? "#64748B" : "#9CA3AF",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerMeta}>
            <Ionicons
              name={icon as any}
              size={12}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.headerStatus}>{label}</Text>
          </View>
          <Text style={styles.headerName} numberOfLines={1}>
            {area.name}
          </Text>
          {area.addressText && (
            <View style={styles.headerAddress}>
              <Ionicons
                name="location-outline"
                size={10}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.headerAddressText} numberOfLines={1}>
                {area.addressText}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Water level row */}
        {maxLevel > 0 && (
          <View
            style={[
              styles.waterRow,
              { backgroundColor: c.surface, borderColor: `${wc}40` },
            ]}
          >
            <View style={[styles.waterLeft, { backgroundColor: `${wc}14` }]}>
              <Ionicons name="water" size={14} color={wc} />
              <Text style={[styles.waterVal, { color: wc }]}>{maxLevel}</Text>
              <Text style={[styles.waterUnit, { color: `${wc}99` }]}>cm</Text>
            </View>
            <View style={styles.waterRight}>
              <Text style={[styles.progressPct, { color: wc }]}>
                {Math.round(fill)}%
              </Text>
              <View style={styles.progressRow}>
                <View
                  style={[styles.progressTrack, { backgroundColor: c.border }]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${fill}%`, backgroundColor: wc },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={[styles.metaItem, { backgroundColor: c.surface }]}>
            <MaterialCommunityIcons
              name="radius-outline"
              size={13}
              color={c.muted}
            />
            <Text style={[styles.metaVal, { color: c.text }]}>
              {area.radiusMeters >= 1000
                ? `${(area.radiusMeters / 1000).toFixed(1)}km`
                : `${area.radiusMeters}m`}
            </Text>
            <Text style={[styles.metaLabel, { color: c.muted }]}>Bán kính</Text>
          </View>
          <View style={[styles.metaItem, { backgroundColor: c.surface }]}>
            <Ionicons name="pulse" size={13} color={c.muted} />
            <Text style={[styles.metaVal, { color: c.text }]}>
              {area.contributingStations.length}
            </Text>
            <Text style={[styles.metaLabel, { color: c.muted }]}>Trạm</Text>
          </View>
          <View style={[styles.metaItem, { backgroundColor: c.surface }]}>
            <Ionicons name="time-outline" size={13} color={c.muted} />
            <Text style={[styles.metaVal, { color: c.text }]} numberOfLines={1}>
              {formatTime(area.evaluatedAt)}
            </Text>
            <Text style={[styles.metaLabel, { color: c.muted }]}>Cập nhật</Text>
          </View>
        </View>

        {/* Station chips */}
        {area.contributingStations.length > 0 && (
          <View style={styles.chipsSection}>
            <Text style={[styles.chipsLabel, { color: c.muted }]}>
              Trạm ảnh hưởng
            </Text>
            <View style={styles.chipsRow}>
              {area.contributingStations.slice(0, 4).map((s, i) => (
                <StationChip
                  key={i}
                  code={s.stationCode}
                  level={s.waterLevel}
                  color={waterColor(s.waterLevel)}
                />
              ))}
              {area.contributingStations.length > 4 && (
                <View style={[styles.chip, styles.chipMore]}>
                  <Ionicons name="add" size={10} color={c.muted} />
                  <Text style={[styles.chipCode, { color: c.muted }]}>
                    +{area.contributingStations.length - 4}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={[
                styles.actionBtn,
                styles.actionOutline,
                styles.actionSmall,
              ]}
              activeOpacity={0.75}
            >
              <Ionicons name="pencil" size={13} color="#3B82F6" />
              <Text style={styles.actionOutlineText}>Sửa</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={[
                styles.actionBtn,
                styles.actionOutline,
                styles.actionSmall,
              ]}
              activeOpacity={0.75}
            >
              <Ionicons name="trash" size={13} color="#EF4444" />
              <Text style={styles.actionOutlineText}>Xóa</Text>
            </TouchableOpacity>
          )}
          {onViewDetails && (
            <TouchableOpacity
              onPress={onViewDetails}
              style={[
                styles.actionBtn,
                { backgroundColor: color },
                styles.actionPrimary,
              ]}
              activeOpacity={0.75}
            >
              <Text style={styles.actionFillText}>Chi tiết</Text>
              <Ionicons name="chevron-forward" size={13} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: RADIUS.sheet, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  headerLeft: { flex: 1 },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
    marginBottom: 2,
  },
  headerAddress: { flexDirection: "row", alignItems: "center", gap: 3 },
  headerAddressText: { fontSize: 11, color: "rgba(255,255,255,0.7)", flex: 1 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: { padding: 12, gap: 8 },

  // Water row
  waterRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.chip,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  waterLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: "transparent",
  },
  waterVal: { fontSize: 26, fontWeight: "900", lineHeight: 30 },
  waterUnit: { fontSize: 13, fontWeight: "700" },
  waterRight: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  waterRightLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.6 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: {
    fontSize: 12,
    fontWeight: "800",
    minWidth: 32,
    textAlign: "right",
  },

  // Meta
  metaRow: { flexDirection: "row", gap: 6 },
  metaItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: RADIUS.chip,
    gap: 2,
  },
  metaVal: { fontSize: 14, fontWeight: "800" },
  metaLabel: { fontSize: 9, fontWeight: "600" },

  // Chips
  chipsSection: { gap: 6 },
  chipsLabel: { fontSize: 11, fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    gap: 4,
  },
  chipDot: { width: 5, height: 5, borderRadius: 3 },
  chipCode: { fontSize: 11, fontWeight: "700", color: "#1F2937" },
  chipLevel: { fontSize: 11, fontWeight: "600" },
  chipMore: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  // Actions
  actions: { flexDirection: "row", gap: 6, marginTop: 4 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: RADIUS.button,
    gap: 5,
  },
  actionOutline: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "transparent",
  },
  actionSmall: { paddingHorizontal: 10 },
  actionPrimary: { flex: 1 },
  actionOutlineText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  actionFillText: { fontSize: 13, fontWeight: "700", color: "white" },
});

export default React.memo(AreaCard, (p, n) => p.area?.id === n.area?.id);
