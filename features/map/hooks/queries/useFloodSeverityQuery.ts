// features/map/hooks/queries/useFloodSeverityQuery.ts
import { useQuery } from "@tanstack/react-query";
import { MapService } from "../../services/map.service";
import type { FloodStatusParams } from "../../types/map-layers.types";

export const FLOOD_SEVERITY_QUERY_KEY = "floodSeverity";

export function useFloodSeverityQuery(
  params: FloodStatusParams | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [FLOOD_SEVERITY_QUERY_KEY, params],
    queryFn: () => MapService.getFloodSeverity(params ?? undefined),
    enabled: enabled && params !== null,
    staleTime: 30_000,
  });
}
