// ==================== SATELLITE ANALYSIS API TYPES ====================
// POST /api/v1/area/{area_id}/verify/satellite-analysis

export interface SatelliteBbox {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}

export interface SatelliteMetadata {
  platform: string;
  acquisition_date: string;
  cloud_cover: number;
  system_id: string;
  system_index: string;
  // Sentinel-1 specific
  polarization?: string;
  instrument_mode?: string;
}

export interface FilterStats {
  original_area_km2: number;
  filtered_area_km2: number;
  reduction_pct: number;
  slope_removed_pixels: number;
  permanent_water_km2: number;
  small_patches_removed: number;
}

export interface SatelliteVisuals {
  geojson_url: string | null;
  thumbnail_url: string | null;
  raw_satellite_tif: string | null;
  cloudinary_enabled: boolean;
}

export interface GeoJsonCoordinate {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    flood: number;
    raster_val: number;
  };
  geometry: GeoJsonCoordinate;
}

export interface GeoJsonCollection {
  type: 'FeatureCollection';
  crs?: {
    type: string;
    properties: { name: string };
  };
  features: GeoJsonFeature[];
}

export interface SatelliteResultData {
  area_id: string;
  water_area_km2: number;
  model_info: string;
  satellite_metadata: SatelliteMetadata;
  filter_stats: FilterStats;
  visuals: SatelliteVisuals;
  geojson: GeoJsonCollection;
  geo_coordinates: number[][][];
  timestamp: string;
}

export interface IndividualSatelliteResult {
  platform: 'Sentinel-1' | 'Sentinel-2';
  result: {
    status: 'success' | 'error';
    data: SatelliteResultData;
    error?: string;
  };
}

// Top-level satellite analysis API response
export interface SatelliteAnalysisResponse {
  status: 'success' | 'error' | 'no_flood_detected';
  fusion_mode: boolean;
  fusion_method: string;
  sources_used: string[];
  combined_water_area_km2: number;
  area_id: string;
  level: 'district' | 'city' | 'ward';
  bbox: SatelliteBbox;
  bbox_source: string;
  individual_results: IndividualSatelliteResult[];
  error?: string;
}

// Request params
export interface SatelliteAnalysisParams {
  area_id: string;
  use_bbox?: boolean;
  use_fusion?: boolean;
  capture_mode?: 'square' | 'polygon' | 'circle';
  include_permanent_water?: boolean;
}
