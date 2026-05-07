import axios, { isAxiosError } from "axios";
import {
  PredictionApiResponse,
  PredictionResponse,
} from "../types/prediction.types";
import type { DistrictsForecastResponse } from "../types/districts-forecast.types";

const PREDICTION_BASE_URL =
  process.env.EXPO_PUBLIC_PREDICTION_API_BASE || "https://ai.fda.id.vn";
const PREDICTION_API_KEY = process.env.EXPO_PUBLIC_PREDICTION_API_KEY || "";

const DEFAULT_RATE_LIMIT_COOLDOWN_SECONDS = 60;

export class PredictionRateLimitError extends Error {
  constructor(
    public readonly retryAfterSeconds: number = DEFAULT_RATE_LIMIT_COOLDOWN_SECONDS,
    public readonly requestId?: string,
  ) {
    super("RATE_LIMITED");
    this.name = "PredictionRateLimitError";
  }
}

const generateRequestId = () =>
  `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const parseRetryAfterSeconds = (header: unknown): number => {
  if (typeof header !== "string" && typeof header !== "number") {
    return DEFAULT_RATE_LIMIT_COOLDOWN_SECONDS;
  }
  const n = Number(header);
  if (Number.isFinite(n) && n > 0) return Math.ceil(n);
  return DEFAULT_RATE_LIMIT_COOLDOWN_SECONDS;
};

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
    const requestId = generateRequestId();
    try {
      const response = await predictionClient.post<PredictionApiResponse>(
        `/api/v1/area/${areaId}/predict-flood-assemble`,
        undefined,
        { headers: { "X-Request-ID": requestId } },
      );
      console.log("Prediction API response :", areaId);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Prediction API returned non-success status",
        );
      }

      return response.data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = parseRetryAfterSeconds(
          error.response.headers?.["retry-after"],
        );
        console.warn(
          `⏱️ Rate limited (429) for area ${areaId} — retry in ${retryAfter}s — requestId=${requestId}`,
        );
        throw new PredictionRateLimitError(retryAfter, requestId);
      }
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
