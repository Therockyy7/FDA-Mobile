// features/map/hooks/useMapLayerSettings.ts
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "~/app/store";
import {
  DEFAULT_MAP_SETTINGS,
  fetchAreas,
  fetchFloodSeverity,
  loadMapSettings,
  saveMapSettings,
  setBaseMap,
  setOpacity,
  toggleOverlay,
} from "../stores/map.slice";
import type { FloodStatusParams, MapLayerSettings } from "../types/map-layers.types";

const SAVE_DEBOUNCE_MS = 500;

export function useMapLayerSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selectors with safe defaults
  const settings = useSelector((state: RootState) => state.map?.settings ?? DEFAULT_MAP_SETTINGS);
  const floodSeverity = useSelector((state: RootState) => state.map?.floodSeverity ?? null);
  const areas = useSelector((state: RootState) => state.map?.areas ?? []);
  const loading = useSelector((state: RootState) => state.map?.loading ?? false);
  const floodLoading = useSelector((state: RootState) => state.map?.floodLoading ?? false);
  const areasLoading = useSelector((state: RootState) => state.map?.areasLoading ?? false);
  const settingsLoaded = useSelector((state: RootState) => state.map?.settingsLoaded ?? false);
  const error = useSelector((state: RootState) => state.map?.error ?? null);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.status === "authenticated"
  );

  // Load settings on mount (if not already loaded)
  useEffect(() => {
    if (!settingsLoaded) {
      dispatch(loadMapSettings(isAuthenticated));
    }
  }, [dispatch, isAuthenticated, settingsLoaded]);

  // Load flood severity when flood layer is enabled
  useEffect(() => {
    if (settings.overlays.flood && !floodSeverity) {
      dispatch(fetchFloodSeverity(undefined));
    }
  }, [dispatch, settings.overlays.flood, floodSeverity]);

  // Debounced save function
  const debouncedSave = useCallback(
    (newSettings: MapLayerSettings) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        dispatch(saveMapSettings({ settings: newSettings, isAuthenticated }));
      }, SAVE_DEBOUNCE_MS);
    },
    [dispatch, isAuthenticated]
  );

  // Toggle overlay and save
  const handleToggleOverlay = useCallback(
    (layer: keyof MapLayerSettings["overlays"]) => {
      dispatch(toggleOverlay(layer));
      const newSettings = {
        ...settings,
        overlays: {
          ...settings.overlays,
          [layer]: !settings.overlays[layer],
        },
      };
      debouncedSave(newSettings);
    },
    [dispatch, settings, debouncedSave]
  );

  // Set base map and save
  const handleSetBaseMap = useCallback(
    (baseMap: MapLayerSettings["baseMap"]) => {
      dispatch(setBaseMap(baseMap));
      const newSettings = { ...settings, baseMap };
      debouncedSave(newSettings);
    },
    [dispatch, settings, debouncedSave]
  );

  // Set opacity and save
  const handleSetOpacity = useCallback(
    (layer: keyof MapLayerSettings["opacity"], value: number) => {
      dispatch(setOpacity({ layer, value }));
      const newSettings = {
        ...settings,
        opacity: { ...settings.opacity, [layer]: value },
      };
      debouncedSave(newSettings);
    },
    [dispatch, settings, debouncedSave]
  );

  // Refresh flood severity data
  const refreshFloodSeverity = useCallback(
    (params?: FloodStatusParams) => {
      dispatch(fetchFloodSeverity(params));
    },
    [dispatch]
  );

  // Refresh areas data
  const refreshAreas = useCallback(() => {
    dispatch(fetchAreas());
  }, [dispatch]);

  return {
    // State
    settings,
    floodSeverity,
    areas,
    loading,
    floodLoading,
    areasLoading,
    error,
    isAuthenticated,

    // Actions
    toggleOverlay: handleToggleOverlay,
    setBaseMap: handleSetBaseMap,
    setOpacity: handleSetOpacity,
    refreshFloodSeverity,
    refreshAreas,
  };
}
