// features/areas/components/charts/FloodStatisticsCard.tsx
// Summary statistics display with severity breakdown
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import type { FloodStatisticsData } from "~/features/areas/types/flood-history.types";
import { LoadingChart } from "./LoadingChart";

interface FloodStatisticsCardProps {
  data: FloodStatisticsData | null;
  isLoading?: boolean;
  isDark?: boolean;
}

const SEVERITY_CONFIG = {
  safe: {
    color: "#10B981",
    bg: "#D1FAE5",
    label: "An toàn",
    icon: "checkmark-circle",
  },
  caution: {
    color: "#FBBF24",
    bg: "#FEF3C7",
    label: "Chú ý",
    icon: "alert-circle",
  },
  warning: {
    color: "#F97316",
    bg: "#FFEDD5",
    label: "Cảnh báo",
    icon: "warning",
  },
  critical: {
    color: "#EF4444",
    bg: "#FEE2E2",
    label: "Nguy hiểm",
    icon: "alert",
  },
};

export function FloodStatisticsCard({
  data,
  isLoading = false,
  isDark = false,
}: FloodStatisticsCardProps) {
  const colors = {
    background: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E2E8F0",
    cardBg: isDark ? "#0F172A" : "#F8FAFC",
  };

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (!data?.severityBreakdown) return [];

    const { hoursSafe, hoursCaution, hoursWarning, hoursCritical } =
      data.severityBreakdown;
    const total = hoursSafe + hoursCaution + hoursWarning + hoursCritical || 1;

    return [
      {
        value: hoursSafe,
        color: SEVERITY_CONFIG.safe.color,
        text: `${Math.round((hoursSafe / total) * 100)}%`,
      },
      {
        value: hoursCaution,
        color: SEVERITY_CONFIG.caution.color,
        text: `${Math.round((hoursCaution / total) * 100)}%`,
      },
      {
        value: hoursWarning,
        color: SEVERITY_CONFIG.warning.color,
        text: `${Math.round((hoursWarning / total) * 100)}%`,
      },
      {
        value: hoursCritical,
        color: SEVERITY_CONFIG.critical.color,
        text: `${Math.round((hoursCritical / total) * 100)}%`,
      },
    ].filter((item) => item.value > 0);
  }, [data]);

  if (isLoading) {
    return (
      <LoadingChart
        height={320}
        isDark={isDark}
        message="Đang tải thống kê..."
      />
    );
  }

  if (!data) {
    return (
      <View
        style={{
          height: 200,
          backgroundColor: colors.background,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons name="stats-chart-outline" size={40} color={colors.subtext} />
        <Text style={{ color: colors.subtext, marginTop: 12, fontSize: 14 }}>
          Không có dữ liệu thống kê
        </Text>
      </View>
    );
  }

  const { summary, severityBreakdown, comparison, dataQuality } = data;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={isDark ? ["#1E3A5F", "#1E293B"] : ["#EFF6FF", "#FFFFFF"]}
        style={{ padding: 16 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
            >
              Thống kê mực nước
            </Text>
            <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 2 }}>
              {new Date(data.periodStart).toLocaleDateString("vi-VN")} -{" "}
              {new Date(data.periodEnd).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          {dataQuality && (
            <View
              style={{
                backgroundColor:
                  dataQuality.completeness >= 99
                    ? "#D1FAE5"
                    : dataQuality.completeness >= 95
                      ? "#FEF3C7"
                      : "#FEE2E2",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color:
                    dataQuality.completeness >= 99
                      ? "#059669"
                      : dataQuality.completeness >= 95
                        ? "#D97706"
                        : "#DC2626",
                }}
              >
                {dataQuality.completeness.toFixed(1)}% dữ liệu
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Main stats grid */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {/* Max level */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: colors.cardBg,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="arrow-up-bold"
                  size={18}
                  color="#EF4444"
                />
              </View>
              <View>
                <Text style={{ fontSize: 10, color: colors.subtext }}>
                  Mực nước cao nhất
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#EF4444" }}
                >
                  {Math.round(summary.maxWaterLevel * 100)}cm
                </Text>
              </View>
            </View>
          </View>

          {/* Min level */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: colors.cardBg,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#D1FAE5",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="arrow-down-bold"
                  size={18}
                  color="#10B981"
                />
              </View>
              <View>
                <Text style={{ fontSize: 10, color: colors.subtext }}>
                  Mực nước thấp nhất
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#10B981" }}
                >
                  {Math.round(summary.minWaterLevel * 100)}cm
                </Text>
              </View>
            </View>
          </View>

          {/* Average level */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: colors.cardBg,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#DBEAFE",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="analytics" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={{ fontSize: 10, color: colors.subtext }}>
                  Mực nước trung bình
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#3B82F6" }}
                >
                  {Math.round(summary.avgWaterLevel * 100)}cm
                </Text>
              </View>
            </View>
          </View>

          {/* Flood hours */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: colors.cardBg,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#FFEDD5",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="time" size={18} color="#F97316" />
              </View>
              <View>
                <Text style={{ fontSize: 10, color: colors.subtext }}>
                  Tổng giờ ngập
                </Text>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#F97316" }}
                >
                  {summary.totalFloodHours}h
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Severity breakdown pie chart */}
        {severityBreakdown && pieData.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Phân bổ mức cảnh báo
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Pie chart */}
              <View style={{ alignItems: "center" }}>
                <PieChart
                  data={pieData}
                  donut
                  radius={60}
                  innerRadius={35}
                  innerCircleColor={colors.background}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "800",
                          color: colors.text,
                        }}
                      >
                        {summary.totalReadings}
                      </Text>
                      <Text style={{ fontSize: 9, color: colors.subtext }}>
                        điểm đo
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Legend */}
              <View style={{ flex: 1, marginLeft: 20, gap: 8 }}>
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
                  const hours =
                    key === "safe"
                      ? severityBreakdown.hoursSafe
                      : key === "caution"
                        ? severityBreakdown.hoursCaution
                        : key === "warning"
                          ? severityBreakdown.hoursWarning
                          : severityBreakdown.hoursCritical;

                  if (hours === 0) return null;

                  return (
                    <View
                      key={key}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: config.color,
                        }}
                      />
                      <Text
                        style={{ fontSize: 12, color: colors.subtext, flex: 1 }}
                      >
                        {config.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: colors.text,
                        }}
                      >
                        {hours}h
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Comparison with previous period */}
        {comparison &&
          (comparison.avgLevelChange !== undefined ||
            comparison.floodHoursChange !== undefined) && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text
                style={{ fontSize: 11, color: colors.subtext, marginBottom: 8 }}
              >
                So với kỳ trước
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {comparison.avgLevelChange !== undefined && (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      backgroundColor:
                        comparison.avgLevelChange > 0
                          ? "#FEE2E2"
                          : comparison.avgLevelChange < 0
                            ? "#D1FAE5"
                            : colors.cardBg,
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons
                      name={
                        comparison.avgLevelChange > 0
                          ? "arrow-up"
                          : comparison.avgLevelChange < 0
                            ? "arrow-down"
                            : "remove"
                      }
                      size={16}
                      color={
                        comparison.avgLevelChange > 0
                          ? "#EF4444"
                          : comparison.avgLevelChange < 0
                            ? "#10B981"
                            : colors.subtext
                      }
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color:
                          comparison.avgLevelChange > 0
                            ? "#EF4444"
                            : comparison.avgLevelChange < 0
                              ? "#10B981"
                              : colors.subtext,
                      }}
                    >
                      {comparison.avgLevelChange > 0 ? "+" : ""}
                      {comparison.avgLevelChange.toFixed(0)}%
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.subtext }}>
                      mực nước
                    </Text>
                  </View>
                )}
                {comparison.floodHoursChange !== undefined && (
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      backgroundColor:
                        comparison.floodHoursChange > 0
                          ? "#FEE2E2"
                          : comparison.floodHoursChange < 0
                            ? "#D1FAE5"
                            : colors.cardBg,
                      paddingVertical: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons
                      name={
                        comparison.floodHoursChange > 0
                          ? "arrow-up"
                          : comparison.floodHoursChange < 0
                            ? "arrow-down"
                            : "remove"
                      }
                      size={16}
                      color={
                        comparison.floodHoursChange > 0
                          ? "#EF4444"
                          : comparison.floodHoursChange < 0
                            ? "#10B981"
                            : colors.subtext
                      }
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color:
                          comparison.floodHoursChange > 0
                            ? "#EF4444"
                            : comparison.floodHoursChange < 0
                              ? "#10B981"
                              : colors.subtext,
                      }}
                    >
                      {comparison.floodHoursChange > 0 ? "+" : ""}
                      {comparison.floodHoursChange.toFixed(0)}%
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.subtext }}>
                      giờ ngập
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
      </View>
    </View>
  );
}
