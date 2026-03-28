import { RiskColor } from './prediction.types';

// ==================== TEMPORAL EVOLUTION ====================

export interface TemporalEvolution {
  horizon: string;       // "1h", "3h", "6h", "9h", "12h", "24h"
  precip_mm: number;
  probability: number;
  risk_level: string;    // "Thấp", "Vang", "Cam", "Cao"
  risk_color: RiskColor;
  trend: 'tang' | 'giam' | 'on_dinh';
  trend_delta: number;
  components: {
    runoff_mm: number;
    curve_number: number;
    drainage_efficiency: number;
  };
}

// ==================== DISTRICT NOW ====================

export interface DistrictNow {
  probability: number;
  risk_level: string;
  risk_color: RiskColor;
  confidence: number;
  recommendation: string;
  model: string;
}

// ==================== DISTRICT ====================

export interface DistrictForecast {
  area_id: string;
  area_name: string;
  status: string;           // "Normal", "Warning"
  fda_severity: number;     // 0-4
  fda_avg_water_level_m: number;
  contributing_stations: number;
  geojson: {
    type: string;
    coordinates: number[][][];
  };
  now: DistrictNow;
  temporal_evolution: TemporalEvolution[];
  color_timeline: Record<string, RiskColor>;
  summary: string;
}

// ==================== WEATHER SUMMARY ====================

export interface ForecastWeatherSummary {
  precip_now_mm: number;
  yesterday_precip_mm: number;
  tide_height_m: number;
  alert_count: number;
  [key: string]: number;  // precip_3h_mm, precip_5h_mm, etc.
}

// ==================== RISK DISTRIBUTION ====================

export interface RiskDistributionItem {
  level: string;
  count: number;
  color: RiskColor;
}

export interface ForecastSummary {
  total_districts: number;
  by_risk_level: Record<string, number>;
  risk_distribution: RiskDistributionItem[];
  highest_risk_district: string;
  highest_risk_probability: number;
}

// ==================== FULL RESPONSE ====================

export interface DistrictsForecastResponse {
  success: boolean;
  message: string;
  evaluated_at: string;
  forecast_horizons: string[];
  weather_summary: ForecastWeatherSummary;
  summary: ForecastSummary;
  districts: DistrictForecast[];
}
