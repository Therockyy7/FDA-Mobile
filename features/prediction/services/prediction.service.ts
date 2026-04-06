import axios from "axios";
import {
  PredictionApiResponse,
  PredictionResponse,
} from "../types/prediction.types";

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
};
