import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";

interface Recommendation {
  icon: string;
  title: string;
  description: string;
  items: string[];
}

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 400, duration: 500 }}
      testID="prediction-impact-recommendations-card"
    >
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5" style={SHADOW.lg}>
        <SectionHeader
          title="Khuyến Nghị Hành Động"
          testID="prediction-impact-recommendations-header"
          className="mb-5"
          rightAction={
            <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
              <Ionicons name="checkmark-done" size={20} color="#10B981" />
            </View>
          }
        />

        {recommendations.map((rec, recIndex) => (
          <View key={recIndex} className="mb-5">
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", delay: 500 + recIndex * 100, duration: 400 }}
              testID={`prediction-impact-rec-title-${recIndex}`}
            >
              <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#10B98110", borderLeftWidth: 4, borderLeftColor: "#10B981" }}>
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">{rec.icon}</Text>
                  <Text className="flex-1 text-base font-black text-emerald-500">{rec.title}</Text>
                </View>
                {rec.description && (
                  <Text className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">{rec.description}</Text>
                )}
              </View>
            </MotiView>

            {rec.items.length > 0 && (
              <View className="gap-2.5">
                {rec.items.map((item, itemIndex) => (
                  <MotiView
                    key={itemIndex}
                    from={{ opacity: 0, translateX: -15 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: "timing", delay: 600 + recIndex * 100 + itemIndex * 80, duration: 400 }}
                    testID={`prediction-impact-rec-item-${recIndex}-${itemIndex}`}
                  >
                    <View className="flex-row items-start bg-slate-50 dark:bg-slate-700 rounded-xl p-3.5 pl-4">
                      <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-3" />
                      <Text className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">{item}</Text>
                    </View>
                  </MotiView>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </MotiView>
  );
}
