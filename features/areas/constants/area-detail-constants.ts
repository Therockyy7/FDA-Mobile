import type { Area } from "../types/areas-types";

export interface AreaDetailExtra {
  id: Area["id"];
  description?: string;

  warningLevel: number;
  dangerLevel: number;

  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall24h: number;

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
    warningLevel: 0.3,
    dangerLevel: 0.5,
    temperature: 28,
    humidity: 65,
    windSpeed: 8,
    rainfall24h: 5,
    history: [
      { time: "00:00", level: 0.05 },
      { time: "03:00", level: 0.07 },
      { time: "06:00", level: 0.08 },
      { time: "09:00", level: 0.09 },
      { time: "12:00", level: 0.1 },
      { time: "15:00", level: 0.1 },
    ],
    forecast: [
      { time: "16:00", level: 0.1, status: "safe", rainfall: 1 },
      { time: "17:00", level: 0.11, status: "safe", rainfall: 1 },
      { time: "18:00", level: 0.12, status: "safe", rainfall: 2 },
      { time: "19:00", level: 0.11, status: "safe", rainfall: 1 },
      { time: "20:00", level: 0.1, status: "safe", rainfall: 1 },
      { time: "21:00", level: 0.09, status: "safe", rainfall: 0 },
    ],
  },

  // --- area-2: Trường ĐH Bách Khoa ---
  "area-2": {
    id: "area-2",
    description:
      "Khuôn viên trường ĐH Bách Khoa, dễ ngập tại các lối ra vào khi mưa lớn.",
    warningLevel: 0.4,
    dangerLevel: 0.6,
    temperature: 26,
    humidity: 85,
    windSpeed: 12,
    rainfall24h: 18,
    history: [
      { time: "00:00", level: 0.3 },
      { time: "03:00", level: 0.32 },
      { time: "06:00", level: 0.35 },
      { time: "09:00", level: 0.38 },
      { time: "12:00", level: 0.4 },
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

  // --- area-hai-chau: map zone-1 ---
  "area-hai-chau": {
    id: "area-hai-chau",
    description:
      "Khu trung tâm Hải Châu, mật độ dân cư và giao thông rất cao, dễ ngập khi mưa lớn và triều cường.",
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

  // --- area-song-han: map zone-2 ---
  "area-song-han": {
    id: "area-song-han",
    description:
      "Khu vực dọc Sông Hàn và bờ Đông, chịu ảnh hưởng trực tiếp của mực nước sông và triều cường.",
    warningLevel: 1.5,
    dangerLevel: 2.5,
    temperature: 26,
    humidity: 88,
    windSpeed: 18,
    rainfall24h: 60,
    history: [
      { time: "00:00", level: 1.4 },
      { time: "03:00", level: 1.5 },
      { time: "06:00", level: 1.6 },
      { time: "09:00", level: 1.7 },
      { time: "12:00", level: 1.8 },
      { time: "15:00", level: 1.9 },
    ],
    forecast: [
      { time: "16:00", level: 2.0, status: "warning", rainfall: 8 },
      { time: "17:00", level: 2.1, status: "warning", rainfall: 10 },
      { time: "18:00", level: 2.2, status: "warning", rainfall: 12 },
      { time: "19:00", level: 2.2, status: "warning", rainfall: 10 },
      { time: "20:00", level: 2.1, status: "warning", rainfall: 8 },
      { time: "21:00", level: 2.0, status: "warning", rainfall: 6 },
    ],
  },

  // --- area-thanh-khe: map zone-3 ---
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

  // --- area-son-tra-bien: map zone-4 ---
  "area-son-tra-bien": {
    id: "area-son-tra-bien",
    description:
      "Khu vực ven biển Sơn Trà - Mỹ Khê, địa hình thoát nước tốt, ít ghi nhận ngập sâu kéo dài.",
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
      { time: "00:00", level: 0.1 },
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
