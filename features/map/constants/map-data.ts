// features/map/constants/map-data.ts

export const DANANG_CENTER = {
  latitude: 16.0544,
  longitude: 108.2022,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
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
};

export type FloodZone = {
  id: string;
  name: string;
  status: SensorStatus;
  coordinates: { latitude: number; longitude: number }[];
  waterLevel: number;
  affectedArea: string;
};

export type RouteStation = {
  id: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
  waterLevel: number;
};

export type FloodRoute = {
  id: string;
  name: string;
  description: string;
  status: SensorStatus;
  waterLevel: number; // mực nước tổng quan tuyến
  maxLevel: number;
  coordinates: { latitude: number; longitude: number }[];
  strokeWidth: number;
  flowSpeed: number;
  direction: "north" | "south" | "east" | "west";
  length: number;
  coordinate: { latitude: number; longitude: number }; // điểm đại diện cho route
  stations?: RouteStation[]; // ⭐ các trạm nước trên tuyến
};

export const MOCK_SENSORS: Sensor[] = [
  {
    id: "S01",
    name: "Sông Hàn",
    location: "Cầu Trần Thị Lý",
    latitude: 16.0678,
    longitude: 108.2229,
    waterLevel: 35,
    maxLevel: 50,
    status: "warning",
    statusText: "Cảnh báo",
    lastUpdate: "2 phút trước",
    temperature: 28,
    humidity: 85,
  },
  {
    id: "S02",
    name: "Cầu Rồng",
    location: "Quận Sơn Trà",
    latitude: 16.0605,
    longitude: 108.2273,
    waterLevel: 65,
    maxLevel: 50,
    status: "danger",
    statusText: "Nguy hiểm",
    lastUpdate: "1 phút trước",
    temperature: 29,
    humidity: 88,
  },
  {
    id: "S03",
    name: "Hải Châu",
    location: "Trung tâm TP",
    latitude: 16.0471,
    longitude: 108.2091,
    waterLevel: 25,
    maxLevel: 50,
    status: "safe",
    statusText: "An toàn",
    lastUpdate: "5 phút trước",
    temperature: 27,
    humidity: 75,
  },
  {
    id: "S04",
    name: "Sơn Trà",
    location: "Bán đảo",
    latitude: 16.0864,
    longitude: 108.244,
    waterLevel: 45,
    maxLevel: 50,
    status: "warning",
    statusText: "Cảnh báo",
    lastUpdate: "3 phút trước",
    temperature: 26,
    humidity: 80,
  },
  {
    id: "S05",
    name: "Thanh Khê",
    location: "Quận Thanh Khê",
    latitude: 16.0673,
    longitude: 108.1926,
    waterLevel: 28,
    maxLevel: 50,
    status: "safe",
    statusText: "An toàn",
    lastUpdate: "4 phút trước",
    temperature: 27,
    humidity: 78,
  },
  {
    id: "S06",
    name: "Ngã ba Huế",
    location: "Quận Thanh Khê",
    latitude: 16.0608,
    longitude: 108.1883,
    waterLevel: 42,
    maxLevel: 50,
    status: "warning",
    statusText: "Cảnh báo",
    lastUpdate: "3 phút trước",
    temperature: 28,
    humidity: 82,
  },
];

// FLOOD ZONES - giữ nguyên như của bạn
export const FLOOD_ZONES: FloodZone[] = [
  {
    id: "zone-1",
    name: "Khu vực Hải Châu - Trung tâm",
    status: "danger",
    waterLevel: 55,
    affectedArea: "~2.5 km²",
    coordinates: [
      { latitude: 16.0471, longitude: 108.2091 },
      { latitude: 16.0500, longitude: 108.2150 },
      { latitude: 16.0485, longitude: 108.2200 },
      { latitude: 16.0442, longitude: 108.2210 },
      { latitude: 16.0410, longitude: 108.2165 },
      { latitude: 16.0420, longitude: 108.2100 },
    ],
  },
  {
    id: "zone-2",
    name: "Khu vực Cầu Rồng - Sông Hàn",
    status: "warning",
    waterLevel: 42,
    affectedArea: "~3.2 km²",
    coordinates: [
      { latitude: 16.0605, longitude: 108.2273 },
      { latitude: 16.0640, longitude: 108.2300 },
      { latitude: 16.0625, longitude: 108.2350 },
      { latitude: 16.0580, longitude: 108.2360 },
      { latitude: 16.0550, longitude: 108.2310 },
      { latitude: 16.0570, longitude: 108.2260 },
    ],
  },
  {
    id: "zone-3",
    name: "Thanh Khê - Khu dân cư",
    status: "warning",
    waterLevel: 38,
    affectedArea: "~1.8 km²",
    coordinates: [
      { latitude: 16.0673, longitude: 108.1926 },
      { latitude: 16.0710, longitude: 108.1970 },
      { latitude: 16.0690, longitude: 108.2020 },
      { latitude: 16.0650, longitude: 108.2030 },
      { latitude: 16.0620, longitude: 108.1990 },
      { latitude: 16.0640, longitude: 108.1940 },
    ],
  },
  {
    id: "zone-4",
    name: "Sơn Trà - Ven biển Mỹ Khê",
    status: "safe",
    waterLevel: 28,
    affectedArea: "~1.2 km²",
    coordinates: [
      { latitude: 16.0420, longitude: 108.2350 },
      { latitude: 16.0450, longitude: 108.2420 },
      { latitude: 16.0410, longitude: 108.2450 },
      { latitude: 16.0370, longitude: 108.2420 },
      { latitude: 16.0360, longitude: 108.2360 },
      { latitude: 16.0390, longitude: 108.2340 },
    ],
  },
];

// FLOOD ROUTES – thêm field coordinate + stations demo
export const FLOOD_ROUTES: FloodRoute[] = [
  {
    id: "route-1",
    name: "Đường Lê Duẩn",
    description: "Cầu Sông Hàn → Ngã tư Ông Ích Khiêm (Nối tiếp Điện Biên Phủ)",
    status: "safe",
    waterLevel: 18,
    maxLevel: 50,
    strokeWidth: 10,
    flowSpeed: 0.8,
    direction: "west",
    length: 1.8,
    coordinates: [
      { latitude: 16.07185, longitude: 108.22415 },
      { latitude: 16.07172, longitude: 108.223 },
      { latitude: 16.0715, longitude: 108.2215 },
      { latitude: 16.0712, longitude: 108.219 },
      { latitude: 16.0708, longitude: 108.2165 },
      { latitude: 16.0702, longitude: 108.215 },
      { latitude: 16.06945, longitude: 108.21345 },
    ],
    coordinate: { latitude: 16.0715, longitude: 108.2215 },
    stations: [
      {
        id: "r1-s1",
        name: "Cầu Sông Hàn",
        coordinate: { latitude: 16.07185, longitude: 108.22415 },
        waterLevel: 20,
      },
      {
        id: "r1-s2",
        name: "Ngã tư Phan Châu Trinh",
        coordinate: { latitude: 16.0715, longitude: 108.2215 },
        waterLevel: 18,
      },
      {
        id: "r1-s3",
        name: "Công viên 29/3",
        coordinate: { latitude: 16.06945, longitude: 108.21345 },
        waterLevel: 16,
      },
    ],
  },
  {
    id: "route-2",
    name: "Đường Trần Phú",
    description: "Trung tâm Hành chính → Cầu Rồng (Đường một chiều Bắc-Nam)",
    status: "warning",
    waterLevel: 45,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 0.6,
    direction: "south",
    length: 2.5,
    coordinates: [
      { latitude: 16.07765, longitude: 108.2215 },
      { latitude: 16.075, longitude: 108.222 },
      { latitude: 16.0716, longitude: 108.2226 },
      { latitude: 16.0688, longitude: 108.2231 },
      { latitude: 16.065, longitude: 108.2234 },
      { latitude: 16.061, longitude: 108.2237 },
    ],
    coordinate: { latitude: 16.0716, longitude: 108.2226 },
    stations: [
      {
        id: "r2-s1",
        name: "Trung tâm Hành chính",
        coordinate: { latitude: 16.07765, longitude: 108.2215 },
        waterLevel: 50,
      },
      {
        id: "r2-s2",
        name: "Chợ Hàn",
        coordinate: { latitude: 16.0688, longitude: 108.2231 },
        waterLevel: 44,
      },
      {
        id: "r2-s3",
        name: "Gần Cầu Rồng",
        coordinate: { latitude: 16.061, longitude: 108.2237 },
        waterLevel: 47,
      },
    ],
  },
  {
    id: "route-3",
    name: "Đường Nguyễn Văn Linh",
    description: "Sân bay Quốc tế → Cầu Rồng",
    status: "warning",
    waterLevel: 48,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 1.2,
    direction: "east",
    length: 2.8,
    coordinates: [
      { latitude: 16.0592, longitude: 108.2045 },
      { latitude: 16.0598, longitude: 108.2092 },
      { latitude: 16.0601, longitude: 108.212 },
      { latitude: 16.0602, longitude: 108.2145 },
      { latitude: 16.0605, longitude: 108.2185 },
      { latitude: 16.0607, longitude: 108.2232 },
    ],
    coordinate: { latitude: 16.0601, longitude: 108.212 },
    stations: [
      {
        id: "r3-s1",
        name: "Cổng Sân bay",
        coordinate: { latitude: 16.0592, longitude: 108.2045 },
        waterLevel: 40,
      },
      {
        id: "r3-s2",
        name: "Ngã tư Ông Ích Khiêm",
        coordinate: { latitude: 16.0602, longitude: 108.2145 },
        waterLevel: 49,
      },
      {
        id: "r3-s3",
        name: "Đầu Cầu Rồng",
        coordinate: { latitude: 16.0607, longitude: 108.2232 },
        waterLevel: 52,
      },
    ],
  },
  {
    id: "route-4",
    name: "Đường Điện Biên Phủ",
    description: "Ngã tư Ông Ích Khiêm → Cầu vượt Ngã Ba Huế",
    status: "safe",
    waterLevel: 32,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 0.4,
    direction: "west",
    length: 3.5,
    coordinates: [
      { latitude: 16.06945, longitude: 108.21345 },
      { latitude: 16.0685, longitude: 108.21 },
      { latitude: 16.0675, longitude: 108.205 },
      { latitude: 16.0672, longitude: 108.2 },
      { latitude: 16.0675, longitude: 108.1965 },
      { latitude: 16.0685, longitude: 108.185 },
      { latitude: 16.0714, longitude: 108.1725 },
    ],
    coordinate: { latitude: 16.0675, longitude: 108.205 },
    stations: [
      {
        id: "r4-s1",
        name: "Công viên 29/3",
        coordinate: { latitude: 16.06945, longitude: 108.21345 },
        waterLevel: 30,
      },
      {
        id: "r4-s2",
        name: "Coopmart",
        coordinate: { latitude: 16.0672, longitude: 108.2 },
        waterLevel: 33,
      },
      {
        id: "r4-s3",
        name: "Ngã Ba Huế",
        coordinate: { latitude: 16.0714, longitude: 108.1725 },
        waterLevel: 35,
      },
    ],
  },
  {
    id: "route-5",
    name: "Đường 2 Tháng 9",
    description: "Cầu Rồng → Vòng xoay Xô Viết Nghệ Tĩnh",
    status: "warning",
    waterLevel: 41,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 0.5,
    direction: "south",
    length: 3.8,
    coordinates: [
      { latitude: 16.0605, longitude: 108.223 },
      { latitude: 16.0565, longitude: 108.2228 },
      { latitude: 16.0525, longitude: 108.2225 },
      { latitude: 16.0485, longitude: 108.222 },
      { latitude: 16.042, longitude: 108.2215 },
      { latitude: 16.0355, longitude: 108.2205 },
    ],
    coordinate: { latitude: 16.0525, longitude: 108.2225 },
    stations: [
      {
        id: "r5-s1",
        name: "Bảo tàng Chăm",
        coordinate: { latitude: 16.0605, longitude: 108.223 },
        waterLevel: 42,
      },
      {
        id: "r5-s2",
        name: "Cầu Trần Thị Lý",
        coordinate: { latitude: 16.0485, longitude: 108.222 },
        waterLevel: 40,
      },
      {
        id: "r5-s3",
        name: "Quảng trường 2/9",
        coordinate: { latitude: 16.042, longitude: 108.2215 },
        waterLevel: 39,
      },
    ],
  },
  {
    id: "route-6",
    name: "Đường Bạch Đằng",
    description: "Cảng Đà Nẵng → Cầu Rồng (Dọc sông Hàn - Bờ Tây)",
    status: "warning",
    waterLevel: 46,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 1.0,
    direction: "south",
    length: 2.2,
    coordinates: [
      { latitude: 16.0785, longitude: 108.223 },
      { latitude: 16.075, longitude: 108.2235 },
      { latitude: 16.07185, longitude: 108.22415 },
      { latitude: 16.068, longitude: 108.224 },
      { latitude: 16.061, longitude: 108.2238 },
    ],
    coordinate: { latitude: 16.07185, longitude: 108.22415 },
    stations: [
      {
        id: "r6-s1",
        name: "Cảng Đà Nẵng",
        coordinate: { latitude: 16.0785, longitude: 108.223 },
        waterLevel: 48,
      },
      {
        id: "r6-s2",
        name: "Cầu Sông Hàn",
        coordinate: { latitude: 16.07185, longitude: 108.22415 },
        waterLevel: 46,
      },
      {
        id: "r6-s3",
        name: "Gần Cầu Rồng",
        coordinate: { latitude: 16.061, longitude: 108.2238 },
        waterLevel: 44,
      },
    ],
  },
];
