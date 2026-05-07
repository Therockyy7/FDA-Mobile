// features/map/services/safe-route.service.ts
import { isAxiosError } from "axios";
import { apiClient } from "~/lib/api-client";
import type { SafeRouteRequest, SafeRouteResponse } from "../types/safe-route.types";
import { MapServiceError } from "./map-service-error";

const DEFAULT_ROUTE_RATE_LIMIT_COOLDOWN_SECONDS = 60;

export class SafeRouteRateLimitError extends Error {
  constructor(
    public readonly retryAfterSeconds: number = DEFAULT_ROUTE_RATE_LIMIT_COOLDOWN_SECONDS,
    public readonly requestId?: string,
  ) {
    super("ROUTE_RATE_LIMITED");
    this.name = "SafeRouteRateLimitError";
  }
}

const parseRetryAfterSeconds = (header: unknown): number => {
  if (typeof header !== "string" && typeof header !== "number") {
    return DEFAULT_ROUTE_RATE_LIMIT_COOLDOWN_SECONDS;
  }
  const n = Number(header);
  if (Number.isFinite(n) && n > 0) return Math.ceil(n);
  return DEFAULT_ROUTE_RATE_LIMIT_COOLDOWN_SECONDS;
};

export const SafeRouteService = {
  getSafeRoute: async (params: SafeRouteRequest): Promise<SafeRouteResponse> => {
    try {
      const res = await apiClient.post<SafeRouteResponse>(
        "/api/v1/routing/safe-route",
        params,
      );
      return res.data;
    } catch (error: any) {
      if (isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = parseRetryAfterSeconds(
          error.response.headers?.["retry-after"],
        );
        console.warn(`⏱️ Safe Route rate limited (429) — retry in ${retryAfter}s`);
        throw new SafeRouteRateLimitError(retryAfter);
      }
      throw new MapServiceError(
        error?.response?.data?.message || error?.message || "Failed to calculate safe route",
        error?.response?.status,
      );
    }
  },
};
