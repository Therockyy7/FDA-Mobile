// features/map/hooks/index.ts — barrel export for all hooks

// Root hooks
export { useMapCamera } from "./useMapCamera";
export { useMapData } from "./useMapData";
export { useMapDisplay } from "./useMapDisplay";
export { useMapScreen } from "./useMapScreen";
export { useNavigation } from "./useNavigation";
export { usePlaceSearch } from "./usePlaceSearch";
export { useStreetView } from "./useStreetView";
export { useUserLocation } from "./useUserLocation";

// Flood
export { useFloodData } from "./flood/useFloodData";
export { useFloodLayerSettings } from "./flood/useFloodLayerSettings";
export { useFloodSignalR } from "./flood/useFloodSignalR";

// Navigation
export { useGPSWatcher } from "./navigation/useGPSWatcher";
export { useNavigationState } from "./navigation/useNavigationState";
export { useNavigationVoice } from "./navigation/useNavigationVoice";

// Routing
export { useRoutingLocations } from "./routing/useRoutingLocations";
export { useRoutingUI } from "./routing/useRoutingUI";
export { useSafeRoute } from "./routing/useSafeRoute";

// Queries
export { useAdminAreasQuery } from "./queries/useAdminAreasQuery";
export { useAreasQuery } from "./queries/useAreasQuery";
export { useCommunityReportsQuery } from "./queries/useCommunityReportsQuery";
export { useFloodSeverityQuery } from "./queries/useFloodSeverityQuery";
export {
  AREAS_QUERY_KEY,
  useRefreshAreas,
} from "./queries/useAreasQuery";
export { ADMIN_AREAS_QUERY_KEY } from "./queries/useAdminAreasQuery";
export { COMMUNITY_REPORTS_QUERY_KEY } from "./queries/useCommunityReportsQuery";
export { FLOOD_SEVERITY_QUERY_KEY } from "./queries/useFloodSeverityQuery";

// Mutations
export { useMapSettingsMutation } from "./mutations/useMapSettingsMutation";
