import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColorScheme } from "~/lib/useColorScheme";
import { getRiskConfig } from "../utils/adviceParser";

interface RiskOverviewCardProps {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskPercentage: number;
  riskLabel: string;
}

export function RiskOverviewCard({
  riskLevel,
  riskPercentage,
  riskLabel,
}: RiskOverviewCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const config = getRiskConfig(riskLevel);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(riskPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [riskPercentage]);

  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference - (animatedPercentage / 100) * circumference;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 32,
          padding: 2,
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <View
          style={{
            backgroundColor: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
            borderRadius: 30,
            padding: 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: config.bgColor,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name={config.icon as any} size={28} color={config.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Đánh Giá Tổng Quan
              </Text>
              <LinearGradient
                colors={config.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  marginTop: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    color: "#FFFFFF",
                    letterSpacing: 0.8,
                  }}
                >
                  {config.label}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Circular Progress */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={{ width: size, height: size, position: "relative" }}>
              <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={isDarkColorScheme ? "#334155" : "#E2E8F0"}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={config.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={progress}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
              {/* Center Content */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 42,
                    fontWeight: "900",
                    color: config.color,
                  }}
                >
                  {animatedPercentage.toFixed(1)}
                  <Text style={{ fontSize: 24 }}>%</Text>
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginTop: 4,
                  }}
                >
                  Rủi Ro
                </Text>
              </View>
            </View>
          </View>

          {/* Risk Label */}
          <View
            style={{
              backgroundColor: config.bgColor,
              borderRadius: 16,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: config.color,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                lineHeight: 24,
                textAlign: "center",
              }}
            >
              Mức độ rủi ro <Text style={{ fontWeight: "900", color: config.color }}>{riskLabel.toLowerCase()}</Text> với xác suất {riskPercentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}
