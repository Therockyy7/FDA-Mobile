
import { Alert, CityStats, MonitoredArea, QuickAction } from "../types/home-types";

export const MOCK_ALERT: Alert = {
  level: "danger",
  title: "CẢNH BÁO LŨ KHẨN CẤP",
  subtitle: "Khu vực Quận Hải Châu và Sơn Trà",
  time: "08:30",
  date: "03/12/2025",
  description:
    "Mực nước tại Sông Hàn đang vượt mức cảnh báo 2. Dự báo mưa lớn kéo dài đến 15h chiều nay.",
};

export const MOCK_AREAS: MonitoredArea[] = [
  {
    id: "1",
    name: "Quận Hải Châu",
    district: "Đà Nẵng",
    status: "danger",
    statusText: "Nguy hiểm",
    updatedAt: "2 phút trước",
    waterLevel: 2.5,
    warningLevel: 2.0,
    sensorCount: 5,
    affectedStreets: ["Đường 2/9", "Nguyễn Văn Linh", "Trần Phú"],
    rainfall: "85mm/3h",
  },
  {
    id: "2",
    name: "Quận Sơn Trà",
    district: "Đà Nẵng",
    status: "warning",
    statusText: "Cảnh báo",
    updatedAt: "5 phút trước",
    waterLevel: 1.4,
    warningLevel: 1.5,
    sensorCount: 4,
    affectedStreets: ["Võ Nguyên Giáp", "Hoàng Sa"],
    rainfall: "45mm/3h",
  },
  {
    id: "3",
    name: "Quận Thanh Khê",
    district: "Đà Nẵng",
    status: "warning",
    statusText: "Nguy cơ thấp",
    updatedAt: "8 phút trước",
    waterLevel: 0.9,
    warningLevel: 1.5,
    sensorCount: 3,
    affectedStreets: [],
    rainfall: "22mm/3h",
  },
  {
    id: "4",
    name: "Quận Ngũ Hành Sơn",
    district: "Đà Nẵng",
    status: "safe",
    statusText: "An toàn",
    updatedAt: "10 phút trước",
    waterLevel: 0.5,
    warningLevel: 1.5,
    sensorCount: 3,
    affectedStreets: [],
    rainfall: "8mm/3h",
  },
];

export const DANANG_STATS: CityStats = {
  cityName: "Đà Nẵng",
  currentStatus: "warning",
  statusText: "Cảnh báo Mức 2",
  floodedAreas: 12,
  totalAreas: 56,
  activeSensors: 48,
  totalSensors: 52,
  averageWaterLevel: 1.8,
  rainfall24h: 156,
  affectedPopulation: "~15,000",
  evacuationCenters: 8,
  lastUpdated: "14:25, 03/12/2025",
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: "map",
    label: "Bản đồ\nLũ lụt",
    route: "/map",
    color: "#0EA5E9",
  },
  {
    icon: "location-on",
    label: "Khu vực\ncủa tôi",
    route: "/my-areas",
    color: "#06B6D4",
  },
  {
    icon: "directions",
    label: "Tìm\nLộ trình",
    route: "/route-planner",
    color: "#8B5CF6",
  },
];
