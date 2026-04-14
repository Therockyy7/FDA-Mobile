// features/map/components/areas/cards/AreaStationChips.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { Pill } from "~/components/ui/Pill";

interface Station {
  stationCode: string;
  waterLevel: number;
  severity: string;
}

interface AreaStationChipsProps {
  stations: Station[];
  colors: { cardBg: string; text: string; subtext: string };
}

export function AreaStationChips({ stations, colors }: AreaStationChipsProps) {
  if (stations?.length === 0) return null;

  return (
    <View testID="map-area-station-chips">
      <Text style={{ fontSize: 11, fontWeight: "600", marginBottom: 6, color: colors.subtext }}>
        Trạm ảnh hưởng
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {stations?.slice(0, 4)?.map((s) => {
          return (
            <Pill
              key={s?.stationCode ?? `chip-${Math.random()}`}
              variant="filled"
              label={`${s?.stationCode ?? "N/A"} • ${s?.waterLevel ?? 0}cm`}
              testID="map-area-station-chip"
            />
          );
        })}
        {(stations?.length ?? 0) > 4 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 5,
              backgroundColor: colors.cardBg,
            }}
          >
            <Ionicons name="add" size={12} color={colors.subtext} />
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.subtext }}>
              +{(stations?.length ?? 0) - 4}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}