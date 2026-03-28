// features/map/hooks/useMapData.ts
// Wrapper hook gom tất cả map data sources về 1 chỗ:
// - useMapLayerSettings (settings, flood, areas, community reports)
// - useFloodSignalR (real-time connection)
// - adminAreas (từ map.slice)
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { fetchAdminAreas } from "../stores/map.slice";
import { useFloodSignalR } from "./useFloodSignalR";
import { useMapLayerSettings } from "./useMapLayerSettings";

export function useMapData() {
  const dispatch = useAppDispatch();

  const {
    settings,
    floodSeverity,
    areas,
    communityReports,
    loading,
    floodLoading,
    areasLoading,
    error,
    isAuthenticated,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  } = useMapLayerSettings();

  // Real-time flood updates via SignalR
  useFloodSignalR(settings.overlays.flood);

  // Admin areas
  const adminAreas = useAppSelector((state) => state.map.adminAreas);
  const adminAreasLoading = useAppSelector(
    (state) => state.map.adminAreasLoading,
  );

  useEffect(() => {
    if (adminAreas.length === 0) {
      dispatch(fetchAdminAreas({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, adminAreas.length]);

  return {
    // Settings
    settings,
    isAuthenticated,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    // Flood data
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
    // General
    loading,
    error,
  };
}
