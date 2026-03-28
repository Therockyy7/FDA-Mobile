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

// ==================== FULL PREDICTION RESPONSE ====================

export interface PredictionResponse {
  status: string;
  area_id: string;
  area_name: string;
  administrative_level: string;
  timestamp: string;

  // Core prediction
  ensemble_prediction: EnsemblePrediction;
  valid_period: ValidPeriod;

  // Assessment
  impact_assessment: ImpactAssessment;
  confidence_breakdown: ConfidenceBreakdown;
  discrepancy_analysis: DiscrepancyAnalysis;
  action_plan: ActionPlan;

  // Engine outputs
  ai_engine_output: AiEngineOutput;
  physics_engine_output: PhysicsEngineOutput;

  // Data context
  data_quality: DataQuality;
  community_risk?: CommunityRisk;
  input_data: InputData;
  weighting_strategy: WeightingStrategy;
  interpretability: Interpretability;

  // Shadow / HITL
  shadow_mode: ShadowMode;
  human_in_the_loop: {
    requires_manual_review: boolean;
    review_reason: string;
  };

  // AI text
  ai_consultant_advice: string;

  // Model info
  model_info: ModelInfo;

  // Legacy / satellite
  satellite_truth: any;
  discrepancy_alert: string;
  decision_logic: Record<string, any>;
  area_logic: Record<string, any>;
}
