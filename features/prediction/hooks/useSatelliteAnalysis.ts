import { useCallback } from "react";
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

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function useSatelliteAnalysis(areaId: string): UseSatelliteAnalysisReturn {
  const {
    results,
    setResult,
    clearResult,
    setActiveLoadingAreaId,
    startTicker,
    stopTicker,
  } = useSatelliteAnalysisStore();

  const currentState = results[areaId] || {
    state: "idle",
    data: null,
    error: null,
    elapsedSeconds: 0,
  };

  const { data, state, error, elapsedSeconds } = currentState;
  const { setLayers, clear: clearFloodStore } = useSatelliteFloodStore();

  // When this component unmounts, do NOT stop the ticker —
  // it must keep running in the background so the pill stays updated.
  // The ticker is only stopped when the API call finishes or reset() is called.

  const reset = useCallback(() => {
    clearResult(areaId);
    clearFloodStore();
    setActiveLoadingAreaId(null);
    stopTicker();
  }, [areaId, clearResult, clearFloodStore, setActiveLoadingAreaId, stopTicker]);

  const runAnalysis = useCallback(
    async (
      useBbox = true,
      useFusion = true,
      captureMode?: "square" | "polygon" | "circle",
      includePermanentWater = false,
    ) => {
      // Guard: return cached result if still fresh (within TTL)
      const cached = results[areaId];
      if (
        cached?.state === "success" &&
        cached.cachedAt &&
        Date.now() - cached.cachedAt < CACHE_TTL_MS
      ) {
        return;
      }

      const now = new Date().toISOString();

      setResult(areaId, {
        state: "loading",
        error: null,
        data: null,
        elapsedSeconds: 0,
        startedAt: now,
      });
      setActiveLoadingAreaId(areaId);
      clearFloodStore();

      // Start the global ticker — persists even after this component unmounts
      startTicker(areaId, now);

      try {
        const result = await SatelliteService.runSatelliteAnalysis({
          area_id: areaId,
          use_bbox: useBbox,
          use_fusion: useFusion,
          capture_mode: captureMode,
          include_permanent_water: includePermanentWater,
        });

        setResult(areaId, { data: result, state: "success", cachedAt: Date.now() });

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
        setActiveLoadingAreaId(null);
      } finally {
        // Stop the global ticker — API call is complete
        stopTicker();
      }
    },
    [areaId, results, setResult, clearFloodStore, setLayers, setActiveLoadingAreaId, startTicker, stopTicker],
  );

  return { data, state, error, elapsedSeconds, runAnalysis, reset };
}
