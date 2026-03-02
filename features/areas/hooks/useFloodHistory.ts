// features/areas/hooks/useFloodHistory.ts
// Custom hook for fetching flood history data (FeatG39)
import { useCallback, useEffect, useState } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import type {
  ChartPeriod,
  FloodHistoryData,
} from "~/features/areas/types/flood-history.types";

interface UseFloodHistoryParams {
  stationId?: string;
  stationIds?: string[]; // Array of station IDs for Area context
  areaId?: string;
  period?: ChartPeriod;
  enabled?: boolean;
}

interface UseFloodHistoryResult {
  data: FloodHistoryData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFloodHistory({
  stationId,
  stationIds,
  areaId,
  period = "24h",
  enabled = true,
}: UseFloodHistoryParams): UseFloodHistoryResult {
  const [data, setData] = useState<FloodHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Format date to ISO string for API: 2026-01-17T09:13:35Z (UTC with Z suffix)
  const formatDateForApi = (date: Date): string => {
    return date.toISOString().split(".")[0] + "Z";
  };

  // Calculate date range based on period
  const getDateRange = useCallback((period: ChartPeriod) => {
    const now = new Date();
    const endDate = formatDateForApi(now);
    let startDate: string;
    let granularity: "hourly" | "daily";

    switch (period) {
      case "24h":
        startDate = formatDateForApi(
          new Date(now.getTime() - 24 * 60 * 60 * 1000),
        );
        granularity = "hourly";
        break;
      case "7d":
        startDate = formatDateForApi(
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        );
        granularity = "daily";
        break;
      case "30d":
        startDate = formatDateForApi(
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        );
        granularity = "daily";
        break;
      case "90d":
        startDate = formatDateForApi(
          new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        );
        granularity = "daily";
        break;
      default:
        startDate = formatDateForApi(
          new Date(now.getTime() - 24 * 60 * 60 * 1000),
        );
        granularity = "hourly";
    }

    return { startDate, endDate, granularity };
  }, []);

  const fetchData = useCallback(async () => {
    // Enable if stationId, stationIds array, or areaId is provided
    const hasStationId = !!stationId;
    const hasStationIds = stationIds && stationIds.length > 0;
    const hasAreaId = !!areaId;

    if (!enabled || (!hasStationId && !hasStationIds && !hasAreaId)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate, granularity } = getDateRange(period);

      const result = await AreaService.getFloodHistory({
        stationId,
        stationIds,
        areaId,
        startDate,
        endDate,
        granularity,
      });

      setData(result);
    } catch (err) {
      console.error("Failed to fetch flood history:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch flood history"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [stationId, stationIds, areaId, period, enabled, getDateRange]);

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
