// features/map/stores/usePlaceSearchHistoryStore.ts
// Persisted history of selected places from the route search sheet.
// Storage key is shared so Create Area search can reuse the same list later.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface PlaceSearchHistoryItem {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface PlaceSearchHistoryStore {
  items: PlaceSearchHistoryItem[];
  addItem: (item: Omit<PlaceSearchHistoryItem, "timestamp">) => void;
  removeItem: (placeId: string) => void;
  clearAll: () => void;
}

const HISTORY_CAP = 10;

export const usePlaceSearchHistoryStore = create<PlaceSearchHistoryStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const deduped = state.items.filter((i) => i.placeId !== item.placeId);
          const next: PlaceSearchHistoryItem = { ...item, timestamp: Date.now() };
          return { items: [next, ...deduped].slice(0, HISTORY_CAP) };
        }),

      removeItem: (placeId) =>
        set((state) => ({
          items: state.items.filter((i) => i.placeId !== placeId),
        })),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: "fda_place_search_history",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const usePlaceSearchHistoryItems = () =>
  usePlaceSearchHistoryStore((s) => s.items);
