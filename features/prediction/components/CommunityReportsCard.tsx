import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";
import { useRouter } from "expo-router";
import type { CommunityReport } from "../types/prediction.types";

interface Props {
  reports: CommunityReport[];
}

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  low:      { color: "#10B981", label: "Nhẹ" },
  moderate: { color: "#F59E0B", label: "Vừa" },
  high:     { color: "#EF4444", label: "Cao" },
  critical: { color: "#7C3AED", label: "Khẩn" },
};

export function CommunityReportsCard({ reports }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!reports || reports.length === 0) return null;

  const maxTrust = Math.max(1, ...reports.map((r) => r.trustScore));

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4" style={SHADOW.md} testID="prediction-forecast-community-reports-card">
      <TouchableOpacity activeOpacity={0.7} onPress={() => setIsExpanded(!isExpanded)} testID="prediction-forecast-community-reports-toggle">
        <SectionHeader
          title="Báo cáo cộng đồng"
          subtitle={`${reports.length} báo cáo mới nhất`}
          testID="prediction-forecast-community-reports-header"
          className={isExpanded ? "mb-3.5" : ""}
          rightAction={
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-slate-900 items-center justify-center">
                <Ionicons name="people-outline" size={16} color="#A855F7" />
              </View>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
            </View>
          }
        />
      </TouchableOpacity>

      {isExpanded && (
        <View className="gap-2">
          {reports.map((rep, idx) => {
            const sev = SEVERITY_CONFIG[rep.severity] ?? SEVERITY_CONFIG.low;
            const dateStr = new Date(rep.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
            });
            return (
              <React.Fragment key={rep.id}>
                {idx > 0 && <View className="h-px bg-slate-200 dark:bg-slate-700" />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/map",
                      params: {
                        reportId: rep.id,
                        reportLat: rep.latitude.toString(),
                        reportLng: rep.longitude.toString(),
                        reportSeverity: rep.severity,
                        reportCreatedAt: rep.createdAt,
                      },
                    })
                  }
                  className="flex-row gap-2.5 py-1"
                  testID={`prediction-forecast-community-report-${rep.id}`}
                >
                  <View className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: sev.color }} />
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1" numberOfLines={2}>
                      {rep.description || "Không có mô tả"}
                    </Text>
                    <View className="flex-row items-center gap-2.5 flex-wrap">
                      <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${sev.color}18` }}>
                        <Text className="text-[10px] font-bold" style={{ color: sev.color }}>{sev.label}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="shield-checkmark-outline" size={10} color="#10B981" />
                        <Text className="text-[10px] text-slate-500 dark:text-slate-400">Trust {rep.trustScore}/{maxTrust}</Text>
                      </View>
                      <View className="flex-row items-center gap-0.5 flex-1">
                        <Ionicons name="time-outline" size={10} color="#64748B" />
                        <Text className="text-[10px] text-slate-500 dark:text-slate-400" numberOfLines={1}>{dateStr}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}
