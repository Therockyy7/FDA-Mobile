import axios from "axios";
import { PredictionResponse } from "../types/prediction.types";

const predictionClient = axios.create({
  baseURL: "http://103.77.242.129:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const PredictionService = {
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
};
