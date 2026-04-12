import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { CommunityReport } from "../types/prediction.types";
import { useColorScheme } from "~/lib/useColorScheme";
import { useRouter } from "expo-router";

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
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const bg   = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text  = isDarkColorScheme ? "#F1F5F9" : "#0F172A";
  const divider = isDarkColorScheme ? "#334155" : "#E2E8F0";

  if (!reports || reports.length === 0) return null;

  const maxTrust = Math.max(1, ...reports.map(r => r.trustScore));

  return (
    <View style={{
      backgroundColor: bg, borderRadius: 20,
      padding: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    }}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => setIsExpanded(!isExpanded)}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: isExpanded ? 14 : 0, gap: 8 }}
      >
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: isDarkColorScheme ? "#0F172A" : "#FDF4FF",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="people-outline" size={16} color="#A855F7" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: text }}>Báo cáo cộng đồng</Text>
          <Text style={{ fontSize: 11, color: muted }}>{reports.length} báo cáo mới nhất</Text>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={muted} />
      </TouchableOpacity>

      {isExpanded && (
        <View style={{ gap: 8 }}>
          {reports.map((rep, idx) => {
            const sev = SEVERITY_CONFIG[rep.severity] ?? SEVERITY_CONFIG.low;
            const date = new Date(rep.createdAt);
            const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

            return (
              <React.Fragment key={rep.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: divider, marginBottom: 8 }} />}
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs)/map',
                      params: {
                        reportId: rep.id,
                        reportLat: rep.latitude.toString(),
                        reportLng: rep.longitude.toString(),
                        reportSeverity: rep.severity,
                        reportCreatedAt: rep.createdAt,
                      }
                    });
                  }}
                  style={{ flexDirection: "row", gap: 10 }}
                >
                  {/* Severity dot */}
                  <View style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: sev.color, marginTop: 5,
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: text, marginBottom: 4 }} numberOfLines={2}>
                      {rep.description || "Không có mô tả"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      {/* Severity pill */}
                      <View style={{
                        backgroundColor: `${sev.color}18`,
                        paddingHorizontal: 7, paddingVertical: 2,
                        borderRadius: 6,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: sev.color }}>{sev.label}</Text>
                      </View>
                      {/* Trust score */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="shield-checkmark-outline" size={10} color="#10B981" />
                        <Text style={{ fontSize: 10, color: muted }}>Trust {rep.trustScore}/{maxTrust}</Text>
                      </View>
                      {/* Time */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flex: 1 }}>
                        <Ionicons name="time-outline" size={10} color={muted} />
                        <Text style={{ fontSize: 10, color: muted }} numberOfLines={1}>{dateStr}</Text>
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
