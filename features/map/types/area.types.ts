// features/map/types/area.types.ts
// Types liên quan đến tạo và tìm kiếm vùng theo dõi

/** Phương thức chọn vị trí khi tạo vùng */
export type CreationOption = "gps" | "search" | "map_center";

/** Kết quả tìm kiếm địa chỉ từ geocoding API */
export interface SearchResult {
  address: string;
  latitude: number;
  longitude: number;
}
