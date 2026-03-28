// features/map/stores/useFloodRealtimeStore.ts
// Zustand store for SignalR real-time flood sensor updates (replaces Redux applyRealtimeUpdate)

import { create } from "zustand";
import type { SensorUpdateData } from "../types/map-layers.types";

interface FloodRealtimeStore {
  /** Keyed by stationId — latest update per station */
  updates: Record<string, SensorUpdateData>;
  applyUpdate: (data: SensorUpdateData) => void;
  clear: () => void;
}

export const useFloodRealtimeStore = create<FloodRealtimeStore>()((set) => ({
  updates: {},

  applyUpdate: (data) =>
    set((state) => ({
      updates: { ...state.updates, [data.stationId]: data },
    })),

  clear: () => set({ updates: {} }),
}));
