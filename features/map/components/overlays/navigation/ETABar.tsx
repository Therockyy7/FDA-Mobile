// features/map/components/overlays/navigation/ETABar.tsx
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatDistance, formatDuration } from "../../../lib/polyline-utils";
import { formatETA } from "../../../lib/navigation-utils";

interface ETABarProps {
  remainingDistance: number;
  remainingTime: number;
  insetsBottom: number;
  onExit: () => void;
}

export function ETABar({
  remainingDistance,
  remainingTime,
  insetsBottom,
  onExit,
}: ETABarProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={[styles.container, { paddingBottom: insetsBottom + 8 }]}
    >
      <View style={styles.bar}>
        {/* ETA */}
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatETA(remainingTime)}</Text>
          <Text style={styles.statLabel}>Đến nơi</Text>
        </View>

        <View style={styles.divider} />

        {/* Duration */}
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {formatDuration(remainingTime)}
          </Text>
          <Text style={styles.statLabel}>Thời gian</Text>
        </View>

        <View style={styles.divider} />

        {/* Distance */}
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {formatDistance(remainingDistance)}
          </Text>
          <Text style={styles.statLabel}>Khoảng cách</Text>
        </View>

        {/* Exit button */}
        <TouchableOpacity
          onPress={onExit}
          activeOpacity={0.8}
          style={styles.exitButton}
        >
          <Ionicons name="close" size={22} color="white" />
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
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
});
