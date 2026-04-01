// features/map/hooks/routing/useSafeRoute.ts
import { useCallback, useState } from "react";
import type { TransportMode } from "../../types/routing.types";
import { FloodRoute, FloodZone } from "../../constants/map-data";
import { parseRouteResponse } from "../../lib/polyline-utils";
import { SafeRouteService } from "../../services/safe-route.service";
import type {
  DecodedRoute,
  FloodWarningDto,
  LatLng,
  RouteMetadata,
  RouteSafetyStatus,
} from "../../types/safe-route.types";
import { TRANSPORT_MODE_TO_PROFILE } from "../../types/safe-route.types";

export function useSafeRoute() {
  // Safe route data
  const [primaryRoute, setPrimaryRoute] = useState<DecodedRoute | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<DecodedRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [overallSafetyStatus, setOverallSafetyStatus] = useState<RouteSafetyStatus | null>(null);
  const [floodWarnings, setFloodWarnings] = useState<FloodWarningDto[]>([]);
  const [metadata, setMetadata] = useState<RouteMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flood map selection (merged from useFloodSelection)
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FloodRoute | null>(null);
  const [showDetailPanels, setShowDetailPanels] = useState(true);

  const hasResults = primaryRoute !== null;

  const findRoute = useCallback(
    async (
      start: LatLng,
      end: LatLng,
      transportMode: TransportMode,
      maxAlternatives: number = 2,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await SafeRouteService.getSafeRoute({
          startLatitude: start.latitude,
          startLongitude: start.longitude,
          endLatitude: end.latitude,
          endLongitude: end.longitude,
          routeProfile: TRANSPORT_MODE_TO_PROFILE[transportMode],
          maxAlternatives,
          avoidFloodedAreas: true,
        });

        if (!response.success) {
          setError(response.message || "Không tìm được tuyến đường");
          return;
        }

        const parsed = parseRouteResponse(response.data);

        if (!parsed.primaryRoute) {
          setError("Không tìm được tuyến đường");
          return;
        }

        if (parsed.metadata.safetyStatus === "Blocked") {
          setError("Tất cả các tuyến đường đều bị ngập. Vui lòng thử lại sau.");
          setOverallSafetyStatus("Blocked");
          return;
        }

        setPrimaryRoute(parsed.primaryRoute);
        setAlternativeRoutes(parsed.alternativeRoutes);
        setSelectedRouteIndex(0);
        setOverallSafetyStatus(parsed.metadata.safetyStatus);
        setFloodWarnings(parsed.floodWarnings);
        setMetadata(parsed.metadata);
      } catch (err: any) {
        setError(err?.message || "Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const selectRoute = useCallback((index: number) => {
    setSelectedRouteIndex(index);
  }, []);

  const getSelectedRoute = useCallback((): DecodedRoute | null => {
    if (selectedRouteIndex === 0) return primaryRoute;
    return alternativeRoutes[selectedRouteIndex - 1] ?? null;
  }, [selectedRouteIndex, primaryRoute, alternativeRoutes]);

  const getAllRoutes = useCallback((): DecodedRoute[] => {
    if (!primaryRoute) return [];
    return [primaryRoute, ...alternativeRoutes];
  }, [primaryRoute, alternativeRoutes]);

  const clearRoutes = useCallback(() => {
    setPrimaryRoute(null);
    setAlternativeRoutes([]);
    setSelectedRouteIndex(0);
    setOverallSafetyStatus(null);
    setFloodWarnings([]);
    setMetadata(null);
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, []);

  return {
    // Safe route
    primaryRoute,
    alternativeRoutes,
    selectedRouteIndex,
    overallSafetyStatus,
    floodWarnings,
    metadata,
    isLoading,
    error,
    hasResults,
    findRoute,
    selectRoute,
    getSelectedRoute,
    getAllRoutes,
    clearRoutes,
    // Flood map selection
    selectedZone,
    setSelectedZone,
    selectedRoute,
    setSelectedRoute,
    showDetailPanels,
    setShowDetailPanels,
    clearSelection,
  };
}
