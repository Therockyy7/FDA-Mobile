import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";
import type { ContributingStation } from "../types/prediction.types";

interface Props {
  stations: ContributingStation[];
}

const SEVERITY_CONFIG: Record<string, { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  safe:     { color: "#10B981", label: "An toàn",  icon: "checkmark-circle" },
  moderate: { color: "#F59E0B", label: "Cảnh báo", icon: "warning" },
  high:     { color: "#EF4444", label: "Nguy hiểm",icon: "alert-circle" },
  critical: { color: "#7C3AED", label: "Khẩn cấp", icon: "flash" },
};

export function StationsCard({ stations }: Props) {
  if (!stations || stations.length === 0) return null;

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl py-4" style={SHADOW.md} testID="prediction-forecast-stations-card">
      <SectionHeader
        title="Trạm đo lường"
        subtitle={`${stations.length} trạm đang giám sát`}
        testID="prediction-forecast-stations-header"
        className="mb-3.5 px-4"
        rightAction={
          <View className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-900 items-center justify-center">
            <Ionicons name="radio-outline" size={16} color="#3B82F6" />
          </View>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {stations.map((st) => {
          const sev = SEVERITY_CONFIG[st.severity] ?? SEVERITY_CONFIG.safe;
          return (
            <View
              key={st.stationId}
              className="w-40 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3"
              style={{ borderTopWidth: 3, borderTopColor: sev.color }}
              testID={`prediction-forecast-station-${st.stationId}`}
            >
              <View className="flex-row items-center mb-2.5 gap-1.5">
                <View className="items-center justify-center" style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: `${sev.color}22` }}>
                  <Ionicons name={sev.icon} size={13} color={sev.color} />
                </View>
                <Text className="text-xs font-black text-slate-800 dark:text-slate-100 flex-1">{st.stationCode}</Text>
              </View>

              <View className="mb-2">
                <Text className="text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">Mực nước</Text>
                <Text className="text-xl font-black" style={{ color: sev.color }}>{st.waterLevel} Cm</Text>
              </View>

              <View className="h-px bg-slate-200 dark:bg-slate-700 mb-2" />

              <View className="flex-row items-start gap-1">
                <Ionicons name="location-outline" size={10} color="#64748B" style={{ marginTop: 1 }} />
                <Text className="text-[10px] text-slate-500 dark:text-slate-400 flex-1" numberOfLines={2}>{st.street.name}</Text>
              </View>

              <View className="mt-2 px-2 py-0.5 rounded-lg self-start" style={{ backgroundColor: `${sev.color}22` }}>
                <Text className="text-[10px] font-bold" style={{ color: sev.color }}>{sev.label}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
