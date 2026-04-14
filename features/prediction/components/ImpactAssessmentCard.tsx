import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Badge } from "~/components/ui/Badge";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";
import type { ImpactAssessment } from "../types/prediction.types";

interface ImpactAssessmentCardProps {
  impact: ImpactAssessment;
}

function getDepthColor(depthM: number): string {
  if (depthM >= 0.5) return "#DC2626";
  if (depthM >= 0.3) return "#EA580C";
  if (depthM >= 0.1) return "#CA8A04";
  return "#16A34A";
}

export function ImpactAssessmentCard({ impact }: ImpactAssessmentCardProps) {
  const depthColor = getDepthColor(impact.potential_depth_m);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 300, duration: 500 }}
      testID="prediction-impact-assessment-card"
    >
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5" style={SHADOW.lg}>
        <SectionHeader
          title="Đánh Giá Tác Động"
          testID="prediction-impact-assessment-header"
          className="mb-5"
          rightAction={
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: "#EA580C20" }}>
              <Ionicons name="warning" size={20} color="#EA580C" />
            </View>
          }
        />

        <View
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: `${depthColor}12`, borderLeftWidth: 4, borderLeftColor: depthColor }}
          testID="prediction-impact-depth-section"
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="water" size={20} color={depthColor} style={{ marginRight: 8 }} />
            <Text className="text-sm font-bold text-slate-500 dark:text-slate-400">Độ sâu ngập dự kiến</Text>
          </View>
          <Text className="text-4xl font-black mb-1" style={{ color: depthColor }}>
            {impact.potential_depth_m.toFixed(2)}<Text className="text-lg"> m</Text>
          </Text>
          <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-snug">
            {impact.depth_impact_description}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <View
            className="flex-1 rounded-xl p-3 items-center"
            style={{ minWidth: "45%", backgroundColor: impact.evacuation_needed ? "rgba(220, 38, 38, 0.15)" : "rgba(22, 163, 74, 0.15)" }}
            testID="prediction-impact-evacuation-badge"
          >
            <Ionicons
              name={impact.evacuation_needed ? "exit" : "shield-checkmark"}
              size={22}
              color={impact.evacuation_needed ? "#DC2626" : "#16A34A"}
            />
            <Badge
              label={impact.evacuation_needed ? "Cần Di Tản" : "Không Cần Di Tản"}
              variant={impact.evacuation_needed ? "danger" : "safe"}
              size="sm"
              className="mt-1.5"
              testID="prediction-impact-evacuation-badge-label"
            />
          </View>

          <View className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-3 items-center" style={{ minWidth: "45%" }} testID="prediction-impact-population">
            <Ionicons name="people" size={22} color="#3B82F6" />
            <Text className="text-base font-black text-slate-800 dark:text-slate-100 mt-1">
              {impact.estimated_affected_population.toLocaleString()}
            </Text>
            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center">Dân số ảnh hưởng</Text>
          </View>

          <View className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-3 items-center" style={{ minWidth: "45%" }} testID="prediction-impact-transportation">
            <Ionicons name="car" size={22} color="#8B5CF6" />
            <Text className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5 text-center">
              {typeof impact.transportation_impact === "string"
                ? impact.transportation_impact
                : (impact.transportation_impact as any)?.status || "N/A"}
            </Text>
            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Giao thông</Text>
          </View>

          <View className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-3 items-center" style={{ minWidth: "45%" }} testID="prediction-impact-structures">
            <Ionicons name="home" size={22} color="#F59E0B" />
            <Text className="text-base font-black text-slate-800 dark:text-slate-100 mt-1">
              {impact.affected_structures_estimate}
            </Text>
            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Công trình bị ảnh hưởng</Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
