// features/map/components/overlays/navigation/TopInstructionCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { getManeuverIcon } from "../../../lib/navigation-utils";
import type { GeoJsonInstruction } from "../../../types/safe-route.types";

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
  const iconName = instruction
    ? (getManeuverIcon(instruction.text) as any)
    : "navigate";
  const isClose = distanceToNextTurn < 100;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={[styles.container, { paddingTop: insetsTop + 4 }]}
    >
      <View style={styles.card}>
        {instruction ? (
          <>
            {/* Primary instruction */}
            <View style={styles.primaryRow}>
              <View style={styles.iconBox}>
                <Ionicons name={iconName} size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.instructionText,
                    isClose && styles.instructionTextClose,
                  ]}
                  numberOfLines={2}
                >
                  {instruction.text}
                </Text>
                <Text
                  style={[
                    styles.distanceText,
                    isClose && styles.distanceTextClose,
                  ]}
                >
                  {distanceToNextTurn < 1000
                    ? `${Math.round(distanceToNextTurn)} m`
                    : `${(distanceToNextTurn / 1000).toFixed(1)} km`}
                </Text>
              </View>
            </View>

            {/* Next step preview */}
            {nextInstruction && (
              <View style={styles.nextRow}>
                <Ionicons
                  name={getManeuverIcon(nextInstruction.text) as any}
                  size={16}
                  color="#93C5FD"
                />
                <Text style={styles.nextText} numberOfLines={1}>
                  Sau đó: {nextInstruction.text}
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.calculating}>Đang tính toán...</Text>
        )}
      </View>

      {/* Off-route warning */}
      {isOffRoute && (
        <View style={styles.offRouteWarning}>
          <Ionicons name="warning" size={18} color="white" />
          <Text style={styles.offRouteText}>
            Bạn đã lạc đường! Hãy quay lại tuyến đường.
          </Text>
        </View>
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
    backgroundColor: "#1E3A5F",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  instructionTextClose: {
    fontSize: 18,
    lineHeight: 22,
  },
  distanceText: {
    color: "#93C5FD",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  distanceTextClose: {
    fontSize: 22,
    color: "#FCD34D",
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  nextText: {
    color: "#93C5FD",
    fontSize: 12,
    flex: 1,
  },
  calculating: {
    color: "white",
    fontSize: 15,
    textAlign: "center",
  },
  offRouteWarning: {
    marginTop: 8,
    backgroundColor: "#DC2626",
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
