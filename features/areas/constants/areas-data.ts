// features/home/data/areas-data.ts
import type { Area } from "../types/areas-types";
import { ALL_AREAS } from "./all-areas-data";


// Khu vực người dùng đang theo dõi (mặc định lấy tất cả, hoặc chỉ một phần)
export const USER_AREAS: Area[] = [
  ALL_AREAS.find((a) => a.id === "area-1")!,         // Nhà riêng
  ALL_AREAS.find((a) => a.id === "area-2")!,         // Bách Khoa
  ALL_AREAS.find((a) => a.id === "area-thanh-khe")!, // Thanh Khê
  ALL_AREAS.find((a) => a.id === "area-hai-chau")!,  // Sông Hàn
  ALL_AREAS.find((a) => a.id === "area-son-tra-bien")!, // Sơn Trà
];
