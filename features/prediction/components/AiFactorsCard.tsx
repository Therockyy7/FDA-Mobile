import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { AiPrediction } from "../types/prediction.types";
import { useColorScheme } from "~/lib/useColorScheme";

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
  const { isDarkColorScheme } = useColorScheme();
  const bg   = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text  = isDarkColorScheme ? "#F1F5F9" : "#0F172A";
  const sub   = isDarkColorScheme ? "#334155" : "#F1F5F9";

  return (
    <View style={{
      backgroundColor: bg, borderRadius: 20,
      padding: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: isDarkColorScheme ? "#0F172A" : "#FEF3C7",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="git-merge-outline" size={16} color="#F59E0B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: text }}>Phân tích yếu tố AI</Text>
          <Text style={{ fontSize: 11, color: muted }}>
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
            <View key={meta.key} style={{
              backgroundColor: sub, borderRadius: 14, padding: 12,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: meta.bg,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={meta.icon} size={15} color={meta.color} />
                </View>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: "700", color: text }}>{meta.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: "900", color: meta.color }}>{pct}%</Text>
              </View>
              {/* Progress bar */}
              <View style={{ height: 5, backgroundColor: isDarkColorScheme ? "#1E293B" : "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                <View style={{ height: 5, width: `${pct}%`, backgroundColor: meta.color, borderRadius: 4 }} />
              </View>
              <Text style={{ fontSize: 11, color: muted, marginTop: 6 }}>{detail}</Text>
            </View>
          );
        })}
      </View>

      {/* Accuracy strip */}
      <View style={{
        marginTop: 12,
        backgroundColor: isDarkColorScheme ? "#0F172A" : "#F0FDF4",
        borderRadius: 12, padding: 10,
        flexDirection: "row", alignItems: "center", gap: 8,
      }}>
        <Ionicons name="ribbon-outline" size={14} color="#10B981" />
        <Text style={{ fontSize: 11, color: isDarkColorScheme ? "#6EE7B7" : "#059669", fontWeight: "600", flex: 1 }}>
          Độ chính xác: {aiPrediction.accuracyMetrics.total_improvement} · Phase 3: {aiPrediction.accuracyMetrics.phase_3_accuracy}
        </Text>
      </View>
    </View>
  );
}
