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

export type FloodRoute = {
  id: string;
  name: string;
  description: string;
  status: SensorStatus;
  waterLevel: number;
  maxLevel: number;
  coordinates: { latitude: number; longitude: number }[];
  strokeWidth: number;
  flowSpeed: number; // meters/second
  direction: "north" | "south" | "east" | "west";
  length: number; // km
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
    longitude: 108.2440,
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

// 🆕 ENHANCED: Flood Zones với visual effects
export const FLOOD_ZONES: FloodZone[] = [
  {
    id: "zone-1",
    name: "Khu vực Hải Châu - Trung tâm",
    status: "danger",
    waterLevel: 55,
    affectedArea: "~2.5 km²",
    coordinates: [
      { latitude: 16.0471, longitude: 108.2091 },
      { latitude: 16.0471, longitude: 108.218 },
      { latitude: 16.0435, longitude: 108.2195 },
      { latitude: 16.04, longitude: 108.218 },
      { latitude: 16.04, longitude: 108.2091 },
      { latitude: 16.0435, longitude: 108.2076 },
    ],
  },
  {
    id: "zone-2",
    name: "Khu vực Cầu Rồng - Sông Hàn",
    status: "warning",
    waterLevel: 42,
    affectedArea: "~3.2 km²",
    coordinates: [
      { latitude: 16.0625, longitude: 108.222 },
      { latitude: 16.0625, longitude: 108.231 },
      { latitude: 16.059, longitude: 108.232 },
      { latitude: 16.056, longitude: 108.231 },
      { latitude: 16.056, longitude: 108.222 },
      { latitude: 16.059, longitude: 108.221 },
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
      { latitude: 16.0673, longitude: 108.1996 },
      { latitude: 16.0643, longitude: 108.2006 },
      { latitude: 16.0613, longitude: 108.1996 },
      { latitude: 16.0613, longitude: 108.1926 },
      { latitude: 16.0643, longitude: 108.1916 },
    ],
  },
  {
    id: "zone-4",
    name: "Sơn Trà - Ven biển",
    status: "safe",
    waterLevel: 28,
    affectedArea: "~1.2 km²",
    coordinates: [
      { latitude: 16.0864, longitude: 108.244 },
      { latitude: 16.0864, longitude: 108.251 },
      { latitude: 16.0834, longitude: 108.252 },
      { latitude: 16.0804, longitude: 108.251 },
      { latitude: 16.0804, longitude: 108.244 },
      { latitude: 16.0834, longitude: 108.243 },
    ],
  },
];

// 🆕 REAL ROUTES: Tuyến đường thực tế Đà Nẵng
export const FLOOD_ROUTES: FloodRoute[] = [
  {
    id: "route-1",
    name: "Đường Lê Duẩn",
    description: "Hải Châu → Thanh Khê (QL14B)",
    status: "danger",
    waterLevel: 58,
    maxLevel: 50,
    strokeWidth: 10,
    flowSpeed: 0.8,
    direction: "west",
    length: 3.2,
    // Route: Cầu Rồng → Ngã ba Huế
    coordinates: [
      { latitude: 16.0605, longitude: 108.2273 }, // Cầu Rồng
      { latitude: 16.0608, longitude: 108.2245 },
      { latitude: 16.0611, longitude: 108.2217 },
      { latitude: 16.0614, longitude: 108.2189 },
      { latitude: 16.0617, longitude: 108.2161 },
      { latitude: 16.062, longitude: 108.2133 },
      { latitude: 16.0619, longitude: 108.2105 },
      { latitude: 16.0618, longitude: 108.2077 },
      { latitude: 16.0617, longitude: 108.2049 },
      { latitude: 16.0616, longitude: 108.2021 },
      { latitude: 16.0615, longitude: 108.1993 },
      { latitude: 16.0614, longitude: 108.1965 },
      { latitude: 16.0613, longitude: 108.1937 },
      { latitude: 16.0608, longitude: 108.1883 }, // Ngã ba Huế
    ],
  },
  {
    id: "route-2",
    name: "Đường Trần Phú",
    description: "Ven biển Sơn Trà - Mỹ Khê",
    status: "warning",
    waterLevel: 45,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 0.6,
    direction: "north",
    length: 4.5,
    // Route: From Hải Châu to Sơn Trà along coast
    coordinates: [
      { latitude: 16.0471, longitude: 108.2291 }, // Start Mỹ Khê
      { latitude: 16.051, longitude: 108.2315 },
      { latitude: 16.0549, longitude: 108.2339 },
      { latitude: 16.0588, longitude: 108.2363 },
      { latitude: 16.0627, longitude: 108.2387 },
      { latitude: 16.0666, longitude: 108.2411 },
      { latitude: 16.0705, longitude: 108.2435 },
      { latitude: 16.0744, longitude: 108.2459 },
      { latitude: 16.0783, longitude: 108.2483 },
      { latitude: 16.0822, longitude: 108.2507 }, // Sơn Trà
    ],
  },
  {
    id: "route-3",
    name: "Đường Nguyễn Văn Linh",
    description: "Dọc sông Hàn (Bờ Đông)",
    status: "warning",
    waterLevel: 48,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 1.2,
    direction: "south",
    length: 5.8,
    // Route: Along Han River east side
    coordinates: [
      { latitude: 16.0864, longitude: 108.2229 }, // North
      { latitude: 16.0824, longitude: 108.2235 },
      { latitude: 16.0784, longitude: 108.2241 },
      { latitude: 16.0744, longitude: 108.2247 },
      { latitude: 16.0704, longitude: 108.2253 },
      { latitude: 16.0664, longitude: 108.2259 },
      { latitude: 16.0624, longitude: 108.2265 },
      { latitude: 16.0584, longitude: 108.2271 },
      { latitude: 16.0544, longitude: 108.2277 },
      { latitude: 16.0504, longitude: 108.2283 },
      { latitude: 16.0464, longitude: 108.2289 }, // South
    ],
  },
  {
    id: "route-4",
    name: "Đường Điện Biên Phủ",
    description: "Thanh Khê - Liên Chiểu",
    status: "safe",
    waterLevel: 32,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 0.4,
    direction: "west",
    length: 2.8,
    coordinates: [
      { latitude: 16.0673, longitude: 108.1926 }, // Thanh Khê
      { latitude: 16.0678, longitude: 108.1898 },
      { latitude: 16.0683, longitude: 108.187 },
      { latitude: 16.0688, longitude: 108.1842 },
      { latitude: 16.0693, longitude: 108.1814 },
      { latitude: 16.0698, longitude: 108.1786 },
      { latitude: 16.0703, longitude: 108.1758 },
      { latitude: 16.0708, longitude: 108.173 }, // Liên Chiểu
    ],
  },
  {
    id: "route-5",
    name: "Đường 2 Tháng 9",
    description: "Trung tâm - Biển Mỹ Khê",
    status: "warning",
    waterLevel: 41,
    maxLevel: 50,
    strokeWidth: 9,
    flowSpeed: 0.5,
    direction: "east",
    length: 2.1,
    coordinates: [
      { latitude: 16.0471, longitude: 108.2091 }, // Hải Châu center
      { latitude: 16.0471, longitude: 108.2119 },
      { latitude: 16.0471, longitude: 108.2147 },
      { latitude: 16.0471, longitude: 108.2175 },
      { latitude: 16.0471, longitude: 108.2203 },
      { latitude: 16.0471, longitude: 108.2231 },
      { latitude: 16.0471, longitude: 108.2259 },
      { latitude: 16.0471, longitude: 108.2287 }, // Mỹ Khê beach
    ],
  },
];
