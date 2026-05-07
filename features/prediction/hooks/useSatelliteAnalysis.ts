import { useCallback, useEffect, useRef } from "react";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";
import { SatelliteService } from "../services/satellite.service";
import { useSatelliteAnalysisStore } from "../stores/useSatelliteAnalysisStore";
import type { SatelliteAnalysisResponse } from "../types/satellite.types";

export type SatelliteAnalysisState = "idle" | "loading" | "success" | "error";

export interface UseSatelliteAnalysisReturn {
  data: SatelliteAnalysisResponse | null;
  state: SatelliteAnalysisState;
  error: string | null;
  /** Elapsed seconds since analysis started */
  elapsedSeconds: number;
  runAnalysis: (
    useBbox?: boolean,
    useFusion?: boolean,
    onSuccess?: () => void,
  ) => Promise<void>;
  reset: () => void;
}

// Per-platform accent colors shown on the map
const PLATFORM_COLORS: Record<string, string> = {
  "Sentinel-1": "#8B5CF6", // violet — SAR radar
  "Sentinel-2": "#0EA5E9", // sky    — optical
  fusion: "#10B981", // emerald — combined
};

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function useSatelliteAnalysis(
  areaId: string,
): UseSatelliteAnalysisReturn {
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

  // AbortController for the in-flight request — lets us cancel on unmount
  // so a 180s satellite analysis doesn't keep references alive after the
  // user leaves the screen.
  const abortRef = useRef<AbortController | null>(null);

  // When this component unmounts, do NOT stop the ticker —
  // it must keep running in the background so the pill stays updated.
  // The ticker is only stopped when the API call finishes or reset() is called.
  // We DO abort any in-flight request so a 180s satellite call can't keep
  // references alive after the user leaves the screen.
  // NOTE: we deliberately do NOT clear `useSatelliteFloodStore` here — the
  // "View on Map" button stages layers there immediately before navigating,
  // and clearing on unmount would race that flow. The flood store is already
  // wiped at the start of each new runAnalysis (see clearFloodStore() below),
  // so it stays bounded to ~one analysis worth of layers across runs.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearResult(areaId);
    clearFloodStore();
    setActiveLoadingAreaId(null);
    stopTicker();
  }, [
    areaId,
    clearResult,
    clearFloodStore,
    setActiveLoadingAreaId,
    stopTicker,
  ]);

  const runAnalysis = useCallback(
    async (
      useBbox = true,
      useFusion = true,
      onSuccess?: () => void,
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

      // Cancel any previous in-flight request before starting a new one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await SatelliteService.runSatelliteAnalysis(
          {
            area_id: areaId,
            use_bbox: useBbox,
            use_fusion: useFusion,
            capture_mode: undefined,
            include_permanent_water: false,
          },
          controller.signal,
        );

        setResult(areaId, {
          data: result,
          state: "success",
          cachedAt: Date.now(),
        });
        onSuccess?.();

        // ── Push flood polygons into the global map store ──────────────────
        // Guard: server may omit `individual_results` when status is
        // "no_flood_detected" or under certain partial-response conditions.
        const layers = (result.individual_results ?? [])
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
        // Aborted requests (component unmounted / new run started) are not errors.
        const aborted =
          controller.signal.aborted ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED";
        if (aborted) {
          setActiveLoadingAreaId(null);
          return;
        }

        // Classify into a stable i18n key so the UI can render a
        // user-friendly message in either language. The raw axios/JS
        // message (e.g. "Cannot read property 'filter' of undefined" or
        // "Request failed with status code 504") is not shown to users.
        const status: number | undefined = err?.response?.status;
        const code: string | undefined = err?.code;
        const rawMsg: string = err?.message ?? "";
        const isTimeout =
          status === 504 ||
          status === 408 ||
          code === "ECONNABORTED" ||
          /timeout/i.test(rawMsg);
        const isNetwork =
          !err?.response &&
          (code === "ERR_NETWORK" || /network/i.test(rawMsg));
        const isRateLimit = status === 429;
        const isServerError = typeof status === "number" && status >= 500;

        let key: string;
        if (isTimeout) key = "satellite.error.timeout";
        else if (isRateLimit) key = "satellite.error.rateLimit";
        else if (isNetwork) key = "satellite.error.network";
        else if (isServerError) key = "satellite.error.server";
        else key = "satellite.error.generic";

        setResult(areaId, { error: key, state: "error" });
        setActiveLoadingAreaId(null);
      } finally {
        // Only clear our ref if it still points at this run (a newer run may
        // have already replaced it).
        if (abortRef.current === controller) abortRef.current = null;
        // Stop the global ticker — API call is complete
        stopTicker();
      }
    },
    [
      areaId,
      results,
      setResult,
      clearFloodStore,
      setLayers,
      setActiveLoadingAreaId,
      startTicker,
      stopTicker,
    ],
  );

  return { data, state, error, elapsedSeconds, runAnalysis, reset };
}
