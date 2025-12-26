// features/map/data/map-data.ts

export const DANANG_CENTER = {
  latitude: 16.065,
  longitude: 108.21,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

export type SensorStatus = "safe" | "warning" | "danger";

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

export type FloodZone = {
  id: string;
  name: string;
  status: SensorStatus;
  coordinates: { latitude: number; longitude: number }[];
  waterLevel: number;
  affectedArea: string;
  sensorIds?: string[];
  routeIds?: string[];

  areaId?: string; // liên kết với Area.id (ALL_AREAS)
};

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

// ==================== ZONES ====================

export const FLOOD_ZONES: FloodZone[] = [
  {
    id: "zone-1",
    name: "Hải Châu - Trung tâm",
    status: "danger",
    waterLevel: 55,
    affectedArea: "~2.5 km²",
    coordinates: [
      { latitude: 16.07, longitude: 108.224 },
      { latitude: 16.07, longitude: 108.19 },
      { latitude: 16.05, longitude: 108.19 },
      { latitude: 16.05, longitude: 108.224 },
    ],
    routeIds: ["route-2", "route-4"],
    sensorIds: ["S_TP_01", "S_NVL_01", "S_NVL_02"],
    areaId: "area-hai-chau",
  },
  {
    id: "zone-2",
    name: "Sông Hàn & Bờ Đông",
    status: "warning",
    waterLevel: 42,
    affectedArea: "~3.2 km²",
    coordinates: [
      { latitude: 16.085, longitude: 108.224 },
      { latitude: 16.085, longitude: 108.235 },
      { latitude: 16.05, longitude: 108.235 },
      { latitude: 16.05, longitude: 108.224 },
    ],
    routeIds: ["route-1"],
    sensorIds: ["S_BD_01", "S_BD_02", "S_BD_03"],
    areaId: "area-song-han",
  },
  {
    id: "zone-3",
    name: "Thanh Khê",
    status: "warning",
    waterLevel: 38,
    affectedArea: "~1.8 km²",
    coordinates: [
      { latitude: 16.085, longitude: 108.224 },
      { latitude: 16.085, longitude: 108.18 },
      { latitude: 16.07, longitude: 108.18 },
      { latitude: 16.07, longitude: 108.224 },
    ],
    routeIds: ["route-3", "route-6"],
    sensorIds: ["S_LD_01", "S_DBP_01"],
    areaId: "area-thanh-khe",
  },
  {
    id: "zone-4",
    name: "Sơn Trà - Biển",
    status: "safe",
    waterLevel: 28,
    affectedArea: "~1.2 km²",
    coordinates: [
      { latitude: 16.085, longitude: 108.235 },
      { latitude: 16.085, longitude: 108.25 },
      { latitude: 16.05, longitude: 108.25 },
      { latitude: 16.05, longitude: 108.235 },
    ],
    routeIds: [],
    sensorIds: [],
    areaId: "area-son-tra-bien",
  },
];

// ==================== ROUTES ====================

export const FLOOD_ROUTES: FloodRoute[] = [
  {
    id: "route-1",
    name: "Đường Bạch Đằng",
    description: "Dọc bờ Tây sông Hàn",
    status: "warning",
    waterLevel: 46,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 1.0,
    direction: "south",
    length: 2.2,
    coordinates: [
      { latitude: 16.078, longitude: 108.2242 },
      { latitude: 16.07, longitude: 108.2245 },
      { latitude: 16.06, longitude: 108.2242 },
    ],
    coordinate: { latitude: 16.07, longitude: 108.2245 },
    zoneId: "zone-2",
    sensorIds: ["S_BD_01", "S_BD_02", "S_BD_03"],
  },
  {
    id: "route-2",
    name: "Đường Trần Phú",
    description: "Song song Bạch Đằng",
    status: "safe",
    waterLevel: 30,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 0.6,
    direction: "south",
    length: 2.5,
    coordinates: [
      { latitude: 16.069, longitude: 108.2225 },
      { latitude: 16.065, longitude: 108.223 },
      { latitude: 16.06, longitude: 108.2225 },
    ],
    coordinate: { latitude: 16.065, longitude: 108.223 },
    zoneId: "zone-1",
    sensorIds: ["S_TP_01"],
  },
  {
    id: "route-4",
    name: "Đường Nguyễn Văn Linh",
    description: "Cầu Rồng -> Sân Bay",
    status: "danger",
    waterLevel: 55,
    maxLevel: 50,
    strokeWidth: 10,
    flowSpeed: 1.2,
    direction: "east",
    length: 2.8,
    coordinates: [
      { latitude: 16.061, longitude: 108.222 },
      { latitude: 16.0605, longitude: 108.215 },
      { latitude: 16.06, longitude: 108.205 },
    ],
    coordinate: { latitude: 16.0605, longitude: 108.215 },
    zoneId: "zone-1",
    sensorIds: ["S_NVL_01", "S_NVL_02"],
  },
  {
    id: "route-3",
    name: "Đường Lê Duẩn",
    description: "Cầu Sông Hàn -> Ông Ích Khiêm",
    status: "safe",
    waterLevel: 18,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 0.8,
    direction: "west",
    length: 1.8,
    coordinates: [
      { latitude: 16.072, longitude: 108.22 },
      { latitude: 16.0718, longitude: 108.215 },
      { latitude: 16.0715, longitude: 108.21 },
    ],
    coordinate: { latitude: 16.0718, longitude: 108.215 },
    zoneId: "zone-3",
    sensorIds: ["S_LD_01"],
  },
  {
    id: "route-6",
    name: "Điện Biên Phủ",
    description: "Khu vực Ngã ba Huế",
    status: "warning",
    waterLevel: 40,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 0.4,
    direction: "west",
    length: 1.5,
    coordinates: [
      { latitude: 16.071, longitude: 108.21 },
      { latitude: 16.0705, longitude: 108.195 },
      { latitude: 16.0702, longitude: 108.185 },
    ],
    coordinate: { latitude: 16.0705, longitude: 108.195 },
    zoneId: "zone-3",
    sensorIds: ["S_DBP_01"],
  },
];

// ==================== SENSORS ====================

export const MOCK_SENSORS: Sensor[] = [
  {
    id: "S_BD_01",
    name: "Cảng Đà Nẵng",
    location: "Đầu đường Bạch Đằng",
    latitude: 16.078,
    longitude: 108.2242,
    waterLevel: 20,
    maxLevel: 50,
    status: "safe",
    statusText: "An toàn",
    lastUpdate: "1 phút trước",
    temperature: 28,
    humidity: 80,
    zoneIds: ["zone-2"],
    routeIds: ["route-1"],
  },
  {
    id: "S_BD_02",
    name: "Chợ Hàn",
    location: "Khu vực Chợ Hàn",
    latitude: 16.07,
    longitude: 108.2245,
    waterLevel: 55,
    maxLevel: 50,
    status: "danger",
    statusText: "Ngập sâu",
    lastUpdate: "Vừa xong",
    temperature: 27,
    humidity: 85,
    zoneIds: ["zone-2"],
    routeIds: ["route-1"],
  },
  {
    id: "S_BD_03",
    name: "Đuôi Cầu Rồng",
    location: "Giao lộ Bạch Đằng - Cầu Rồng",
    latitude: 16.06,
    longitude: 108.2242,
    waterLevel: 40,
    maxLevel: 50,
    status: "warning",
    statusText: "Cảnh báo",
    lastUpdate: "2 phút trước",
    temperature: 28,
    humidity: 82,
    zoneIds: ["zone-2"],
    routeIds: ["route-1"],
  },
  {
    id: "S_TP_01",
    name: "Ngã tư Lê Duẩn",
    location: "Giao lộ Trần Phú - Lê Duẩn",
    latitude: 16.069,
    longitude: 108.2225,
    waterLevel: 30,
    maxLevel: 50,
    status: "safe",
    statusText: "An toàn",
    lastUpdate: "5 phút trước",
    temperature: 29,
    humidity: 75,
    zoneIds: ["zone-1"],
    routeIds: ["route-2"],
  },
  {
    id: "S_NVL_01",
    name: "Ngã tư Hoàng Diệu",
    location: "Đoạn giao Hoàng Diệu",
    latitude: 16.0605,
    longitude: 108.215,
    waterLevel: 65,
    maxLevel: 50,
    status: "danger",
    statusText: "Nguy hiểm",
    lastUpdate: "1 phút trước",
    temperature: 26,
    humidity: 90,
    zoneIds: ["zone-1"],
    routeIds: ["route-4"],
  },
  {
    id: "S_NVL_02",
    name: "Công viên 29/3",
    location: "Đoạn gần công viên",
    latitude: 16.06,
    longitude: 108.205,
    waterLevel: 25,
    maxLevel: 50,
    status: "safe",
    statusText: "An toàn",
    lastUpdate: "4 phút trước",
    temperature: 27,
    humidity: 78,
    zoneIds: ["zone-1"],
    routeIds: ["route-4"],
  },
  {
    id: "S_LD_01",
    name: "Đại học Đà Nẵng",
    location: "Trước cổng ĐH Đà Nẵng",
    latitude: 16.0718,
    longitude: 108.215,
    waterLevel: 18,
    maxLevel: 50,
    status: "safe",
    statusText: "An toàn",
    lastUpdate: "3 phút trước",
    temperature: 30,
    humidity: 70,
    zoneIds: ["zone-3"],
    routeIds: ["route-3"],
  },
  {
    id: "S_DBP_01",
    name: "Hầm chui Ngã Ba Huế",
    location: "Khu vực hầm chui",
    latitude: 16.0702,
    longitude: 108.185,
    waterLevel: 42,
    maxLevel: 50,
    status: "warning",
    statusText: "Cảnh báo",
    lastUpdate: "2 phút trước",
    temperature: 28,
    humidity: 82,
    zoneIds: ["zone-3"],
    routeIds: ["route-6"],
  },
];
