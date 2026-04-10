// features/map/components/stations/cards/StationFooter.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatTime } from "~/features/map/lib/formatters";
import { RADIUS } from "~/features/map/lib/map-ui-utils";

interface StationFooterProps {
  measuredAt: string | null;
  stationStatus: string | null;
  severityColor: string;
  onViewDetails?: () => void;
  colors: { subtext: string; muted: string };
}

export function StationFooter({
  measuredAt,
  stationStatus,
  severityColor,
  onViewDetails,
  colors,
}: StationFooterProps) {
  return (
    <View style={styles.row}>
      <View style={styles.meta}>
        <Ionicons name="time-outline" size={11} color={colors.muted} />
        <Text style={[styles.timeText, { color: colors.muted }]}>
          {formatTime(measuredAt)}
        </Text>
        {stationStatus && (
          <>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    stationStatus === "online" ? "#22C55E" : "#EF4444",
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: stationStatus === "online" ? "#22C55E" : "#EF4444" },
              ]}
            >
              {stationStatus}
            </Text>
          </>
        )}
      </View>

      {onViewDetails && (
        <TouchableOpacity
          onPress={onViewDetails}
          style={[styles.btn, { backgroundColor: severityColor }]}
          activeOpacity={0.75}
        >
          <Text style={styles.btnText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={12} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.button,
    gap: 3,
  },
  btnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
});
