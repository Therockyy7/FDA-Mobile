// features/home/components/WeatherInsightsSection.tsx
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
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

// Rainfall level colors mapped to Tailwind tokens
const RAINFALL_COLORS: Record<RainfallForecastItem["level"], string> = {
  "none": "#94A3B8",     // slate-400
  "light": "#34D399",    // emerald-400
  "moderate": "#FBBF24", // amber-400
  "heavy": "#F97316",    // orange-500
  "extreme": "#EF4444",  // red-500
};

const getRainfallBarHeight = (amount: number): number =>
  Math.max(6, Math.min(40, (amount / 50) * 40));

// Risk level colors - map to design tokens (emerald, amber, red scale)
const RISK_COLORS: Record<AiRiskSummary["riskLevel"], { gradient: [string, string]; shadow: string }> = {
  "low": {
    gradient: ["#059669", "#10B981"], // emerald-700, emerald-500
    shadow: "#10B981",
  },
  "medium": {
    gradient: ["#D97706", "#F59E0B"], // amber-600, amber-400
    shadow: "#F59E0B",
  },
  "high": {
    gradient: ["#DC2626", "#F87171"], // red-600, red-400
    shadow: "#EF4444",                // red-500
  },
  "critical": {
    gradient: ["#7F1D1D", "#DC2626"], // red-900, red-600
    shadow: "#EF4444",                // red-500
  },
};

// Soil moisture status colors (mapped to design tokens)
const SOIL_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; description: string }> = {
  saturated: {
    label: "Bão hòa",
    color: "#EF4444",   // red-500
    icon: "water",
    description: "Đất bão hòa nước – Nguy cơ ngập cao",
  },
  high: {
    label: "Ẩm cao",
    color: "#F97316",   // orange-500
    icon: "water-outline",
    description: "Đất ẩm – Khả năng thấm hút giảm",
  },
  normal: {
    label: "Bình thường",
    color: "#10B981",   // emerald-500
    icon: "leaf",
    description: "Đất có khả năng thấm hút tốt",
  },
  dry: {
    label: "Khô",
    color: "#F59E0B",   // amber-400
    icon: "sunny",
    description: "Đất khô – Thấm hút cực tốt nếu có mưa",
  },
};

/** Get soil moisture status */
function getSoilStatus(moisture: number): { label: string; color: string; icon: string; description: string } {
  if (moisture >= 0.4) return SOIL_STATUS_CONFIG.saturated;
  if (moisture >= 0.3) return SOIL_STATUS_CONFIG.high;
  if (moisture >= 0.2) return SOIL_STATUS_CONFIG.normal;
  return SOIL_STATUS_CONFIG.dry;
}

/* ────────── weather animation map ────────── */

type WeatherAnimDef = {
  source: any;
  bgOpacity: number;
  iconSpeed: number;
  iconSize: number;
};

function getWeatherAnimation(code: number): WeatherAnimDef {
  // ⚡ Thunder / Storm
  if ([95, 96, 99].includes(code))
    return {
      source: require("../../../assets/animations/thunder.json"),
      bgOpacity: 0.22,
      iconSpeed: 1.0,
      iconSize: 130,
    };
  // 🌧 Heavy rain / Pouring
  if ([65, 82].includes(code))
    return {
      source: require("../../../assets/animations/rain-storm.json"),
      bgOpacity: 0.2,
      iconSpeed: 0.9,
      iconSize: 120,
    };
  // 🌦 Rain / Drizzle / Showers
  if ([51, 53, 55, 61, 63, 80, 81].includes(code))
    return {
      source: require("../../../assets/animations/drizzle.json"),
      bgOpacity: 0.16,
      iconSpeed: 0.7,
      iconSize: 120,
    };
  // 🌫 Fog / Mist
  if ([45, 48].includes(code))
    return {
      source: require("../../../assets/animations/fog.json"),
      bgOpacity: 0.18,
      iconSpeed: 0.5,
      iconSize: 130,
    };
  // ☁️ Overcast
  if (code === 3)
    return {
      source: require("../../../assets/animations/cloudy.json"),
      bgOpacity: 0.14,
      iconSpeed: 0.4,
      iconSize: 115,
    };
  // 🌤 Partly cloudy
  if ([1, 2].includes(code))
    return {
      source: require("../../../assets/animations/partly-cloudy.json"),
      bgOpacity: 0.1,
      iconSpeed: 0.6,
      iconSize: 120,
    };
  // ☀️ Clear / Sunny
  return {
    source: require("../../../assets/animations/sunny.json"),
    bgOpacity: 0.09,
    iconSpeed: 0.5,
    iconSize: 125,
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
  const theme = useMemo(() => getWeatherTheme(weatherCode), [weatherCode]);

  // Current hour index in hourly data
  const currentHourIdx = useMemo(() => {
    const now = new Date();
    const currentHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:00`;
    const idx = meteo.hourly.time.indexOf(currentHour);
    return idx >= 0 ? idx : 0;
  }, [meteo.hourly.time]);

  // Current humidity from hourly
  const currentHumidity =
    meteo.hourly.relative_humidity_2m[currentHourIdx] ?? 0;

  // Current soil moisture
  const currentSoilMoisture =
    meteo.hourly.soil_moisture_3_to_9cm[currentHourIdx] ?? 0;
  const soilStatus = getSoilStatus(currentSoilMoisture);

  // Next 24 hours of hourly data
  const next24Hours = useMemo(() => {
    const items = [];
    for (
      let i = currentHourIdx;
      i < Math.min(currentHourIdx + 24, meteo.hourly.time.length);
      i++
    ) {
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
    if (
      aiRisk &&
      (aiRisk.riskLevel === "high" || aiRisk.riskLevel === "critical")
    ) {
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

  const riskColors = aiRisk ? RISK_COLORS[aiRisk.riskLevel] : null;

  // Weather-specific Lottie animation
  const weatherAnim = useMemo(
    () => getWeatherAnimation(weatherCode),
    [weatherCode],
  );

  // Find today's daily data
  const todayMax = meteo.daily.temperature_2m_max[0];
  const todayMin = meteo.daily.temperature_2m_min[0];
  const todayRainProb = meteo.daily.precipitation_probability_max[0];

  return (
    <View className="px-4 py-2" testID="home-weather-section">
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
          <Text className="text-slate-400 dark:text-slate-500 text-xs">
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
          ...SHADOW.lg,
          shadowColor: theme.color,
        }}
        testID="home-weather-hero"
      >
        {/* ── Lottie ambient background ── */}
        <LottieView
          source={weatherAnim.source}
          autoPlay
          loop
          speed={weatherAnim.iconSpeed * 0.6}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: weatherAnim.bgOpacity,
          }}
        />

        <View style={{ padding: 20 }}>
          {/* Top: Temp + condition */}
          <View className="flex-row items-center justify-between mb-1">
            <View style={{ flex: 1 }}>
              <View className="flex-row items-end gap-1">
                <Text
                  style={{
                    fontSize: 58,
                    fontWeight: "900",
                    color: "white",
                    lineHeight: 62,
                    letterSpacing: -2,
                  }}
                  testID="home-weather-temperature"
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
                  fontSize: 17,
                  fontWeight: "800",
                  marginTop: 2,
                  letterSpacing: -0.3,
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

            {/* ── Lottie weather icon (large, animated) ── */}
            <View
              style={{
                width: weatherAnim.iconSize,
                height: weatherAnim.iconSize,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LottieView
                source={weatherAnim.source}
                autoPlay
                loop
                speed={weatherAnim.iconSpeed}
                style={{
                  width: weatherAnim.iconSize,
                  height: weatherAnim.iconSize,
                }}
              />
            </View>
          </View>

          {/* Stats chips row */}
          <View className="flex-row gap-2" style={{ marginTop: 16 }}>
            {/* Humidity */}
            <View
              className="flex-1 rounded-2xl p-3 flex-row items-center gap-2 bg-white/10"
              testID="home-weather-humidity"
            >
              <MaterialCommunityIcons
                name="water-percent"
                size={18}
                color="white"
              />
              <View>
                <Text className="text-white/55 text-xs font-semibold">
                  Độ ẩm
                </Text>
                <Text className="text-white text-base font-extrabold">
                  {currentHumidity}%
                </Text>
              </View>
            </View>

            {/* Wind */}
            <View
              className="flex-1 rounded-2xl p-3 flex-row items-center gap-2 bg-white/10"
              testID="home-weather-wind"
            >
              <MaterialCommunityIcons
                name="weather-windy"
                size={18}
                color="white"
              />
              <View>
                <Text className="text-white/55 text-xs font-semibold">
                  Gió
                </Text>
                <Text className="text-white text-base font-extrabold">
                  {meteo.current.wind_speed_10m}
                  <Text className="text-xs font-semibold"> km/h</Text>
                </Text>
              </View>
            </View>

            {/* Rain probability */}
            <View
              className="flex-1 rounded-2xl p-3 flex-row items-center gap-2 bg-white/10"
              testID="home-weather-rain-prob"
            >
              <Ionicons name="rainy" size={16} color="white" />
              <View>
                <Text className="text-white/55 text-xs font-semibold">
                  Mưa
                </Text>
                <Text className="text-white text-base font-extrabold">
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
        style={SHADOW.sm}
        testID="home-weather-hourly"
      >
        <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#0EA5E9" />
            <Text className="text-slate-800 dark:text-slate-200 text-sm font-bold">
              Dự báo theo giờ
            </Text>
          </View>
          <Text className="text-slate-400 dark:text-slate-500 text-xs">
            24 giờ tới
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: 14,
            gap: 2,
          }}
        >
          {next24Hours.map((item, idx) => {
            const isNow = idx === 0;
            const hasRain = item.precipitation > 0;
            return (
              <View
                key={idx}
                className="items-center py-2 px-2.5 rounded-2xl"
                style={{
                  backgroundColor: isNow ? "rgba(6, 182, 212, 0.12)" : "transparent",
                  minWidth: 54,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: isNow ? "#06B6D4" : "#94A3B8" }}
                >
                  {isNow
                    ? "Bây giờ"
                    : `${String(item.hour).padStart(2, "0")}:00`}
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
                    className="flex-row items-center gap-0.5 mt-1 bg-blue-500/10 px-1 py-0.5 rounded"
                  >
                    <Ionicons name="rainy" size={11} color="#3B82F6" />
                    <Text className="text-blue-600 text-xs font-bold">
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
        style={SHADOW.sm}
        testID="home-weather-7day"
      >
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialCommunityIcons
            name="calendar-week"
            size={14}
            color="#8B5CF6"
          />
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
                    <Ionicons name="rainy" size={11} color="#3B82F6" />
                    <Text
                      style={{
                        color: "#3B82F6",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {rainProb}%
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: "#94A3B8", fontSize: 11 }}>—</Text>
                )}
              </View>

              {/* Temperature range bar */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: "#94A3B8", width: 28, textAlign: "right" }}
                >
                  {Math.round(minT)}°
                </Text>

                {/* Gradient bar */}
                <View
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "rgba(148,163,184,0.15)",
                  }}
                >
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

                <Text className="text-xs font-bold" style={{ width: 28 }}>
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
        style={SHADOW.sm}
        testID="home-weather-flood-index"
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
            testID="home-weather-soil-moisture"
          >
            <View className="flex-row items-center gap-1.5 mb-2">
              <Ionicons
                name={soilStatus.icon as any}
                size={14}
                color={soilStatus.color}
              />
              <Text
                className="text-xs font-bold uppercase"
                style={{
                  color: soilStatus.color,
                }}
              >
                ĐỘ ẨM ĐẤT
              </Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: soilStatus.color,
              }}
            >
              {(currentSoilMoisture * 100).toFixed(0)}%
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {soilStatus.description}
            </Text>
          </View>

          {/* Precipitation today */}
          <View
            className="flex-1 rounded-2xl p-3"
            style={{
              backgroundColor:
                meteo.current.precipitation > 0 ? "#3B82F610" : "#10B98110",
              borderWidth: 1,
              borderColor:
                meteo.current.precipitation > 0 ? "#3B82F625" : "#10B98125",
            }}
            testID="home-weather-precipitation"
          >
            <View className="flex-row items-center gap-1.5 mb-2">
              <Ionicons
                name="rainy"
                size={14}
                color={meteo.current.precipitation > 0 ? "#3B82F6" : "#10B981"}
              />
              <Text
                className="text-xs font-bold uppercase"
                style={{
                  color:
                    meteo.current.precipitation > 0 ? "#3B82F6" : "#10B981",
                }}
              >
                LƯỢNG MƯA
              </Text>
            </View>
            <Text
              className="text-2xl font-black"
              style={{
                color: meteo.current.precipitation > 0 ? "#3B82F6" : "#10B981",
              }}
            >
              {meteo.daily.precipitation_sum[0]}
              <Text className="text-xs font-semibold"> mm</Text>
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {meteo.current.precipitation > 0
                ? "Đang có mưa – Theo dõi mực nước"
                : "Không mưa – Nguy cơ ngập thấp"}
            </Text>
          </View>
        </View>
      </View>

      {/* ═══════════ 5) LƯỢNG MƯA TRẠM ĐO ═══════════ */}
      {rainfallForecast.some((r) => r.amount > 0) && (
        <View
          className="bg-sky-50 dark:bg-slate-800 rounded-3xl mb-3 border border-sky-200 dark:border-slate-700"
          style={SHADOW.md}
          testID="home-weather-rainfall-chart"
        >
          <View
            style={{ padding: 18 }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center gap-3">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "#0EA5E925",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="weather-pouring"
                    size={20}
                    color="#0EA5E9"
                  />
                </View>
                <View>
                  <Text className="text-slate-900 dark:text-white text-[15px] font-extrabold pb-0.5">
                    Lượng mưa trạm đo (mm)
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">
                    Theo số liệu thời gian thực
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: "#0EA5E920",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: "#0EA5E9",
                    fontSize: 11,
                    fontWeight: "900",
                    letterSpacing: 0.5,
                  }}
                >
                  LIVE
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 85,
                paddingHorizontal: 4,
              }}
            >
              {rainfallForecast.map((item, index) => {
                const color = RAINFALL_COLORS[item.level];
                const height = getRainfallBarHeight(item.amount) * 1.5;
                const hasRain = item.amount > 0;
                return (
                  <View key={index} style={{ alignItems: "center", flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "900",
                        color: hasRain ? color : "#94A3B8",
                        marginBottom: 6,
                      }}
                    >
                      {hasRain ? item.amount : "0"}
                    </Text>
                    <View
                      style={{
                        width: 16,
                        height: Math.max(8, height),
                        borderRadius: 8,
                        backgroundColor: color,
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: hasRain ? 0.6 : 0,
                        shadowRadius: 6,
                        elevation: hasRain ? 4 : 0,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#64748B",
                        marginTop: 10,
                      }}
                    >
                      {item.hour}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────
// Skeleton Loading Component for Weather Insights
// ──────────────────────────────────────────────

export const WeatherInsightsSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <View className="px-4 py-2 mt-4">
      {/* Header Skeleton */}
      <View className="flex-row items-center gap-2 mb-3">
        <Animated.View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#E2E8F0",
            opacity: pulseAnim,
          }}
          className="dark:bg-slate-700"
        />
        <View>
          <Animated.View
            style={{
              width: 140,
              height: 18,
              borderRadius: 8,
              backgroundColor: "#E2E8F0",
              opacity: pulseAnim,
              marginBottom: 4,
            }}
            className="dark:bg-slate-700"
          />
          <Animated.View
            style={{
              width: 100,
              height: 12,
              borderRadius: 4,
              backgroundColor: "#E2E8F0",
              opacity: pulseAnim,
            }}
            className="dark:bg-slate-700"
          />
        </View>
      </View>

      {/* 1) HERO SKELETON */}
      <Animated.View
        style={{
          height: 200,
          borderRadius: 24,
          opacity: pulseAnim,
          marginBottom: 12,
          padding: 20,
          justifyContent: "space-between",
        }}
        className="bg-slate-200 dark:bg-slate-700"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <View
              style={{
                width: 80,
                height: 50,
                borderRadius: 12,
                backgroundColor: "rgba(0,0,0,0.1)",
                marginBottom: 8,
              }}
            />
            <View
              style={{
                width: 100,
                height: 14,
                borderRadius: 6,
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            />
          </View>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(0,0,0,0.1)",
            }}
          />
        </View>
        <View className="flex-row gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 16,
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </View>
      </Animated.View>

      {/* 2) HOURLY SKELETON */}
      <View
        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-3"
        style={{ height: 120, borderRadius: 20 }}
      >
        <Animated.View
          style={{ flex: 1, borderRadius: 20, opacity: pulseAnim }}
          className="bg-slate-200 dark:bg-slate-700"
        />
      </View>

      {/* 3) 7-DAY SKELETON */}
      <View
        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-3"
        style={{ padding: 16, borderRadius: 20 }}
      >
        <View className="flex-row items-center gap-2 mb-4">
          <Animated.View
            style={{
              width: 120,
              height: 14,
              borderRadius: 6,
              opacity: pulseAnim,
            }}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </View>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-row items-center justify-between py-2.5"
          >
            <Animated.View
              style={{ width: 40, height: 12, borderRadius: 6, opacity: pulseAnim }}
              className="bg-slate-200 dark:bg-slate-700"
            />
            <Animated.View
              style={{ width: 24, height: 24, borderRadius: 12, opacity: pulseAnim }}
              className="bg-slate-200 dark:bg-slate-700"
            />
            <Animated.View
              style={{ width: 100, height: 8, borderRadius: 4, opacity: pulseAnim }}
              className="bg-slate-200 dark:bg-slate-700"
            />
          </View>
        ))}
      </View>
    </View>
  );
};
