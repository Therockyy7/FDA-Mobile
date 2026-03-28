import { useEffect, useState, useCallback, useMemo } from "react";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import type {
  DistrictsForecastResponse,
  DistrictForecast,
} from "~/features/prediction/types/districts-forecast.types";

export type ForecastHorizon = "now" | "1h" | "3h" | "6h" | "9h" | "12h" | "24h";

export const FORECAST_HORIZONS: ForecastHorizon[] = [
  "now", "1h", "3h", "6h", "9h", "12h", "24h",
];

// Static fallback color mapping
const RISK_COLORS: Record<string, { hex: string; bg: string }> = {
  'Cao':  { hex: '#DC2626', bg: 'rgba(239, 68, 68, 0.4)' },
  'Cam':  { hex: '#EA580C', bg: 'rgba(249, 115, 22, 0.4)' },
  'Vang': { hex: '#CA8A04', bg: 'rgba(234, 179, 8, 0.4)' },
  'Thấp': { hex: '#16A34A', bg: 'rgba(34, 197, 94, 0.4)' },
};

const DEFAULT_COLOR = RISK_COLORS['Thấp'];

/**
 * Get the color for a district at a specific forecast horizon.
 * Priority: color_timeline → temporal_evolution.risk_color → RISK_COLORS fallback
 */
export function getDistrictColor(
  district: DistrictForecast,
  horizon: ForecastHorizon,
): { hex: string; bg: string } {
  if (horizon === "now") {
    // Use now.risk_color from API
    const nowColor = district.now?.risk_color;
    if (nowColor?.hex && nowColor?.bg) {
      return { hex: nowColor.hex, bg: nowColor.bg };
    }
    // Fallback to risk_level
    const riskLevel = district.now?.risk_level || "Thấp";
    return RISK_COLORS[riskLevel] || DEFAULT_COLOR;
  }

  // Future horizons: try color_timeline first
  const timelineColor = district.color_timeline?.[horizon];
  if (timelineColor?.hex && timelineColor?.bg) {
    return { hex: timelineColor.hex, bg: timelineColor.bg };
  }

  // Fallback to temporal_evolution
  const evolution = district.temporal_evolution?.find(
    (e) => e.horizon === horizon,
  );
  if (evolution?.risk_color?.hex && evolution?.risk_color?.bg) {
    return { hex: evolution.risk_color.hex, bg: evolution.risk_color.bg };
  }

  // Final fallback: risk_level string to static color
  const riskLevel = evolution?.risk_level || "Thấp";
  return RISK_COLORS[riskLevel] || DEFAULT_COLOR;
}

export const useDistrictsForecast = (enabled: boolean = true) => {
  const [data, setData] = useState<DistrictsForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const result = await PredictionService.getDistrictsForecast("1,3,6,9,12,24");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Không thể tải dự báo quận/huyện");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize the lookup map - only recomputed when data changes, not every render
  const districtMap = useMemo(
    () =>
      data
        ? new Map(data.districts.map((d) => [d.area_id, d]))
        : new Map<string, DistrictForecast>(),
    [data],
  );

  /**
   * Build a color map for ALL districts at a given horizon.
   * Returns a stable Map<areaId, {hex, bg}> to use in rendering.
   */
  const getColorMapForHorizon = useCallback(
    (horizon: ForecastHorizon): Map<string, { hex: string; bg: string }> => {
      const colorMap = new Map<string, { hex: string; bg: string }>();
      if (!data) return colorMap;

      for (const district of data.districts) {
        colorMap.set(district.area_id, getDistrictColor(district, horizon));
      }
      return colorMap;
    },
    [data],
  );

  return {
    data,
    districtMap,
    loading,
    error,
    refresh: fetchData,
    getColorMapForHorizon,
    getDistrictColor,
  };
};
