import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColorScheme } from "~/lib/useColorScheme";
import { getRiskConfigByLevel } from "../types/prediction.types";

interface RiskOverviewCardProps {
  probability: number;         // 0-1 from ensemble_prediction.probability
  riskLevel: string;           // Vietnamese: "Thấp" | "Vang" | "Cam" | "Cao"
  recommendation: string;     // Vietnamese recommendation text
  confidence: string;         // e.g. "High (models agree)"
  confidenceScore: number;    // 0-1
  modelAgreementScore?: number; // 0-1
  uncertaintyLevel?: string;  // "low" | "medium" | "high"
}

export function RiskOverviewCard({
  probability,
  riskLevel,
  recommendation,
  confidence,
  confidenceScore,
  modelAgreementScore,
  uncertaintyLevel,
}: RiskOverviewCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const config = getRiskConfigByLevel(riskLevel);
  const percentValue = probability * 100;
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [percentValue]);

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
        colors={config.gradient as unknown as [string, string]}
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
            backgroundColor: isDarkColorScheme ? "#0B1A33" : "#FFFFFF",
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
                backgroundColor: `${config.color}20`,
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
                colors={config.gradient as unknown as [string, string]}
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
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={isDarkColorScheme ? "#334155" : "#E2E8F0"}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
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
                  Xác Suất
                </Text>
              </View>
            </View>
          </View>

          {/* Recommendation */}
          <View
            style={{
              backgroundColor: `${config.color}15`,
              borderRadius: 16,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: config.color,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                lineHeight: 24,
              }}
            >
              {recommendation}
            </Text>
          </View>

          {/* Confidence & Agreement Row */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Confidence */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                }}
              >
                Độ Tin Cậy
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                }}
              >
                {(confidenceScore * 100).toFixed(0)}%
              </Text>
            </View>

            {/* Model Agreement */}
            {modelAgreementScore !== undefined && (
              <View
                style={{
                  flex: 1,
                  backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                  }}
                >
                  Mô Hình Đồng Ý
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: modelAgreementScore > 0.8 ? "#16A34A" : modelAgreementScore > 0.5 ? "#CA8A04" : "#DC2626",
                  }}
                >
                  {(modelAgreementScore * 100).toFixed(0)}%
                </Text>
              </View>
            )}

            {/* Uncertainty */}
            {uncertaintyLevel && (
              <View
                style={{
                  flex: 1,
                  backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                  }}
                >
                  Độ Bất Định
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: uncertaintyLevel === "high" ? "#DC2626" : uncertaintyLevel === "medium" ? "#CA8A04" : "#16A34A",
                    textTransform: "capitalize",
                  }}
                >
                  {uncertaintyLevel === "high" ? "Cao" : uncertaintyLevel === "medium" ? "TB" : "Thấp"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </MotiView>
  );
}
