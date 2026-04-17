// features/areas/hooks/useFloodStatistics.ts
// Custom hook for fetching flood statistics (FeatG41)
import { useCallback, useEffect, useState } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import type {
  ChartPeriod,
  FloodStatisticsData,
} from "~/features/areas/types/flood-history.types";

interface UseFloodStatisticsParams {
  stationId?: string;
  stationIds?: string[]; // Array of station IDs for Area context
  areaId?: string;
  period?: ChartPeriod;
  includeBreakdown?: boolean;
  includeComparison?: boolean;
  enabled?: boolean;
}

interface UseFloodStatisticsResult {
  data: FloodStatisticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Map ChartPeriod to API period format
function mapPeriodToApiFormat(
  period: ChartPeriod,
): "last7days" | "last30days" | "last90days" {
  switch (period) {
    case "24h":
    case "7d":
      return "last7days";
    case "30d":
      return "last30days";
    case "90d":
      return "last90days";
    default:
      return "last30days";
  }
}

export function useFloodStatistics({
  stationId,
  stationIds,
  areaId,
  period = "30d",
  includeBreakdown = true,
  includeComparison = false,
  enabled = true,
}: UseFloodStatisticsParams): UseFloodStatisticsResult {
  const [data, setData] = useState<FloodStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const stationIdsJoined = stationIds?.join(',') || '';

  const fetchData = useCallback(async () => {
    const currentStationIds = stationIdsJoined ? stationIdsJoined.split(',') : undefined;
    const hasStationId = !!stationId;
    const hasStationIds = currentStationIds && currentStationIds.length > 0;
    const hasAreaId = !!areaId;

    if (!enabled || (!hasStationId && !hasStationIds && !hasAreaId)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiPeriod = mapPeriodToApiFormat(period);

      const result = await AreaService.getFloodStatistics({
        stationId,
        stationIds: currentStationIds,
        areaId,
        period: apiPeriod,
        includeBreakdown,
        includeComparison,
      });

      setData(result);
    } catch (err) {
      console.error("Failed to fetch flood statistics:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch flood statistics"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    stationId,
    stationIdsJoined,
    areaId,
    period,
    includeBreakdown,
    includeComparison,
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
