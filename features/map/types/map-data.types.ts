// features/map/types/map-data.types.ts
// Data model types cho cảm biến, vùng ngập và tuyến đường ngập

/** Trạng thái mức độ ngập */
export type SensorStatus = "safe" | "warning" | "danger";

/** Dữ liệu cảm biến đo mực nước */
export type Sensor = {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  maxLevel: number;
  status: SensorStatus;
  statusText: string;
  lastUpdate: string;
  temperature: number;
  humidity: number;
  zoneIds?: string[];
  routeIds?: string[];
};

/** Vùng ngập lụt trên bản đồ */
export type FloodZone = {
  id: string;
  name: string;
  status: SensorStatus;
  coordinates: { latitude: number; longitude: number }[];
  waterLevel: number;
  affectedArea: string;
  sensorIds?: string[];
  routeIds?: string[];
  areaId?: string;
};

/** Tuyến đường ngập lụt trên bản đồ */
export type FloodRoute = {
  id: string;
  name: string;
  description: string;
  status: SensorStatus;
  waterLevel: number;
  maxLevel: number;
  coordinates: { latitude: number; longitude: number }[];
  strokeWidth: number;
  flowSpeed: number;
  direction: "north" | "south" | "east" | "west";
  length: number;
  coordinate: { latitude: number; longitude: number };
  zoneId: string;
  sensorIds?: string[];
};
