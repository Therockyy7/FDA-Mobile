// features/areas/components/charts/FloodTrendChart.tsx
// Bar chart for flood trends visualization (daily/weekly/monthly)
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import { MAP_COLORS, SEVERITY_PALETTE, SHADOW } from "~/lib/design-tokens";
import type { FloodTrendsData } from "~/features/areas/types/flood-history.types";
import { LoadingChart } from "./LoadingChart";

const screenWidth = Dimensions.get("window").width;

interface FloodTrendChartProps {
  data: FloodTrendsData | null;
  isLoading?: boolean;
  isDark?: boolean;
  height?: number;
  testID?: string;
}

// JS values required by chart library — cannot use Tailwind classes here
const SEVERITY_COLORS = {
  safe:     SEVERITY_PALETTE.safe.primary,
  caution:  SEVERITY_PALETTE.caution.primary,
  warning:  SEVERITY_PALETTE.warning.primary,
  critical: SEVERITY_PALETTE.critical.primary,
};

export function FloodTrendChart({
  data,
  isLoading = false,
  isDark = false,
  height = 260,
  testID,
}: FloodTrendChartProps) {
  // JS-only exception: isDark prop for non-NativeWind contexts (chart library, dynamic styles)
  const theme = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
  const chartColors = {
    background: theme.card,
    text: theme.text,
    subtext: theme.subtext,
    border: theme.border,
    grid: isDark ? MAP_COLORS.dark.border : MAP_COLORS.light.border,
    positive: SEVERITY_COLORS.safe,
    negative: SEVERITY_COLORS.critical,
    accent: theme.accent,
    dangerBg: SEVERITY_PALETTE.critical.bg,
    safeBg: SEVERITY_PALETTE.safe.bg,
    tooltipBg: isDark ? MAP_COLORS.dark.background : theme.card,
  };

  const chartData = useMemo(() => {
    if (!data?.dataPoints?.length) return [];

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
              className="rounded-lg px-1 mb-0.5"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.9)" }}
            >
              <Text className="text-[11px] text-white font-bold">
                {point.floodHours}h
              </Text>
            </View>
          ) : null,
        labelTextStyle: {
          color: chartColors.subtext,
          fontSize: 9,
        },
      };
    });
  }, [data, chartColors.subtext]);

  if (isLoading) {
    return (
      <LoadingChart
        height={height}
        isDark={isDark}
        message="Đang tải xu hướng..."
        testID="areas-chart-trend-loading"
      />
    );
  }

  if (!data || !chartData.length) {
    return (
      <View
        testID={testID ?? "areas-chart-trend-empty"}
        className="rounded-2xl justify-center items-center border border-border-light dark:border-border-dark bg-white dark:bg-slate-800"
        style={{ height }}
      >
        <Ionicons name="trending-up-outline" size={40} color={chartColors.subtext} />
        <Text className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
          Không có dữ liệu xu hướng
        </Text>
      </View>
    );
  }

  const comparison = data.comparison;
  const avgChange = comparison?.avgLevelChange ?? 0;
  const floodHoursChange = comparison?.floodHoursChange ?? 0;

  return (
    <View
      testID={testID ?? "areas-chart-trend"}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-border-light dark:border-border-dark"
    >
      {/* Header */}
      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Xu hướng mực nước cao nhất
          </Text>
          <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {data.dataPoints.length} ngày gần đây
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
            {Number(data.summary.maxWaterLevel).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} cm
          </Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400">Cao nhất</Text>
        </View>
      </View>

      {/* Comparison badges */}
      {comparison && (
        <View className="flex-row gap-3 mb-4">
          <View
            testID="areas-chart-trend-avg-change"
            className="flex-1 flex-row items-center justify-center gap-1 rounded-lg px-2.5 py-1.5"
            style={{
              backgroundColor:
                avgChange > 0
                  ? chartColors.dangerBg
                  : avgChange < 0
                    ? chartColors.safeBg
                    : chartColors.border,
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
                  ? chartColors.negative
                  : avgChange < 0
                    ? chartColors.positive
                    : chartColors.subtext
              }
            />
            <Text
              className="text-[11px] font-semibold"
              style={{
                color:
                  avgChange > 0
                    ? chartColors.negative
                    : avgChange < 0
                      ? chartColors.positive
                      : chartColors.subtext,
              }}
            >
              {avgChange > 0 ? "+" : ""}
              {avgChange.toFixed(0)}% mực nước
            </Text>
          </View>

          <View
            testID="areas-chart-trend-flood-change"
            className="flex-1 flex-row items-center justify-center gap-1 rounded-lg px-2.5 py-1.5"
            style={{
              backgroundColor:
                floodHoursChange > 0
                  ? chartColors.dangerBg
                  : floodHoursChange < 0
                    ? chartColors.safeBg
                    : chartColors.border,
            }}
          >
            <Ionicons
              name="time-outline"
              size={12}
              color={
                floodHoursChange > 0
                  ? chartColors.negative
                  : floodHoursChange < 0
                    ? chartColors.positive
                    : chartColors.subtext
              }
            />
            <Text
              className="text-[11px] font-semibold"
              style={{
                color:
                  floodHoursChange > 0
                    ? chartColors.negative
                    : floodHoursChange < 0
                      ? chartColors.positive
                      : chartColors.subtext,
              }}
            >
              {floodHoursChange > 0 ? "+" : ""}
              {floodHoursChange.toFixed(0)}% giờ ngập
            </Text>
          </View>
        </View>
      )}

      {/* Chart */}
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
          maxValue={chartData.length > 0 ? Math.ceil(Math.max(...chartData.map((d) => d.value)) + 0.5) : 10}
          xAxisColor={chartColors.grid}
          yAxisColor={chartColors.grid}
          yAxisTextStyle={{ color: chartColors.subtext, fontSize: 11 }}
          xAxisLabelTextStyle={{ color: chartColors.subtext, fontSize: 11 }}
          rulesType="solid"
          rulesColor={chartColors.grid}
          barBorderRadius={4}
          showGradient
          gradientColor="rgba(59, 130, 246, 0.2)"
          frontColor={chartColors.accent}
          yAxisLabelSuffix=" Cm"
          yAxisLabelWidth={35}
          renderTooltip={(item: { value: number }, index: number) => {
            const point =
              data.dataPoints[
                data.dataPoints.length - chartData.length + index
              ];
            return (
              <View
                className="bg-white dark:bg-slate-900 rounded-lg border border-border-light dark:border-border-dark p-2"
                style={SHADOW.sm}
              >
                <Text className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                  {Number(item.value).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} cm
                </Text>
                {point && (
                  <Text className="text-[11px] text-slate-500 dark:text-slate-400">
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
        testID="areas-chart-trend-summary"
        className="flex-row justify-between mt-3 pt-3 border-t border-border-light dark:border-border-dark"
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="water-outline" size={16} color={chartColors.accent} />
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            <Text className="font-bold text-slate-800 dark:text-slate-100">
              {data.summary.totalFloodHours}
            </Text>{" "}
            giờ ngập tổng
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="calendar-outline" size={16} color={SEVERITY_COLORS.warning} />
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            <Text className="font-bold text-slate-800 dark:text-slate-100">
              {data.summary.daysWithFlooding}
            </Text>{" "}
            ngày có ngập
          </Text>
        </View>
      </View>
    </View>
  );
}
