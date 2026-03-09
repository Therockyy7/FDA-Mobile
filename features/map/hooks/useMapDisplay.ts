import { useCallback, useMemo, useState } from "react";
import { MapType } from "react-native-maps";
import { ViewMode } from "../components/controls/ViewModeSelector";
import {
  FLOOD_ROUTES,
  FLOOD_ZONES,
  FloodRoute,
  FloodZone,
} from "../constants/map-data";

export function useMapDisplay() {
  const [viewMode, setViewMode] = useState<ViewMode>("zones");
  const [showLegend, setShowLegend] = useState(false);
  const [mapType, setMapType] = useState<MapType>("standard");

  const toggleLegend = () => setShowLegend((v) => !v);

  const stats = useMemo(() => {
    const items: (FloodZone | FloodRoute)[] =
      viewMode === "zones" ? FLOOD_ZONES : FLOOD_ROUTES;

    // Count by severity levels based on water level thresholds
    // safe: < 10 cm, caution: 10-20 cm, warning: 20-40 cm, critical: >= 40 cm
    const safe = items.filter((item) => item.status === "safe").length;
    const caution = 0; // TODO: Update when data model supports caution status
    const warning = items.filter((item) => item.status === "warning").length;
    const critical = items.filter((item) => item.status === "danger").length;

    return { safe, caution, warning, critical };
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
