// features/map/hooks/flood/useFloodLayerSettings.ts
// Map layer settings — reads from Zustand (persisted), syncs to backend when authenticated.
// Guest: Zustand → AsyncStorage (via persist). Authenticated: also sync to backend API.

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

const SAVE_DEBOUNCE_MS = 500;

export function useFloodLayerSettings() {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  const isAuthenticated = store.getState().auth?.status === "authenticated";

  // Individual selectors — stable references, no useShallow needed
  const settings = useMapSettingsStore((s) => s.settings);
  const settingsLoaded = useMapSettingsStore((s) => s.settingsLoaded);
  const setSettings = useMapSettingsStore((s) => s.setSettings);
  const updateOverlay = useMapSettingsStore((s) => s.updateOverlay);
  const updateBaseMap = useMapSettingsStore((s) => s.updateBaseMap);
  const updateOpacity = useMapSettingsStore((s) => s.updateOpacity);

  // Load remote preferences on first mount when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (settings != null) return; // already have local settings (from persist or defaults)
    if (initializedRef.current) return;
    initializedRef.current = true;

    const loadRemotePreferences = async () => {
      try {
        const remoteSettings = await MapService.getMapLayerPreferences();
        setSettings(remoteSettings);
      } catch {
        // Remote load failed — keep local persisted settings
      }
    };

    loadRemotePreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // setSettings/settings intentionally omitted — initializedRef prevents double-run

  // Debounced save to backend when authenticated
  const debouncedSaveToBackend = useCallback(
    (newSettings: MapLayerSettings) => {
      if (!isAuthenticated) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await MapService.updateMapLayerPreferences(newSettings);
        } catch {
          // Save failure is non-critical — settings are already persisted locally
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [isAuthenticated],
  );

  const toggleOverlay = useCallback(
    (layer: keyof MapLayerSettings["overlays"]) => {
      const currentValue =
        settings?.overlays?.[layer] ?? DEFAULT_MAP_SETTINGS.overlays[layer];
      const newValue = !currentValue;
      updateOverlay(layer, newValue);
      const newSettings = {
        ...(settings ?? DEFAULT_MAP_SETTINGS),
        overlays: {
          ...(settings?.overlays ?? DEFAULT_MAP_SETTINGS.overlays),
          [layer]: newValue,
        },
      };
      debouncedSaveToBackend(newSettings);
    },
    [settings, updateOverlay, debouncedSaveToBackend],
  );

  const setBaseMap = useCallback(
    (baseMap: MapLayerSettings["baseMap"]) => {
      updateBaseMap(baseMap);
      debouncedSaveToBackend({
        ...(settings ?? DEFAULT_MAP_SETTINGS),
        baseMap,
      });
    },
    [settings, updateBaseMap, debouncedSaveToBackend],
  );

  const setOpacity = useCallback(
    (layer: keyof MapLayerSettings["opacity"], value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      updateOpacity(layer, clamped);
      debouncedSaveToBackend({
        ...(settings ?? DEFAULT_MAP_SETTINGS),
        opacity: {
          ...(settings?.opacity ?? DEFAULT_MAP_SETTINGS.opacity),
          [layer]: clamped,
        },
      });
    },
    [settings, updateOpacity, debouncedSaveToBackend],
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
    loading: false, // settings always has a value (DEFAULT or persisted) — no loading state needed
    error: null,
    toggleOverlay,
    setBaseMap,
    setOpacity,
    refreshFloodSeverity,
    refreshAreas,
    refreshNearbyFloodReports,
  };
}
