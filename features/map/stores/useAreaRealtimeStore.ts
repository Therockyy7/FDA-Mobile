// features/map/stores/useAreaRealtimeStore.ts
// Zustand store for SignalR real-time area status updates

import { create } from "zustand";
import type { AreaStatus, ContributingStation } from "../types/map-layers.types";

export interface AreaStatusUpdate {
  areaId: string;
  status: AreaStatus;
  severityLevel: number;
  summary?: string;
  evaluatedAt?: string;
  contributingStations?: ContributingStation[];
}

interface AreaRealtimeStore {
  /** Keyed by areaId — latest status update per area */
  updates: Record<string, AreaStatusUpdate>;
  applyUpdate: (data: AreaStatusUpdate) => void;
  clear: () => void;
}

export const useAreaRealtimeStore = create<AreaRealtimeStore>()((set) => ({
  updates: {},

  applyUpdate: (data) =>
    set((state) => ({
      updates: { ...state.updates, [data.areaId]: data },
    })),

  clear: () => set({ updates: {} }),
}));
