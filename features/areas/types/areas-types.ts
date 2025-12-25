
export type AreaStatus = "safe" | "warning" | "danger";
export type FloodLevel = "safe" | "warning" | "danger" ;
export type AreaType = "personal" | "district";
export interface Area {
  id: string;
  name: string;
  location: string;
  waterLevel: number;
  maxLevel: number;
  status: FloodLevel;
  statusText: string;
  lastUpdate: string;
  forecast: string;
  temperature?: number;
  humidity?: number;
  rainChance?: number;
  isFavorite?: boolean;
  // type: AreaType;              // "personal" | "district"
  district?: string;           // tên quận nếu là district
  sensorCount?: number;
  affectedStreets?: string[];
  rainfall?: string;           // "85mm/3h"
}

export interface StatusColors {
  main: string;
  bg: string;
  text: string;
  gradient: readonly [string, string];
}

export interface QuickStat {
  label: string;
  count: number;
  color: string;
}
