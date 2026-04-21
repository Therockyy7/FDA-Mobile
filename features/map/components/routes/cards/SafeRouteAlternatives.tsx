// features/map/components/routes/cards/SafeRouteAlternatives.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatDistance, formatDuration } from "~/features/map/lib/polyline-utils";
import type { DecodedRoute } from "~/features/map/types/safe-route.types";
import {
  SAFETY_STATUS_COLORS,
  SAFETY_STATUS_LABELS,
} from "~/features/map/types/safe-route.types";
import { CARD_SHADOW, RADIUS, STATUS_BADGE, useMapColors } from "~/features/map/lib/map-ui-utils";
import type { TransportMode } from "~/features/map/types/routing.types";

interface SafeRouteAlternativesProps {
  routes: DecodedRoute[];
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
  onExitRouting: () => void;
  /** Transport mode switcher — shown when routes are displayed */
  transportMode?: TransportMode;
  onModeChange?: (mode: TransportMode) => void;
  onFindRoute?: () => void;
  isLoading?: boolean;
}

export function SafeRouteAlternatives({
  routes,
  selectedIndex,
  onSelectRoute,
  onExitRouting,
  transportMode,
  onModeChange,
  onFindRoute,
  isLoading = false,
}: SafeRouteAlternativesProps) {
  // IMPORTANT: hooks must be called unconditionally (Rules of Hooks)
  const colors = useMapColors();

  if (routes.length <= 1) return null;

  const MODES: { mode: TransportMode; icon: React.ReactNode }[] = [
    { mode: "car", icon: <Ionicons name="car" size={15} color={transportMode === "car" ? "white" : colors.subtext} /> },
    { mode: "motorbike", icon: <MaterialCommunityIcons name="motorbike" size={15} color={transportMode === "motorbike" ? "white" : colors.subtext} /> },
    { mode: "bicycle", icon: <Ionicons name="bicycle" size={15} color={transportMode === "bicycle" ? "white" : colors.subtext} /> },
    { mode: "walk", icon: <Ionicons name="walk" size={15} color={transportMode === "walk" ? "white" : colors.subtext} /> },
  ];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Transport mode switcher */}
        {transportMode && onModeChange && (
          <View style={[styles.modeRow, { backgroundColor: colors.card }]}>
            <View style={[styles.modePills, { backgroundColor: colors.border }]}>
              {MODES.map(({ mode, icon }) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => {
                    onModeChange(mode);
                    // onModeChange is handleSwitchModeAndFind — it sets the mode AND re-searches
                  }}
                  disabled={isLoading}
                  activeOpacity={0.8}
                  style={[
                    styles.modePill,
                    transportMode === mode && styles.modePillActive,
                  ]}
                >
                  {icon}
                </TouchableOpacity>
              ))}
            </View>
            {isLoading && <ActivityIndicator size="small" color="#2563EB" style={{ marginLeft: 6 }} />}
          </View>
        )}
        {/* Exit */}
        <TouchableOpacity
          onPress={onExitRouting}
          activeOpacity={0.8}
          style={[styles.exitBtn, { backgroundColor: colors.border }]}
        >
          <Ionicons name="close" size={16} color={colors.subtext} />
        </TouchableOpacity>

        {routes.map((route, index) => {
          const isSelected = index === selectedIndex;
          const color = SAFETY_STATUS_COLORS[route.safetyStatus];
          const label = SAFETY_STATUS_LABELS[route.safetyStatus];

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectRoute(index)}
              activeOpacity={0.8}
              style={[
                CARD_SHADOW,
                styles.routeCard,
                {
                  backgroundColor: isSelected ? colors.card : colors.background,
                  borderColor: isSelected ? color : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {/* Label row */}
              <View style={styles.labelRow}>
                <View style={[styles.routeIndicator, { backgroundColor: color }]} />
                <Text style={[styles.routeLabel, { color: colors.text }]}>
                  {index === 0 ? "Tuyến chính" : `Tuyến ${index + 1}`}
                </Text>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="speedometer-outline" size={11} color={colors.muted} />
                  <Text style={[styles.statText, { color: colors.subtext }]}>
                    {formatDistance(route.distance)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="time-outline" size={11} color={colors.muted} />
                  <Text style={[styles.statText, { color: colors.subtext }]}>
                    {formatDuration(route.time)}
                  </Text>
                </View>
              </View>

              {/* Safety badge */}
              <View style={[styles.safetyBadge, { backgroundColor: `${color}18` }]}>
                <View style={[styles.safetyDot, { backgroundColor: color }]} />
                <Text style={[styles.safetyText, { color }]}>{label.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignSelf: "center",
    gap: 4,
  },
  modePills: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 3,
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modePillActive: {
    backgroundColor: "#2563EB",
  },
  exitBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  routeCard: {
    borderRadius: RADIUS.chip,
    padding: 10,
    minWidth: 130,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  routeIndicator: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 11,
  },
  safetyBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: STATUS_BADGE.borderRadius,
    paddingHorizontal: STATUS_BADGE.paddingHorizontal,
    paddingVertical: STATUS_BADGE.paddingVertical,
    alignSelf: "flex-start",
    gap: 4,
  },
  safetyDot: {
    width: STATUS_BADGE.dotSize,
    height: STATUS_BADGE.dotSize,
    borderRadius: 3,
  },
  safetyText: {
    fontSize: STATUS_BADGE.fontSize,
    fontWeight: STATUS_BADGE.fontWeight,
    letterSpacing: STATUS_BADGE.letterSpacing,
  },
});