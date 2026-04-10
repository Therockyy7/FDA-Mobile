// features/map/stores/useFloodRealtimeStore.ts
// Zustand store for SignalR real-time flood sensor updates (replaces Redux applyRealtimeUpdate)

import { create } from "zustand";
import type { FloodSeverityFeature, SensorUpdateData } from "../types/map-layers.types";

interface FloodRealtimeStore {
  /** Keyed by stationId — latest update per station */
  updates: Record<string, SensorUpdateData>;
  /** Keyed by stationId — full station data saved when user taps marker (for detail screen) */
  selectedStations: Record<string, FloodSeverityFeature>;
  applyUpdate: (data: SensorUpdateData) => void;
  setSelectedStation: (station: FloodSeverityFeature | null) => void;
  clear: () => void;
}

export const useFloodRealtimeStore = create<FloodRealtimeStore>()((set) => ({
  updates: {},
  selectedStations: {},

  applyUpdate: (data) =>
    set((state) => ({
      updates: { ...state.updates, [data.stationId]: data },
    })),

  setSelectedStation: (station) =>
    set((s) => {
      if (!station) return s;
      return {
        ...s,
        selectedStations: {
          ...s.selectedStations,
          [station.properties.stationId]: station,
        },
      };
    }),

  clear: () => set({ updates: {}, selectedStations: {} }),
}));
