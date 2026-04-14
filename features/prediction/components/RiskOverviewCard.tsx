import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "~/components/ui/text";
import { FLOOD_COLORS, SHADOW } from "~/lib/design-tokens";
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

  const agreementColor =
    modelAgreementScore === undefined
      ? FLOOD_COLORS.safe
      : modelAgreementScore > 0.8
        ? FLOOD_COLORS.safe
        : modelAgreementScore > 0.5
          ? FLOOD_COLORS.warning
          : FLOOD_COLORS.danger;

  const uncertaintyColor =
    uncertaintyLevel === "high"
      ? FLOOD_COLORS.danger
      : uncertaintyLevel === "medium"
        ? FLOOD_COLORS.warning
        : FLOOD_COLORS.safe;

  return (
    <MotiView
      testID="prediction-risk-card"
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
          ...SHADOW.lg,
          shadowColor: config.color,
        }}
      >
        <View
          style={{ borderRadius: 30, padding: 24 }}
          className="bg-white dark:bg-dark"
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
              testID="prediction-risk-icon-box"
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
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
                className="text-slate-500 dark:text-slate-400"
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
                  testID="prediction-risk-level-label"
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
          <View
            testID="prediction-risk-circle"
            style={{ alignItems: "center", marginBottom: 16 }}
          >
            <View style={{ width: size, height: size, position: "relative" }}>
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#E2E8F0"
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
                  testID="prediction-risk-probability"
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
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginTop: 4,
                  }}
                  className="text-slate-500 dark:text-slate-400"
                >
                  Xác Suất
                </Text>
              </View>
            </View>
          </View>

          {/* Recommendation */}
          <View
            testID="prediction-risk-recommendation"
            style={{
              borderRadius: 16,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: config.color,
              marginBottom: 12,
              backgroundColor: `${config.color}15`,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                lineHeight: 24,
              }}
              className="text-slate-700 dark:text-slate-200"
            >
              {recommendation}
            </Text>
          </View>

          {/* Confidence & Agreement Row */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* Confidence */}
            <View
              testID="prediction-risk-confidence"
              style={{
                flex: 1,
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
              }}
              className="bg-slate-100 dark:bg-slate-700"
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                }}
                className="text-slate-500 dark:text-slate-400"
              >
                Độ Tin Cậy
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                }}
                className="text-slate-800 dark:text-slate-100"
              >
                {(confidenceScore * 100).toFixed(0)}%
              </Text>
            </View>

            {/* Model Agreement */}
            {modelAgreementScore !== undefined && (
              <View
                testID="prediction-risk-agreement"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
                className="bg-slate-100 dark:bg-slate-700"
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                  }}
                  className="text-slate-500 dark:text-slate-400"
                >
                  Mô Hình Đồng Ý
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: agreementColor,
                  }}
                >
                  {(modelAgreementScore * 100).toFixed(0)}%
                </Text>
              </View>
            )}

            {/* Uncertainty */}
            {uncertaintyLevel && (
              <View
                testID="prediction-risk-uncertainty"
                style={{
                  flex: 1,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: "center",
                }}
                className="bg-slate-100 dark:bg-slate-700"
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                  }}
                  className="text-slate-500 dark:text-slate-400"
                >
                  Độ Bất Định
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: uncertaintyColor,
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
