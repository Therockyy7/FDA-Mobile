import axios from "axios";
import type {
  SatelliteAnalysisParams,
  SatelliteAnalysisResponse,
} from "../types/satellite.types";

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
  // Satellite analysis is compute-heavy — allow up to 3 minutes
  timeout: 180000,
});

export const SatelliteService = {
  /**
   * POST /api/v1/area/{area_id}/verify/satellite-analysis
   *
   * Uses NASA Prithvi ViT foundation model to detect flood extent from
   * Sentinel-1 (SAR/radar) and Sentinel-2 (optical) satellite imagery.
   *
   * @param params.area_id   - City or district UUID
   * @param params.use_bbox  - true → district bbox, false → full city region
   * @param params.use_fusion - true → run BOTH S1 + S2 for maximum accuracy
   */
  runSatelliteAnalysis: async (
    params: SatelliteAnalysisParams,
  ): Promise<SatelliteAnalysisResponse> => {
    const { area_id, use_bbox = true, use_fusion = true, capture_mode, include_permanent_water = false } = params;

    try {
      // API expects use_bbox & use_fusion as query string params, not body
      const response = await predictionClient.post<SatelliteAnalysisResponse>(
        `/api/v1/area/${area_id}/verify/satellite-analysis`,
        null,                          
        { params: { use_bbox, use_fusion, capture_mode, include_permanent_water } },
      );

      if (response.data.status !== "success") {
        throw new Error(
          response.data.error || "Satellite analysis returned non-success status",
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("❌ Satellite analysis failed:", error?.message);
      throw error;
    }
  },
};
