// ==================== RISK COLOR / LEVEL ====================

export type VietnameseRiskLevel = 'Thấp' | 'Vang' | 'Cam' | 'Cao';

export interface RiskColor {
  hex: string;
  rgb: string;
  bg: string;
  label: string;
}

export const RISK_CONFIG: Record<VietnameseRiskLevel, {
  color: string;
  bg: string;
  label: string;
  icon: string;
  gradient: readonly [string, string];
}> = {
  'Thấp': { color: '#16A34A', bg: '#DCFCE7', label: 'THẤP', icon: 'shield-checkmark', gradient: ['#059669', '#16A34A'] },
  'Vang':  { color: '#CA8A04', bg: '#FEF9C3', label: 'VÀNG', icon: 'warning',          gradient: ['#A16207', '#CA8A04'] },
  'Cam':   { color: '#EA580C', bg: '#FFEDD5', label: 'CAM',  icon: 'alert',             gradient: ['#C2410C', '#EA580C'] },
  'Cao':   { color: '#DC2626', bg: '#FEE2E2', label: 'CAO',  icon: 'alert-circle',      gradient: ['#B91C1C', '#DC2626'] },
};

export function getRiskConfigByLevel(riskLevel: string) {
  const key = riskLevel as VietnameseRiskLevel;
  return RISK_CONFIG[key] ?? RISK_CONFIG['Thấp'];
}

// ==================== ENSEMBLE PREDICTION ====================

export interface PredictionInterval {
  lower: number;
  upper: number;
  coverage: string;
}

export interface EnsemblePrediction {
  probability: number;
  probability_raw: number;
  probability_calibrated: number;
  risk_level: string;
  recommendation: string;
  confidence: string;
  confidence_score: number;
  model_agreement_score: number;
  verification_status: string;
  prediction_interval: PredictionInterval;
  uncertainty_level: string;
  uncertainty_score: number;
  confidence_reason_codes: string[];
}

// ==================== VALID PERIOD ====================

export interface ValidPeriod {
  start: string;
  end: string;
  status: string;
  duration_hours: number;
  next_update_expected: string;
}

// ==================== IMPACT ASSESSMENT ====================

export interface ImpactAssessment {
  potential_depth_m: number;
  critical_assets_at_risk: string[];
  affected_assets_count: number;
  transportation_impact: { status: string } | string;
  estimated_affected_population: number;
  total_at_risk_population: number;
  affected_structures_estimate: number;
  evacuation_needed: boolean;
  evacuation_points: any[];
  available_evacuation_capacity: number;
  evacuation_capacity_adequate: boolean;
  depth_impact_description: string;
  critical_impacts: string[];
}

// ==================== CONFIDENCE BREAKDOWN ====================

export interface ConfidenceComponent {
  confidence: string;
  weight?: string;
  reason?: string;
  contribution?: string;
  multiplier?: number;
  rainfall_12h_mm?: number;
  current_level_m?: number;
}

export interface ConfidenceBreakdown {
  overall_confidence: string;
  confidence_score: number;
  breakdown_components: Record<string, ConfidenceComponent>;
  confidence_rationale: string;
}

// ==================== DISCREPANCY ANALYSIS ====================

export interface DiscrepancyAnalysis {
  is_divergent: boolean;
  reason: string;
  resolution: string;
  satellite_freshness_multiplier: number;
}

// ==================== ACTION PLAN ====================

export interface ActionPlan {
  immediate_actions: string[];
  alert_thresholds: {
    next_trigger_mm: number;
    critical_water_level_m: number;
  };
  evacuation_status: string;
  manual_verification_required: boolean;
}

// ==================== SHADOW MODE ====================

export interface ShadowMode {
  enabled: boolean;
  legacy_probability: number;
  vnext_probability: number;
  absolute_delta: number;
  legacy_weighting?: {
    ai_weight: number;
    physics_weight: number;
    reason: string;
  };
}

// ==================== AI & PHYSICS ENGINES ====================

export interface ContributionScores {
  Intensity: number;
  Saturation: number;
  Accumulation: number;
  Topography: number;
  Hydrology: number;
  intensity: number;
  saturation: number;
  accumulation: number;
  topography: number;
  hydrology: number;
}

export interface AiEngineOutput {
  probability: number;
  risk_level: string;
  time_to_peak_minutes: number;
  contribution_scores: ContributionScores;
  model: string;
}

export interface PhysicsEngineOutput {
  probability: number;
  flood_risk_index: number;
  components: {
    precipitation_now_mm: number;
    precipitation_yesterday_mm: number;
    curve_number_cn: number;
    runoff_mm: number;
    flow_velocity_ms: number;
    drainage_efficiency: number;
    tide_height_m: number;
    sensor_adjustment: number;
  };
  model: string;
}

// ==================== DATA QUALITY ====================

export interface DataQuality {
  rainfall_history_quality: number;
  sensor_staleness: number;
  terrain_quality: number;
  rainfall_12h_source: string;
}

// ==================== COMMUNITY RISK ====================

export interface CommunityRisk {
  risk_score: number;
  active: boolean;
  report_count: number;
  confidence: number;
  max_severity: string;
  recent_count: number;
  high_trust_count: number;
  weight_in_ensemble: number;
}

// ==================== INTERPRETABILITY ====================

export interface HistoricalSimilarity {
  event_name: string;
  event_date: string;
  event_description: string;
  event_type: string;
  severity: string;
  casualties: number;
  economic_damage_vnd: string;
  verified_flood_area_km2: number;
  areas_affected_count: number;
  distance: number;
  similarity_score: number;
}

export interface Interpretability {
  dominant_factor: {
    factor_name: string;
    factor_name_vn: string;
    contribution_percent: number;
    all_contributions_percent: Record<string, number>;
  };
  geographical_context: string;
  historical_similarity: HistoricalSimilarity;
  explanation: string;
  confidence_level: string;
  contribution_scores: Record<string, number>;
  area_id: string;
  generated_at: string;
}

// ==================== WEIGHTING STRATEGY  ====================

export interface WeightingStrategy {
  ai_weight: number;
  physics_weight: number;
  reason: string;
  blend_signals?: Record<string, number>;
}

// ==================== INPUT DATA ====================

export interface InputData {
  sensor_data: {
    rainfall_12h_mm: number;
    current_water_level_m: number;
    forecast_rainfall_6h_mm: number;
    contributing_stations: number;
  };
  terrain_data: {
    soil_saturation_pct: number;
    topographic_wetness_index: number;
    avg_slope_degrees: number;
  };
}

// ==================== MODEL INFO ====================

export interface ModelInfo {
  architecture: string;
  ai_model: string;
  physics_model: string;
  satellite_model: string;
  ensemble_version: string;
  confidence_level: string;
}

// ==================== NEW API WRAPPER FORMAT ====================
// API mới trả về { success: true, message: string, data: PredictionData }
// Đây là schema dựa trên response thực tế từ:
// POST /api/v1/area/{areaId}/predict/flood-risk-ensemble

export interface ForecastWindow {
  horizon: string;         // "3h" | "5h" | "7h"
  probability: number;
  status: string;          // "Normal" | "Moderate" | "High" etc.
  severityLevel: number;
}

export interface ValidPeriodNew {
  start: string;
  end: string;
  durationHours: number;
  nextUpdateExpected: string;
}

export interface AccuracyMetrics {
  baseline_accuracy: string;
  phase_1_accuracy: string;
  phase_2_accuracy: string;
  phase_3_accuracy: string;
  total_improvement: string;
}

export interface WeatherComponent {
  precipitation_24h_mm: number;
  precipitation_6h_mm: number;
  precipitation_3h_mm: number;
  avg_humidity_pct: number;
  max_wind_ms: number;
  precip_risk: number;
  short_term_risk: number;
  precipitation_probability: number;
  weather_code: number;
  contribution: number;
  key_drivers: string[];
}

export interface SaturationComponent {
  saturation_level: number;
  status: string;
  infiltration_capacity: number;
  runoff_factor: number;
  soil_moisture_m3m3: number;
  elevation_m: number;
  slope_degrees: number;
  distance_to_river: number;
  drainage_risk: number;
  source: string;
  date: string;
  confidence: number;
  method: string;
  note: string;
}

export interface TerrainComponent {
  elevation_m: number;
  slope_degrees: number;
  aspect_degrees: number;
  flow_accumulation: number;
  drainage_risk: number;
  flood_potential: string;
  distance_to_river: number;
  source: string;
  confidence: number;
  resolution_m: number;
  computed_at: string;
}

export interface HistoricalSimilarityMatch {
  event_name: string;
  event_date: string;
  event_description: string;
  event_type: string;
  severity: string;
  casualties: number;
  economic_damage_vnd: string;
  verified_flood_area_km2: number;
  areas_affected_count: number;
  distance: number;
  similarity_score: number;
}

export interface HistoricalSimilarityComponent {
  best_match: string;
  best_match_date: string;
  best_match_similarity: number;
  best_match_type: string;
  best_match_severity: string;
  similarity_signal: number;
  top_matches: HistoricalSimilarityMatch[];
}

export interface AiPredictionComponents {
  weather: WeatherComponent;
  saturation: SaturationComponent;
  terrain: TerrainComponent;
  historical_similarity: HistoricalSimilarityComponent;
}

export interface AiPredictionImpact {
  estimated_depth_m: number;
  estimated_area_affected: string;
  recommendation: string;
}

export interface AiPrediction {
  ensembleProbability: number;
  riskLevel: string;           // "MODERATE" | "HIGH" | "LOW" etc.
  confidence: number;
  accuracyMetrics: AccuracyMetrics;
  components: AiPredictionComponents;
  impact: AiPredictionImpact;
}

export interface Forecast {
  validPeriod: ValidPeriodNew;
  windows: ForecastWindow[];
  aiPrediction: AiPrediction;
}

export interface ContributingStation {
  stationId: string;
  stationCode: string;
  distance: number;
  waterLevel: number;
  severity: string;
  weight: number;
  street: {
    id: string;
    name: string;
    code: string;
  };
  ward: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CommunityReport {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: string;
  trustScore: number;
  status: string;
  createdAt: string;
}

export interface AdministrativeArea {
  id: string;
  name: string;
  level: string;
  code: string;
  parentId: string | null;
  parentName: string | null;
}

export interface AiConsultant {
  provider: string;
  finalSummary: string;
}

export interface SatelliteVerification {
  available: boolean;
  source: string;
  status: string;
  message: string;
  metadata: any | null;
  visuals: {
    thumbnail_url: string | null;
    raw_satellite_tif: string | null;
    geojson_url: string | null;
    cloudinary_enabled: boolean;
  };
}

// PredictionResponse = the `data` field inside the API envelope
export interface PredictionResponse {
  administrativeAreaId: string;
  status: string;            // "Moderate" | "High" | "Normal" etc.
  severityLevel: number;
  summary: string;
  contributingStations: ContributingStation[];
  communityReports: CommunityReport[];
  evaluatedAt: string;
  administrativeArea: AdministrativeArea;
  geoJson: any | null;
  forecast: Forecast;
  aiConsultant: AiConsultant;
  satelliteVerification: SatelliteVerification;
}

// Top-level API envelope
export interface PredictionApiResponse {
  success: boolean;
  message: string;
  data: PredictionResponse;
}

