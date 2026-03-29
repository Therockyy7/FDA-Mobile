// features/map/hooks/useMapData.ts
// Convenience wrapper that aggregates all map data sources.
// Delegates to flood/ hooks for flood data, plus area queries.

import { useEffect, useRef } from "react";
import type { NearbyFloodReportsParams } from "~/features/community/services/community.service";
import { useFloodLayerSettings, useFloodSignalR } from "./flood";
import { useFloodData } from "./flood/useFloodData";
import { DEFAULT_MAP_SETTINGS } from "../stores/useMapSettingsStore";
import { useAdminAreasQuery } from "./queries/useAdminAreasQuery";
import { useAreasQuery } from "./queries/useAreasQuery";
import { useCommunityReportsQuery } from "./queries/useCommunityReportsQuery";
import { DANANG_CENTER } from "../constants/map-data";

const DEFAULT_COMMUNITY_PARAMS: NearbyFloodReportsParams = {
  latitude: DANANG_CENTER.latitude,
  longitude: DANANG_CENTER.longitude,
  radiusMeters: Math.round((DANANG_CENTER.latitudeDelta / 2) * 111320),
  hours: 720,
};

export function useMapData() {
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
  // FloodSeverityMarkers renders only when settings?.overlays?.flood === true.
  const { floodSeverity, isLoading: floodLoading, refetch: refetchFloodSeverity } = useFloodData(
    undefined,
    settings?.overlays?.flood ?? true,
  );

  // Force refetch when flood overlay becomes enabled (settings loads from undefined → true)
  // React Query doesn't auto-retry when `enabled` goes false→true, so we need this.
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    const isFloodEnabled = settings?.overlays?.flood ?? true;
    if (isFloodEnabled && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refetchFloodSeverity();
    }
  }, [settings?.overlays?.flood, refetchFloodSeverity]);

  // Community reports (initial load at Da Nang center)
  const communityReportsQuery = useCommunityReportsQuery(
    DEFAULT_COMMUNITY_PARAMS,
    settings?.overlays?.communityReports ?? true,
  );
  const communityReports = communityReportsQuery.data ?? [];

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
    // Admin areas
    adminAreas,
    adminAreasLoading,
  };
}
