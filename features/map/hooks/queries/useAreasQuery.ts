// features/map/hooks/queries/useAreasQuery.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { AreaService } from "~/features/areas/services/area.service";
import type { AreaWithStatus } from "../../types/map-layers.types";

export const AREAS_QUERY_KEY = "userAreas";

export function useAreasQuery() {
  return useQuery({
    queryKey: [AREAS_QUERY_KEY],
    queryFn: (): Promise<AreaWithStatus[]> => AreaService.getAreasWithStatus(),
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
