// features/map/stores/useMapSettingsStore.ts
// Zustand store for map layer settings (replaces Redux map.settings)

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MapLayerSettings } from "../types/map-layers.types";

export const DEFAULT_MAP_SETTINGS: MapLayerSettings = {
  baseMap: "standard",
  overlays: {
    flood: true,
    traffic: false,
    weather: false,
    communityReports: true,
  },
  opacity: {
    flood: 80,
    weather: 70,
  },
};

export interface MapSettingsStore {
  settings: MapLayerSettings;
  settingsLoaded: boolean;
  setSettings: (settings: MapLayerSettings) => void;
  updateOverlay: (key: keyof MapLayerSettings["overlays"], value: boolean) => void;
  updateBaseMap: (value: MapLayerSettings["baseMap"]) => void;
  updateOpacity: (key: keyof MapLayerSettings["opacity"], value: number) => void;
  markLoaded: () => void;
}

export const useMapSettingsStore = create<MapSettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_MAP_SETTINGS,
      settingsLoaded: false,

      setSettings: (settings) => set({ settings, settingsLoaded: true }),

      updateOverlay: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            overlays: { ...state.settings.overlays, [key]: value },
          },
        })),

      updateBaseMap: (value) =>
        set((state) => ({
          settings: { ...state.settings, baseMap: value },
        })),

      updateOpacity: (key, value) =>
        set((state) => ({
          settings: {
            ...state.settings,
            opacity: { ...state.settings.opacity, [key]: value },
          },
        })),

      markLoaded: () => set({ settingsLoaded: true }),
    }),
    {
      name: "fda_map_settings",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist settings, not settingsLoaded flag
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);

// Granular selectors — use these to prevent unnecessary re-renders
export const useMapSettings = () => useMapSettingsStore((s) => s.settings);
export const useIsSettingsLoaded = () => useMapSettingsStore((s) => s.settingsLoaded);
export const useOverlaySetting = (key: keyof MapLayerSettings["overlays"]) =>
  useMapSettingsStore((s) => s.settings.overlays[key]);
