
import type { Area } from "../types/areas-types";

export interface AreaDetailExtra {
  id: Area["id"]; // trùng với Area.id
  description?: string;

  // Ngưỡng cảnh báo/nguy hiểm (m)
  warningLevel: number;
  dangerLevel: number;

  // Thời tiết chi tiết
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall24h: number;

  // Lịch sử + dự báo mực nước (m)
  history: { time: string; level: number }[];
  forecast: {
    time: string;
    level: number;
    status: "safe" | "warning" | "danger";
    rainfall: number;
  }[];
}

export const AREA_DETAIL_MAP: Record<string, AreaDetailExtra> = {
  // --- area-1: Nhà riêng ---
  "area-1": {
    id: "area-1",
    description: "Nhà riêng tại tuyến đường trung tâm, khu dân cư đông đúc.",
    warningLevel: 0.3, // 30 cm
    dangerLevel: 0.5,  // 50 cm
    temperature: 28,
    humidity: 65,
    windSpeed: 8,
    rainfall24h: 5, // từ "5mm/3h" suy ra khá thấp
    history: [
      { time: "00:00", level: 0.05 },
      { time: "03:00", level: 0.07 },
      { time: "06:00", level: 0.08 },
      { time: "09:00", level: 0.09 },
      { time: "12:00", level: 0.10 },
      { time: "15:00", level: 0.10 },
    ],
    forecast: [
      { time: "16:00", level: 0.10, status: "safe", rainfall: 1 },
      { time: "17:00", level: 0.11, status: "safe", rainfall: 1 },
      { time: "18:00", level: 0.12, status: "safe", rainfall: 2 },
      { time: "19:00", level: 0.11, status: "safe", rainfall: 1 },
      { time: "20:00", level: 0.10, status: "safe", rainfall: 1 },
      { time: "21:00", level: 0.09, status: "safe", rainfall: 0 },
    ],
  },

  // --- area-2: Trường ĐH Bách Khoa ---
  "area-2": {
    id: "area-2",
    description:
      "Khuôn viên trường ĐH Bách Khoa, dễ ngập tại các lối ra vào khi mưa lớn.",
    warningLevel: 0.4, // 40 cm
    dangerLevel: 0.6,  // 60 cm
    temperature: 26,
    humidity: 85,
    windSpeed: 12,
    rainfall24h: 18,
    history: [
      { time: "00:00", level: 0.30 },
      { time: "03:00", level: 0.32 },
      { time: "06:00", level: 0.35 },
      { time: "09:00", level: 0.38 },
      { time: "12:00", level: 0.40 },
      { time: "15:00", level: 0.42 },
    ],
    forecast: [
      { time: "16:00", level: 0.43, status: "warning", rainfall: 4 },
      { time: "17:00", level: 0.45, status: "warning", rainfall: 5 },
      { time: "18:00", level: 0.47, status: "warning", rainfall: 6 },
      { time: "19:00", level: 0.46, status: "warning", rainfall: 5 },
      { time: "20:00", level: 0.44, status: "warning", rainfall: 4 },
      { time: "21:00", level: 0.42, status: "warning", rainfall: 3 },
    ],
  },

  // --- area-hai-chau: Quận Hải Châu ---
  "area-hai-chau": {
    id: "area-hai-chau",
    description:
      "Khu trung tâm Quận Hải Châu, mật độ dân cư và giao thông rất cao, dễ ngập khi mưa lớn và triều cường.",
    warningLevel: 2.0,
    dangerLevel: 3.5,
    temperature: 27,
    humidity: 92,
    windSpeed: 15,
    rainfall24h: 85,
    history: [
      { time: "00:00", level: 2.0 },
      { time: "03:00", level: 2.1 },
      { time: "06:00", level: 2.2 },
      { time: "09:00", level: 2.3 },
      { time: "12:00", level: 2.4 },
      { time: "15:00", level: 2.5 },
    ],
    forecast: [
      { time: "16:00", level: 2.6, status: "warning", rainfall: 12 },
      { time: "17:00", level: 2.8, status: "warning", rainfall: 15 },
      { time: "18:00", level: 3.0, status: "danger", rainfall: 20 },
      { time: "19:00", level: 3.1, status: "danger", rainfall: 18 },
      { time: "20:00", level: 3.0, status: "danger", rainfall: 14 },
      { time: "21:00", level: 2.8, status: "warning", rainfall: 10 },
    ],
  },

  // --- area-ngu-hanh-son: Quận Ngũ Hành Sơn ---
  "area-ngu-hanh-son": {
    id: "area-ngu-hanh-son",
    description:
      "Khu vực ven biển, địa hình thoát nước tốt, ít ghi nhận ngập sâu kéo dài.",
    warningLevel: 1.5,
    dangerLevel: 2.5,
    temperature: 27,
    humidity: 70,
    windSpeed: 18,
    rainfall24h: 8,
    history: [
      { time: "00:00", level: 0.3 },
      { time: "03:00", level: 0.3 },
      { time: "06:00", level: 0.4 },
      { time: "09:00", level: 0.4 },
      { time: "12:00", level: 0.5 },
      { time: "15:00", level: 0.5 },
    ],
    forecast: [
      { time: "16:00", level: 0.5, status: "safe", rainfall: 2 },
      { time: "17:00", level: 0.5, status: "safe", rainfall: 2 },
      { time: "18:00", level: 0.6, status: "safe", rainfall: 3 },
      { time: "19:00", level: 0.6, status: "safe", rainfall: 2 },
      { time: "20:00", level: 0.5, status: "safe", rainfall: 1 },
      { time: "21:00", level: 0.5, status: "safe", rainfall: 0 },
    ],
  },

  // --- area-son-tra: Quận Sơn Trà ---
  "area-son-tra": {
    id: "area-son-tra",
    description:
      "Khu vực ven biển và ven sông Hàn, chịu ảnh hưởng mạnh của triều và gió biển.",
    warningLevel: 1.5,
    dangerLevel: 2.5,
    temperature: 26,
    humidity: 88,
    windSpeed: 20,
    rainfall24h: 45,
    history: [
      { time: "00:00", level: 1.1 },
      { time: "03:00", level: 1.2 },
      { time: "06:00", level: 1.3 },
      { time: "09:00", level: 1.3 },
      { time: "12:00", level: 1.4 },
      { time: "15:00", level: 1.4 },
    ],
    forecast: [
      { time: "16:00", level: 1.5, status: "warning", rainfall: 6 },
      { time: "17:00", level: 1.6, status: "warning", rainfall: 8 },
      { time: "18:00", level: 1.7, status: "warning", rainfall: 10 },
      { time: "19:00", level: 1.7, status: "warning", rainfall: 9 },
      { time: "20:00", level: 1.6, status: "warning", rainfall: 7 },
      { time: "21:00", level: 1.5, status: "warning", rainfall: 5 },
    ],
  },

  // --- area-thanh-khe: Quận Thanh Khê ---
  "area-thanh-khe": {
    id: "area-thanh-khe",
    description:
      "Khu dân cư Thanh Khê, nhiều hẻm nhỏ dễ đọng nước khi mưa liên tục.",
    warningLevel: 1.5,
    dangerLevel: 2.5,
    temperature: 27,
    humidity: 82,
    windSpeed: 10,
    rainfall24h: 22,
    history: [
      { time: "00:00", level: 0.7 },
      { time: "03:00", level: 0.8 },
      { time: "06:00", level: 0.85 },
      { time: "09:00", level: 0.9 },
      { time: "12:00", level: 0.95 },
      { time: "15:00", level: 0.9 },
    ],
    forecast: [
      { time: "16:00", level: 0.9, status: "safe", rainfall: 4 },
      { time: "17:00", level: 1.0, status: "warning", rainfall: 5 },
      { time: "18:00", level: 1.1, status: "warning", rainfall: 6 },
      { time: "19:00", level: 1.1, status: "warning", rainfall: 5 },
      { time: "20:00", level: 1.0, status: "safe", rainfall: 3 },
      { time: "21:00", level: 0.9, status: "safe", rainfall: 2 },
    ],
  },

  // --- area-4: Công ty ABC ---
  "area-4": {
    id: "area-4",
    description:
      "Văn phòng công ty nằm trên trục đường lớn, dễ ngập lối vào khi mưa to.",
    warningLevel: 0.4,
    dangerLevel: 0.6,
    temperature: 27,
    humidity: 70,
    windSpeed: 9,
    rainfall24h: 10,
    history: [
      { time: "00:00", level: 0.10 },
      { time: "03:00", level: 0.11 },
      { time: "06:00", level: 0.12 },
      { time: "09:00", level: 0.13 },
      { time: "12:00", level: 0.14 },
      { time: "15:00", level: 0.15 },
    ],
    forecast: [
      { time: "16:00", level: 0.15, status: "safe", rainfall: 2 },
      { time: "17:00", level: 0.16, status: "safe", rainfall: 2 },
      { time: "18:00", level: 0.17, status: "safe", rainfall: 3 },
      { time: "19:00", level: 0.17, status: "safe", rainfall: 2 },
      { time: "20:00", level: 0.16, status: "safe", rainfall: 1 },
      { time: "21:00", level: 0.15, status: "safe", rainfall: 1 },
    ],
  },
};
