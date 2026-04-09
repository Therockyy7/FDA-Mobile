import axios from "axios";
import {
  PredictionApiResponse,
  PredictionResponse,
} from "../types/prediction.types";
import type { DistrictsForecastResponse } from "../types/districts-forecast.types";

const PREDICTION_BASE_URL =
  process.env.EXPO_PUBLIC_PREDICTION_API_BASE || "https://ai.fda.id.vn";
const PREDICTION_API_KEY = process.env.EXPO_PUBLIC_PREDICTION_API_KEY || "";

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
      const response = await predictionClient.post<PredictionApiResponse>(
        `/api/v1/area/${areaId}/predict-flood-assemble`,
      );
      console.log("Prediction API response :", areaId);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Prediction API returned non-success status",
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("❌ Failed to fetch prediction:" + `${areaId}`, error);
      throw error;
    }
  },

  /**
   * GET /api/v1/districts/forecast
   * Fetch flood risk forecast for all districts at given horizons.
   * @param horizons comma-separated list e.g. "1,3,6,9,12,24"
   */
  getDistrictsForecast: async (
    horizons: string,
  ): Promise<DistrictsForecastResponse> => {
    try {
      const response = await predictionClient.get<DistrictsForecastResponse>(
        `/api/v1/districts/forecast`,
        { params: { horizons } },
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch districts forecast:", error);
      throw error;
    }
  },
};
