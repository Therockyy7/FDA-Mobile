
export type FloodLevel = "safe" | "warning" | "danger" | "critical";

export interface Alert {
  level: FloodLevel;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  description: string;
}

export interface MonitoredArea {
  id: string;
  name: string;
  district: string;
  status: FloodLevel;
  statusText: string;
  updatedAt: string;
  waterLevel: number;
  warningLevel: number;
  sensorCount: number;
  affectedStreets: string[];
  rainfall: string;
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
