// features/home/hooks/useHomeWeatherData.ts
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
  const prob = Math.round(pred.ensemble_prediction.probability * 100);

  let riskLevel: AiRiskSummary["riskLevel"] = "low";
  let riskLabelVn = "Rủi ro thấp";

  const apiLevel = pred.ensemble_prediction.risk_level?.toLowerCase() || "";
  if (
    apiLevel.includes("critical") ||
    apiLevel.includes("very high") ||
    apiLevel.includes("rất cao")
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

  let dominantFactor = "water_level";
  let dominantFactorVn = "Mực nước";

  if (pred.interpretability?.dominant_factor) {
    dominantFactor = pred.interpretability.dominant_factor.factor_name;
    dominantFactorVn = pred.interpretability.dominant_factor.factor_name_vn;
  } else if (pred.ai_engine_output?.contribution_scores) {
    const scores = pred.ai_engine_output.contribution_scores;
    const entries = Object.entries(scores);
    if (entries.length > 0) {
      entries.sort((a, b) => b[1] - a[1]);
      dominantFactor = entries[0][0];
      const translations: Record<string, string> = {
        rainfall_intensity: "Cường độ mưa",
        water_level: "Mực nước",
        soil_saturation: "Độ bão hòa đất",
        historical_pattern: "Lịch sử ngập lụt",
        drainage_capacity: "Năng lực thoát nước",
        slope: "Độ dốc địa hình",
      };
      dominantFactorVn = translations[dominantFactor] || dominantFactor;
    }
  }

  const now = new Date();

  return {
    riskLevel,
    riskLabelVn,
    probability: prob,
    dominantFactor,
    dominantFactorVn,
    recommendation:
      pred.ensemble_prediction.recommendation ||
      "Theo dõi các bản tin cập nhật để nắm bắt tình hình.",
    areaId: pred.area_id,
    areaName: pred.area_name,
    updatedAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
}

/* ────────── hook ────────── */

export function useHomeWeatherData() {
  const [state, setState] = useState<HomeWeatherState>({
    meteo: null,
    rainfallForecast: [],
    aiRisk: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1) Get user's first area for prediction + flood history
      let firstAreaId: string | null = null;
      try {
        const areas = await AreaService.getAreas();
        if (areas.length > 0) {
          firstAreaId = areas[0].id;
        }
      } catch {
        console.warn("⚠️ Could not fetch user areas");
      }

      // 2) Fetch real weather from Open-Meteo
      let meteo: OpenMeteoResponse | null = null;
      try {
        meteo = await WeatherService.getForecast();
        console.log("🌦 Open-Meteo data loaded:", meteo.current.temperature_2m + "°C");
      } catch {
        console.warn("⚠️ Could not fetch Open-Meteo weather");
      }

      // 3) Fetch flood history for rainfall forecast
      let rainfallForecast: RainfallForecastItem[] = getEmptyForecast();
      if (firstAreaId) {
        try {
          const history = await AreaService.getFloodHistory({
            areaId: firstAreaId,
            granularity: "hourly",
            limit: 6,
          });
          rainfallForecast = deriveRainfallForecast(history);
        } catch {
          console.warn("⚠️ Could not fetch flood history for rainfall");
        }
      }

      // 4) Fetch AI prediction
      let aiRisk: AiRiskSummary | null = null;
      if (firstAreaId) {
        try {
          const prediction =
            await PredictionService.getFloodRiskPrediction(firstAreaId);
          aiRisk = predictionToRiskSummary(prediction);
        } catch {
          console.warn("⚠️ Could not fetch AI prediction");
        }
      }

      setState({
        meteo,
        rainfallForecast,
        aiRisk,
        loading: false,
        error: null,
      });
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
