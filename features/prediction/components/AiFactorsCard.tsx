import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AiPrediction } from "../types/prediction.types";
import { SHADOW } from "~/lib/design-tokens";

interface Props {
  aiPrediction: AiPrediction;
}

const COMPONENT_META = [
  {
    key: "weather" as const,
    label: "Thời tiết",
    icon: "cloud-outline" as const,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    getValue: (p: AiPrediction) => p.components.weather.contribution,
    getDetail: (p: AiPrediction) => `Mưa 6h: ${p.components.weather.precipitation_6h_mm}mm · Độ ẩm: ${p.components.weather.avg_humidity_pct}%`,
  },
  {
    key: "saturation" as const,
    label: "Bão hoà đất",
    icon: "water-outline" as const,
    color: "#6366F1",
    bg: "rgba(99,102,241,0.12)",
    getValue: (p: AiPrediction) => p.components.saturation.drainage_risk,
    getDetail: (p: AiPrediction) => `Mức bão hoà: ${Math.round(p.components.saturation.saturation_level * 100)}% · ${p.components.saturation.status}`,
  },
  {
    key: "terrain" as const,
    label: "Địa hình",
    icon: "triangle-outline" as const,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
    getValue: (p: AiPrediction) => p.components.terrain.drainage_risk,
    getDetail: (p: AiPrediction) => `Độ dốc: ${p.components.terrain.slope_degrees}° · Cao độ: ${p.components.terrain.elevation_m}m`,
  },
  {
    key: "historical_similarity" as const,
    label: "Lịch sử",
    icon: "library-outline" as const,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    getValue: (p: AiPrediction) => p.components.historical_similarity.similarity_signal,
    getDetail: (p: AiPrediction) => `Tương đồng: ${Math.round(p.components.historical_similarity.best_match_similarity * 100)}% · ${p.components.historical_similarity.best_match_type}`,
  },
];

export function AiFactorsCard({ aiPrediction }: Props) {
  return (
    <View
      testID="prediction-ai-factors-card"
      className="bg-white dark:bg-slate-800 rounded-2xl"
      style={{ padding: 16, ...SHADOW.md }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 }}>
        <View className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 items-center justify-center">
          <Ionicons name="git-merge-outline" size={16} color="#F59E0B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            testID="prediction-ai-factors-title"
            className="text-sm font-extrabold text-gray-900 dark:text-slate-100"
          >
            Phân tích yếu tố AI
          </Text>
          <Text
            testID="prediction-ai-factors-subtitle"
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            Xác suất ensemble: {Math.round(aiPrediction.ensembleProbability * 100)}% · {aiPrediction.riskLevel}
          </Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {COMPONENT_META.map((meta) => {
          const rawVal = meta.getValue(aiPrediction);
          const pct = Math.min(100, Math.round(rawVal * 100));
          const detail = meta.getDetail(aiPrediction);
          return (
            <View
              key={meta.key}
              testID={`prediction-ai-factors-item-${meta.key}`}
              className="bg-slate-100 dark:bg-slate-700 rounded-2xl"
              style={{ padding: 12 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: meta.bg,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={meta.icon} size={15} color={meta.color} />
                </View>
                <Text className="text-xs font-bold text-gray-900 dark:text-slate-100" style={{ flex: 1 }}>
                  {meta.label}
                </Text>
                <Text
                  testID={`prediction-ai-factors-pct-${meta.key}`}
                  style={{ fontSize: 14, fontWeight: "900", color: meta.color }}
                >
                  {pct}%
                </Text>
              </View>
              {/* Progress bar */}
              <View className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-md overflow-hidden">
                <View style={{ height: "100%" as any, width: `${pct}%`, backgroundColor: meta.color, borderRadius: 3 }} />
              </View>
              <Text className="text-xs text-slate-500 dark:text-slate-400" style={{ marginTop: 6 }}>
                {detail}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Accuracy strip */}
      <View
        testID="prediction-ai-factors-accuracy"
        className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl"
        style={{
          marginTop: 12,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons name="ribbon-outline" size={14} color="#10B981" />
        <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400" style={{ flex: 1 }}>
          Độ chính xác: {aiPrediction.accuracyMetrics.total_improvement} · Phase 3: {aiPrediction.accuracyMetrics.phase_3_accuracy}
        </Text>
      </View>
    </View>
  );
}
