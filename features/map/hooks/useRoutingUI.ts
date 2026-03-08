import { useCallback, useState } from "react";
import { TransportMode } from "../components/routes/RouteDirectionPanel";
import type { LatLng } from "../types/safe-route.types";

export type PickingTarget = "origin" | "destination" | null;

export function useRoutingUI() {
  const [isRoutingUIVisible, setIsRoutingUIVisible] = useState(false);
  const [transportMode, setTransportMode] =
    useState<TransportMode>("motorbike");

  // Origin state
  const [originText, setOriginText] = useState("");
  const [startCoord, setStartCoord] = useState<LatLng | null>(null);
  const [isUsingGPSOrigin, setIsUsingGPSOrigin] =
    useState(true);

  // Destination state
  const [destinationText, setDestinationText] = useState("");
  const [endCoord, setEndCoord] = useState<LatLng | null>(null);
  const [isUsingGPSDest, setIsUsingGPSDest] =
    useState(false);

  // Pick-on-map mode
  const [pickingTarget, setPickingTarget] = useState<PickingTarget>(null);
  const isPickingOnMap = pickingTarget !== null;

  const openRouting = useCallback(() => setIsRoutingUIVisible(true), []);

  const closeRouting = useCallback(() => {
    setIsRoutingUIVisible(false);
    setPickingTarget(null);
  }, []);

  const startPickingOrigin = useCallback(() => {
    setPickingTarget("origin");
  }, []);

  const startPickingDestination = useCallback(() => {
    setPickingTarget("destination");
  }, []);

  const cancelPicking = useCallback(() => {
    setPickingTarget(null);
  }, []);

  // Set a point from map tap (for whichever target is active)
  const setPointFromMap = useCallback(
    (coord: LatLng, label: string) => {
      if (pickingTarget === "origin") {
        setStartCoord(coord);
        setOriginText(label);
        setIsUsingGPSOrigin(false);
      } else if (pickingTarget === "destination") {
        setEndCoord(coord);
        setDestinationText(label);
        setIsUsingGPSDest(false);
      }
      setPickingTarget(null);
    },
    [pickingTarget]
  );

  // Quick-select "Vị trí hiện tại" for origin
  const selectGPSAsOrigin = useCallback(() => {
    setIsUsingGPSOrigin(true);
    setStartCoord(null);
    setOriginText("");
  }, []);

  // Quick-select "Vị trí hiện tại" for destination
  const selectGPSAsDestination = useCallback(
    (gpsCoord: LatLng) => {
      setIsUsingGPSDest(true);
      setEndCoord(gpsCoord);
      setDestinationText("Vị trí hiện tại");
    },
    []
  );

  // When user types in origin, disable "current location" mode
  const handleOriginTextChange = useCallback((text: string) => {
    setOriginText(text);
    if (text.length > 0) {
      setIsUsingGPSOrigin(false);
    }
  }, []);

  // When user types in destination, disable "current location" mode
  const handleDestinationTextChange = useCallback((text: string) => {
    setDestinationText(text);
    if (text.length > 0) {
      setIsUsingGPSDest(false);
    }
  }, []);

  const swapOriginDestination = useCallback(() => {
    const tmpText = originText;
    const tmpCoord = startCoord;
    const tmpUseGPS = isUsingGPSOrigin;

    setOriginText(destinationText);
    setStartCoord(endCoord);
    setIsUsingGPSOrigin(isUsingGPSDest);

    setDestinationText(tmpText);
    setEndCoord(tmpCoord);
    setIsUsingGPSDest(tmpUseGPS);
  }, [
    originText,
    destinationText,
    startCoord,
    endCoord,
    isUsingGPSOrigin,
    isUsingGPSDest,
  ]);

  const resetRouting = useCallback(() => {
    setOriginText("");
    setDestinationText("");
    setStartCoord(null);
    setEndCoord(null);
    setPickingTarget(null);
    setIsUsingGPSOrigin(true);
    setIsUsingGPSDest(false);
  }, []);

  // Display label
  const originLabel = isUsingGPSOrigin
    ? "Vị trí hiện tại"
    : originText;

  return {
    isRoutingUIVisible,
    openRouting,
    closeRouting,
    transportMode,
    setTransportMode,
    // Origin
    originLabel,
    originText,
    setOriginText: handleOriginTextChange,
    startCoord,
    setStartCoord,
    isUsingGPSOrigin,
    selectGPSAsOrigin,
    // Destination
    destinationText,
    setDestinationText: handleDestinationTextChange,
    endCoord,
    setEndCoord,
    isUsingGPSDest,
    selectGPSAsDestination,
    // Pick on map
    pickingTarget,
    isPickingOnMap,
    startPickingOrigin,
    startPickingDestination,
    cancelPicking,
    setPointFromMap,
    // Swap & Reset
    swapOriginDestination,
    resetRouting,
    // Backward compat aliases
    isPickingDestination: pickingTarget === "destination",
    setDestinationFromMap: (coord: LatLng, label: string) => {
      setEndCoord(coord);
      setDestinationText(label);
      setIsUsingGPSDest(false);
      setPickingTarget(null);
    },
    setOriginFromGPS: (coord: LatLng, label: string) => {
      setStartCoord(coord);
      setOriginText(label);
    },
  };
}
