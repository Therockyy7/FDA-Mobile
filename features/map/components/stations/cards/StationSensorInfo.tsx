// features/map/components/stations/cards/StationSensorInfo.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface StationSensorInfoProps {
  sensorHeight: number | null;
  distance: number | null;
  unit: string;
  colors: {
    cardBg: string;
    text: string;
    subtext: string;
  };
}

export function StationSensorInfo({
  sensorHeight,
  distance,
  unit,
  colors,
}: StationSensorInfoProps) {
  if (sensorHeight === null && distance === null) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
      }}
    >
      {sensorHeight !== null && (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.cardBg,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-expand-vertical"
            size={16}
            color={colors.subtext}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ fontSize: 10, color: colors.subtext }}>
              Chiều cao cảm biến
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {sensorHeight} {unit}
            </Text>
          </View>
        </View>
      )}
      {distance !== null && (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.cardBg,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <MaterialCommunityIcons
            name="ruler"
            size={16}
            color={colors.subtext}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ fontSize: 10, color: colors.subtext }}>
              Khoảng cách
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {distance} cm
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
