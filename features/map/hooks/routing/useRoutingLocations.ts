// features/map/hooks/routing/useRoutingLocations.ts
// Quản lý data: origin/destination coords, text, GPS flags
import { useCallback, useState } from "react";
import type { LatLng } from "../../types/safe-route.types";

export function useRoutingLocations() {
  const [originText, setOriginTextRaw] = useState("");
  const [startCoord, setStartCoord] = useState<LatLng | null>(null);
  const [isUsingGPSOrigin, setIsUsingGPSOrigin] = useState(true);

  const [destinationText, setDestinationTextRaw] = useState("");
  const [endCoord, setEndCoord] = useState<LatLng | null>(null);
  const [isUsingGPSDest, setIsUsingGPSDest] = useState(false);

  const setOriginText = useCallback((text: string) => {
    setOriginTextRaw(text);
    setIsUsingGPSOrigin(false);
  }, []);

  const setDestinationText = useCallback((text: string) => {
    setDestinationTextRaw(text);
    if (text.length > 0) setIsUsingGPSDest(false);
  }, []);

  const selectGPSAsOrigin = useCallback(() => {
    setIsUsingGPSOrigin(true);
    setStartCoord(null);
    setOriginTextRaw("");
  }, []);

  const selectGPSAsDestination = useCallback((gpsCoord: LatLng) => {
    setIsUsingGPSDest(true);
    setEndCoord(gpsCoord);
    setDestinationTextRaw("Vị trí hiện tại");
  }, []);

  const swapOriginDestination = useCallback(() => {
    const tmpText = originText;
    const tmpCoord = startCoord;
    const tmpUseGPS = isUsingGPSOrigin;

    setOriginTextRaw(destinationText);
    setStartCoord(endCoord);
    setIsUsingGPSOrigin(isUsingGPSDest);

    setDestinationTextRaw(tmpText);
    setEndCoord(tmpCoord);
    setIsUsingGPSDest(tmpUseGPS);
  }, [originText, destinationText, startCoord, endCoord, isUsingGPSOrigin, isUsingGPSDest]);

  const resetLocations = useCallback(() => {
    setOriginTextRaw("");
    setDestinationTextRaw("");
    setStartCoord(null);
    setEndCoord(null);
    setIsUsingGPSOrigin(true);
    setIsUsingGPSDest(false);
  }, []);

  const originLabel = isUsingGPSOrigin ? "Vị trí hiện tại" : originText;

  return {
    originText,
    originLabel,
    setOriginText,
    startCoord,
    setStartCoord,
    isUsingGPSOrigin,
    selectGPSAsOrigin,
    destinationText,
    setDestinationText,
    endCoord,
    setEndCoord,
    isUsingGPSDest,
    selectGPSAsDestination,
    swapOriginDestination,
    resetLocations,
  };
}
