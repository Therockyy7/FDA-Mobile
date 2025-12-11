// app/area-detail/[id].tsx
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text } from "~/components/ui/text";
import { getStatusConfig } from "~/features/home/lib/home-utils";
import { cn } from "~/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Types
interface WaterLevelData {
  value: number;
  label: string;
  dataPointText?: string;
}

interface ForecastData {
  time: string;
  level: number;
  status: "safe" | "warning" | "danger";
  rainfall: number;
}

// Mock Data
const AREA_DETAIL = {
  id: "1",
  name: "Nhà riêng",
  location: "123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
  status: "safe" as const,
  statusText: "An toàn",
  currentWaterLevel: 2.1,
  warningLevel: 3.5,
  dangerLevel: 5.0,
  lastUpdate: "14:30 - 07/12/2025",
  sensorCount: 3,
  rainfall24h: 45,
  temperature: 28,
  humidity: 72,
  windSpeed: 12,
  affectedStreets: ["Nguyễn Văn Linh", "Lê Duẩn"],
};

const WATER_LEVEL_HISTORY: WaterLevelData[] = [
  { value: 1.8, label: "00:00" },
  { value: 1.9, label: "03:00" },
  { value: 2.0, label: "06:00" },
  { value: 2.2, label: "09:00" },
  { value: 2.3, label: "12:00" },
  { value: 2.1, label: "15:00", dataPointText: "2.1m" },
];

const FORECAST_DATA: ForecastData[] = [
  { time: "16:00", level: 2.2, status: "safe", rainfall: 5 },
  { time: "17:00", level: 2.4, status: "safe", rainfall: 8 },
  { time: "18:00", level: 2.6, status: "safe", rainfall: 12 },
  { time: "19:00", level: 2.5, status: "safe", rainfall: 10 },
  { time: "20:00", level: 2.3, status: "safe", rainfall: 6 },
  { time: "21:00", level: 2.1, status: "safe", rainfall: 3 },
];

export default function AreaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<"history" | "forecast">("history");

  const statusConfig = getStatusConfig(AREA_DETAIL.status);
  const waterPercentage = (AREA_DETAIL.currentWaterLevel / AREA_DETAIL.dangerLevel) * 100;

  const handleDelete = () => {
    Alert.alert(
      "Xóa khu vực",
      "Bạn có chắc chắn muốn xóa khu vực này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header với Gradient */}
      <LinearGradient
        colors={[statusConfig.iconColor, statusConfig.iconColor + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight! + 10,
          paddingBottom: 20,
          paddingHorizontal: 16,
        }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold flex-1 text-center">
            Chi tiết khu vực
          </Text>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Area Info */}
        <View>
          <Text className="text-white text-3xl font-black mb-2">
            {AREA_DETAIL.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 text-sm font-medium flex-1">
              {AREA_DETAIL.location}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Status Card */}
        <View className="px-4 mt-5 ">
          <LinearGradient
            colors={[statusConfig.iconColor, statusConfig.iconColor + "DD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5 shadow-lg "
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
                  Tình trạng hiện tại
                </Text>
                <Text className="text-white text-2xl font-black">
                  {AREA_DETAIL.statusText}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white/80 text-xs font-medium mb-1">
                  Mực nước
                </Text>
                <Text className="text-white text-5xl font-black tracking-tighter">
                  {AREA_DETAIL.currentWaterLevel}
                  <Text className="text-xl">m</Text>
                </Text>
              </View>
            </View>

            {/* Water Level Progress */}
            <View className="bg-white/20 rounded-full h-3 overflow-hidden mb-3">
              <View
                className="bg-white h-full rounded-full"
                style={{ width: `${Math.min(waterPercentage, 100)}%` }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-yellow-300" />
                <Text className="text-white/80 text-xs">
                  Cảnh báo: {AREA_DETAIL.warningLevel}m
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-red-300" />
                <Text className="text-white/80 text-xs">
                  Nguy hiểm: {AREA_DETAIL.dangerLevel}m
                </Text>
              </View>
            </View>

            <Text className="text-white/60 text-xs mt-4">
              Cập nhật: {AREA_DETAIL.lastUpdate}
            </Text>
          </LinearGradient>
        </View>

        {/* Weather Stats */}
        <View className="px-4 mt-6">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">
            Thông tin thời tiết
          </Text>
          <View className="flex-row gap-3">
            {[
              {
                icon: "rainy",
                label: "Lượng mưa 24h",
                value: `${AREA_DETAIL.rainfall24h}mm`,
                color: "#3B82F6",
                bg: "#EFF6FF",
              },
              {
                icon: "thermometer",
                label: "Nhiệt độ",
                value: `${AREA_DETAIL.temperature}°C`,
                color: "#F59E0B",
                bg: "#FEF3C7",
              },
            ].map((stat, index) => (
              <View
                key={index}
                className="flex-1 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: stat.bg }}
              >
                <Ionicons name={stat.icon as any} size={28} color={stat.color} />
                <Text
                  className="text-xs font-medium mt-3 mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.label}
                </Text>
                <Text className="text-2xl font-black" style={{ color: stat.color }}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row gap-3 mt-3">
            {[
              {
                icon: "water",
                label: "Độ ẩm",
                value: `${AREA_DETAIL.humidity}%`,
                color: "#06B6D4",
              },
              {
                icon: "speedometer",
                label: "Tốc độ gió",
                value: `${AREA_DETAIL.windSpeed}km/h`,
                color: "#8B5CF6",
              },
            ].map((stat, index) => (
              <View
                key={index}
                className="flex-1 rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
              >
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium mt-2 mb-1">
                  {stat.label}
                </Text>
                <Text className="text-slate-900 dark:text-white text-xl font-bold">
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Chart Section */}
        <View className="px-4 mt-6">
          {/* Tab Selector */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setSelectedTab("history")}
              className={cn(
                "flex-1 py-3 rounded-xl items-center",
                selectedTab === "history"
                  ? "bg-blue-500"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              )}
              activeOpacity={0.7}
            >
              <Text
                className={cn(
                  "text-sm font-bold",
                  selectedTab === "history"
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Lịch sử 24h
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("forecast")}
              className={cn(
                "flex-1 py-3 rounded-xl items-center",
                selectedTab === "forecast"
                  ? "bg-blue-500"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              )}
              activeOpacity={0.7}
            >
              <Text
                className={cn(
                  "text-sm font-bold",
                  selectedTab === "forecast"
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                Dự báo AI (6h)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart Card */}
          <View className="rounded-2xl bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700">
            <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">
              {selectedTab === "history" ? "Biến động mực nước" : "Dự báo mực nước"}
            </Text>

            <LineChart
              data={WATER_LEVEL_HISTORY}
              width={SCREEN_WIDTH - 80}
              height={200}
              color={statusConfig.iconColor}
              thickness={3}
              startFillColor={statusConfig.iconColor}
              endFillColor={statusConfig.iconColor + "20"}
              startOpacity={0.4}
              endOpacity={0.1}
              initialSpacing={10}
              spacing={45}
              hideRules
              hideYAxisText
              yAxisColor="transparent"
              xAxisColor="#E5E7EB"
              dataPointsColor={statusConfig.iconColor}
              dataPointsRadius={5}
              textColor="#6B7280"
              textFontSize={12}
              textShiftY={-8}
              curved
              areaChart
            />

            {/* Chart Legend */}
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: statusConfig.iconColor }} />
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

        {/* Forecast Cards */}
        {selectedTab === "forecast" && (
          <View className="px-4 mt-4">
            <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">
              Chi tiết dự báo
            </Text>
            <View className="gap-3">
              {FORECAST_DATA.map((item, index) => (
                <View
                  key={index}
                  className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <Ionicons name="time-outline" size={20} color="#6B7280" />
                      <Text className="text-slate-900 dark:text-white text-base font-bold">
                        {item.time}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        "px-3 py-1 rounded-full",
                        item.status === "safe" && "bg-emerald-100",
                        item.status === "warning" && "bg-amber-100",
                        item.status === "danger" && "bg-red-100"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-xs font-bold",
                          item.status === "safe" && "text-emerald-700",
                          item.status === "warning" && "text-amber-700",
                          item.status === "danger" && "text-red-700"
                        )}
                      >
                        {item.status === "safe" ? "An toàn" : item.status === "warning" ? "Cảnh báo" : "Nguy hiểm"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-6">
                    <View className="flex-row items-center gap-2">
                      <MaterialCommunityIcons name="waves" size={18} color="#3B82F6" />
                      <Text className="text-slate-600 dark:text-slate-400 text-sm">
                        Mực nước:
                      </Text>
                      <Text className="text-slate-900 dark:text-white text-base font-bold">
                        {item.level}m
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="rainy" size={18} color="#3B82F6" />
                      <Text className="text-slate-600 dark:text-slate-400 text-sm">
                        Mưa:
                      </Text>
                      <Text className="text-slate-900 dark:text-white text-base font-bold">
                        {item.rainfall}mm
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sensors & Streets Info */}
        <View className="px-4 mt-6">
          <View className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Sensors */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                  <MaterialIcons name="sensors" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-slate-900 dark:text-white text-base font-semibold">
                    Cảm biến liên quan
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs">
                    {AREA_DETAIL.sensorCount} thiết bị đang hoạt động
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />

            {/* Affected Streets */}
            <View className="p-4">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
                  <MaterialIcons name="warning" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-slate-900 dark:text-white text-base font-semibold">
                    Đường bị ảnh hưởng
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs">
                    {AREA_DETAIL.affectedStreets.length} tuyến đường
                  </Text>
                </View>
              </View>
              <View className="gap-2 ml-13">
                {AREA_DETAIL.affectedStreets.map((street, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <Text className="text-slate-600 dark:text-slate-400 text-sm">
                      {street}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="px-4 mt-6 gap-3">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-blue-500 active:bg-blue-600"
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={20} color="white" />
            <Text className="text-white text-base font-bold">
              Xem trên bản đồ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 active:bg-red-100"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 text-base font-bold">
              Xóa khu vực
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
