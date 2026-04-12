// features/map/stores/useSatelliteFloodStore.ts
// Global store for AI Prithvi satellite flood polygons.
// The SatelliteVerificationCard writes here after a successful analysis;
// SatelliteFloodOverlay (inside MapContent) reads and renders Polygons.

import { create } from "zustand";
import type { GeoJsonCollection, SatelliteBbox } from "~/features/prediction/types/satellite.types";

export interface SatelliteFloodLayer {
  /** Unique key per analysis run */
  id: string;
  /** Platform that produced this layer */
  platform: "Sentinel-1" | "Sentinel-2" | "fusion";
  /** Area km² of detected flood */
  waterAreaKm2: number;
  /** GeoJSON FeatureCollection with Polygon features */
  geojson: GeoJsonCollection;
  /** Acquisition timestamp (ISO) */
  timestamp: string;
  /** Accent color for this layer */
  color: string;
}

interface SatelliteFloodStore {
  /** All active flood layers from the latest analysis */
  layers: SatelliteFloodLayer[];
  /** Bounding box of the last analysed area (for camera focus) */
  bbox: SatelliteBbox | null;
  /** Whether the overlay is currently visible on the map */
  visible: boolean;
  /** EWKB hex string of the admin area boundary used to clip flood polygons */
  clipBoundary: string | null;

  setLayers: (layers: SatelliteFloodLayer[], bbox: SatelliteBbox) => void;
  /**
   * Store layers WITHOUT making them visible yet.
   * Call commitLayers() after the map has animated to the bbox
   * to avoid blocking the JS thread during camera animation.
   */
  setPendingLayers: (layers: SatelliteFloodLayer[], bbox: SatelliteBbox, clipBoundary?: string | null) => void;
  /** Make previously pending layers visible (call after animateToRegion completes). */
  commitLayers: () => void;
  toggleVisible: () => void;
  setVisible: (v: boolean) => void;
  clear: () => void;
}

export const useSatelliteFloodStore = create<SatelliteFloodStore>((set) => ({
  layers: [],
  bbox: null,
  visible: true,
  clipBoundary: null,

  setLayers: (layers, bbox) => set({ layers, bbox, visible: true }),
  // Stage layers silently — map can animate without heavy polygon rendering
  setPendingLayers: (layers, bbox, clipBoundary = null) => set({ layers, bbox, visible: false, clipBoundary }),
  // Reveal staged layers after camera animation completes
  commitLayers: () => set({ visible: true }),
  toggleVisible: () => set((s) => ({ visible: !s.visible })),
  setVisible: (visible) => set({ visible }),
  clear: () => set({ layers: [], bbox: null, visible: true, clipBoundary: null }),
}));
