// features/map/hooks/useMapData.ts
// Convenience wrapper that aggregates all map data sources.
// Delegates to flood/ hooks for flood data, plus area queries.

import type { NearbyFloodReport } from "~/features/community/services/community.service";
import type { FloodSeverityGeoJSON } from "../types/map-layers.types";
import { useFloodLayerSettings, useFloodSignalR } from "./flood";
import { useAdminAreasQuery } from "./queries/useAdminAreasQuery";
import { useAreasQuery } from "./queries/useAreasQuery";

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
  useFloodSignalR(settings.overlays.flood);

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
    settings,
    settingsLoaded,
    isAuthenticated,
    loading,
    error,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    // Flood — consumed via useFloodData in MapScreen; placeholder here
    floodSeverity: undefined as FloodSeverityGeoJSON | undefined,
    floodLoading: false,
    refreshFloodSeverity,
    // User areas
    areas,
    areasLoading,
    refreshAreas,
    // Community reports (loaded on demand by MapScreen with viewport params)
    communityReports: [] as NearbyFloodReport[],
    refreshNearbyFloodReports,
    // Admin areas
    adminAreas,
    adminAreasLoading,
  };
}
