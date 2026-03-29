// features/map/hooks/flood/useFloodLayerSettings.ts
// Map layer settings — reads from Zustand, saves via React Query mutation.
// Replaces Redux useSelector(state.map.*) usage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { store } from "~/app/store";
import type { NearbyFloodReportsParams } from "~/features/community/services/community.service";
import { MapService } from "../../services/map.service";
import {
  DEFAULT_MAP_SETTINGS,
  useMapSettingsStore,
} from "../../stores/useMapSettingsStore";
import type { FloodStatusParams, MapLayerSettings } from "../../types/map-layers.types";
import { AREAS_QUERY_KEY } from "../queries/useAreasQuery";
import { COMMUNITY_REPORTS_QUERY_KEY } from "../queries/useCommunityReportsQuery";
import { FLOOD_SEVERITY_QUERY_KEY } from "../queries/useFloodSeverityQuery";

const GUEST_MAP_SETTINGS_KEY = "fda_map_settings";
const SAVE_DEBOUNCE_MS = 500;

export function useFloodLayerSettings() {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = store.getState().auth?.status === "authenticated";

  // Individual selectors — stable references, no useShallow needed
  const settings = useMapSettingsStore((s) => s.settings);
  const settingsLoaded = useMapSettingsStore((s) => s.settingsLoaded);
  const setSettings = useMapSettingsStore((s) => s.setSettings);
  const updateOverlay = useMapSettingsStore((s) => s.updateOverlay);
  const updateBaseMap = useMapSettingsStore((s) => s.updateBaseMap);
  const updateOpacity = useMapSettingsStore((s) => s.updateOpacity);
  const markLoaded = useMapSettingsStore((s) => s.markLoaded);

  // Load settings on first mount (once)
  useEffect(() => {
    if (settingsLoaded) return;

    const loadSettings = async () => {
      try {
        if (isAuthenticated) {
          const remoteSettings = await MapService.getMapLayerPreferences();
          setSettings(remoteSettings);
        } else {
          const stored = await AsyncStorage.getItem(GUEST_MAP_SETTINGS_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as MapLayerSettings;
            setSettings({
              ...DEFAULT_MAP_SETTINGS,
              ...parsed,
              overlays: { ...DEFAULT_MAP_SETTINGS.overlays, ...(parsed.overlays ?? {}) },
              opacity: { ...DEFAULT_MAP_SETTINGS.opacity, ...(parsed.opacity ?? {}) },
            });
          } else {
            markLoaded();
          }
        }
      } catch {
        markLoaded();
      }
    };

    loadSettings();
  }, [isAuthenticated, settingsLoaded]);

  // Debounced save to backend or AsyncStorage
  const debouncedSave = useCallback(
    (newSettings: MapLayerSettings) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          if (isAuthenticated) {
            await MapService.updateMapLayerPreferences(newSettings);
          } else {
            await AsyncStorage.setItem(GUEST_MAP_SETTINGS_KEY, JSON.stringify(newSettings));
          }
        } catch {
          // Save failure is non-critical — settings are already in Zustand
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [isAuthenticated],
  );

  const toggleOverlay = useCallback(
    (layer: keyof MapLayerSettings["overlays"]) => {
      const newValue = !settings.overlays[layer];
      updateOverlay(layer, newValue);
      const newSettings = {
        ...settings,
        overlays: { ...settings.overlays, [layer]: newValue },
      };
      debouncedSave(newSettings);
    },
    [settings, updateOverlay, debouncedSave],
  );

  const setBaseMap = useCallback(
    (baseMap: MapLayerSettings["baseMap"]) => {
      updateBaseMap(baseMap);
      debouncedSave({ ...settings, baseMap });
    },
    [settings, updateBaseMap, debouncedSave],
  );

  const setOpacity = useCallback(
    (layer: keyof MapLayerSettings["opacity"], value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      updateOpacity(layer, clamped);
      debouncedSave({
        ...settings,
        opacity: { ...settings.opacity, [layer]: clamped },
      });
    },
    [settings, updateOpacity, debouncedSave],
  );

  const refreshFloodSeverity = useCallback(
    (params?: FloodStatusParams) => {
      queryClient.invalidateQueries({
        queryKey: [FLOOD_SEVERITY_QUERY_KEY, params ?? null],
      });
    },
    [queryClient],
  );

  const refreshAreas = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [AREAS_QUERY_KEY] });
  }, [queryClient]);

  const refreshNearbyFloodReports = useCallback(
    (params: NearbyFloodReportsParams) => {
      queryClient.invalidateQueries({
        queryKey: [COMMUNITY_REPORTS_QUERY_KEY, params],
      });
    },
    [queryClient],
  );

  return {
    settings,
    settingsLoaded,
    isAuthenticated,
    loading: !settingsLoaded,
    error: null,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  };
}
