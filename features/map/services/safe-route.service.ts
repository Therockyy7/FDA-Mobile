// features/map/services/safe-route.service.ts
import { apiClient } from "~/lib/api-client";
import type { SafeRouteRequest, SafeRouteResponse } from "../types/safe-route.types";
import { MapServiceError } from "./map-service-error";

export const SafeRouteService = {
  getSafeRoute: async (params: SafeRouteRequest): Promise<SafeRouteResponse> => {
    try {
      const res = await apiClient.post<SafeRouteResponse>(
        "/api/v1/routing/safe-route",
        params,
      );
      return res.data;
    } catch (error: any) {
      throw new MapServiceError(
        error?.response?.data?.message || error?.message || "Failed to calculate safe route",
        error?.response?.status,
      );
    }
  },
};
