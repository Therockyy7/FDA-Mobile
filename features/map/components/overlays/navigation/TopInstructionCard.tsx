// features/map/components/overlays/navigation/TopInstructionCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { getManeuverIcon } from "~/features/map/lib/navigation-utils";
import type { GeoJsonInstruction } from "~/features/map/types/safe-route.types";
import { SHADOW, FLOOD_COLORS } from "~/lib/design-tokens";

interface TopInstructionCardProps {
  instruction: GeoJsonInstruction | null;
  nextInstruction: GeoJsonInstruction | null;
  distanceToNextTurn: number;
  isOffRoute: boolean;
  insetsTop: number;
}

export function TopInstructionCard({
  instruction,
  nextInstruction,
  distanceToNextTurn,
  isOffRoute,
  insetsTop,
}: TopInstructionCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const iconName = instruction ? (getManeuverIcon(instruction.text) as any) : "navigate";
  const isClose = distanceToNextTurn < 100;

  const cardBg = isDarkColorScheme ? "rgba(15,30,60,0.92)" : "rgba(20,45,90,0.9)";
  const iconBoxBg = isDarkColorScheme ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.2)";
  const distanceColor = isClose ? "#FCD34D" : "#93C5FD";
  const nextTextColor = isDarkColorScheme ? "#60A5FA" : "#93C5FD";
  const dividerColor = isDarkColorScheme ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)";

  return (
    <MotiView
      from={{ opacity: 0, translateY: -40 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={[styles.container, { paddingTop: insetsTop + 6 }]}
      testID="map-nav-hud"
    >
      <View style={[SHADOW.md, styles.card, { backgroundColor: cardBg }]}>
        {instruction ? (
          <>
            {/* Primary instruction row */}
            <View style={styles.primaryRow}>
              <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
                <Ionicons name={iconName} size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.instructionText,
                    isClose && styles.instructionTextClose,
                    { color: "white" },
                  ]}
                  numberOfLines={2}
                >
                  {instruction.text}
                </Text>
                <Text
                  style={[
                    styles.distanceText,
                    isClose && styles.distanceTextClose,
                    { color: distanceColor },
                  ]}
                >
                  {distanceToNextTurn < 1000
                    ? `${Math.round(distanceToNextTurn)} m`
                    : `${(distanceToNextTurn / 1000).toFixed(1)} km`}
                </Text>
              </View>
            </View>

            {/* Next instruction */}
            {nextInstruction && (
              <View style={[styles.nextRow, { borderTopColor: dividerColor }]}>
                <View style={[styles.miniIcon, { backgroundColor: iconBoxBg }]}>
                  <Ionicons name={getManeuverIcon(nextInstruction.text) as any} size={14} color="white" />
                </View>
                <Text style={[styles.nextText, { color: nextTextColor }]} numberOfLines={1}>
                  Sau đó: {nextInstruction.text}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.calculatingRow}>
            <Text style={[styles.calculating, { color: "white" }]}>Đang tính toán...</Text>
          </View>
        )}
      </View>

      {isOffRoute && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.offRouteWarning}
        >
          {/* FLOOD_COLORS.danger replaces hardcoded #DC2626; SHADOW.sm replaces inline shadow */}
          <View
            style={[
              SHADOW.sm,
              styles.offRouteInner,
              { backgroundColor: FLOOD_COLORS.danger, shadowColor: FLOOD_COLORS.danger },
            ]}
          >
            <Ionicons name="warning" size={16} color="white" />
            <Text style={styles.offRouteText}>Bạn đã lạc đường! Hãy quay lại tuyến đường.</Text>
          </View>
        </MotiView>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  miniIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  instructionTextClose: {
    fontSize: 18,
    lineHeight: 22,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },
  distanceTextClose: {
    fontSize: 22,
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  nextText: {
    fontSize: 12,
    flex: 1,
  },
  calculatingRow: {
    alignItems: "center",
    paddingVertical: 8,
  },
  calculating: {
    fontSize: 15,
  },
  offRouteWarning: {
    marginTop: 8,
  },
  offRouteInner: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offRouteText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});
