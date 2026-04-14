// features/areas/components/charts/FloodStatisticsCard.tsx
// Summary statistics display with severity breakdown
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import { MAP_COLORS, SEVERITY_PALETTE, SHADOW } from "~/lib/design-tokens";
import type { FloodStatisticsData } from "~/features/areas/types/flood-history.types";
import { LoadingChart } from "./LoadingChart";

interface FloodStatisticsCardProps {
  data: FloodStatisticsData | null;
  isLoading?: boolean;
  isDark?: boolean;
  testID?: string;
}

// Severity display config — uses SEVERITY_PALETTE from design-tokens for colors
const SEVERITY_CONFIG = {
  safe:     { ...SEVERITY_PALETTE.safe,     label: "An toàn",  icon: "checkmark-circle" as const },
  caution:  { ...SEVERITY_PALETTE.caution,  label: "Chú ý",    icon: "alert-circle" as const },
  warning:  { ...SEVERITY_PALETTE.warning,  label: "Cảnh báo", icon: "warning" as const },
  critical: { ...SEVERITY_PALETTE.critical, label: "Nguy hiểm",icon: "alert" as const },
};

export function FloodStatisticsCard({
  data,
  isLoading = false,
  isDark = false,
  testID,
}: FloodStatisticsCardProps) {
  // JS-only exception: isDark prop for non-NativeWind contexts (chart library, dynamic styles)
  const theme = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
  const colors = {
    background: theme.card,
    text: theme.text,
    subtext: theme.subtext,
    border: theme.border,
    cardBg: isDark ? "#0B1A33" : theme.background,
    // Severity token shortcuts for JSX readability
    dangerBg: SEVERITY_PALETTE.critical.bg,
    safeBg: SEVERITY_PALETTE.safe.bg,
    cautionBg: SEVERITY_PALETTE.caution.bg,
    warningBg: SEVERITY_PALETTE.warning.bg,
    accentBg: "#DBEAFE", // blue-100 — JS-only exception for chart lib context
    dangerText: SEVERITY_PALETTE.critical.primary,
    safeText: SEVERITY_PALETTE.safe.primary,
    warningText: SEVERITY_PALETTE.warning.primary,
    accentText: theme.accent,
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
        color: SEVERITY_CONFIG.safe.primary,
        text: `${Math.round((hoursSafe / total) * 100)}%`,
      },
      {
        value: hoursCaution,
        color: SEVERITY_CONFIG.caution.primary,
        text: `${Math.round((hoursCaution / total) * 100)}%`,
      },
      {
        value: hoursWarning,
        color: SEVERITY_CONFIG.warning.primary,
        text: `${Math.round((hoursWarning / total) * 100)}%`,
      },
      {
        value: hoursCritical,
        color: SEVERITY_CONFIG.critical.primary,
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
        colors={isDark ? ["#1E3A5F", MAP_COLORS.dark.card] : ["#EFF6FF", MAP_COLORS.light.card]}
        style={{ padding: 16 }}
      >
        <View testID="areas-chart-statistics-root"
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
                    ? colors.safeBg
                    : dataQuality.completeness >= 95
                      ? colors.cautionBg
                      : colors.dangerBg,
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
                      ? colors.safeText
                      : dataQuality.completeness >= 95
                        ? SEVERITY_PALETTE.caution.text
                        : SEVERITY_PALETTE.critical.text,
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
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {/* Max level */}
          <View
            style={{
              width: "48%",
              backgroundColor: colors.cardBg,
              padding: 12,
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
                  backgroundColor: colors.dangerBg,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="arrow-up-bold"
                  size={18}
                  color={colors.dangerText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 11, color: colors.subtext }}
                  numberOfLines={1}
                >
                  Cao nhất
                </Text>
                <Text
                  style={{ fontSize: 17, fontWeight: "800", color: colors.dangerText }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {summary.maxWaterLevel.toFixed(2)}cm
                </Text>
              </View>
            </View>
          </View>

          {/* Min level */}
          <View
            style={{
              width: "48%",
              backgroundColor: colors.cardBg,
              padding: 12,
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
                  backgroundColor: colors.safeBg,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="arrow-down-bold"
                  size={18}
                  color={colors.safeText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 11, color: colors.subtext }}
                  numberOfLines={1}
                >
                  Thấp nhất
                </Text>
                <Text
                  style={{ fontSize: 17, fontWeight: "800", color: colors.safeText }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {summary.minWaterLevel.toFixed(2)}cm
                </Text>
              </View>
            </View>
          </View>

          {/* Average level */}
          <View
            style={{
              width: "48%",
              backgroundColor: colors.cardBg,
              padding: 12,
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
                  backgroundColor: colors.accentBg,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="analytics" size={18} color={colors.accentText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 11, color: colors.subtext }}
                  numberOfLines={1}
                >
                  Trung bình
                </Text>
                <Text
                  style={{ fontSize: 17, fontWeight: "800", color: colors.accentText }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {summary.avgWaterLevel.toFixed(2)}cm
                </Text>
              </View>
            </View>
          </View>

          {/* Flood hours */}
          <View
            style={{
              width: "48%",
              backgroundColor: colors.cardBg,
              padding: 12,
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
                  backgroundColor: colors.warningBg,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="time" size={18} color={colors.warningText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 11, color: colors.subtext }}
                  numberOfLines={1}
                >
                  Tổng giờ ngập
                </Text>
                <Text
                  style={{ fontSize: 17, fontWeight: "800", color: colors.warningText }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
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
                          backgroundColor: config.primary,
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
                          ? colors.dangerBg
                          : comparison.avgLevelChange < 0
                            ? colors.safeBg
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
                          ? colors.dangerText
                          : comparison.avgLevelChange < 0
                            ? colors.safeText
                            : colors.subtext
                      }
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color:
                          comparison.avgLevelChange > 0
                            ? colors.dangerText
                            : comparison.avgLevelChange < 0
                              ? colors.safeText
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
                          ? colors.dangerBg
                          : comparison.floodHoursChange < 0
                            ? colors.safeBg
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
                          ? colors.dangerText
                          : comparison.floodHoursChange < 0
                            ? colors.safeText
                            : colors.subtext
                      }
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color:
                          comparison.floodHoursChange > 0
                            ? colors.dangerText
                            : comparison.floodHoursChange < 0
                              ? colors.safeText
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
