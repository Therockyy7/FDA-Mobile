import axios from "axios";
import { PredictionResponse } from "../types/prediction.types";
import { DistrictsForecastResponse } from "../types/districts-forecast.types";

const PREDICTION_BASE_URL =
  process.env.EXPO_PUBLIC_PREDICTION_API_BASE || "http://103.77.242.129:8000";
const PREDICTION_API_KEY =
  process.env.EXPO_PUBLIC_PREDICTION_API_KEY || "";

const predictionClient = axios.create({
  baseURL: PREDICTION_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(PREDICTION_API_KEY
      ? { Authorization: `Bearer ${PREDICTION_API_KEY}` }
      : {}),
  },
  timeout: 30000,
});

export const PredictionService = {
  /**
   * POST /api/v1/area/{areaId}/predict/flood-risk-ensemble
   * Primary ensemble prediction: AI + Physics + Community + Satellite
   */
  getFloodRiskPrediction: async (
    areaId: string,
  ): Promise<PredictionResponse> => {
    try {
      const response = await predictionClient.post<PredictionResponse>(
        `/api/v1/area/${areaId}/predict/flood-risk-ensemble`,
      );

      if (response.data.status !== "success") {
        throw new Error("Prediction API returned non-success status");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch prediction:", error);
      throw error;
    }
  },

  /**
   * GET /api/v1/area/districts/predict/flood-risk-forecast
   * All-districts temporal forecast with 3h/5h/7h windows
   */
  getDistrictsForecast: async (
    horizons: string = "3,5,7",
  ): Promise<DistrictsForecastResponse> => {
    try {
      const response =
        await predictionClient.get<DistrictsForecastResponse>(
          `/api/v1/area/districts/predict/flood-risk-forecast`,
          { params: { horizons } },
        );

      if (!response.data.success) {
        throw new Error("Districts forecast API returned non-success status");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch districts forecast:", error);
      throw error;
    }
  },
};
