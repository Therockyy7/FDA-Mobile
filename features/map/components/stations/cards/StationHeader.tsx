// features/map/components/stations/cards/StationHeader.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface StationHeaderProps {
  stationName: string;
  stationCode: string;
  severityColor: string;
  onClose: () => void;
  colors: {
    cardBg: string;
    text: string;
    subtext: string;
  };
}

export function StationHeader({
  stationName,
  stationCode,
  severityColor,
  onClose,
  colors,
}: StationHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: `${severityColor}20`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={severityColor}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: colors.text,
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {stationName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.subtext }}>
            {stationCode}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={{
          width: 32,
          height: 32,
          backgroundColor: colors.cardBg,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={18} color={colors.subtext} />
      </TouchableOpacity>
    </View>
  );
}
