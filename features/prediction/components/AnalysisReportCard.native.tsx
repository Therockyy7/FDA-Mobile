/**
 * AnalysisReportCard - Native Version (No Tamagui)
 * 
 * Version này không dùng Tamagui, chỉ dùng React Native core components
 * Sử dụng khi gặp issue với Tamagui config
 */

import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle,
  Droplets,
  History,
  Mountain,
  TrendingUp,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { View, Text as RNText } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { clsx } from "clsx";
import { useColorScheme } from "~/lib/useColorScheme";

// ==================== TYPES ====================
interface ParsedFloodData {
  riskPercent: number;
  slope: string;
  saturation: string;
  history: string;
  level: "Low" | "Medium" | "High" | "Critical";
  recommendations: string[];
}

interface AnalysisReportCardProps {
  advice: string;
}

interface RiskConfig {
  color: string;
  glowColor: string;
  gradientColors: string[];
  label: string;
  darkColor: string;
}

// ==================== UTILITIES ====================
const parseFloodData = (text: string): ParsedFloodData => {
  const riskMatch = text.match(/(?:Tỉ lệ rủi ro|rủi ro).*?(\d+\.?\d*)%/i);
  const riskPercent = parseFloat(riskMatch?.[1] || "0");

  const slopeMatch = text.match(/(?:độ dốc|địa hình).*?(\d+\.?\d*)%/i);
  const slope = slopeMatch?.[1] || "0";

  const saturationMatch = text.match(/(?:độ bão hòa|bão hòa đất).*?(\d+\.?\d*)%/i);
  const saturation = saturationMatch?.[1] || "0";

  const historyMatch = text.match(/(?:tương đồng lịch sử|lịch sử).*?(\d+)%/i);
  const history = historyMatch?.[1] || "0";

  let level: ParsedFloodData["level"] = "Low";
  if (text.match(/rủi ro (cao|nguy hiểm)/i) || riskPercent > 70) {
    level = "Critical";
  } else if (text.match(/rủi ro trung bình/i) || riskPercent > 40) {
    level = "Medium";
  } else if (text.match(/rủi ro thấp/i) || riskPercent <= 40) {
    level = "Low";
  }

  const recommendations: string[] = [];
  const recLines = text.split(/[.\n]/).filter((line) => {
    const lower = line.toLowerCase();
    return (
      lower.includes("theo dõi") ||
      lower.includes("kiểm tra") ||
      lower.includes("chuẩn bị") ||
      lower.includes("giám sát") ||
      lower.includes("khuyến nghị") ||
      lower.includes("nên")
    );
  });

  recLines.forEach((line) => {
    const cleaned = line.trim();
    if (cleaned.length > 10 && cleaned.length < 100) {
      recommendations.push(cleaned);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("Theo dõi thường xuyên tình hình thời tiết");
    recommendations.push("Kiểm tra hệ thống thoát nước");
    recommendations.push("Chuẩn bị phương án ứng phó khẩn cấp");
  }

  return {
    riskPercent,
    slope,
    saturation,
    history,
    level,
    recommendations: recommendations.slice(0, 4),
  };
};

const getRiskConfig = (level: ParsedFloodData["level"]): RiskConfig => {
  switch (level) {
    case "Critical":
      return {
        color: "#EF4444",
        glowColor: "rgba(239, 68, 68, 0.4)",
        gradientColors: ["#DC2626", "#EF4444"],
        label: "NGUY CẤP",
        darkColor: "#991B1B",
      };
    case "High":
      return {
        color: "#F97316",
        glowColor: "rgba(249, 115, 22, 0.4)",
        gradientColors: ["#EA580C", "#F97316"],
        label: "CAO",
        darkColor: "#9A3412",
      };
    case "Medium":
      return {
        color: "#F59E0B",
        glowColor: "rgba(245, 158, 11, 0.4)",
        gradientColors: ["#D97706", "#F59E0B"],
        label: "TRUNG BÌNH",
        darkColor: "#92400E",
      };
    default:
      return {
        color: "#10B981",
        glowColor: "rgba(16, 185, 129, 0.4)",
        gradientColors: ["#059669", "#10B981"],
        label: "THẤP",
        darkColor: "#065F46",
      };
  }
};

// ==================== SUB COMPONENTS ====================

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size,
  strokeWidth,
  color,
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
    >
      <View style={{ width: size, height: size, position: "relative" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
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
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 500, damping: 12 }}
          >
            <RNText style={{ fontSize: 32, fontWeight: "900", color }}>
              {animatedPercentage.toFixed(1)}
              <RNText style={{ fontSize: 18 }}>%</RNText>
            </RNText>
          </MotiView>
        </View>
      </View>
    </MotiView>
  );
};

// ==================== MAIN COMPONENT ====================

export const AnalysisReportCard: React.FC<AnalysisReportCardProps> = ({
  advice,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const parsedData = parseFloodData(advice);
  const riskConfig = getRiskConfig(parsedData.level);

  return (
    <View style={{ gap: 16, marginBottom: 16 }}>
      {/* Hero Section */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 500 }}
      >
        <View
          style={{
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: riskConfig.glowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={
              isDarkColorScheme
                ? ["rgba(30, 41, 59, 0.95)", "rgba(15, 23, 42, 0.95)"]
                : ["rgba(255, 255, 255, 0.95)", "rgba(241, 245, 249, 0.95)"]
            }
            style={{ padding: 24 }}
          >
            <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
              <CircularProgress
                percentage={parsedData.riskPercent}
                size={120}
                strokeWidth={10}
                color={riskConfig.color}
              />

              <View style={{ flex: 1, gap: 8 }}>
                <MotiView
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "timing", delay: 400 }}
                >
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                      letterSpacing: 1.5,
                    }}
                  >
                    MỨC ĐỘ RỦI RO
                  </RNText>
                </MotiView>

                <MotiView
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "timing", delay: 500 }}
                >
                  <LinearGradient
                    colors={riskConfig.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                      alignSelf: "flex-start",
                    }}
                  >
                    <RNText
                      style={{
                        fontSize: 24,
                        fontWeight: "900",
                        color: "#FFFFFF",
                        letterSpacing: 1,
                      }}
                    >
                      {riskConfig.label}
                    </RNText>
                  </LinearGradient>
                </MotiView>

                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "timing", delay: 600 }}
                >
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                    }}
                  >
                    Phân tích dựa trên {parsedData.recommendations.length} yếu tố
                  </RNText>
                </MotiView>
              </View>
            </View>
          </LinearGradient>
        </View>
      </MotiView>

      {/* Metrics Grid */}
      <View
        className={clsx(
          "rounded-3xl p-4",
          isDarkColorScheme ? "bg-slate-800/50" : "bg-white/80"
        )}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View style={{ gap: 12 }}>
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", delay: 300 }}
          >
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <View
                className={clsx(
                  "w-8 h-8 rounded-lg items-center justify-center",
                  isDarkColorScheme ? "bg-blue-500/20" : "bg-blue-400/20"
                )}
              >
                <TrendingUp
                  size={16}
                  color={isDarkColorScheme ? "#60A5FA" : "#3B82F6"}
                />
              </View>
              <RNText
                className={clsx(
                  "text-base font-bold",
                  isDarkColorScheme ? "text-white" : "text-gray-900"
                )}
              >
                Thông số phân tích
              </RNText>
            </View>
          </MotiView>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              {
                icon: Mountain,
                label: "Độ dốc",
                value: parsedData.slope,
                index: 0,
              },
              {
                icon: Droplets,
                label: "Bão hòa",
                value: parsedData.saturation,
                index: 1,
              },
              {
                icon: History,
                label: "Lịch sử",
                value: parsedData.history,
                index: 2,
              },
            ].map((metric) => (
              <MotiView
                key={metric.label}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  delay: 200 + metric.index * 100,
                }}
                style={{ flex: 1 }}
              >
                <View
                  className={clsx(
                    "rounded-2xl p-4",
                    isDarkColorScheme ? "bg-white/5" : "bg-white/10"
                  )}
                >
                  <View style={{ gap: 8, alignItems: "center" }}>
                    <View
                      className={clsx(
                        "w-10 h-10 rounded-xl items-center justify-center",
                        isDarkColorScheme ? "bg-blue-500/20" : "bg-blue-400/30"
                      )}
                    >
                      <metric.icon
                        size={20}
                        color={isDarkColorScheme ? "#60A5FA" : "#3B82F6"}
                      />
                    </View>
                    <RNText
                      className={clsx(
                        "text-xs font-semibold uppercase tracking-wider",
                        isDarkColorScheme ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {metric.label}
                    </RNText>
                    <RNText
                      className={clsx(
                        "text-2xl font-black",
                        isDarkColorScheme ? "text-white" : "text-gray-900"
                      )}
                    >
                      {metric.value}%
                    </RNText>
                  </View>
                </View>
              </MotiView>
            ))}
          </View>
        </View>
      </View>

      {/* Recommendations */}
      {parsedData.recommendations.length > 0 && (
        <View
          className={clsx(
            "rounded-3xl p-5",
            isDarkColorScheme ? "bg-slate-800/50" : "bg-white/80"
          )}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View style={{ gap: 12 }}>
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", delay: 400 }}
            >
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: `${riskConfig.color}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle size={16} color={riskConfig.color} />
                </View>
                <RNText
                  className={clsx(
                    "text-base font-bold",
                    isDarkColorScheme ? "text-white" : "text-gray-900"
                  )}
                >
                  Khuyến nghị hành động
                </RNText>
              </View>
            </MotiView>

            <View style={{ gap: 8 }}>
              {parsedData.recommendations.map((rec, index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{
                    type: "timing",
                    delay: 600 + index * 150,
                  }}
                >
                  <View
                    className={clsx(
                      "rounded-xl p-3",
                      isDarkColorScheme ? "bg-white/5" : "bg-white/20"
                    )}
                    style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}
                  >
                    <View style={{ paddingTop: 2 }}>
                      <CheckCircle size={18} color={riskConfig.color} strokeWidth={2.5} />
                    </View>
                    <RNText
                      className={clsx(
                        "flex-1 text-sm font-medium leading-5",
                        isDarkColorScheme ? "text-gray-200" : "text-gray-800"
                      )}
                    >
                      {rec}
                    </RNText>
                  </View>
                </MotiView>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
