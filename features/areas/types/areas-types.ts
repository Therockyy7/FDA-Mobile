
export type AreaStatus = "safe" | "warning" | "danger";

export interface Area {
  id: string;
  name: string;
  location: string;
  waterLevel: number;
  maxLevel: number;
  status: AreaStatus;
  statusText: string;
  lastUpdate: string;
  forecast: string;
  temperature?: number;
  humidity?: number;
  rainChance?: number;
  isFavorite?: boolean;
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
