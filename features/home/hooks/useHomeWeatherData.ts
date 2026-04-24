// features/home/hooks/useHomeWeatherData.ts
import { useCallback, useEffect, useState } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import { WeatherService } from "../services/weather.service";
import type { AiRiskSummary, RainfallForecastItem } from "../types/home-types";
import type { OpenMeteoResponse } from "../types/open-meteo.types";

export interface HomeWeatherState {
  meteo: OpenMeteoResponse | null;
  rainfallForecast: RainfallForecastItem[];
  aiRisk: AiRiskSummary | null;
  loading: boolean;
  error: string | null;
}

/* ────────── helpers ────────── */

/** Derive rainfall forecast from flood history hourly data */
function deriveRainfallForecast(floodHistory: {
  dataPoints: { timestamp: string; value: number; severity?: string }[];
}): RainfallForecastItem[] {
  const points = floodHistory.dataPoints || [];
  if (points.length === 0) return getEmptyForecast();

  const recentPoints = points.slice(-6);

  return recentPoints.map((dp) => {
    const timestamp = new Date(dp.timestamp);
    const hour = `${String(timestamp.getHours()).padStart(2, "0")}:00`;

    const waterLevelCm = dp.value;
    let amount: number;
    let level: RainfallForecastItem["level"];

    if (waterLevelCm >= 250) {
      amount = Math.round(25 + (waterLevelCm - 250) * 0.2);
      level = "extreme";
    } else if (waterLevelCm >= 200) {
      amount = Math.round(15 + (waterLevelCm - 200) * 0.2);
      level = "heavy";
    } else if (waterLevelCm >= 150) {
      amount = Math.round(8 + (waterLevelCm - 150) * 0.14);
      level = "moderate";
    } else if (waterLevelCm >= 80) {
      amount = Math.round(2 + (waterLevelCm - 80) * 0.08);
      level = "light";
    } else {
      amount = Math.round(waterLevelCm * 0.02);
      level = amount > 0 ? "light" : "none";
    }

    return { hour, amount, level };
  });
}

function getEmptyForecast(): RainfallForecastItem[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const h = new Date(now.getTime() + i * 3 * 3600 * 1000);
    return {
      hour: `${String(h.getHours()).padStart(2, "0")}:00`,
      amount: 0,
      level: "none" as const,
    };
  });
}

/* ────────── hook ────────── */

let _cachedHomeWeather: HomeWeatherState | null = null;
let _homeWeatherTimestamp = 0;
const HOME_WEATHER_CACHE_TTL_MS = 5 * 60 * 1000;

export function useHomeWeatherData() {
  const [state, setState] = useState<HomeWeatherState>(() => {
    if (
      _cachedHomeWeather &&
      Date.now() - _homeWeatherTimestamp < HOME_WEATHER_CACHE_TTL_MS
    ) {
      return _cachedHomeWeather;
    }
    return {
      meteo: null,
      rainfallForecast: [],
      aiRisk: null,
      loading: true,
      error: null,
    };
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (
      !forceRefresh &&
      _cachedHomeWeather &&
      Date.now() - _homeWeatherTimestamp < HOME_WEATHER_CACHE_TTL_MS
    ) {
      setState(_cachedHomeWeather);
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Tầng 1: getAreas và getForecast hoàn toàn độc lập — bắn song song
      const [areasResult, meteoResult] = await Promise.allSettled([
        AreaService.getAreas(),
        WeatherService.getForecast(),
      ]);

      const userArea =
        areasResult.status === "fulfilled" && areasResult.value.length > 0
          ? areasResult.value[0]
          : null;

      if (areasResult.status === "rejected") {
        console.warn("⚠️ Could not fetch user areas");
      }

      let meteo: OpenMeteoResponse | null = null;
      if (meteoResult.status === "fulfilled") {
        meteo = meteoResult.value;
        console.log(
          "🌦 Open-Meteo data loaded:",
          meteo.current.temperature_2m + "°C",
        );
      } else {
        console.warn("⚠️ Could not fetch Open-Meteo weather");
      }

      let rainfallForecast: RainfallForecastItem[] = getEmptyForecast();
      let aiRisk: AiRiskSummary | null = null;

      // if (userArea) {
      //   const { latitude, longitude } = userArea;

        // // Tầng 2: getFloodHistory và reverseGeocodeAsync đều cần userArea nhưng độc lập nhau — song song
        // const [historyResult, geoResult] = await Promise.allSettled([
        //   AreaService.getFloodHistory({
        //     areaId: userArea.id,
        //     granularity: "hourly",
        //     limit: 6,
        //   }),
        //   Location.reverseGeocodeAsync({ latitude, longitude }),
        // ]);

        // if (historyResult.status === "fulfilled") {
        //   rainfallForecast = deriveRainfallForecast(historyResult.value);
        // } else {
        //   console.warn("⚠️ Could not fetch flood history for rainfall");
        // }

        // Note: AI prediction is handled by DistrictsForecastCard independently
        // to avoid duplicate API calls with potentially different area matches
      // }

      const newState = {
        meteo,
        rainfallForecast,
        aiRisk,
        loading: false,
        error: null,
      };
      _cachedHomeWeather = newState;
      _homeWeatherTimestamp = Date.now();
      setState(newState);
    } catch (err: any) {
      console.error("❌ Home weather data fetch failed:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Không thể tải dữ liệu",
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refresh: fetchData };
}
