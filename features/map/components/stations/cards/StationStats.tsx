// features/map/components/stations/cards/StationStats.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface StationStatsProps {
  waterLevel: number | null;
  unit: string;
  alertLevel: string | null;
  severityColor: string;
  severityLabel: string;
  severityConfig: {
    name: "alert-circle" | "alert" | "information-circle" | "checkmark-circle";
  };
  colors: {
    cardBg: string;
    text: string;
    subtext: string;
  };
}

export function StationStats({
  waterLevel,
  unit,
  alertLevel,
  severityColor,
  severityLabel,
  severityConfig,
  colors,
}: StationStatsProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
      }}
    >
      {/* Water Level Card */}
      <View
        style={{
          flex: 1,
          backgroundColor: `${severityColor}15`,
          borderRadius: 14,
          padding: 12,
          borderWidth: 1,
          borderColor: `${severityColor}30`,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Ionicons name="water" size={14} color={severityColor} />
          <Text
            style={{ fontSize: 10, color: colors.subtext, marginLeft: 4 }}
          >
            Mực nước
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: severityColor,
            }}
          >
            {waterLevel !== null
              ? typeof waterLevel === "number"
                ? waterLevel.toFixed(1)
                : waterLevel
              : "N/A"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: severityColor,
              marginLeft: 2,
            }}
          >
            {unit}
          </Text>
        </View>
      </View>

      {/* Alert Level Badge */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.cardBg,
          borderRadius: 14,
          padding: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Ionicons
            name={severityConfig.name}
            size={14}
            color={colors.subtext}
          />
          <Text
            style={{ fontSize: 10, color: colors.subtext, marginLeft: 4 }}
          >
            Cảnh báo
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: `${severityColor}20`,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            alignSelf: "flex-start",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: severityColor,
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: severityColor,
            }}
          >
            {alertLevel || severityLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
