// features/map/components/stations/cards/StationFooter.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatTime } from "../../../lib/formatters";

interface StationFooterProps {
  measuredAt: string | null;
  stationStatus: string | null;
  severityColor: string;
  onViewDetails?: () => void;
  colors: {
    subtext: string;
  };
}

export function StationFooter({
  measuredAt,
  stationStatus,
  severityColor,
  onViewDetails,
  colors,
}: StationFooterProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="time-outline" size={14} color={colors.subtext} />
          <Text style={{ fontSize: 11, color: colors.subtext, marginLeft: 4 }}>
            {formatTime(measuredAt)}
          </Text>
        </View>
        {stationStatus && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  stationStatus === "active" ? "#22C55E" : "#EF4444",
              }}
            />
            <Text style={{ fontSize: 10, color: colors.subtext, marginLeft: 4 }}>
              {stationStatus === "active" ? "Hoạt động" : "Ngừng hoạt động"}
            </Text>
          </View>
        )}
      </View>

      {onViewDetails && (
        <TouchableOpacity
          onPress={onViewDetails}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: severityColor,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>
            Chi tiết
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color="white"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
