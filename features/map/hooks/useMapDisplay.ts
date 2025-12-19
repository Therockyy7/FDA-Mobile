import { useState, useMemo, useCallback } from "react";
import {
  FLOOD_ROUTES,
  FLOOD_ZONES,
  FloodRoute,
  FloodZone,
} from "../constants/map-data";
import { ViewMode } from "../components/ViewModeSelector";
import { MapType } from "react-native-maps";

export function useMapDisplay() {
  const [viewMode, setViewMode] = useState<ViewMode>("zones");
  const [showLegend, setShowLegend] = useState(true);
  const [mapType, setMapType] = useState<MapType>("standard");

  const toggleLegend = () => setShowLegend((v) => !v);

  const stats = useMemo(() => {
    const items: (FloodZone | FloodRoute)[] =
      viewMode === "zones" ? FLOOD_ZONES : FLOOD_ROUTES;
    const safe = items.filter((item) => item.status === "safe").length;
    const warning = items.filter((item) => item.status === "warning").length;
    const danger = items.filter((item) => item.status === "danger").length;
    return { safe, warning, danger };
  }, [viewMode]);

  const handleMapTypeChange = useCallback(() => {
    const types: MapType[] = ["standard", "satellite", "hybrid"];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  }, [mapType]);

  return {
    mapType,
    viewMode,
    setViewMode,
    showLegend,
    toggleLegend,
    stats,
    handleMapTypeChange
  };
}
