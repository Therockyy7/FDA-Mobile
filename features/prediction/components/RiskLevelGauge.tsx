import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

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
      color: "#EF4444",
      label: "Nguy cấp",
      icon: "alert-circle" as const,
    };
  }
  if (normalizedLevel.includes("high")) {
    return { color: "#F97316", label: "Cao", icon: "warning" as const };
  }
  if (
    normalizedLevel.includes("medium") ||
    normalizedLevel.includes("moderate")
  ) {
    return {
      color: "#F59E0B",
      label: "Trung bình",
      icon: "alert-circle-outline" as const,
    };
  }
  return { color: "#10B981", label: "Thấp", icon: "shield-checkmark" as const };
};

export function RiskLevelGauge({ level, probability }: RiskLevelGaugeProps) {
  const { isDarkColorScheme } = useColorScheme();
  const config = getRiskConfig(level);

  return (
    <View
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
          backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
        }}
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
            backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
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
              fontSize: 9,
              fontWeight: "700",
              color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginTop: 2,
            }}
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
            color: isDarkColorScheme ? "#94A3B8" : "#64748B",
            fontWeight: "700",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
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
            color: isDarkColorScheme ? "#CBD5E1" : "#64748B",
            lineHeight: 18,
            fontWeight: "500",
          }}
        >
          Tổng hợp từ {Math.floor(probability * 10)} mô hình dự báo
        </Text>
      </View>
    </View>
  );
}
