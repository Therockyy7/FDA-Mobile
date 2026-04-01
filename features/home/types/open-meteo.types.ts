// features/home/types/open-meteo.types.ts
// Open-Meteo API response types for Đà Nẵng weather data

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentWeather;
  hourly_units: HourlyUnits;
  hourly: HourlyWeather;
  daily_units: DailyUnits;
  daily: DailyWeather;
}

export interface CurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  precipitation: string;
  weather_code: string;
  wind_speed_10m: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface HourlyUnits {
  time: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  precipitation: string;
  weather_code: string;
  wind_speed_10m: string;
  soil_moisture_3_to_9cm: string;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  soil_moisture_3_to_9cm: number[];
}

export interface DailyUnits {
  time: string;
  weather_code: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  precipitation_sum: string;
  precipitation_probability_max: string;
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
}

/* ────────── WMO Weather Code Mapping ────────── */

export type WeatherSeverity = "safe" | "watch" | "warning" | "danger";

export interface WeatherTheme {
  label: string;
  labelVn: string;
  icon: string; // MaterialCommunityIcons name
  severity: WeatherSeverity;
  color: string;
  bgGradient: readonly [string, string, ...string[]];
  cardGradient: readonly [string, string, ...string[]];
  lottieSource?: string;
}

export function getWeatherTheme(code: number): WeatherTheme {
  // ⚡ Dông sét / Lũ lụt (Nguy hiểm - Theme Đỏ)
  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorm",
      labelVn: "Dông bão",
      icon: "weather-lightning-rainy",
      severity: "danger",
      color: "#EF4444",
      bgGradient: ["#7F1D1D", "#DC2626", "#EF4444"],
      cardGradient: ["#991B1B", "#DC2626"],
    };
  }

  // 🌧 Mưa to (Cảnh báo - Theme Cam)
  if ([65, 82].includes(code)) {
    return {
      label: "Heavy Rain",
      labelVn: "Mưa rất to",
      icon: "weather-pouring",
      severity: "warning",
      color: "#F97316",
      bgGradient: ["#7C2D12", "#EA580C", "#F97316"],
      cardGradient: ["#C2410C", "#F97316"],
    };
  }

  // 🌧 Mưa vừa / Mưa rào (Theme Xanh dương)
  if ([51, 53, 55, 61, 63, 80, 81].includes(code)) {
    return {
      label: "Rain",
      labelVn: "Có mưa",
      icon: "weather-rainy",
      severity: "watch",
      color: "#3B82F6",
      bgGradient: ["#1E3A8A", "#3B82F6", "#60A5FA"],
      cardGradient: ["#1D4ED8", "#3B82F6"],
    };
  }

  // 🌫 Sương mù
  if ([45, 48].includes(code)) {
    return {
      label: "Fog",
      labelVn: "Sương mù",
      icon: "weather-fog",
      severity: "watch",
      color: "#6B7280",
      bgGradient: ["#374151", "#6B7280", "#9CA3AF"],
      cardGradient: ["#4B5563", "#6B7280"],
    };
  }

  // ☁️ Mây u ám
  if (code === 3) {
    return {
      label: "Overcast",
      labelVn: "Nhiều mây",
      icon: "weather-cloudy",
      severity: "safe",
      color: "#64748B",
      bgGradient: ["#0B1A33", "#334155", "#64748B"],
      cardGradient: ["#1E293B", "#475569"],
    };
  }

  // 🌤 Ít mây
  if ([1, 2].includes(code)) {
    return {
      label: "Partly Cloudy",
      labelVn: "Ít mây",
      icon: "weather-partly-cloudy",
      severity: "safe",
      color: "#06B6D4",
      bgGradient: ["#0E7490", "#06B6D4", "#22D3EE"],
      cardGradient: ["#0891B2", "#22D3EE"],
    };
  }

  // ☀️ Trời quang
  return {
    label: "Clear Sky",
    labelVn: "Trời nắng đẹp",
    icon: "weather-sunny",
    severity: "safe",
    color: "#F59E0B",
    bgGradient: ["#D97706", "#F59E0B", "#FBBF24"],
    cardGradient: ["#F59E0B", "#FBBF24"],
  };
}

/** Get short day name in Vietnamese */
export function getDayNameVn(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[date.getDay()];
}

/** Get compact weather icon name for WMO code */
export function getCompactWeatherIcon(code: number): string {
  if ([95, 96, 99].includes(code)) return "weather-lightning";
  if ([65, 82].includes(code)) return "weather-pouring";
  if ([51, 53, 55, 61, 63, 80, 81].includes(code)) return "weather-rainy";
  if ([45, 48].includes(code)) return "weather-fog";
  if (code === 3) return "weather-cloudy";
  if ([1, 2].includes(code)) return "weather-partly-cloudy";
  return "weather-sunny";
}
