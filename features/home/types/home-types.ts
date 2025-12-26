import { Area, FloodLevel } from "~/features/areas/types/areas-types";


// export type MonitoredArea = Area;

export interface MonitoredArea {
   id: string;
  name: string;
  district: string;
  status: FloodLevel;
  statusText: string;

  // card đang dùng:
  lastUpdate: string;   // cho "Cập nhật {area.lastUpdate}"
  waterLevel: number;   // cm
  maxLevel: number;     // cm

  sensorCount: number;
  affectedStreets: string[];
  rainfall: string | null;
}

export interface Alert {
  level: FloodLevel;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  description: string;
}

export interface CityStats {
  cityName: string;
  currentStatus: FloodLevel;
  statusText: string;
  floodedAreas: number;
  totalAreas: number;
  activeSensors: number;
  totalSensors: number;
  averageWaterLevel: number;
  rainfall24h: number;
  affectedPopulation: string;
  evacuationCenters: number;
  lastUpdated: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
}

export interface StatusConfig {
  bg: string;
  text: string;
  icon: "checkmark-circle" | "alert-circle" | "alert" | "warning";
  iconColor: string;
}