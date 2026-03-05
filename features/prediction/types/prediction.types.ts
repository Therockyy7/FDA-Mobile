export interface PredictionResponse {
  status: string;
  area_id: string;
  area_name: string;
  administrative_level: string;
  ensemble_prediction: {
    probability: number;
    risk_level: string;
    recommendation: string;
    confidence: string;
    confidence_score: number;
    model_agreement_score: number;
    verification_status: string;
  };
  valid_period: {
    start: string;
    end: string;
    status: string;
    duration_hours: number;
    next_update_expected: string;
  };
  impact_assessment: {
    potential_depth_m: number;
    critical_assets_at_risk: any[];
    affected_assets_count: number;
    estimated_affected_population: number;
    depth_impact_description: string;
  };
  confidence_breakdown: {
    overall_confidence: string;
    confidence_score: number;
    breakdown_components: {
      [key: string]: {
        confidence: string;
        weight?: string;
        reason?: string;
        contribution?: string;
        multiplier?: number;
      };
    };
    confidence_rationale: string;
  };
  ai_engine_output: {
    probability: number;
    risk_level: string;
    contribution_scores: {
      [key: string]: number;
    };
    model: string;
  };
  ai_consultant_advice: string;
  timestamp: string;
  interpretability?: {
    dominant_factor?: {
      factor_name: string;
      factor_name_vn: string;
      contribution_percent: number;
    };
    explanation?: string;
  };
}
