import { Area, FloodLevel } from "~/features/areas/types/areas-types";


// export type MonitoredArea = Area;

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