// features/areas/hooks/useFloodTrends.ts
// Custom hook for fetching flood trend data (FeatG40)
import { useCallback, useEffect, useState } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import type {
    ChartPeriod,
    FloodTrendsData,
} from "~/features/areas/types/flood-history.types";

interface UseFloodTrendsParams {
  stationId?: string;
  areaId?: string;
  period?: ChartPeriod;
  // Custom date range (required when period = "custom")
  startDate?: string;
  endDate?: string;
  compareWithPrevious?: boolean;
  enabled?: boolean;
}

interface UseFloodTrendsResult {
  data: FloodTrendsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Map ChartPeriod to API period format or calculate custom dates
function getApiParams(
  period: ChartPeriod,
  customStartDate?: string,
  customEndDate?: string,
): {
  apiPeriod:
    | "last7days"
    | "last30days"
    | "last90days"
    | "last365days"
    | "custom";
  startDate?: string;
  endDate?: string;
} {
  if (period === "custom") {
    return {
      apiPeriod: "custom",
      startDate: customStartDate,
      endDate: customEndDate,
    };
  }

  // For standard periods, use predefined API values
  switch (period) {
    case "24h":
    case "7d":
      return { apiPeriod: "last7days" };
    case "30d":
      return { apiPeriod: "last30days" };
    case "90d":
      return { apiPeriod: "last90days" };
    default:
      return { apiPeriod: "last30days" };
  }
}

export function useFloodTrends({
  stationId,
  areaId,
  period = "30d",
  startDate: customStartDate,
  endDate: customEndDate,
  compareWithPrevious = true,
  enabled = true,
}: UseFloodTrendsParams): UseFloodTrendsResult {
  const [data, setData] = useState<FloodTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || (!stationId && !areaId)) {
      return;
    }

    // For custom period, require startDate and endDate
    if (period === "custom" && (!customStartDate || !customEndDate)) {
      console.warn("Custom period requires startDate and endDate");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { apiPeriod, startDate, endDate } = getApiParams(
        period,
        customStartDate,
        customEndDate,
      );

      const result = await AreaService.getFloodTrends({
        stationId,
        areaId,
        period: apiPeriod,
        startDate,
        endDate,
        granularity: "daily",
        compareWithPrevious,
      });

      setData(result);
    } catch (err) {
      console.error("Failed to fetch flood trends:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch flood trends"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    stationId,
    areaId,
    period,
    customStartDate,
    customEndDate,
    compareWithPrevious,
    enabled,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
