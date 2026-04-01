// features/map/components/areas/cards/AreaStationChips.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";

interface Station {
  stationCode: string;
  waterLevel: number;
  severity: string;
}

interface AreaStationChipsProps {
  stations: Station[];
  colors: {
    cardBg: string;
    text: string;
    subtext: string;
  };
}

export function AreaStationChips({ stations, colors }: AreaStationChipsProps) {
  if (stations.length === 0) return null;

  return (
    <View style={{ marginBottom: 12 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: colors.subtext,
          marginBottom: 8,
        }}
      >
        Trạm ảnh hưởng:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {stations.slice(0, 3).map((station, index) => (
          <View
            key={index}
            style={{
              backgroundColor: colors.cardBg,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  station.severity === "critical"
                    ? "#EF4444"
                    : station.severity === "warning"
                      ? "#F97316"
                      : "#10B981",
              }}
            />
            <Text style={{ fontSize: 11, color: colors.text, fontWeight: "600" }}>
              {station.stationCode}
            </Text>
            <Text style={{ fontSize: 10, color: colors.subtext }}>
              {station.waterLevel}cm
            </Text>
          </View>
        ))}
        {stations.length > 3 && (
          <View
            style={{
              backgroundColor: colors.cardBg,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 11, color: colors.subtext }}>
              +{stations.length - 3}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
