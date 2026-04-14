// features/map/components/overlays/navigation/ETABar.tsx
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { formatDistance, formatDuration } from "~/features/map/lib/polyline-utils";
import { formatETA } from "~/features/map/lib/navigation-utils";
import { SHADOW, FLOOD_COLORS, RADIUS } from "~/lib/design-tokens";

interface ETABarProps {
  remainingDistance: number;
  remainingTime: number;
  insetsBottom: number;
  onExit: () => void;
}

export function ETABar({ remainingDistance, remainingTime, insetsBottom, onExit }: ETABarProps) {
  const { isDarkColorScheme } = useColorScheme();

  const bg = isDarkColorScheme ? "rgba(30,41,59,0.94)" : "rgba(255,255,255,0.94)";
  const text = isDarkColorScheme ? "#F1F5F9" : "#1E293B";
  const muted = isDarkColorScheme ? "#64748B" : "#94A3B8";
  const divider = isDarkColorScheme ? "#334155" : "#E2E8F0";
  const border = isDarkColorScheme ? "#334155" : "#F1F5F9";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 40 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={[styles.container, { paddingBottom: insetsBottom + 10 }]}
      testID="map-nav-eta-bar"
    >
      <View style={[SHADOW.md, styles.bar, { backgroundColor: bg, borderColor: border }]}>
        {/* ETA */}
        <View style={styles.stat}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="time-outline" size={14} color={muted} />
            <Text style={[styles.statLabel, { color: muted }]}>Đến nơi</Text>
          </View>
          <Text style={[styles.statValue, { color: text }]}>{formatETA(remainingTime)}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: divider }]} />

        {/* Duration */}
        <View style={styles.stat}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="hourglass-outline" size={14} color={muted} />
            <Text style={[styles.statLabel, { color: muted }]}>Thời gian</Text>
          </View>
          <Text style={[styles.statValue, { color: text }]}>{formatDuration(remainingTime)}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: divider }]} />

        {/* Distance */}
        <View style={styles.stat}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="navigate-outline" size={14} color={muted} />
            <Text style={[styles.statLabel, { color: muted }]}>Khoảng cách</Text>
          </View>
          <Text style={[styles.statValue, { color: text }]}>{formatDistance(remainingDistance)}</Text>
        </View>

        {/* Exit button — FLOOD_COLORS.danger instead of hardcoded #EF4444 */}
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.8}
          style={[
            styles.exitButton,
            SHADOW.sm,
            { backgroundColor: FLOOD_COLORS.danger, shadowColor: FLOOD_COLORS.danger },
          ]}
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 12,
  },
  bar: {
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 11, marginBottom: 2, fontWeight: "500" },
  statValue: { fontSize: 16, fontWeight: "800" },
  divider: { width: 1, height: 32 },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
