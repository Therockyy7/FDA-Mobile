// features/map/services/basic-route.service.ts
// Anonymous (guest) basic route — no JWT required.
// Endpoint: POST /api/v1/routing/basic-route

import { apiClient } from "~/lib/api-client";
import type { BasicRouteRequest, SafeRouteResponse } from "../types/safe-route.types";
import { MapServiceError } from "./map-service-error";

export const BasicRouteService = {
  getBasicRoute: async (params: BasicRouteRequest): Promise<SafeRouteResponse> => {
    try {
      const res = await apiClient.post<SafeRouteResponse>(
        "/api/v1/routing/basic-route",
        params,
      );
      return res.data;
    } catch (error: any) {
      throw new MapServiceError(
        error?.response?.data?.message || error?.message || "Failed to calculate basic route",
        error?.response?.status,
      );
    }
  },
};
