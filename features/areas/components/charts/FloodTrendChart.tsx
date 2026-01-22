// features/areas/components/charts/FloodTrendChart.tsx
// Bar chart for flood trends visualization (daily/weekly/monthly)
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import type { FloodTrendsData } from "~/features/areas/types/flood-history.types";
import { LoadingChart } from "./LoadingChart";

const screenWidth = Dimensions.get("window").width;

interface FloodTrendChartProps {
  data: FloodTrendsData | null;
  isLoading?: boolean;
  isDark?: boolean;
  height?: number;
}

const SEVERITY_COLORS = {
  safe: "#10B981",
  caution: "#FBBF24",
  warning: "#F97316",
  critical: "#EF4444",
};

export function FloodTrendChart({
  data,
  isLoading = false,
  isDark = false,
  height = 260,
}: FloodTrendChartProps) {
  const colors = {
    background: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E2E8F0",
    grid: isDark ? "#334155" : "#E5E7EB",
    positive: "#10B981",
    negative: "#EF4444",
  };

  // Transform data for bar chart
  const chartData = useMemo(() => {
    if (!data?.dataPoints?.length) return [];

    // Take last 14 days or all data if less
    const points = data.dataPoints.slice(-14);

    return points.map((point, index) => {
      const date = new Date(point.periodStart);
      const dayNum = date.getDate();
      const showLabel = index % 2 === 0 || points.length <= 7;

      return {
        value: Math.round(point.maxLevel * 100) / 100,
        label: showLabel ? `${dayNum}` : "",
        frontColor: SEVERITY_COLORS[point.peakSeverity] || SEVERITY_COLORS.safe,
        topLabelComponent: () =>
          point.floodHours > 0 ? (
            <View
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.9)",
                borderRadius: 8,
                paddingHorizontal: 4,
                paddingVertical: 1,
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: 8, color: "#FFF", fontWeight: "700" }}>
                {point.floodHours}h
              </Text>
            </View>
          ) : null,
        labelTextStyle: {
          color: colors.subtext,
          fontSize: 9,
        },
      };
    });
  }, [data, colors.subtext]);

  if (isLoading) {
    return (
      <LoadingChart
        height={height}
        isDark={isDark}
        message="Đang tải xu hướng..."
      />
    );
  }

  if (!data || !chartData.length) {
    return (
      <View
        style={{
          height,
          backgroundColor: colors.background,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons name="trending-up-outline" size={40} color={colors.subtext} />
        <Text style={{ color: colors.subtext, marginTop: 12, fontSize: 14 }}>
          Không có dữ liệu xu hướng
        </Text>
      </View>
    );
  }

  // Comparison indicator
  const comparison = data.comparison;
  const avgChange = comparison?.avgLevelChange ?? 0;
  const floodHoursChange = comparison?.floodHoursChange ?? 0;

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
            Xu hướng mực nước cao nhất
          </Text>
          <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 2 }}>
            {data.dataPoints.length} ngày gần đây
          </Text>
        </View>

        {/* Summary stats */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
            {Math.round(data.summary.maxWaterLevel * 100)}cm
          </Text>
          <Text style={{ fontSize: 10, color: colors.subtext }}>Cao nhất</Text>
        </View>
      </View>

      {/* Comparison badges */}
      {comparison && (
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor:
                avgChange > 0
                  ? "#FEE2E2"
                  : avgChange < 0
                    ? "#D1FAE5"
                    : colors.border,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Ionicons
              name={
                avgChange > 0
                  ? "trending-up"
                  : avgChange < 0
                    ? "trending-down"
                    : "remove"
              }
              size={14}
              color={
                avgChange > 0
                  ? colors.negative
                  : avgChange < 0
                    ? colors.positive
                    : colors.subtext
              }
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color:
                  avgChange > 0
                    ? colors.negative
                    : avgChange < 0
                      ? colors.positive
                      : colors.subtext,
              }}
            >
              {avgChange > 0 ? "+" : ""}
              {avgChange.toFixed(0)}% mực nước
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor:
                floodHoursChange > 0
                  ? "#FEE2E2"
                  : floodHoursChange < 0
                    ? "#D1FAE5"
                    : colors.border,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Ionicons
              name="time-outline"
              size={12}
              color={
                floodHoursChange > 0
                  ? colors.negative
                  : floodHoursChange < 0
                    ? colors.positive
                    : colors.subtext
              }
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color:
                  floodHoursChange > 0
                    ? colors.negative
                    : floodHoursChange < 0
                      ? colors.positive
                      : colors.subtext,
              }}
            >
              {floodHoursChange > 0 ? "+" : ""}
              {floodHoursChange.toFixed(0)}% giờ ngập
            </Text>
          </View>
        </View>
      )}

      {/* Chart - wrapped to prevent overflow */}
      <View
        style={{
          overflow: "hidden",
          marginHorizontal: -8,
          paddingHorizontal: 8,
        }}
      >
        <BarChart
          data={chartData}
          width={screenWidth - 100}
          height={height - 160}
          barWidth={Math.max(12, (screenWidth - 140) / chartData.length - 8)}
          spacing={Math.max(4, (screenWidth - 140) / chartData.length / 4)}
          initialSpacing={10}
          endSpacing={10}
          noOfSections={4}
          maxValue={Math.ceil(Math.max(...chartData.map((d) => d.value)) + 0.5)}
          xAxisColor={colors.grid}
          yAxisColor={colors.grid}
          yAxisTextStyle={{ color: colors.subtext, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.subtext, fontSize: 9 }}
          rulesType="solid"
          rulesColor={colors.grid}
          barBorderRadius={4}
          showGradient
          gradientColor="rgba(59, 130, 246, 0.2)"
          frontColor="#3B82F6"
          yAxisLabelSuffix="m"
          yAxisLabelWidth={35}
          renderTooltip={(item: { value: number }, index: number) => {
            const point =
              data.dataPoints[
                data.dataPoints.length - chartData.length + index
              ];
            return (
              <View
                style={{
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  padding: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {Math.round(item.value * 100)}cm
                </Text>
                {point && (
                  <Text style={{ fontSize: 9, color: colors.subtext }}>
                    {point.floodHours > 0
                      ? `${point.floodHours} giờ ngập`
                      : "Không ngập"}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>

      {/* Flood hours summary */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="water-outline" size={16} color="#3B82F6" />
          <Text style={{ fontSize: 12, color: colors.subtext }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {data.summary.totalFloodHours}
            </Text>{" "}
            giờ ngập tổng
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={16} color="#F97316" />
          <Text style={{ fontSize: 12, color: colors.subtext }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {data.summary.daysWithFlooding}
            </Text>{" "}
            ngày có ngập
          </Text>
        </View>
      </View>
    </View>
  );
}
