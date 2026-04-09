import { create } from "zustand";
import type { SatelliteAnalysisResponse } from "../types/satellite.types";
import { SatelliteAnalysisState } from "../hooks/useSatelliteAnalysis";

export interface AreaSatelliteState {
  state: SatelliteAnalysisState;
  data: SatelliteAnalysisResponse | null;
  error: string | null;
  elapsedSeconds: number;
  /** ISO string of when analysis started */
  startedAt?: string;
  /** Area name for display in the pill */
  areaName?: string;
}

interface SatelliteAnalysisStore {
  results: Record<string, AreaSatelliteState>;
  /** The areaId currently being analysed (null when idle/done) */
  activeLoadingAreaId: string | null;
  setResult: (areaId: string, payload: Partial<AreaSatelliteState>) => void;
  clearResult: (areaId: string) => void;
  setActiveLoadingAreaId: (areaId: string | null) => void;
  /** Start a global ticker that survives component unmount */
  startTicker: (areaId: string, startedAt: string) => void;
  /** Stop the global ticker */
  stopTicker: () => void;
}

// ─── Module-level interval — survives component unmount ──────────────────────
let _globalTickerRef: ReturnType<typeof setInterval> | null = null;

function clearGlobalTicker() {
  if (_globalTickerRef !== null) {
    clearInterval(_globalTickerRef);
    _globalTickerRef = null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export const useSatelliteAnalysisStore = create<SatelliteAnalysisStore>((set) => ({
  results: {},
  activeLoadingAreaId: null,

  setActiveLoadingAreaId: (areaId) => set({ activeLoadingAreaId: areaId }),

  startTicker: (areaId, startedAt) => {
    clearGlobalTicker();
    const origin = new Date(startedAt).getTime();
    _globalTickerRef = setInterval(() => {
      const elapsed = Math.floor((Date.now() - origin) / 1000);
      set((state) => ({
        results: {
          ...state.results,
          [areaId]: {
            ...(state.results[areaId] || {
              state: "loading",
              data: null,
              error: null,
              elapsedSeconds: 0,
            }),
            elapsedSeconds: elapsed,
          },
        },
      }));
    }, 1000);
  },

  stopTicker: () => {
    clearGlobalTicker();
  },

  setResult: (areaId, payload) =>
    set((state) => ({
      results: {
        ...state.results,
        [areaId]: {
          ...(state.results[areaId] || {
            state: "idle",
            data: null,
            error: null,
            elapsedSeconds: 0,
          }),
          ...payload,
        },
      },
    })),

  clearResult: (areaId) =>
    set((state) => {
      const newResults = { ...state.results };
      delete newResults[areaId];
      return { results: newResults };
    }),
}));
