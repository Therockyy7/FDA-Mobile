// features/map/stores/map.slice.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AreaService } from "~/features/areas/services/area.service";
import { MapService } from "../services/map.service";
import type {
  AreaWithStatus,
  FloodSeverityFeature,
  FloodSeverityGeoJSON,
  FloodStatusParams,
  MapLayerSettings,
  SensorUpdateData,
} from "../types/map-layers.types";

// Constants
const GUEST_MAP_SETTINGS_KEY = "fda_map_settings";

// Default settings - Flood ON by default (app focus)
export const DEFAULT_MAP_SETTINGS: MapLayerSettings = {
  baseMap: "standard",
  overlays: {
    flood: true,
    traffic: false,
    weather: false,
  },
  opacity: {
    flood: 80,
    weather: 70,
  },
};

// State interface
export interface MapState {
  settings: MapLayerSettings;
  floodSeverity: FloodSeverityGeoJSON | null;
  areas: AreaWithStatus[];
  loading: boolean;
  floodLoading: boolean;
  areasLoading: boolean;
  settingsLoaded: boolean;
  error: string | null;
}

const initialState: MapState = {
  settings: DEFAULT_MAP_SETTINGS,
  floodSeverity: null,
  areas: [],
  loading: false,
  floodLoading: false,
  areasLoading: false,
  settingsLoaded: false,
  error: null,
};

// --- THUNKS ---

/**
 * Load map layer settings
 * - For authenticated users: fetch from backend API
 * - For guests: load from AsyncStorage
 */
export const loadMapSettings = createAsyncThunk<
  MapLayerSettings,
  boolean, // isAuthenticated
  { rejectValue: string }
>("map/loadSettings", async (isAuthenticated, { rejectWithValue }) => {
  try {
    if (isAuthenticated) {
      // Fetch from backend for logged-in users
      return await MapService.getMapLayerPreferences();
    } else {
      // Load from AsyncStorage for guests
      const stored = await AsyncStorage.getItem(GUEST_MAP_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_MAP_SETTINGS;
    }
  } catch (error: any) {
    console.error("Failed to load map settings:", error);
    return rejectWithValue(error?.message || "Không thể tải cài đặt bản đồ");
  }
});

/**
 * Save map layer settings
 * - For authenticated users: sync to backend API
 * - For guests: save to AsyncStorage
 */
export const saveMapSettings = createAsyncThunk<
  MapLayerSettings,
  { settings: MapLayerSettings; isAuthenticated: boolean },
  { rejectValue: string }
>("map/saveSettings", async ({ settings, isAuthenticated }, { rejectWithValue }) => {
  try {
    if (isAuthenticated) {
      // Sync to backend for logged-in users
      await MapService.updateMapLayerPreferences(settings);
    } else {
      // Save to AsyncStorage for guests
      await AsyncStorage.setItem(GUEST_MAP_SETTINGS_KEY, JSON.stringify(settings));
    }
    return settings;
  } catch (error: any) {
    console.error("Failed to save map settings:", error);
    return rejectWithValue(error?.message || "Không thể lưu cài đặt bản đồ");
  }
});

/**
 * Sync guest settings to backend after login
 * Used during login transition flow
 */
export const syncGuestSettingsToBackend = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("map/syncGuestSettings", async (_, { rejectWithValue }) => {
  try {
    const guestSettings = await AsyncStorage.getItem(GUEST_MAP_SETTINGS_KEY);
    if (guestSettings) {
      const settings: MapLayerSettings = JSON.parse(guestSettings);
      await MapService.updateMapLayerPreferences(settings);
      // Clear guest storage after sync
      await AsyncStorage.removeItem(GUEST_MAP_SETTINGS_KEY);
    }
  } catch (error: any) {
    console.error("Failed to sync guest settings:", error);
    return rejectWithValue(error?.message || "Không thể đồng bộ cài đặt");
  }
});

/**
 * Fetch flood severity GeoJSON data from backend
 */
export const fetchFloodSeverity = createAsyncThunk<
  FloodSeverityGeoJSON,
  FloodStatusParams | undefined,
  { rejectValue: string }
>("map/fetchFloodSeverity", async (params, { rejectWithValue }) => {
  try {
    return await MapService.getFloodSeverity(params);
  } catch (error: any) {
    console.error("Failed to fetch flood severity:", error);
    return rejectWithValue(error?.message || "Không thể tải dữ liệu ngập lụt");
  }
});

/**
 * Fetch all areas with their statuses
 */
export const fetchAreas = createAsyncThunk<
  AreaWithStatus[],
  void,
  { rejectValue: string }
>("map/fetchAreas", async (_, { rejectWithValue }) => {
  try {
    // Fetch all areas
    const areas = await AreaService.getAreas();
    
    // Fetch status for each area in parallel
    const areasWithStatus = await Promise.all(
      areas.map(async (area) => {
        const status = await AreaService.getAreaStatus(area.id);
        return {
          ...area,
          status: status.status,
          severityLevel: status.severityLevel,
          summary: status.summary,
          contributingStations: status.contributingStations,
          evaluatedAt: status.evaluatedAt,
        };
      })
    );
    
    // console.log(`✅ Loaded ${areasWithStatus.length} areas with status`);
    return areasWithStatus;
  } catch (error: any) {
    console.error("Failed to fetch areas:", error);
    return rejectWithValue(error?.message || "Không thể tải dữ liệu vùng");
  }
});

// --- SLICE ---
const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    /**
     * Toggle a specific overlay layer on/off
     */
    toggleOverlay: (
      state,
      action: PayloadAction<keyof MapLayerSettings["overlays"]>
    ) => {
      if (!state.settings) {
        state.settings = {
          ...DEFAULT_MAP_SETTINGS,
          overlays: { ...DEFAULT_MAP_SETTINGS.overlays },
          opacity: { ...DEFAULT_MAP_SETTINGS.opacity },
        };
      }
      state.settings.overlays[action.payload] =
        !state.settings.overlays[action.payload];
    },

    /**
     * Set base map type (standard or satellite)
     */
    setBaseMap: (state, action: PayloadAction<MapLayerSettings["baseMap"]>) => {
      if (!state.settings) {
        state.settings = {
          ...DEFAULT_MAP_SETTINGS,
          overlays: { ...DEFAULT_MAP_SETTINGS.overlays },
          opacity: { ...DEFAULT_MAP_SETTINGS.opacity },
        };
      }
      state.settings.baseMap = action.payload;
    },

    /**
     * Set opacity for a specific layer
     */
    setOpacity: (
      state,
      action: PayloadAction<{
        layer: keyof MapLayerSettings["opacity"];
        value: number;
      }>
    ) => {
      if (!state.settings) {
        state.settings = {
          ...DEFAULT_MAP_SETTINGS,
          overlays: { ...DEFAULT_MAP_SETTINGS.overlays },
          opacity: { ...DEFAULT_MAP_SETTINGS.opacity },
        };
      }
      const { layer, value } = action.payload;
      // Clamp value between 0-100
      state.settings.opacity[layer] = Math.max(0, Math.min(100, value));
    },

    /**
     * Reset settings to defaults
     */
    resetSettings: (state) => {
      state.settings = {
        ...DEFAULT_MAP_SETTINGS,
        overlays: { ...DEFAULT_MAP_SETTINGS.overlays },
        opacity: { ...DEFAULT_MAP_SETTINGS.opacity },
      };
    },

    /**
     * Clear flood severity data
     */
    clearFloodSeverity: (state) => {
      state.floodSeverity = null;
    },

    /**
     * Clear any errors
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Apply a real-time sensor update from SignalR.
     * Merges into existing floodSeverity by stationId.
     */
    applyRealtimeUpdate: (
      state,
      action: PayloadAction<SensorUpdateData>
    ) => {
      const update = action.payload;

      // If REST hasn't loaded yet, ignore
      if (!state.floodSeverity) return;

      const existingIndex = state.floodSeverity.features.findIndex(
        (f) => f.geometry.type === "Point" && (f as FloodSeverityFeature).properties.stationId === update.stationId
      );

      if (existingIndex >= 0) {
        // Update existing station in place (Immer handles immutability)
        const feature = state.floodSeverity.features[existingIndex] as FloodSeverityFeature;
        const props = feature.properties;
        props.waterLevel = update.waterLevel;
        props.distance = update.distance;
        props.sensorHeight = update.sensorHeight;
        props.unit = update.unit;
        props.severity = update.severity;
        props.severityLevel = update.severityLevel;
        props.markerColor = update.markerColor;
        props.alertLevel = update.alertLevel;
        props.measuredAt = update.measuredAt;
        // Update coordinates in case station moved
        feature.geometry.coordinates = [update.longitude, update.latitude];
      } else {
        // Append new station
        const newFeature: FloodSeverityFeature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [update.longitude, update.latitude],
          },
          properties: {
            stationId: update.stationId,
            stationCode: update.stationCode,
            stationName: update.stationName,
            locationDesc: null,
            roadName: null,
            waterLevel: update.waterLevel,
            distance: update.distance,
            sensorHeight: update.sensorHeight,
            unit: update.unit,
            measuredAt: update.measuredAt,
            severity: update.severity,
            severityLevel: update.severityLevel,
            stationStatus: "active",
            lastSeenAt: null,
            markerColor: update.markerColor,
            alertLevel: update.alertLevel,
          },
        };
        state.floodSeverity.features.push(newFeature);
        state.floodSeverity.metadata.totalStations += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Load settings
    builder
      .addCase(loadMapSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMapSettings.fulfilled, (state, action) => {
      
        state.settings = action.payload;
        state.loading = false;
        state.settingsLoaded = true;
      })
      .addCase(loadMapSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi tải cài đặt";
        state.settingsLoaded = true; // Mark as loaded even on error (use defaults)
      });

    // Save settings
    builder
      .addCase(saveMapSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(saveMapSettings.rejected, (state, action) => {
        state.error = action.payload || "Lỗi lưu cài đặt";
      });

    // Fetch flood severity
    builder
      .addCase(fetchFloodSeverity.pending, (state) => {
        state.floodLoading = true;
        state.error = null;
      })
      .addCase(fetchFloodSeverity.fulfilled, (state, action) => {
        console.log("✅ Flood severity loaded:", action.payload);

        // Merge: keep existing stations, update/add from new response
        if (!state.floodSeverity) {
          state.floodSeverity = action.payload;
        } else {
          const incomingPoints = action.payload.features.filter(
            (f) => f.geometry.type === "Point"
          ) as FloodSeverityFeature[];
          const incomingLines = action.payload.features.filter(
            (f) => f.geometry.type === "LineString"
          );

          // Merge Point features by stationId
          incomingPoints.forEach((incoming) => {
            const idx = state.floodSeverity!.features.findIndex(
              (f) => f.geometry.type === "Point" &&
                (f as FloodSeverityFeature).properties.stationId === incoming.properties.stationId
            );
            if (idx >= 0) {
              state.floodSeverity!.features[idx] = incoming;
            } else {
              state.floodSeverity!.features.push(incoming);
            }
          });

          // Replace all LineString features with new ones from API
          state.floodSeverity!.features = [
            ...state.floodSeverity!.features.filter((f) => f.geometry.type === "Point"),
            ...incomingLines,
          ];

          state.floodSeverity!.metadata = action.payload.metadata;
        }
        state.floodLoading = false;
      })
      .addCase(fetchFloodSeverity.rejected, (state, action) => {
        state.floodLoading = false;
        state.error = action.payload || "Lỗi tải dữ liệu ngập";
      });

    // Fetch areas
    builder
      .addCase(fetchAreas.pending, (state) => {
        state.areasLoading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.areas = action.payload;
        state.areasLoading = false;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.areasLoading = false;
        state.error = action.payload || "Lỗi tải dữ liệu vùng";
      });
  },
});

// Export actions
export const {
  toggleOverlay,
  setBaseMap,
  setOpacity,
  resetSettings,
  clearFloodSeverity,
  clearError,
  applyRealtimeUpdate,
} = mapSlice.actions;

// Export reducer
export default mapSlice.reducer;
