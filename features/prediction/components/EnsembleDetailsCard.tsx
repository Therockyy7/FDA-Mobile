import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SHADOW } from "~/lib/design-tokens";
import type {
  ConfidenceBreakdown,
  DataQuality,
  ModelInfo,
  WeightingStrategy,
} from "../types/prediction.types";

interface EnsembleDetailsCardProps {
  modelInfo: ModelInfo;
  confidenceBreakdown: ConfidenceBreakdown;
  dataQuality: DataQuality;
  weightingStrategy: WeightingStrategy;
  aiProbability: number;
  physicsProbability: number;
}

export function EnsembleDetailsCard({
  modelInfo,
  confidenceBreakdown,
  dataQuality,
  weightingStrategy,
  aiProbability,
  physicsProbability,
}: EnsembleDetailsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const qualityItems = [
    {
      label: "Lịch sử mưa",
      value: dataQuality.rainfall_history_quality,
      icon: "rainy" as const,
    },
    {
      label: "Độ mới cảm biến",
      value: 1 - dataQuality.sensor_staleness,
      icon: "hardware-chip" as const,
    },
    {
      label: "Chất lượng địa hình",
      value: dataQuality.terrain_quality,
      icon: "map" as const,
    },
  ];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 400, duration: 500 }}
    >
      <View
        testID="prediction-ensemble-card"
        className="bg-white dark:bg-slate-800 rounded-3xl p-5"
        style={SHADOW.lg}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="brain"
              size={22}
              color="white"
            />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text
              testID="prediction-ensemble-title"
              className="text-lg font-extrabold text-gray-800 dark:text-slate-100"
            >
              Chi Tiết Mô Hình
            </Text>
            <Text
              testID="prediction-ensemble-version"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5"
            >
              {modelInfo.ensemble_version}
            </Text>
          </View>
        </View>

        {/* Model Badges */}
        <View
          testID="prediction-ensemble-badges"
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}
        >
          <View
            className="bg-indigo-100 dark:bg-indigo-900/40"
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
          >
            <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              🧠 {modelInfo.ai_model.split("(")[0].trim()}
            </Text>
          </View>
          <View
            className="bg-cyan-100 dark:bg-cyan-900/40"
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
          >
            <Text className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              ⚙️ {modelInfo.physics_model.split("+")[0].trim()}
            </Text>
          </View>
          <View
            className="bg-emerald-100 dark:bg-emerald-900/40"
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}
          >
            <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              🛰️ {modelInfo.satellite_model.split("(")[0].trim()}
            </Text>
          </View>
        </View>

        {/* AI vs Physics comparison */}
        <View
          testID="prediction-ensemble-comparison"
          className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3.5 mb-4"
        >
          <Text
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5"
          >
            So Sánh Mô Hình
          </Text>

          {/* AI bar */}
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                AI ({(weightingStrategy.ai_weight * 100).toFixed(0)}%)
              </Text>
              <Text className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {(aiProbability * 100).toFixed(1)}%
              </Text>
            </View>
            <View className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-md">
              <View
                style={{
                  height: "100%" as any,
                  width: `${Math.min(aiProbability * 100, 100)}%`,
                  backgroundColor: "#6366F1",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          {/* Physics bar */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                Vật Lý ({(weightingStrategy.physics_weight * 100).toFixed(0)}%)
              </Text>
              <Text className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                {(physicsProbability * 100).toFixed(1)}%
              </Text>
            </View>
            <View className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-md">
              <View
                style={{
                  height: "100%" as any,
                  width: `${Math.min(physicsProbability * 100, 100)}%`,
                  backgroundColor: "#06B6D4",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        </View>

        {/* Data Quality */}
        <View
          testID="prediction-ensemble-quality"
          style={{ marginBottom: 12 }}
        >
          <Text
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5"
          >
            Chất Lượng Dữ Liệu
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {qualityItems.map((item) => {
              const pct = item.value * 100;
              const color = pct >= 80 ? "#16A34A" : pct >= 50 ? "#CA8A04" : "#DC2626";
              return (
                <View
                  key={item.label}
                  testID={`prediction-ensemble-quality-${item.label}`}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-2.5 items-center"
                >
                  <Ionicons name={item.icon as any} size={18} color={color} />
                  <Text
                    style={{ fontSize: 16, fontWeight: "900", color, marginTop: 4 }}
                  >
                    {pct.toFixed(0)}%
                  </Text>
                  <Text
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center mt-0.5"
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 4,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#94A3B8"
            />
            <Text
              className="text-xs font-medium text-slate-400 dark:text-slate-500"
            >
              Nguồn mưa 12h: {dataQuality.rainfall_12h_source}
            </Text>
          </View>
        </View>

        {/* Expandable confidence breakdown */}
        <TouchableOpacity
          testID="prediction-ensemble-expand"
          onPress={() => setExpanded(!expanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTopWidth: 1,
          }}
          className="border-slate-200 dark:border-slate-700"
        >
          <Text
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
          >
            Phân tích tin cậy chi tiết
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {expanded && (
          <View
            testID="prediction-ensemble-breakdown"
            style={{ marginTop: 12, gap: 8 }}
          >
            {Object.entries(confidenceBreakdown.breakdown_components).map(
              ([key, comp]) => (
                <View
                  key={key}
                  className="bg-slate-50 dark:bg-slate-700 rounded-xl p-2.5"
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text
                      className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize"
                    >
                      {key.replace(/_/g, " ")}
                    </Text>
                    <Text
                      className={
                        comp.confidence === "Very High" || comp.confidence === "High"
                          ? "text-xs font-extrabold text-green-700 dark:text-green-400"
                          : comp.confidence === "Medium"
                            ? "text-xs font-extrabold text-amber-600 dark:text-amber-400"
                            : "text-xs font-extrabold text-red-600 dark:text-red-400"
                      }
                    >
                      {comp.confidence}
                    </Text>
                  </View>
                  {comp.reason && (
                    <Text
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-4"
                    >
                      {comp.reason}
                    </Text>
                  )}
                </View>
              ),
            )}
            {/* Rationale */}
            <Text
              className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-4 italic mt-1"
            >
              {confidenceBreakdown.confidence_rationale}
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}
