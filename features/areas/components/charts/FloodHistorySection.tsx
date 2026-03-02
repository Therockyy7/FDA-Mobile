// features/areas/components/charts/FloodHistorySection.tsx
// Complete flood history section with tabs for History, Trends, and Statistics
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

import { useFloodHistory } from "~/features/areas/hooks/useFloodHistory";
import { useFloodStatistics } from "~/features/areas/hooks/useFloodStatistics";
import { useFloodTrends } from "~/features/areas/hooks/useFloodTrends";
import type { ChartPeriod } from "~/features/areas/types/flood-history.types";
import { ChartPeriodSelector } from "./ChartPeriodSelector";
import { DateRangePicker } from "./DateRangePicker";
import { FloodHistoryChart } from "./FloodHistoryChart";
import { FloodStatisticsCard } from "./FloodStatisticsCard";
import { FloodTrendChart } from "./FloodTrendChart";

type ChartTab = "history" | "trends" | "statistics";

interface FloodHistorySectionProps {
  stationId?: string;
  stationIds?: string[]; // Array of station IDs for Area context
  areaId?: string;
  isDark?: boolean;
}

// Full tab config for Station context
const STATION_TAB_CONFIG: {
  key: ChartTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "history", label: "Lịch sử", icon: "time-outline" },
  { key: "trends", label: "Xu hướng", icon: "trending-up-outline" },
  { key: "statistics", label: "Thống kê", icon: "stats-chart-outline" },
];

// Tab config for Area context (no trends)
const AREA_TAB_CONFIG: {
  key: ChartTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "history", label: "Lịch sử", icon: "time-outline" },
  { key: "statistics", label: "Thống kê", icon: "stats-chart-outline" },
];

// Helper function to format date for API
function formatDateForApi(date: Date): string {
  return date.toISOString().split(".")[0] + "Z";
}

export function FloodHistorySection({
  stationId,
  stationIds,
  areaId,
  isDark = false,
}: FloodHistorySectionProps) {
  // Determine if this is Area context (stationIds provided)
  const isAreaContext = stationIds && stationIds.length > 0;
  const TAB_CONFIG = isAreaContext ? AREA_TAB_CONFIG : STATION_TAB_CONFIG;

  const [activeTab, setActiveTab] = useState<ChartTab>("history");
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("7d");

  // Custom date range state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());

  // Use areaId primarily, fallback to stationId if provided
  const effectiveAreaId = areaId;
  const effectiveStationId = stationId;

  // Format custom dates for API
  const customStartDateStr = useMemo(
    () => formatDateForApi(customStartDate),
    [customStartDate],
  );
  const customEndDateStr = useMemo(
    () => formatDateForApi(customEndDate),
    [customEndDate],
  );

  // Custom date label for display
  const customDateLabel = useMemo(() => {
    const formatShort = (date: Date) =>
      date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return `${formatShort(customStartDate)} - ${formatShort(customEndDate)}`;
  }, [customStartDate, customEndDate]);

  // Fetch data based on active tab
  const floodHistory = useFloodHistory({
    stationId: effectiveStationId,
    stationIds: stationIds, // Pass stationIds for Area context
    areaId: effectiveAreaId,
    period: selectedPeriod,
    enabled: activeTab === "history",
  });

  const floodTrends = useFloodTrends({
    stationId: effectiveStationId,
    areaId: effectiveAreaId,
    period: selectedPeriod,
    startDate: selectedPeriod === "custom" ? customStartDateStr : undefined,
    endDate: selectedPeriod === "custom" ? customEndDateStr : undefined,
    compareWithPrevious: true,
    enabled: activeTab === "trends" && !isAreaContext, // Disable for Area context
  });

  const floodStatistics = useFloodStatistics({
    stationId: effectiveStationId,
    stationIds: stationIds, // Pass stationIds for Area context
    areaId: effectiveAreaId,
    period: selectedPeriod,
    includeBreakdown: true,
    includeComparison: false,
    enabled: activeTab === "statistics",
  });

  const colors = {
    background: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#6B7280",
    border: isDark ? "#334155" : "#E2E8F0",
    tabBg: isDark ? "#0F172A" : "#F1F5F9",
    tabActive: isDark ? "#3B82F6" : "#3B82F6",
  };

  // Handle refresh for current tab
  const handleRefresh = async () => {
    switch (activeTab) {
      case "history":
        await floodHistory.refetch();
        break;
      case "trends":
        await floodTrends.refetch();
        break;
      case "statistics":
        await floodStatistics.refetch();
        break;
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Section Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="bar-chart" size={18} color="#3B82F6" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
            Biểu đồ mực nước
          </Text>
        </View>

        {/* Refresh button */}
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.tabBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="refresh" size={16} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* Tab selector */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.tabBg,
          borderRadius: 12,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isActive ? colors.tabActive : "transparent",
              }}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={isActive ? "#FFFFFF" : colors.subtext}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#FFFFFF" : colors.subtext,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Period selector */}
      <View style={{ marginBottom: 16 }}>
        <ChartPeriodSelector
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onCustomPress={() => setShowDatePicker(true)}
          customDateLabel={
            selectedPeriod === "custom" ? customDateLabel : undefined
          }
          showCustomButton={activeTab === "trends"}
          isDark={isDark}
        />
      </View>

      {/* Chart content based on active tab */}
      <View style={{ minHeight: 220 }}>
        {activeTab === "history" && (
          <FloodHistoryChart
            key={`history-${selectedPeriod}`}
            data={floodHistory.data}
            isLoading={floodHistory.isLoading}
            isDark={isDark}
            height={220}
          />
        )}

        {activeTab === "trends" && (
          <FloodTrendChart
            key={`trends-${selectedPeriod}`}
            data={floodTrends.data}
            isLoading={floodTrends.isLoading}
            isDark={isDark}
            height={260}
          />
        )}

        {activeTab === "statistics" && (
          <FloodStatisticsCard
            key={`stats-${selectedPeriod}`}
            data={floodStatistics.data}
            isLoading={floodStatistics.isLoading}
            isDark={isDark}
          />
        )}
      </View>

      {/* Error display */}
      {(floodHistory.error || floodTrends.error || floodStatistics.error) && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: "#FEE2E2",
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="warning" size={16} color="#EF4444" />
          <Text style={{ fontSize: 12, color: "#DC2626", flex: 1 }}>
            Không thể tải dữ liệu. Nhấn nút làm mới để thử lại.
          </Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#3B82F6" }}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Date Range Picker Modal */}
      <DateRangePicker
        visible={showDatePicker}
        startDate={customStartDate}
        endDate={customEndDate}
        onStartDateChange={setCustomStartDate}
        onEndDateChange={setCustomEndDate}
        onConfirm={() => {
          setShowDatePicker(false);
          setSelectedPeriod("custom");
        }}
        onCancel={() => setShowDatePicker(false)}
        isDark={isDark}
      />
    </View>
  );
}
