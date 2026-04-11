import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { ContributingStation } from "../types/prediction.types";

interface Props {
  stations: ContributingStation[];
}

const SEVERITY_CONFIG: Record<
  string,
  { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  safe: { color: "#10B981", label: "An toàn", icon: "checkmark-circle" },
  moderate: { color: "#F59E0B", label: "Cảnh báo", icon: "warning" },
  high: { color: "#EF4444", label: "Nguy hiểm", icon: "alert-circle" },
  critical: { color: "#7C3AED", label: "Khẩn cấp", icon: "flash" },
};

export function StationsCard({ stations }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const bg = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text = isDarkColorScheme ? "#F1F5F9" : "#0F172A";
  const sub = isDarkColorScheme ? "#0F172A" : "#F8FAFC";
  const divider = isDarkColorScheme ? "#334155" : "#E2E8F0";

  if (!stations || stations.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isDarkColorScheme ? "#0F172A" : "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="radio-outline" size={16} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: text }}>
            Trạm đo lường
          </Text>
          <Text style={{ fontSize: 11, color: muted }}>
            {stations.length} trạm đang giám sát
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {stations.map((st, idx) => {
          const sev = SEVERITY_CONFIG[st.severity] ?? SEVERITY_CONFIG.safe;
          return (
            <View
              key={st.stationId}
              style={{
                width: 160,
                backgroundColor: sub,
                borderRadius: 16,
                padding: 12,
                borderTopWidth: 3,
                borderTopColor: sev.color,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    backgroundColor: `${sev.color}22`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={sev.icon} size={13} color={sev.color} />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: text,
                    flex: 1,
                  }}
                >
                  {st.stationCode}
                </Text>
              </View>

              {/* Water level */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: muted, marginBottom: 2 }}>
                  Mực nước
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "900", color: sev.color }}
                >
                  {st.waterLevel} Cm
                </Text>
              </View>

              <View
                style={{ height: 1, backgroundColor: divider, marginBottom: 8 }}
              />

              {/* Street */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 4,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={10}
                  color={muted}
                  style={{ marginTop: 1 }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: muted,
                    flex: 1,
                    lineHeight: 14,
                  }}
                  numberOfLines={2}
                >
                  {st.street.name}
                </Text>
              </View>

              {/* Status pill */}
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: `${sev.color}22`,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{ fontSize: 10, fontWeight: "700", color: sev.color }}
                >
                  {sev.label}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
