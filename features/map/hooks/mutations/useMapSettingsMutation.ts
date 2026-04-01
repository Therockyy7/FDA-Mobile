// features/map/hooks/mutations/useMapSettingsMutation.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { store } from "~/app/store";
import { MapService } from "../../services/map.service";
import { useMapSettingsStore } from "../../stores/useMapSettingsStore";
import type { MapLayerSettings } from "../../types/map-layers.types";

const GUEST_MAP_SETTINGS_KEY = "fda_map_settings";

export function useMapSettingsMutation() {
  const isAuthenticated = store.getState().auth?.status === "authenticated";
  const setSettings = useMapSettingsStore((s) => s.setSettings);

  return useMutation({
    mutationFn: async (settings: MapLayerSettings) => {
      if (isAuthenticated) {
        await MapService.updateMapLayerPreferences(settings);
      } else {
        await AsyncStorage.setItem(GUEST_MAP_SETTINGS_KEY, JSON.stringify(settings));
      }
    },
    onMutate: (settings) => {
      // Optimistic update — apply immediately to Zustand store
      setSettings(settings);
    },
  });
}
