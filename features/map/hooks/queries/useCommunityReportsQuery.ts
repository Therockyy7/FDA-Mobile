// features/map/hooks/queries/useCommunityReportsQuery.ts
import { useQuery } from "@tanstack/react-query";
import {
  CommunityService,
  type NearbyFloodReport,
  type NearbyFloodReportsParams,
} from "~/features/community/services/community.service";

export const COMMUNITY_REPORTS_QUERY_KEY = "communityReports";

export function useCommunityReportsQuery(
  params: NearbyFloodReportsParams | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [COMMUNITY_REPORTS_QUERY_KEY, params],
    queryFn: async (): Promise<NearbyFloodReport[]> => {
      const res = await CommunityService.getNearbyFloodReports(params!);
      return res.reports;
    },
    enabled: enabled && params !== null,
    staleTime: 0,           // Always consider data stale → refetch on focus
    refetchInterval: 60_000, // Auto-refresh every 60s while map is open
    refetchOnWindowFocus: true,
  });
}
