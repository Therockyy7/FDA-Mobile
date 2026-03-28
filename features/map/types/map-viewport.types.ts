// features/map/types/map-viewport.types.ts
// Types liên quan đến vùng nhìn và zoom của bản đồ

/** Region hiển thị trên MapView */
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/** Bounding box của viewport (dùng để query dữ liệu theo vùng) */
export interface ViewportBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Chế độ zoom bản đồ:
 * - cluster: zoom < 10 — hiển thị dạng cụm
 * - individual: zoom 10–13 — hiển thị từng marker
 * - detailed: zoom > 13 — hiển thị marker + đường ngập
 */
export type MapZoomMode = "cluster" | "individual" | "detailed";
