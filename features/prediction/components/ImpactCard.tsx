import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";
import type { AiPrediction } from "../types/prediction.types";

interface Props {
  aiPrediction: AiPrediction;
}

export function ImpactCard({ aiPrediction }: Props) {
  const impact = aiPrediction.impact;

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4" style={SHADOW.md} testID="prediction-impact-card">
      <SectionHeader
        title="Đánh giá tác động"
        testID="prediction-impact-card-header"
        className="mb-3.5"
        rightAction={
          <View className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-slate-900 items-center justify-center">
            <Ionicons name="flash-outline" size={16} color="#F97316" />
          </View>
        }
      />

      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 items-center" testID="prediction-impact-card-depth">
          <View className="w-9 h-9 rounded-xl bg-blue-500/15 items-center justify-center mb-2">
            <Ionicons name="water" size={18} color="#3B82F6" />
          </View>
          <Text className="text-lg font-black text-blue-500">{impact.estimated_depth_m}m</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-0.5">Độ sâu ước tính</Text>
        </View>
        <View className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 items-center" testID="prediction-impact-card-area">
          <View className="w-9 h-9 rounded-xl bg-amber-500/15 items-center justify-center mb-2">
            <Ionicons name="map-outline" size={18} color="#F59E0B" />
          </View>
          <Text className="text-lg font-black text-amber-500">{impact.estimated_area_affected}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-0.5">Diện tích ảnh hưởng</Text>
        </View>
      </View>
    </View>
  );
}
