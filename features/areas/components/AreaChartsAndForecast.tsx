
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WaterLevelData {
  value: number;
  label: string;
  dataPointText?: string;
}

interface ForecastItem {
  time: string;
  level: number;
  status: "safe" | "warning" | "danger";
  rainfall: number;
}

interface Props {
  selectedTab: "history" | "forecast";
  onTabChange: (tab: "history" | "forecast") => void;
  statusColor: string;
  historyData: WaterLevelData[];
  forecastData: ForecastItem[];
}

export function AreaChartsAndForecast({
  selectedTab,
  onTabChange,
  statusColor,
  historyData,
  forecastData,
}: Props) {
  return (
    <>
      <View className="px-4 mt-6">
        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={() => onTabChange("history")}
            className={cn(
              "flex-1 py-3 rounded-xl items-center",
              selectedTab === "history"
                ? "bg-blue-500"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
            )}
            activeOpacity={0.7}
          >
            <Text
              className={cn(
                "text-sm font-bold",
                selectedTab === "history"
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400",
              )}
            >
              Lịch sử 24h
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onTabChange("forecast")}
            className={cn(
              "flex-1 py-3 rounded-xl items-center",
              selectedTab === "forecast"
                ? "bg-blue-500"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
            )}
            activeOpacity={0.7}
          >
            <Text
              className={cn(
                "text-sm font-bold",
                selectedTab === "forecast"
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400",
              )}
            >
              Dự báo AI (6h)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart card */}
        <View className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">
            {selectedTab === "history"
              ? "Biến động mực nước"
              : "Dự báo mực nước"}
          </Text>

          <LineChart
            data={
              selectedTab === "history"
                ? historyData
                : forecastData.map((f) => ({
                    value: f.level,
                    label: f.time,
                  }))
            }
            width={SCREEN_WIDTH - 80}
            height={200}
            color={statusColor}
            thickness={3}
            startFillColor={statusColor}
            endFillColor={statusColor + "20"}
            startOpacity={0.4}
            endOpacity={0.1}
            initialSpacing={10}
            spacing={45}
            hideRules
            hideYAxisText
            yAxisColor="transparent"
            xAxisColor="#E5E7EB"
            dataPointsColor={statusColor}
            dataPointsRadius={5}
            textColor="#6B7280"
            textFontSize={12}
            textShiftY={-8}
            curved
            areaChart
          />

          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <View className="flex-row items-center gap-2">
              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <Text className="text-slate-600 dark:text-slate-400 text-xs">
                Mực nước (m)
              </Text>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
              {selectedTab === "history" ? "24 giờ qua" : "6 giờ tới"}
            </Text>
          </View>
        </View>
      </View>

      {/* Forecast detail */}
      {selectedTab === "forecast" && (
        <View className="px-4 mt-4">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">
            Chi tiết dự báo
          </Text>
          <View className="gap-3">
            {forecastData.map((item, index) => (
              <View
                key={index}
                className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text className="text-slate-900 dark:text-white text-base font-bold">
                      {item.time}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      "px-3 py-1 rounded-full",
                      item.status === "safe" && "bg-emerald-100",
                      item.status === "warning" && "bg-amber-100",
                      item.status === "danger" && "bg-red-100",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xs font-bold",
                        item.status === "safe" && "text-emerald-700",
                        item.status === "warning" && "text-amber-700",
                        item.status === "danger" && "text-red-700",
                      )}
                    >
                      {item.status === "safe"
                        ? "An toàn"
                        : item.status === "warning"
                          ? "Cảnh báo"
                          : "Nguy hiểm"}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-6">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="waves"
                      size={18}
                      color="#3B82F6"
                    />
                    <Text className="text-slate-600 dark:text-slate-400 text-sm">
                      Mực nước:
                    </Text>
                    <Text className="text-slate-900 dark:text-white text-base font-bold">
                      {item.level.toFixed(1)}m
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="rainy" size={18} color="#3B82F6" />
                    <Text className="text-slate-600 dark:text-slate-400 text-sm">
                      Mưa:
                    </Text>
                    <Text className="text-slate-900 dark:text-white text-base font-bold">
                      {item.rainfall.toFixed(0)}mm
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}
