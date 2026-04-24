// features/home/hooks/useHomeWeatherData.ts
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import type { PredictionResponse } from "~/features/prediction/types/prediction.types";
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

/** Convert PredictionResponse to AiRiskSummary */
function predictionToRiskSummary(pred: PredictionResponse): AiRiskSummary {
  const ai = pred.forecast?.aiPrediction;
  const prob = Math.round((ai?.ensembleProbability ?? 0) * 100);

  let riskLevel: AiRiskSummary["riskLevel"] = "low";
  let riskLabelVn = "Rủi ro thấp";

  const apiLevel = ai?.riskLevel?.toLowerCase() || "";
  if (
    apiLevel.includes("critical") ||
    apiLevel.includes("very high") ||
    apiLevel.includes("rất cao") ||
    apiLevel.includes("nguy hiểm")
  ) {
    riskLevel = "critical";
    riskLabelVn = "Cực kỳ nguy hiểm";
  } else if (apiLevel.includes("high") || apiLevel.includes("cao")) {
    riskLevel = "high";
    riskLabelVn = "Rủi ro cao";
  } else if (
    apiLevel.includes("medium") ||
    apiLevel.includes("moderate") ||
    apiLevel.includes("trung bình")
  ) {
    riskLevel = "medium";
    riskLabelVn = "Rủi ro trung bình";
  } else {
    riskLevel = "low";
    riskLabelVn = "Rủi ro thấp";
  }

  // Dominant factor from AI components
  let dominantFactor = "water_level";
  let dominantFactorVn = "Mực nước";

  if (ai?.components) {
    const { weather, saturation, terrain } = ai.components;
    const scores = [
      { name: "rainfall", val: weather?.contribution ?? 0, label: "Lượng mưa" },
      {
        name: "saturation",
        val: saturation?.saturation_level ?? 0,
        label: "Độ bão hòa",
      },
      { name: "terrain", val: terrain?.drainage_risk ?? 0, label: "Địa hình" },
    ];
    scores.sort((a, b) => b.val - a.val);
    dominantFactor = scores[0].name;
    dominantFactorVn = scores[0].label;
  }

  const now = new Date();

  return {
    riskLevel,
    riskLabelVn,
    probability: prob,
    dominantFactor,
    dominantFactorVn,
    recommendation:
      ai?.impact?.recommendation ||
      pred.summary ||
      "Theo dõi các bản tin cập nhật để nắm bắt tình hình.",
    areaId: pred.administrativeAreaId,
    areaName: pred.administrativeArea?.name || "Khu vực của bạn",
    updatedAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
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

      if (userArea) {
        const { latitude, longitude } = userArea;

        // Tầng 2: getFloodHistory và reverseGeocodeAsync đều cần userArea nhưng độc lập nhau — song song
        const [historyResult, geoResult] = await Promise.allSettled([
          AreaService.getFloodHistory({
            areaId: userArea.id,
            granularity: "hourly",
            limit: 6,
          }),
          Location.reverseGeocodeAsync({ latitude, longitude }),
        ]);

        if (historyResult.status === "fulfilled") {
          rainfallForecast = deriveRainfallForecast(historyResult.value);
        } else {
          console.warn("⚠️ Could not fetch flood history for rainfall");
        }

        // Tầng 3: Gom tất cả từ khóa tìm kiếm (geo + fallback, loại trùng) rồi bắn song song
        let geoCandidates: string[] = [];
        if (geoResult.status === "fulfilled" && geoResult.value.length > 0) {
          const geo = geoResult.value[0];
          geoCandidates = [
            geo.district, // Often maps to ward level in expo-location VN
            geo.name,
            geo.city,
            geo.subregion,
          ].filter(Boolean) as string[];
        } else {
          console.warn("⚠️ Reverse geocoding failed for prediction mapping");
        }

        const seen = new Set(geoCandidates);
        const fallbackTerms = [userArea.addressText, userArea.name]
          .filter(Boolean)
          .filter((t) => !seen.has(t)) as string[];
        const allCandidates = [...geoCandidates, ...fallbackTerms];

        let adminAreaId: string | null = null;
        if (allCandidates.length > 0) {
          const adminResults = await Promise.allSettled(
            allCandidates.map((term) =>
              AreaService.getAdminAreas({ searchTerm: term, pageSize: 5 }),
            ),
          );

          // Duyệt theo thứ tự ưu tiên gốc: geo candidates trước, fallback sau
          for (const result of adminResults) {
            if (
              result.status === "fulfilled" &&
              result.value.administrativeAreas.length > 0
            ) {
              adminAreaId = result.value.administrativeAreas[0].id;
              break;
            }
          }
        }

        // Tầng 4: Phải chờ adminAreaId — tuần tự
        try {
          const targetPredictionId = adminAreaId || userArea.id;
          const prediction =
            await PredictionService.getFloodRiskPrediction(targetPredictionId);
          aiRisk = predictionToRiskSummary(prediction);
        } catch (err) {
          console.warn("⚠️ Could not fetch AI prediction:", err);
        }
      }

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
