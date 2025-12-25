export const DANANG_CENTER = {
  latitude: 16.0600, // Dời tâm về gần Cầu Rồng hơn chút
  longitude: 108.2200,
  latitudeDelta: 0.05, // Zoom gần hơn để thấy chi tiết đường
  longitudeDelta: 0.05,
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
  flowSpeed: number;
  direction: "north" | "south" | "east" | "west";
  length: number;
  coordinate: { latitude: number; longitude: number };
  sensorIds?: string[];
};

export const MOCK_SENSORS: Sensor[] = [
  // --- Tuyến 1: Bạch Đằng (Có 3 điểm đo) ---
  {
    id: "S_BD_01",
    name: "Cảng Đà Nẵng",
    location: "Đầu đường Bạch Đằng",
    latitude: 16.0772, longitude: 108.2235, // Khớp điểm đầu Route 1
    waterLevel: 20, maxLevel: 50,
    status: "safe", statusText: "An toàn",
    lastUpdate: "1 phút trước", temperature: 28, humidity: 80,
  },
  {
    id: "S_BD_02",
    name: "Chợ Hàn",
    location: "Khu vực Chợ Hàn",
    latitude: 16.0685, longitude: 108.2248, // Khớp điểm giữa Route 1
    waterLevel: 55, maxLevel: 50,
    status: "danger", statusText: "Ngập sâu",
    lastUpdate: "Vừa xong", temperature: 27, humidity: 85,
  },
  {
    id: "S_BD_03",
    name: "Đuôi Cầu Rồng",
    location: "Giao lộ Bạch Đằng - Cầu Rồng",
    latitude: 16.0615, longitude: 108.2242, // Khớp điểm cuối Route 1
    waterLevel: 40, maxLevel: 50,
    status: "warning", statusText: "Cảnh báo",
    lastUpdate: "2 phút trước", temperature: 28, humidity: 82,
  },

  // --- Tuyến 2: Trần Phú ---
  {
    id: "S_TP_01",
    name: "Ngã tư Lê Duẩn",
    location: "Giao lộ Trần Phú - Lê Duẩn",
    latitude: 16.0718, longitude: 108.2228,
    waterLevel: 30, maxLevel: 50,
    status: "safe", statusText: "An toàn",
    lastUpdate: "5 phút trước", temperature: 29, humidity: 75,
  },

  // --- Tuyến 3: Lê Duẩn ---
  {
    id: "S_LD_01",
    name: "Đại học Đà Nẵng",
    location: "Trước cổng ĐH Đà Nẵng",
    latitude: 16.0716, longitude: 108.2160,
    waterLevel: 18, maxLevel: 50,
    status: "safe", statusText: "An toàn",
    lastUpdate: "3 phút trước", temperature: 30, humidity: 70,
  },

  // --- Tuyến 4: Nguyễn Văn Linh (Ngập cục bộ) ---
  {
    id: "S_NVL_01",
    name: "Ngã tư Hoàng Diệu",
    location: "Đoạn giao Hoàng Diệu",
    latitude: 16.0608, longitude: 108.2180,
    waterLevel: 65, maxLevel: 50,
    status: "danger", statusText: "Nguy hiểm",
    lastUpdate: "1 phút trước", temperature: 26, humidity: 90,
  },
  {
    id: "S_NVL_02",
    name: "Công viên 29/3",
    location: "Đoạn gần công viên",
    latitude: 16.0595, longitude: 108.2050,
    waterLevel: 25, maxLevel: 50,
    status: "safe", statusText: "An toàn",
    lastUpdate: "4 phút trước", temperature: 27, humidity: 78,
  },

   // --- Tuyến 6: Điện Biên Phủ ---
   {
    id: "S_DBP_01",
    name: "Hầm chui Ngã Ba Huế",
    location: "Khu vực hầm chui",
    latitude: 16.0690, longitude: 108.1850,
    waterLevel: 42, maxLevel: 50,
    status: "warning", statusText: "Cảnh báo",
    lastUpdate: "2 phút trước", temperature: 28, humidity: 82,
  },
];


export const FLOOD_ZONES: FloodZone[] = [
  {
    id: "zone-1",
    name: "Khu vực Hải Châu - Trung tâm",
    status: "danger",
    waterLevel: 55,
    affectedArea: "~2.5 km²",
    coordinates: [
      { latitude: 16.0471, longitude: 108.2091 },
      { latitude: 16.05, longitude: 108.215 },
      { latitude: 16.0485, longitude: 108.22 },
      { latitude: 16.0442, longitude: 108.221 },
      { latitude: 16.041, longitude: 108.2165 },
      { latitude: 16.042, longitude: 108.21 },
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
      { latitude: 16.064, longitude: 108.23 },
      { latitude: 16.0625, longitude: 108.235 },
      { latitude: 16.058, longitude: 108.236 },
      { latitude: 16.055, longitude: 108.231 },
      { latitude: 16.057, longitude: 108.226 },
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
      { latitude: 16.071, longitude: 108.197 },
      { latitude: 16.069, longitude: 108.202 },
      { latitude: 16.065, longitude: 108.203 },
      { latitude: 16.062, longitude: 108.199 },
      { latitude: 16.064, longitude: 108.194 },
    ],
  },
  {
    id: "zone-4",
    name: "Sơn Trà - Ven biển Mỹ Khê",
    status: "safe",
    waterLevel: 28,
    affectedArea: "~1.2 km²",
    coordinates: [
      { latitude: 16.042, longitude: 108.235 },
      { latitude: 16.045, longitude: 108.242 },
      { latitude: 16.041, longitude: 108.245 },
      { latitude: 16.037, longitude: 108.242 },
      { latitude: 16.036, longitude: 108.236 },
      { latitude: 16.039, longitude: 108.234 },
    ],
  },
];

export const FLOOD_ROUTES: FloodRoute[] = [
  {
    id: "route-1",
    name: "Đường Bạch Đằng",
    description: "Dọc bờ Tây sông Hàn",
    status: "warning", // Trạng thái chung (màu đường)
    waterLevel: 46,
    maxLevel: 50,
    strokeWidth: 8,
    flowSpeed: 1.0,
    direction: "south",
    length: 2.2,
    coordinates: [
      { latitude: 16.0772, longitude: 108.2235 },
      { latitude: 16.0740, longitude: 108.2242 },
      { latitude: 16.0718, longitude: 108.2245 },
      { latitude: 16.0685, longitude: 108.2248 },
      { latitude: 16.0655, longitude: 108.2250 },
      { latitude: 16.0615, longitude: 108.2242 },
    ],
    coordinate: { latitude: 16.0655, longitude: 108.2250 },
    sensorIds: ["S_BD_01", "S_BD_02", "S_BD_03"], // <--- Map 3 sensor
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
      { latitude: 16.0765, longitude: 108.2218 },
      { latitude: 16.0718, longitude: 108.2228 },
      { latitude: 16.0680, longitude: 108.2235 },
      { latitude: 16.0615, longitude: 108.2230 },
    ],
    coordinate: { latitude: 16.0680, longitude: 108.2235 },
    sensorIds: ["S_TP_01"],
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
      { latitude: 16.0718, longitude: 108.2245 },
      { latitude: 16.0717, longitude: 108.2200 },
      { latitude: 16.0716, longitude: 108.2160 },
      { latitude: 16.0714, longitude: 108.2130 },
    ],
    coordinate: { latitude: 16.0716, longitude: 108.2160 },
    sensorIds: ["S_LD_01"],
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
        { latitude: 16.0612, longitude: 108.2235 },
        { latitude: 16.0608, longitude: 108.2180 },
        { latitude: 16.0605, longitude: 108.2120 },
        { latitude: 16.0595, longitude: 108.2050 },
    ],
    coordinate: { latitude: 16.0605, longitude: 108.2120 },
    sensorIds: ["S_NVL_01", "S_NVL_02"], // <--- Map 2 sensor (1 Đỏ, 1 Xanh)
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
       { latitude: 16.0714, longitude: 108.2130 },
       { latitude: 16.0700, longitude: 108.1950 },
       { latitude: 16.0690, longitude: 108.1850 },
    ],
    coordinate: { latitude: 16.0700, longitude: 108.1950 },
    sensorIds: ["S_DBP_01"],
  },
];
