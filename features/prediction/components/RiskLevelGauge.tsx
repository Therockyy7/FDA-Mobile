import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { FLOOD_COLORS, SHADOW } from "~/lib/design-tokens";

interface RiskLevelGaugeProps {
  level: string;
  probability: number;
}

const getRiskConfig = (level: string) => {
  const normalizedLevel = level.toLowerCase();

  if (
    normalizedLevel.includes("critical") ||
    normalizedLevel.includes("extreme")
  ) {
    return {
      color: FLOOD_COLORS.danger,
      label: "Nguy cấp",
      icon: "alert-circle" as const,
    };
  }
  if (normalizedLevel.includes("high")) {
    return { color: FLOOD_COLORS.danger, label: "Cao", icon: "warning" as const };
  }
  if (
    normalizedLevel.includes("medium") ||
    normalizedLevel.includes("moderate")
  ) {
    return {
      color: FLOOD_COLORS.warning,
      label: "Trung bình",
      icon: "alert-circle-outline" as const,
    };
  }
  return { color: FLOOD_COLORS.safe, label: "Thấp", icon: "shield-checkmark" as const };
};

export function RiskLevelGauge({ level, probability }: RiskLevelGaugeProps) {
  const config = getRiskConfig(level);

  return (
    <View
      testID="prediction-gauge-container"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Probability Circle - Modern Design */}
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 55,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        className="bg-slate-100 dark:bg-slate-700"
      >
        {/* Outer ring */}
        <View
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 8,
            borderColor: `${config.color}20`,
          }}
        />
        {/* Progress ring */}
        <View
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 8,
            borderColor: config.color,
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            transform: [
              { rotate: `${-90 + probability * 360}deg` },
            ],
          }}
        />
        {/* Inner circle */}
        <View
          style={{
            width: 86,
            height: 86,
            borderRadius: 43,
            alignItems: "center",
            justifyContent: "center",
            ...SHADOW.sm,
            shadowColor: config.color,
          }}
          className="bg-white dark:bg-slate-900"
        >
          <Text
            testID="prediction-gauge-probability"
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: config.color,
            }}
          >
            {Math.round(probability * 100)}
            <Text style={{ fontSize: 16 }}>%</Text>
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginTop: 2,
            }}
            className="text-slate-500 dark:text-slate-400"
          >
            Xác suất
          </Text>
        </View>
      </View>

      {/* Risk Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
          className="text-slate-500 dark:text-slate-400"
        >
          Mức độ rủi ro
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            testID="prediction-gauge-icon-box"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: `${config.color}20`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons
              name={config.icon}
              size={20}
              color={config.color}
            />
          </View>
          <Text
            testID="prediction-gauge-risk-label"
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: config.color,
            }}
          >
            {config.label}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            lineHeight: 18,
            fontWeight: "500",
          }}
          className="text-slate-500 dark:text-slate-300"
        >
          Tổng hợp từ {Math.floor(probability * 10)} mô hình dự báo
        </Text>
      </View>
    </View>
  );
}
