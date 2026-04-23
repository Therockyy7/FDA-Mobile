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
    staleTime: 30_000,          // Don't refetch within 30s — community data is near-realtime via SignalR anyway
    gcTime: 24 * 60 * 60_000,
    networkMode: "offlineFirst",
    refetchInterval: 120_000,   // Background refresh every 2 min (was 60s — halved to reduce load)
    refetchOnWindowFocus: false, // Don't refetch on app focus — prevents burst on tab switch
  });
}
