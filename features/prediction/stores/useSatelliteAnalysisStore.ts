import { create } from "zustand";
import type { SatelliteAnalysisResponse } from "../types/satellite.types";
import { SatelliteAnalysisState } from "../hooks/useSatelliteAnalysis";

export interface AreaSatelliteState {
  state: SatelliteAnalysisState;
  data: SatelliteAnalysisResponse | null;
  error: string | null;
  elapsedSeconds: number;
}

interface SatelliteAnalysisStore {
  results: Record<string, AreaSatelliteState>;
  setResult: (areaId: string, payload: Partial<AreaSatelliteState>) => void;
  clearResult: (areaId: string) => void;
}

export const useSatelliteAnalysisStore = create<SatelliteAnalysisStore>((set) => ({
  results: {},
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
