// features/map/hooks/useMapData.ts
// Convenience wrapper that aggregates all map data sources.
// Delegates to flood/ hooks for flood data, plus area queries.

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { NearbyFloodReportsParams } from "~/features/community/services/community.service";
import { useFloodLayerSettings, useFloodSignalR } from "./flood";
import { useFloodData } from "./flood/useFloodData";
import { DEFAULT_MAP_SETTINGS } from "../stores/useMapSettingsStore";
import { useAdminAreasQuery } from "./queries/useAdminAreasQuery";
import { useAreasQuery } from "./queries/useAreasQuery";
import { useCommunityReportsQuery, COMMUNITY_REPORTS_QUERY_KEY } from "./queries/useCommunityReportsQuery";
import { DANANG_CENTER } from "../constants/map-data";

const DEFAULT_COMMUNITY_PARAMS: NearbyFloodReportsParams = {
  latitude: DANANG_CENTER.latitude,
  longitude: DANANG_CENTER.longitude,
  radiusMeters: Math.round((DANANG_CENTER.latitudeDelta / 2) * 111320 * 1.5),
  hours: 720,
};

export function useMapData(communityParams?: NearbyFloodReportsParams) {
  const queryClient = useQueryClient();
  const {
    settings,
    settingsLoaded,
    isAuthenticated,
    loading,
    error,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  } = useFloodLayerSettings();

  // Real-time flood updates via SignalR
  useFloodSignalR(settings?.overlays?.flood ?? false);

  // Flood severity data (REST + SignalR real-time merge)
  // When settings is undefined (before Zustand hydrate), fallback to true so API is called.
  const { floodSeverity, isLoading: floodLoading, refetch: refetchFloodSeverity } = useFloodData(
    undefined,
    settings?.overlays?.flood ?? true,
  );

  // Force refetch when flood overlay becomes enabled
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    const isFloodEnabled = settings?.overlays?.flood ?? true;
    if (isFloodEnabled && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refetchFloodSeverity();
    }
  }, [settings?.overlays?.flood, refetchFloodSeverity]);

  // Community reports — use provided params or default to Da Nang center
  const activeParams = communityParams ?? DEFAULT_COMMUNITY_PARAMS;
  const communityReportsQuery = useCommunityReportsQuery(
    activeParams,
    settings?.overlays?.communityReports ?? true,
  );
  const communityReports = communityReportsQuery.data ?? [];

  // Imperative refresh that actually updates the query params by canceling
  // old queries and fetching with new params
  const refreshCommunityReports = (params: NearbyFloodReportsParams) => {
    // Invalidate all community report queries so React Query refetches
    queryClient.invalidateQueries({ queryKey: [COMMUNITY_REPORTS_QUERY_KEY] });
  };

  // User areas
  const areasQuery = useAreasQuery();
  const areas = areasQuery.data ?? [];
  const areasLoading = areasQuery.isLoading;

  // Admin areas
  const adminAreasQuery = useAdminAreasQuery();
  const adminAreas = adminAreasQuery.data ?? [];
  const adminAreasLoading = adminAreasQuery.isLoading;

  return {
    // Settings
    settings: settings ?? DEFAULT_MAP_SETTINGS,
    settingsLoaded,
    isAuthenticated,
    loading,
    error,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    // Flood
    floodSeverity,
    floodLoading,
    refreshFloodSeverity,
    // User areas
    areas,
    areasLoading,
    refreshAreas,
    // Community reports
    communityReports,
    refreshNearbyFloodReports,
    refreshCommunityReports,
    // Admin areas
    adminAreas,
    adminAreasLoading,
  };
}
