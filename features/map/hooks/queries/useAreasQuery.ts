// features/map/hooks/queries/useAreasQuery.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import type { AreaWithStatus } from "../../types/map-layers.types";

export const AREAS_QUERY_KEY = "userAreas";

export function useAreasQuery() {
  return useQuery({
    queryKey: [AREAS_QUERY_KEY],
    queryFn: async (): Promise<AreaWithStatus[]> => {
      const areas = await AreaService.getAreas();
      const statuses = await Promise.all(
        areas.map((a) => AreaService.getAreaStatus(a.id)),
      );
      return areas.map((area, i) => ({
        ...area,
        status: statuses[i].status,
        severityLevel: statuses[i].severityLevel,
        summary: statuses[i].summary,
        contributingStations: statuses[i].contributingStations,
        evaluatedAt: statuses[i].evaluatedAt,
      }));
    },
    staleTime: 60_000,
  });
}

/** Returns a stable callback that invalidates the areas cache */
export function useRefreshAreas() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [AREAS_QUERY_KEY] });
  }, [queryClient]);
}
