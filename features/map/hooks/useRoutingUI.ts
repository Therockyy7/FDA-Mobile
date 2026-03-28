// features/map/hooks/useRoutingUI.ts
// Quản lý UI state: visibility, transport mode, pick-on-map mode
// Kết hợp với useRoutingLocations để expose toàn bộ routing state
import { useCallback, useState } from "react";
import type { LatLng } from "../types/safe-route.types";
import type { PickingTarget, TransportMode } from "../types/routing.types";
import { useRoutingLocations } from "./useRoutingLocations";

export function useRoutingUI() {
  const [isRoutingUIVisible, setIsRoutingUIVisible] = useState(false);
  const [transportMode, setTransportMode] = useState<TransportMode>("motorbike");
  const [pickingTarget, setPickingTarget] = useState<PickingTarget>(null);

  const locations = useRoutingLocations();

  const isPickingOnMap = pickingTarget !== null;

  const openRouting = useCallback(() => setIsRoutingUIVisible(true), []);

  const closeRouting = useCallback(() => {
    setIsRoutingUIVisible(false);
    setPickingTarget(null);
  }, []);

  const startPickingOrigin = useCallback(() => setPickingTarget("origin"), []);
  const startPickingDestination = useCallback(() => setPickingTarget("destination"), []);
  const cancelPicking = useCallback(() => setPickingTarget(null), []);

  const setPointFromMap = useCallback(
    (coord: LatLng, label: string) => {
      if (pickingTarget === "origin") {
        locations.setStartCoord(coord);
        locations.setOriginText(label);
      } else if (pickingTarget === "destination") {
        locations.setEndCoord(coord);
        locations.setDestinationText(label);
      }
      setPickingTarget(null);
    },
    [pickingTarget, locations],
  );

  const resetRouting = useCallback(() => {
    locations.resetLocations();
    setPickingTarget(null);
  }, [locations]);

  return {
    // UI state
    isRoutingUIVisible,
    openRouting,
    closeRouting,
    transportMode,
    setTransportMode,
    // Pick on map
    pickingTarget,
    isPickingOnMap,
    startPickingOrigin,
    startPickingDestination,
    cancelPicking,
    setPointFromMap,
    // Reset
    resetRouting,
    // Location data (from useRoutingLocations)
    ...locations,
  };
}
