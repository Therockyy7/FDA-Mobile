// features/home/components/WeatherInsightsSection.tsx
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AiRiskSummary, RainfallForecastItem } from "../types/home-types";
import type { OpenMeteoResponse } from "../types/open-meteo.types";
import {
  getCompactWeatherIcon,
  getDayNameVn,
  getWeatherTheme,
} from "../types/open-meteo.types";

interface Props {
  meteo: OpenMeteoResponse;
  rainfallForecast: RainfallForecastItem[];
  aiRisk?: AiRiskSummary | null;
}

/* ────────── helpers ────────── */

const getRainfallBarColor = (level: RainfallForecastItem["level"]): string => {
  switch (level) {
    case "none": return "#94A3B8";
    case "light": return "#34D399";
    case "moderate": return "#FBBF24";
    case "heavy": return "#F97316";
    case "extreme": return "#EF4444";
    default: return "#94A3B8";
  }
};

const getRainfallBarHeight = (amount: number): number =>
  Math.max(6, Math.min(40, (amount / 50) * 40));

const getRiskColors = (level: AiRiskSummary["riskLevel"]) => {
  switch (level) {
    case "low":
      return {
        gradient: ["#059669", "#10B981"] as const,
        shadow: "#10B981",
      };
    case "medium":
      return {
        gradient: ["#D97706", "#F59E0B"] as const,
        shadow: "#F59E0B",
      };
    case "high":
      return {
        gradient: ["#DC2626", "#F87171"] as const,
        shadow: "#EF4444",
      };
    case "critical":
      return {
        gradient: ["#7F1D1D", "#DC2626"] as const,
        shadow: "#EF4444",
      };
  }
};

/** Get soil moisture status */
function getSoilStatus(moisture: number): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  if (moisture >= 0.4)
    return {
      label: "Bão hòa",
      color: "#EF4444",
      icon: "water",
      description: "Đất bão hòa nước – Nguy cơ ngập cao",
    };
  if (moisture >= 0.3)
    return {
      label: "Ẩm cao",
      color: "#F97316",
      icon: "water-outline",
      description: "Đất ẩm – Khả năng thấm hút giảm",
    };
  if (moisture >= 0.2)
    return {
      label: "Bình thường",
      color: "#10B981",
      icon: "leaf",
      description: "Đất có khả năng thấm hút tốt",
    };
  return {
    label: "Khô",
    color: "#F59E0B",
    icon: "sunny",
    description: "Đất khô – Thấm hút cực tốt nếu có mưa",
  };
}

/* ────────── component ────────── */

export function WeatherInsightsSection({
  meteo,
  rainfallForecast,
  aiRisk,
}: Props) {
  const router = useRouter();

  // Theme from current weather code
  const weatherCode = meteo.current.weather_code;
  const theme = useMemo(
    () => getWeatherTheme(weatherCode),
    [weatherCode],
  );

  // Current hour index in hourly data
  const currentHourIdx = useMemo(() => {
    const now = new Date();
    const currentHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:00`;
    const idx = meteo.hourly.time.indexOf(currentHour);
    return idx >= 0 ? idx : 0;
  }, [meteo.hourly.time]);

  // Current humidity from hourly
  const currentHumidity = meteo.hourly.relative_humidity_2m[currentHourIdx] ?? 0;

  // Current soil moisture
  const currentSoilMoisture =
    meteo.hourly.soil_moisture_3_to_9cm[currentHourIdx] ?? 0;
  const soilStatus = getSoilStatus(currentSoilMoisture);

  // Next 24 hours of hourly data
  const next24Hours = useMemo(() => {
    const items = [];
    for (let i = currentHourIdx; i < Math.min(currentHourIdx + 24, meteo.hourly.time.length); i++) {
      items.push({
        hour: new Date(meteo.hourly.time[i]).getHours(),
        temp: meteo.hourly.temperature_2m[i],
        precipitation: meteo.hourly.precipitation[i],
        weatherCode: meteo.hourly.weather_code[i],
        windSpeed: meteo.hourly.wind_speed_10m[i],
      });
    }
    return items;
  }, [currentHourIdx, meteo.hourly]);

  // Pulse animation for AI risk card
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (aiRisk && (aiRisk.riskLevel === "high" || aiRisk.riskLevel === "critical")) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.008,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [aiRisk, pulseAnim]);

  const riskColors = aiRisk ? getRiskColors(aiRisk.riskLevel) : null;

  // Find today's daily data
  const todayMax = meteo.daily.temperature_2m_max[0];
  const todayMin = meteo.daily.temperature_2m_min[0];
  const todayRainProb = meteo.daily.precipitation_probability_max[0];

  return (
    <View className="px-4 py-2">
      {/* ── Section Header ── */}
      <View className="flex-row items-center gap-2 mb-3">
        <View
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.color + "20" }}
        >
          <MaterialCommunityIcons
            name={theme.icon as any}
            size={18}
            color={theme.color}
          />
        </View>
        <View>
          <Text className="text-slate-900 dark:text-white text-lg font-bold">
            Thời tiết Đà Nẵng
          </Text>
          <Text className="text-slate-400 dark:text-slate-500 text-[10px]">
            Open-Meteo • Cập nhật lúc{" "}
            {new Date(meteo.current.time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>

      {/* ═══════════ 1) CURRENT WEATHER HERO ═══════════ */}
      <LinearGradient
        colors={theme.bgGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 12,
          shadowColor: theme.color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Lottie ambient background */}
        <LottieView
          source={require("../../../assets/animations/rain-storm.json")}
          autoPlay
          loop
          speed={0.4}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: theme.severity === "safe" ? 0.08 : 0.18,
          }}
        />

        <View style={{ padding: 20 }}>
          {/* Top: Temp + condition */}
          <View className="flex-row items-center justify-between mb-1">
            <View>
              <View className="flex-row items-end gap-1">
                <Text
                  style={{
                    fontSize: 56,
                    fontWeight: "900",
                    color: "white",
                    lineHeight: 60,
                    letterSpacing: -2,
                  }}
                >
                  {Math.round(meteo.current.temperature_2m)}°
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 10,
                  }}
                >
                  C
                </Text>
              </View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 16,
                  fontWeight: "700",
                  marginTop: 2,
                }}
              >
                {theme.labelVn}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                Cao {todayMax}° / Thấp {todayMin}°
              </Text>
            </View>

            {/* Large weather icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={theme.icon as any}
                size={48}
                color="white"
              />
            </View>
          </View>

          {/* Stats chips row */}
          <View
            className="flex-row gap-2"
            style={{ marginTop: 16 }}
          >
            {/* Humidity */}
            <View className="flex-1 rounded-2xl p-3 flex-row items-center gap-2"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <MaterialCommunityIcons
                name="water-percent"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <View>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: "600" }}>
                  Độ ẩm
                </Text>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>
                  {currentHumidity}%
                </Text>
              </View>
            </View>

            {/* Wind */}
            <View className="flex-1 rounded-2xl p-3 flex-row items-center gap-2"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <MaterialCommunityIcons
                name="weather-windy"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <View>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: "600" }}>
                  Gió
                </Text>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>
                  {meteo.current.wind_speed_10m}
                  <Text style={{ fontSize: 10, fontWeight: "600" }}> km/h</Text>
                </Text>
              </View>
            </View>

            {/* Rain probability */}
            <View className="flex-1 rounded-2xl p-3 flex-row items-center gap-2"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Ionicons name="rainy" size={16} color="rgba(255,255,255,0.8)" />
              <View>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: "600" }}>
                  Mưa
                </Text>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>
                  {todayRainProb}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* ═══════════ 2) HOURLY FORECAST STRIP ═══════════ */}
      <View
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#0EA5E9" />
            <Text className="text-slate-800 dark:text-slate-200 text-sm font-bold">
              Dự báo theo giờ
            </Text>
          </View>
          <Text className="text-slate-400 dark:text-slate-500 text-[10px]">
            24 giờ tới
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 14, gap: 2 }}
        >
          {next24Hours.map((item, idx) => {
            const isNow = idx === 0;
            const hasRain = item.precipitation > 0;
            return (
              <View
                key={idx}
                className="items-center py-2 px-2.5 rounded-2xl"
                style={{
                  backgroundColor: isNow
                    ? "rgba(6, 182, 212, 0.12)"
                    : "transparent",
                  minWidth: 54,
                }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: isNow ? "#06B6D4" : "#94A3B8" }}
                >
                  {isNow ? "Bây giờ" : `${String(item.hour).padStart(2, "0")}:00`}
                </Text>

                <MaterialCommunityIcons
                  name={getCompactWeatherIcon(item.weatherCode) as any}
                  size={22}
                  color={isNow ? "#06B6D4" : "#64748B"}
                  style={{ marginVertical: 6 }}
                />

                <Text
                  className="text-sm font-extrabold"
                  style={{
                    color: isNow ? "#06B6D4" : undefined,
                  }}
                >
                  {Math.round(item.temp)}°
                </Text>

                {hasRain && (
                  <View
                    className="flex-row items-center gap-0.5 mt-1"
                    style={{
                      backgroundColor: "#3B82F620",
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderRadius: 6,
                    }}
                  >
                    <Ionicons name="rainy" size={8} color="#3B82F6" />
                    <Text style={{ color: "#3B82F6", fontSize: 8, fontWeight: "700" }}>
                      {item.precipitation}mm
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ═══════════ 3) 7-DAY FORECAST ═══════════ */}
      <View
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons name="calendar-week" size={14} color="#8B5CF6" />
          <Text className="text-slate-800 dark:text-slate-200 text-sm font-bold">
            Dự báo 7 ngày
          </Text>
        </View>

        {meteo.daily.time.map((day, idx) => {
          const isToday = idx === 0;
          const rainSum = meteo.daily.precipitation_sum[idx];
          const rainProb = meteo.daily.precipitation_probability_max[idx];
          const maxT = meteo.daily.temperature_2m_max[idx];
          const minT = meteo.daily.temperature_2m_min[idx];
          const code = meteo.daily.weather_code[idx];

          return (
            <View
              key={day}
              className="flex-row items-center py-2.5"
              style={{
                borderTopWidth: idx > 0 ? 1 : 0,
                borderTopColor: "rgba(148,163,184,0.12)",
              }}
            >
              {/* Day name */}
              <View style={{ width: 44 }}>
                <Text
                  className="text-xs font-bold"
                  style={{ color: isToday ? "#06B6D4" : "#64748B" }}
                >
                  {isToday ? "H.nay" : getDayNameVn(day)}
                </Text>
              </View>

              {/* Weather icon */}
              <View style={{ width: 32, alignItems: "center" }}>
                <MaterialCommunityIcons
                  name={getCompactWeatherIcon(code) as any}
                  size={20}
                  color={getWeatherTheme(code).color}
                />
              </View>

              {/* Rain info */}
              <View style={{ width: 52, alignItems: "center" }}>
                {rainSum > 0 || rainProb > 10 ? (
                  <View className="flex-row items-center gap-0.5">
                    <Ionicons name="rainy" size={10} color="#3B82F6" />
                    <Text style={{ color: "#3B82F6", fontSize: 10, fontWeight: "700" }}>
                      {rainProb}%
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: "#94A3B8", fontSize: 10 }}>—</Text>
                )}
              </View>

              {/* Temperature range bar */}
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  className="text-xs font-medium"
                  style={{ color: "#94A3B8", width: 28, textAlign: "right" }}
                >
                  {Math.round(minT)}°
                </Text>

                {/* Gradient bar */}
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(148,163,184,0.15)" }}>
                  {/* Calculate position based on global min/max */}
                  <LinearGradient
                    colors={["#06B6D4", "#F59E0B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      left: `${Math.max(0, ((minT - 18) / 22) * 100)}%`,
                      right: `${Math.max(0, 100 - ((maxT - 18) / 22) * 100)}%`,
                      height: 6,
                      borderRadius: 3,
                    }}
                  />
                </View>

                <Text
                  className="text-xs font-bold"
                  style={{ width: 28 }}
                >
                  {Math.round(maxT)}°
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ═══════════ 4) SOIL MOISTURE + FLOOD RISK INDICATOR ═══════════ */}
      <View
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons name="waves" size={14} color="#06B6D4" />
          <Text className="text-slate-800 dark:text-slate-200 text-sm font-bold">
            Chỉ số ngập lụt
          </Text>
        </View>

        <View className="flex-row gap-3">
          {/* Soil Moisture */}
          <View
            className="flex-1 rounded-2xl p-3"
            style={{
              backgroundColor: soilStatus.color + "10",
              borderWidth: 1,
              borderColor: soilStatus.color + "25",
            }}
          >
            <View className="flex-row items-center gap-1.5 mb-2">
              <Ionicons name={soilStatus.icon as any} size={14} color={soilStatus.color} />
              <Text style={{ color: soilStatus.color, fontSize: 10, fontWeight: "700" }}>
                ĐỘ ẨM ĐẤT
              </Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: "900", color: soilStatus.color }}>
              {(currentSoilMoisture * 100).toFixed(0)}%
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-[9px] mt-1">
              {soilStatus.description}
            </Text>
          </View>

          {/* Precipitation today */}
          <View
            className="flex-1 rounded-2xl p-3"
            style={{
              backgroundColor: meteo.current.precipitation > 0 ? "#3B82F610" : "#10B98110",
              borderWidth: 1,
              borderColor: meteo.current.precipitation > 0 ? "#3B82F625" : "#10B98125",
            }}
          >
            <View className="flex-row items-center gap-1.5 mb-2">
              <Ionicons
                name="rainy"
                size={14}
                color={meteo.current.precipitation > 0 ? "#3B82F6" : "#10B981"}
              />
              <Text
                style={{
                  color: meteo.current.precipitation > 0 ? "#3B82F6" : "#10B981",
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                LƯỢNG MƯA
              </Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: meteo.current.precipitation > 0 ? "#3B82F6" : "#10B981",
              }}
            >
              {meteo.daily.precipitation_sum[0]}
              <Text style={{ fontSize: 12, fontWeight: "600" }}> mm</Text>
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-[9px] mt-1">
              {meteo.current.precipitation > 0
                ? "Đang có mưa – Theo dõi mực nước"
                : "Không mưa – Nguy cơ ngập thấp"}
            </Text>
          </View>
        </View>
      </View>

      {/* ═══════════ 5) RAINFALL FORECAST FROM STATIONS ═══════════ */}
      {rainfallForecast.some((r) => r.amount > 0) && (
        <View
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="grain" size={16} color="#0EA5E9" />
              <Text className="text-slate-800 dark:text-slate-200 text-sm font-bold">
                Mực nước trạm đo
              </Text>
            </View>
            <Text className="text-slate-400 dark:text-slate-500 text-[10px]">
              Dữ liệu thực
            </Text>
          </View>

          <View className="flex-row items-end justify-between" style={{ height: 60 }}>
            {rainfallForecast.map((item, index) => (
              <View key={index} className="flex-1 items-center gap-1">
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "600",
                    color: getRainfallBarColor(item.level),
                  }}
                >
                  {item.amount > 0 ? `${item.amount}` : "—"}
                </Text>
                <View
                  style={{
                    width: 20,
                    height: getRainfallBarHeight(item.amount),
                    borderRadius: 6,
                    backgroundColor: getRainfallBarColor(item.level),
                    opacity: 0.85,
                  }}
                />
              </View>
            ))}
          </View>

          <View className="flex-row justify-between mt-1.5">
            {rainfallForecast.map((item, index) => (
              <View key={index} className="flex-1 items-center">
                <Text className="text-slate-400 dark:text-slate-500 text-[9px] font-medium">
                  {item.hour}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ═══════════ 6) AI FLOOD RISK CARD ═══════════ */}
      {aiRisk && riskColors && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/prediction/${aiRisk.areaId}` as any)}
            style={{
              shadowColor: riskColors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <LinearGradient
              colors={riskColors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, overflow: "hidden" }}
            >
              <View style={{ padding: 16 }}>
                {/* Header row */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons name="robot-outline" size={20} color="white" />
                    </View>
                    <View>
                      <Text style={{ color: "white", fontSize: 14, fontWeight: "800" }}>
                        Dự đoán AI
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>
                        {aiRisk.areaName} • {aiRisk.updatedAt}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.25)",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 14,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 11, fontWeight: "800" }}>
                      {aiRisk.riskLabelVn}
                    </Text>
                  </View>
                </View>

                {/* Probability + factor */}
                <View className="flex-row items-center gap-3 mb-3">
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      borderWidth: 3,
                      borderColor: "rgba(255,255,255,0.3)",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
                      {aiRisk.probability}%
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View className="flex-row items-center gap-1 mb-1">
                      <MaterialIcons name="trending-up" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" }}>
                        Yếu tố chính: {aiRisk.dominantFactorVn}
                      </Text>
                    </View>
                    <Text
                      style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, lineHeight: 16 }}
                      numberOfLines={2}
                    >
                      {aiRisk.recommendation}
                    </Text>
                  </View>
                </View>

                {/* CTA */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingVertical: 10,
                    borderRadius: 12,
                    gap: 6,
                  }}
                >
                  <MaterialCommunityIcons name="chart-line" size={16} color="white" />
                  <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>
                    Xem phân tích chi tiết
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="white" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
