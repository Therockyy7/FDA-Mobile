import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { DimensionValue, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColorScheme } from "~/lib/useColorScheme";

// ==================== TYPES ====================

interface AnalysisSection {
  title: string;
  content: string;
}

interface ParsedAdvice {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskLabel: string;
  riskScore: number; // 0-100
  summary: string;
  analysisFactors: { label: string; value: string; detail: string }[];
  systemLogic: string[];
  recommendations: string[];
  conclusion: string;
}

interface AnalysisReportCardProps {
  advice: string;
}

const RISK_CONFIG = {
  Low: {
    color: "#10B981",
    label: "THẤP",
    gradient: ["#059669", "#10B981"] as const,
    bgLight: "rgba(16, 185, 129, 0.1)",
    bgDark: "rgba(16, 185, 129, 0.2)",
    icon: "shield-checkmark" as keyof typeof Ionicons.glyphMap,
  },
  Medium: {
    color: "#F59E0B",
    label: "TRUNG BÌNH",
    gradient: ["#D97706", "#F59E0B"] as const,
    bgLight: "rgba(245, 158, 11, 0.1)",
    bgDark: "rgba(245, 158, 11, 0.2)",
    icon: "warning" as keyof typeof Ionicons.glyphMap,
  },
  High: {
    color: "#F97316",
    label: "CAO",
    gradient: ["#EA580C", "#F97316"] as const,
    bgLight: "rgba(249, 115, 22, 0.1)",
    bgDark: "rgba(249, 115, 22, 0.2)",
    icon: "alert" as keyof typeof Ionicons.glyphMap,
  },
  Critical: {
    color: "#EF4444",
    label: "NGUY CẤP",
    gradient: ["#DC2626", "#EF4444"] as const,
    bgLight: "rgba(239, 68, 68, 0.1)",
    bgDark: "rgba(239, 68, 68, 0.2)",
    icon: "thunderstorm" as keyof typeof Ionicons.glyphMap,
  },
};

// ==================== PARSER ====================

const parseAdvice = (text: string): ParsedAdvice => {
  // Default structure
  const result: ParsedAdvice = {
    riskLevel: "Low",
    riskLabel: "THẤP",
    riskScore: 0,
    summary: "",
    analysisFactors: [],
    systemLogic: [],
    recommendations: [],
    conclusion: "",
  };

  if (!text) return result;

  // Split by headers (### Header)
  const sections = text.split(/^###\s+/m).filter(Boolean);

  sections.forEach((section) => {
    const lines = section.split("\n").filter((l) => l.trim());
    const title = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join("\n").trim();

    // 1. Nhận Định và Khuyến Nghị (Summary & Risk)
    if (title.includes("nhận định")) {
      // Extract Risk Level & Score
      const riskMatch = content.match(
        /Rủi Ro (.*?)\*\*.*?(?:mức|xác suất).*?(\d+\.?\d*)%/,
      );

      if (riskMatch) {
        const levelStr = riskMatch[1].trim().toLowerCase();
        result.riskScore = parseFloat(riskMatch[2]);

        if (levelStr.includes("thấp")) result.riskLevel = "Low";
        else if (levelStr.includes("trung bình")) result.riskLevel = "Medium";
        else if (levelStr.includes("cao")) result.riskLevel = "High";
        else if (levelStr.includes("nguy cấp") || levelStr.includes("hiểm"))
          result.riskLevel = "Critical";

        result.riskLabel = RISK_CONFIG[result.riskLevel].label;
      }

      // Extract Summary text (remove the bold Risk part)
      result.summary = content
        .replace(/⚠️ \*\*.*?\*\*:/, "")
        .replace(/\*\*/g, "")
        .trim();
    }

    // 2. Phân Tích (Analysis Factors)
    else if (title.includes("phân tích")) {
      const bullets = content.split(/^- /m).filter(Boolean);
      result.analysisFactors = bullets.map((b) => {
        const parts = b.split(":");
        const label = parts[0].replace(/\*\*/g, "").trim();
        const fullDetail = parts.slice(1).join(":").trim();

        // Extract value percentage if strictly formatted, else just use text
        const valueMatch = fullDetail.match(/(\d+\.?\d*)%/);
        const value = valueMatch ? `${valueMatch[1]}%` : "";

        return {
          label,
          value,
          detail: fullDetail,
        };
      });
    }

    // 3. Logic Hệ Thống
    else if (title.includes("logic")) {
      result.systemLogic = content
        .split(/^- /m)
        .filter(Boolean)
        .map((l) => l.trim().replace(/\*\*/g, ""));
    }

    // 4. Khuyến Nghị
    else if (title.includes("khuyến nghị")) {
      result.recommendations = content
        .split(/^- |🟢 \*\*.*?\*\*:/m) // Split by bullets or the specific Action icon format
        .filter(Boolean)
        .map((l) => l.trim().replace(/\*\*/g, ""));
    }

    // 5. Kết Luận
    else if (title.includes("kết luận")) {
      result.conclusion = content
        .replace(/🌊 \*\*.*?\*\*:/, "")
        .replace(/\*\*/g, "")
        .trim();
    }
  });

  return result;
};

// ==================== SUB COMPONENTS ====================

const CircularProgress = ({
  score,
  color,
  size = 100,
  strokeWidth = 8,
}: {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.1)"
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
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-2xl font-bold" style={{ color }}>
          {progress.toFixed(1)}
        </Text>
        <Text className="text-xs font-medium text-gray-500">%</Text>
      </View>
    </View>
  );
};

// ==================== MAIN COMPONENT ====================

export const AnalysisReportCard: React.FC<AnalysisReportCardProps> = ({
  advice,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [data, setData] = useState<ParsedAdvice | null>(null);
  const [expandedLogic, setExpandedLogic] = useState(false);

  useEffect(() => {
    setData(parseAdvice(advice));
  }, [advice]);

  if (!data) return null;

  console.log("data AnalysisReportCard", data);
  const config = RISK_CONFIG[data.riskLevel];
  const cardBg = isDarkColorScheme ? "bg-slate-800" : "bg-white";
  const textColor = isDarkColorScheme ? "text-slate-100" : "text-gray-900";
  const subTextColor = isDarkColorScheme ? "text-slate-400" : "text-gray-500";
  const borderColor = isDarkColorScheme
    ? "border-slate-700"
    : "border-gray-100";

  return (
    <View className="gap-4 mb-6">
      {/* 1. RISK OVERVIEW CARD */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 500 }}
      >
        <View
          className={`rounded-3xl overflow-hidden ${cardBg}`}
          style={{
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={
              isDarkColorScheme
                ? ["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.9)"]
                : ["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.9)"]
            }
            className="p-5"
          >
            <View className="flex-row items-center gap-5">
              <CircularProgress score={data.riskScore} color={config.color} />

              <View className="flex-1 gap-2">
                <Text
                  className={`text-xs font-bold tracking-widest uppercase opacity-70 ${subTextColor}`}
                >
                  Mức độ rủi ro
                </Text>

                <LinearGradient
                  colors={config.gradient}
                  className="self-start px-4 py-2 rounded-xl"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text className="text-white font-black text-xl tracking-wide">
                    {config.label}
                  </Text>
                </LinearGradient>

                <Text className={`text-sm leading-5 mt-1 ${textColor}`}>
                  {data.summary || "Đang phân tích dữ liệu..."}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </MotiView>

      {/* 2. ANALYSIS FACTORS */}
      {data.analysisFactors.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <View
            className={`rounded-2xl p-4 ${cardBg} shadow-sm border ${borderColor}`}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <View
                className={`w-8 h-8 rounded-lg items-center justify-center bg-blue-500/10`}
              >
                <Ionicons name="analytics" size={18} color="#3B82F6" />
              </View>
              <Text className={`font-bold text-base ${textColor}`}>
                Yếu tố phân tích
              </Text>
            </View>

            <View className="gap-4">
              {data.analysisFactors.map((factor, idx) => (
                <View key={idx} className="gap-1">
                  <View className="flex-row justify-between items-center">
                    <Text className={`font-semibold text-sm ${textColor}`}>
                      {factor.label}
                    </Text>
                    {factor.value && (
                      <Text className="font-bold text-blue-500">
                        {factor.value}
                      </Text>
                    )}
                  </View>
                  <Text className={`text-xs leading-5 ${subTextColor}`}>
                    {factor.detail
                      .replace(factor.value || "", "")
                      .replace(/^\s*[-:]\s*/, "")}
                  </Text>
                  {/* Progress bar visual */}
                  {factor.value && (
                    <View className="h-1.5 w-full bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <View
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: factor.value as DimensionValue }}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </MotiView>
      )}

      {/* 3. RECOMMENDATIONS & LOGIC */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400 }}
      >
        <View
          className={`rounded-2xl p-5 ${cardBg} shadow-sm border ${borderColor}`}
        >
          {/* Header */}
          <View className="flex-row items-center gap-2 mb-4">
            <View
              style={{ backgroundColor: config.bgDark }}
              className="w-8 h-8 rounded-lg items-center justify-center"
            >
              <Ionicons name={config.icon} size={18} color={config.color} />
            </View>
            <Text className={`font-bold text-base ${textColor}`}>
              Khuyến nghị hành động
            </Text>
          </View>

          {/* Recommendations List */}
          <View className="gap-3">
            {data.recommendations.map((rec, idx) => (
              <View
                key={idx}
                className={`flex-row gap-3 p-3 rounded-xl ${isDarkColorScheme ? "bg-white/5" : "bg-gray-50"}`}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={config.color}
                  style={{ marginTop: 2 }}
                />
                <Text
                  className={`flex-1 text-sm leading-5 font-medium ${textColor}`}
                >
                  {rec}
                </Text>
              </View>
            ))}

            {/* Conclusion */}
            {data.conclusion && (
              <View
                className={`mt-2 p-3 rounded-xl border-l-4 border-blue-500 ${isDarkColorScheme ? "bg-blue-900/20" : "bg-blue-50"}`}
              >
                <Text
                  className={`text-sm italic font-medium ${isDarkColorScheme ? "text-blue-200" : "text-blue-800"}`}
                >
                  &quot;{data.conclusion}&quot;
                </Text>
              </View>
            )}
          </View>

          {/* Collapsible System Logic */}
          {/* System Logic Section */}
          {data.systemLogic.length > 0 && (
            <View className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <TouchableOpacity
                onPress={() => setExpandedLogic(!expandedLogic)}
                className="flex-row items-center justify-between"
              >
                <Text
                  className={`text-xs font-semibold uppercase tracking-wider ${subTextColor}`}
                >
                  Chi tiết kỹ thuật
                </Text>
                <Ionicons
                  name={expandedLogic ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={isDarkColorScheme ? "#94A3B8" : "#64748B"}
                />
              </TouchableOpacity>

              {expandedLogic && (
                <View className="mt-3 gap-2">
                  {data.systemLogic.map((logic, idx) => (
                    <View key={idx} className="flex-row gap-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
                      <Text
                        className={`flex-1 text-xs leading-5 ${subTextColor} font-mono`}
                      >
                        {logic}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </MotiView>
    </View>
  );
};
