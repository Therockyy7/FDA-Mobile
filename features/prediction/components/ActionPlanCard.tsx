import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";
import type { ActionPlan } from "../types/prediction.types";

interface ActionPlanCardProps {
  actionPlan: ActionPlan;
}

function getEvacuationColor(status: string): string {
  if (status === "CRITICAL") return "#DC2626";
  if (status === "RECOMMENDED") return "#EA580C";
  return "#16A34A";
}

export function ActionPlanCard({ actionPlan }: ActionPlanCardProps) {
  const evacuationColor = getEvacuationColor(actionPlan.evacuation_status);
  const safeEvacuationColor = evacuationColor || "#666666";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 500, duration: 500 }}
      testID="prediction-impact-action-plan-card"
    >
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-5" style={SHADOW.lg}>
        <SectionHeader
          title="Kế Hoạch Hành Động"
          testID="prediction-impact-action-plan-header"
          className="mb-5"
          rightAction={
            <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
              <Ionicons name="checkmark-done" size={20} color="#10B981" />
            </View>
          }
        />

        <View className="gap-2.5 mb-4">
          {actionPlan.immediate_actions.map((action, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -15 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", delay: 600 + index * 80, duration: 400 }}
              testID={`prediction-impact-action-item-${index}`}
            >
              <View className="flex-row items-start bg-slate-50 dark:bg-slate-700 rounded-xl p-3.5">
                <View className="w-6 h-6 rounded-full bg-emerald-500/10 items-center justify-center mr-2.5">
                  <Text className="text-xs font-black text-emerald-500">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                  {action}
                </Text>
              </View>
            </MotiView>
          ))}
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-3" testID="prediction-impact-alert-thresholds">
            <Ionicons name="alert-circle" size={18} color="#F59E0B" style={{ marginBottom: 6 }} />
            <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Ngưỡng cảnh báo
            </Text>
            <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-5">
              Mưa: {actionPlan.alert_thresholds.next_trigger_mm}mm{"\n"}
              Nước: {actionPlan.alert_thresholds.critical_water_level_m}m
            </Text>
          </View>

          <View
            className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: `${safeEvacuationColor}12`, borderWidth: 1, borderColor: `${safeEvacuationColor}30` }}
            testID="prediction-impact-evacuation-status"
          >
            <Ionicons
              name={actionPlan.evacuation_status === "Not required" ? "shield-checkmark" : "exit"}
              size={18}
              color={safeEvacuationColor}
              style={{ marginBottom: 6 }}
            />
            <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Di tản
            </Text>
            <Text className="text-[13px] font-black" style={{ color: safeEvacuationColor }}>
              {actionPlan.evacuation_status === "Not required" ? "Không cần" : actionPlan.evacuation_status}
            </Text>
          </View>
        </View>

        {actionPlan.manual_verification_required && (
          <View className="mt-3 flex-row items-center bg-amber-500/10 rounded-xl p-2.5 gap-2" testID="prediction-impact-manual-verification">
            <Ionicons name="eye" size={16} color="#F59E0B" />
            <Text className="text-xs font-semibold text-amber-500">Cần xác minh thủ công bởi chuyên gia</Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}
