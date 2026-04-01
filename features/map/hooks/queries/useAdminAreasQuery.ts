// features/map/hooks/queries/useAdminAreasQuery.ts
import { useQuery } from "@tanstack/react-query";
import { AreaService } from "~/features/areas/services/area.service";

export const ADMIN_AREAS_QUERY_KEY = "adminAreas";

export function useAdminAreasQuery() {
  return useQuery({
    queryKey: [ADMIN_AREAS_QUERY_KEY],
    queryFn: () =>
      AreaService.getAdminAreas({ level: "ward", pageNumber: 1, pageSize: 100 }).then(
        (res) => res.administrativeAreas,
      ),
    staleTime: 300_000, // admin areas rarely change
  });
}
