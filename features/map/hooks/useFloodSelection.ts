import { useCallback, useState } from "react";
import { FloodRoute, FloodZone } from "../constants/map-data";

export function useFloodSelection() {
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<FloodRoute | null>(null);
  const [showDetailPanels, setShowDetailPanels] = useState(true);

  const clearSelection = useCallback(() => {
    setSelectedZone(null);
    setSelectedRoute(null);
  }, []);

  return {
    selectedZone,
    setSelectedZone,
    selectedRoute,
    setSelectedRoute,
    showDetailPanels,
    setShowDetailPanels,
    clearSelection,
  };
}
