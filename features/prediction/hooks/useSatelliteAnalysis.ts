import { useCallback, useEffect, useRef } from "react";
import { SatelliteService } from "../services/satellite.service";
import type { SatelliteAnalysisResponse } from "../types/satellite.types";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";
import { useSatelliteAnalysisStore } from "../stores/useSatelliteAnalysisStore";

export type SatelliteAnalysisState = "idle" | "loading" | "success" | "error";

export interface UseSatelliteAnalysisReturn {
  data: SatelliteAnalysisResponse | null;
  state: SatelliteAnalysisState;
  error: string | null;
  /** Elapsed seconds since analysis started */
  elapsedSeconds: number;
  runAnalysis: (useBbox?: boolean, useFusion?: boolean) => Promise<void>;
  reset: () => void;
}

// Per-platform accent colors shown on the map
const PLATFORM_COLORS: Record<string, string> = {
  "Sentinel-1": "#8B5CF6", // violet — SAR radar
  "Sentinel-2": "#0EA5E9", // sky    — optical
  fusion:       "#10B981", // emerald — combined
};

export function useSatelliteAnalysis(areaId: string): UseSatelliteAnalysisReturn {
  const { results, setResult, clearResult } = useSatelliteAnalysisStore();
  
  const currentState = results[areaId] || {
    state: "idle",
    data: null,
    error: null,
    elapsedSeconds: 0,
  };

  const { data, state, error, elapsedSeconds } = currentState;
  const { setLayers, clear: clearFloodStore } = useSatelliteFloodStore();
  
  const tickerRef = useRef<any>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    clearResult(areaId);
    clearFloodStore();
    if (tickerRef.current) clearInterval(tickerRef.current);
  }, [areaId, clearResult, clearFloodStore]);

  const runAnalysis = useCallback(
    async (useBbox = true, useFusion = true, captureMode?: 'square' | 'polygon' | 'circle', includePermanentWater = false) => {
      setResult(areaId, { state: "loading", error: null, data: null, elapsedSeconds: 0 });
      clearFloodStore();

      const startedAt = Date.now();
      if (tickerRef.current) clearInterval(tickerRef.current);
      tickerRef.current = setInterval(() => {
        setResult(areaId, { elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
      }, 1000);

      try {
        const result = await SatelliteService.runSatelliteAnalysis({
          area_id: areaId,
          use_bbox: useBbox,
          use_fusion: useFusion,
          capture_mode: captureMode,
          include_permanent_water: includePermanentWater,
        });
        
        setResult(areaId, { data: result, state: "success" });

        // ── Push flood polygons into the global map store ──────────────────
        const layers = result.individual_results
          .filter((item) => item.result?.data?.geojson?.features?.length)
          .map((item) => ({
            id: `${item.platform}-${Date.now()}`,
            platform: item.platform,
            waterAreaKm2: item.result.data.water_area_km2,
            geojson: item.result.data.geojson,
            timestamp: item.result.data.timestamp,
            color: PLATFORM_COLORS[item.platform] ?? "#A855F7",
          }));

        if (layers.length && result.bbox) {
          setLayers(layers as any, result.bbox);
        }
        // ──────────────────────────────────────────────────────────────────
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Không thể phân tích vệ tinh. Vui lòng thử lại.";
        setResult(areaId, { error: msg, state: "error" });
      } finally {
        if (tickerRef.current) clearInterval(tickerRef.current);
        setResult(areaId, { elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
      }
    },
    [areaId, setResult, clearFloodStore, setLayers]
  );

  return { data, state, error, elapsedSeconds, runAnalysis, reset };
}
