// features/map/components/areas/cards/AreaGauge.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface AreaGaugeProps {
  maxWaterLevel: number;
  colors: {
    cardBg: string;
    subtext: string;
    text: string;
    border: string;
  };
}

export function AreaGauge({ maxWaterLevel, colors }: AreaGaugeProps) {
  return (
    <View style={{ alignItems: "center", marginBottom: 24, marginTop: 8 }}>
      <LinearGradient
        colors={["#06B6D4", "#007AFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#06B6D4",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 12,
          borderWidth: 4,
          borderColor: "rgba(255,255,255,0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 10,
            left: -10,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
        />

        <MaterialCommunityIcons
          name="waves"
          size={32}
          color="rgba(255,255,255,0.9)"
          style={{ marginBottom: 4 }}
        />
        <Text style={{ fontSize: 40, fontWeight: "900", color: "white", lineHeight: 48 }}>
          {maxWaterLevel}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.9)", letterSpacing: 1 }}>
          CM
        </Text>
      </LinearGradient>

      <View
        style={{
          backgroundColor: colors.cardBg,
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 20,
          marginTop: -18,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.subtext }}>
          MỰC NƯỚC CAO NHẤT
        </Text>
      </View>
    </View>
  );
}
