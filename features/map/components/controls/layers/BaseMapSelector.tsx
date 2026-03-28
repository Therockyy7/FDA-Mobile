// features/map/components/controls/layers/BaseMapSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { BaseMapType } from "~/features/map/types";

interface BaseMapSelectorProps {
  selectedMap: BaseMapType;
  onChange: (map: "standard" | "satellite") => void;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  borderColor: string;
  isDarkColorScheme: boolean;
}

export function BaseMapSelector({
  selectedMap,
  onChange,
  accentColor,
  textColor,
  subtextColor,
  cardBg,
  borderColor,
  isDarkColorScheme,
}: BaseMapSelectorProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: subtextColor,
          marginBottom: 12,
          letterSpacing: 0.5,
        }}
      >
        LOẠI BẢN ĐỒ
      </Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* Standard Map */}
        <TouchableOpacity
          onPress={() => onChange("standard")}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: cardBg,
            borderWidth: 2,
            borderColor: selectedMap === "standard" ? accentColor : borderColor,
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor:
                selectedMap === "standard"
                  ? `${accentColor}20`
                  : isDarkColorScheme ? "#475569" : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="map-outline"
              size={24}
              color={selectedMap === "standard" ? accentColor : subtextColor}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: selectedMap === "standard" ? accentColor : textColor,
            }}
          >
            Tiêu chuẩn
          </Text>
        </TouchableOpacity>

        {/* Satellite Map */}
        <TouchableOpacity
          onPress={() => onChange("satellite")}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: cardBg,
            borderWidth: 2,
            borderColor: selectedMap === "satellite" ? accentColor : borderColor,
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor:
                selectedMap === "satellite"
                  ? `${accentColor}20`
                  : isDarkColorScheme ? "#475569" : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="earth"
              size={24}
              color={selectedMap === "satellite" ? accentColor : subtextColor}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: selectedMap === "satellite" ? accentColor : textColor,
            }}
          >
            Vệ tinh
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
