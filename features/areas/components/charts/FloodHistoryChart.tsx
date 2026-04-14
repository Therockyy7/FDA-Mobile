// features/areas/components/charts/FloodHistoryChart.tsx
// Line chart for flood history visualization (24h/7d data)
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import { MAP_COLORS, SEVERITY_PALETTE, SHADOW } from "~/lib/design-tokens";
import type { FloodHistoryData } from "~/features/areas/types/flood-history.types";
import { LoadingChart } from "./LoadingChart";

const screenWidth = Dimensions.get("window").width;

interface FloodHistoryChartProps {
  data: FloodHistoryData | null;
  isLoading?: boolean;
  isDark?: boolean;
  height?: number;
}

// Severity color thresholds (in meters)
const SEVERITY_THRESHOLDS = {
  safe: 1.0,
  caution: 1.5,
  warning: 2.0,
  critical: 2.5,
};

const SEVERITY_COLORS = {
  safe:     SEVERITY_PALETTE.safe.primary,
  caution:  SEVERITY_PALETTE.caution.primary,
  warning:  SEVERITY_PALETTE.warning.primary,
  critical: SEVERITY_PALETTE.critical.primary,
};

function getSeverityColor(valueMeters: number): string {
  if (valueMeters >= SEVERITY_THRESHOLDS.critical)
    return SEVERITY_COLORS.critical;
  if (valueMeters >= SEVERITY_THRESHOLDS.warning)
    return SEVERITY_COLORS.warning;
  if (valueMeters >= SEVERITY_THRESHOLDS.caution)
    return SEVERITY_COLORS.caution;
  return SEVERITY_COLORS.safe;
}

export function FloodHistoryChart({
  data,
  isLoading = false,
  isDark = false,
  // JS-only exception: isDark prop for non-NativeWind contexts (chart library, dynamic styles)
  height = 220,
}: FloodHistoryChartProps) {
  const theme = isDark ? MAP_COLORS.dark : MAP_COLORS.light;
  const colors = {
    background: theme.card,
    text: theme.text,
    subtext: theme.subtext,
    border: theme.border,
    grid: isDark ? MAP_COLORS.dark.border : MAP_COLORS.light.border,
  };

  // Transform data for gifted-charts
  const chartData = useMemo(() => {
    if (!data?.dataPoints?.length) return [];

    return data.dataPoints.map((point, index) => {
      const date = new Date(point.timestamp);
      const value = point.valueMeters ?? point.value / 100;

      // Format label based on granularity
      let label = "";
      if (data.metadata.granularity === "hourly") {
        label = index % 4 === 0 ? `${date.getHours()}h` : "";
      } else {
        label =
          index % 5 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : "";
      }

      return {
        value: Math.round(value * 100) / 100,
        label,
        dataPointColor: getSeverityColor(value),
        labelTextStyle: {
          color: colors.subtext,
          fontSize: 9,
        },
      };
    });
  }, [data, colors.subtext]);

  // Calculate chart statistics
  const stats = useMemo(() => {
    if (!chartData.length) return { max: 0, min: 0, avg: 0 };
    const values = chartData.map((d) => d.value);
    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }, [chartData]);

  if (isLoading) {
    return <LoadingChart height={height} isDark={isDark} />;
  }

  if (!data || !chartData.length) {
    return (
      <View
        style={{
          height,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Ionicons name="analytics-outline" size={40} color={colors.subtext} />
        <Text style={{ color: colors.subtext, marginTop: 12, fontSize: 14, textAlign: "center" }}>
          Không có dữ liệu lịch sử
        </Text>
      </View>
    );
  }

  return (
    <View testID="areas-chart-history-root"
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
            Mực nước theo thời gian
          </Text>
          <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 2 }}>
            {data.metadata.totalDataPoints} điểm dữ liệu
          </Text>
        </View>

        {/* Quick stats */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: colors.subtext }}>Max</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: SEVERITY_COLORS.critical,
              }}
            >
              {Math.round(stats.max * 100)}cm
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: colors.subtext }}>TB</Text>
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
            >
              {Math.round(stats.avg * 100)}cm
            </Text>
          </View>
        </View>
      </View>

      {/* Chart Container - with overflow hidden to prevent chart bleed */}
      <View
        style={{
          overflow: "hidden",
          borderRadius: 8,
          marginHorizontal: -8,
          paddingHorizontal: 8,
        }}
      >
        <LineChart
          data={chartData}
          width={screenWidth - 100}
          height={height - 100}
          spacing={Math.max(
            8,
            Math.floor((screenWidth - 140) / chartData.length),
          )}
          initialSpacing={15}
          endSpacing={15}
          thickness={2.5}
          color={theme.accent}
          dataPointsColor={theme.accent}
          dataPointsRadius={4}
          dataPointsHeight={8}
          dataPointsWidth={8}
          hideDataPoints={false}
          xAxisColor={colors.grid}
          yAxisColor={colors.grid}
          yAxisTextStyle={{ color: colors.subtext, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.subtext, fontSize: 9 }}
          noOfSections={4}
          maxValue={Math.ceil(stats.max + 0.5)}
          rulesType="solid"
          rulesColor={colors.grid}
          curved
          curvature={0.2}
          showVerticalLines={false}
          startFillColor="rgba(59, 130, 246, 0.25)"
          endFillColor="rgba(59, 130, 246, 0.02)"
          startOpacity={0.25}
          endOpacity={0.02}
          areaChart
          yAxisLabelSuffix="m"
          yAxisLabelWidth={35}
          pointerConfig={{
            pointerStripHeight: height - 120,
            pointerStripColor: theme.accent,
            pointerStripWidth: 2,
            pointerColor: theme.accent,
            radius: 6,
            pointerLabelWidth: 100,
            pointerLabelHeight: 50,
            activatePointersOnLongPress: true,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: { value: number }[]) => {
              return (
                <View
                  style={{
                    backgroundColor: theme.card,
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    ...SHADOW.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {Math.round(items[0]?.value * 100)}cm
                  </Text>
                </View>
              );
            },
          }}
        />
      </View>

      {/* Severity legend */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        {Object.entries(SEVERITY_COLORS).map(([key, color]) => (
          <View
            key={key}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: color,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                color: colors.subtext,
                textTransform: "capitalize",
              }}
            >
              {key === "safe"
                ? "An toàn"
                : key === "caution"
                  ? "Chú ý"
                  : key === "warning"
                    ? "Cảnh báo"
                    : "Nguy hiểm"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
