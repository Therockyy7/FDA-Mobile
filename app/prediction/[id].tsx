import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { ActionPlanCard } from "~/features/prediction/components/ActionPlanCard";
import { AiConsultantCard } from "~/features/prediction/components/AiConsultantCard";
import { EnsembleDetailsCard } from "~/features/prediction/components/EnsembleDetailsCard";
import { FactorsCard } from "~/features/prediction/components/FactorsCard";
import { ImpactAssessmentCard } from "~/features/prediction/components/ImpactAssessmentCard";
import { RiskOverviewCard } from "~/features/prediction/components/RiskOverviewCard";
import { ValidPeriodBadge } from "~/features/prediction/components/ValidPeriodBadge";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import { PredictionResponse } from "~/features/prediction/types/prediction.types";
import { useColorScheme } from "~/lib/useColorScheme";
import { PredictionTimelineSlider } from "~/features/map/components/controls/PredictionTimelineSlider";
import { useDistrictsForecast, ForecastHorizon } from "~/features/prediction/hooks/useDistrictsForecast";

export default function PredictionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon>("now");
  const { data: forecastData, loading: forecastLoading, refresh: refreshTimeline } = useDistrictsForecast(true);

  // Re-fetch timeline specific data when refreshing
  const onRefresh = React.useCallback(() => {
    if (id) {
      setRefreshing(true);
      loadPrediction(id);
      refreshTimeline?.();
    }
  }, [id, refreshTimeline]);

  useEffect(() => {
    if (id) {
      loadPrediction(id);
    }
  }, [id]);

  const loadPrediction = async (areaId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await PredictionService.getFloodRiskPrediction(areaId);
      setPrediction(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tải dự báo rủi ro.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.ScrollView
        ref={scrollRef}
        style={{
          flex: 1,
          backgroundColor: isDarkColorScheme ? "#0F172A" : "#F1F5F9",
        }}
        contentContainerStyle={{
          paddingBottom: 40,
          flexGrow: 1,
          minHeight: "100%",
          justifyContent: loading && !refreshing ? "center" : undefined,
          alignItems: loading && !refreshing ? "center" : undefined,
        }}
        scrollEventThrottle={64}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        {loading && !refreshing ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text
              style={{
                marginTop: 16,
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                textAlign: "center",
              }}
            >
              Đang phân tích rủi ro từ AI...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Ionicons
              name="alert-circle"
              size={48}
              color="#EF4444"
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginBottom: 8,
              }}
            >
              Đã có lỗi xảy ra
            </Text>
            <Text style={{ color: "#EF4444", textAlign: "center" }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={{
                marginTop: 20,
                backgroundColor: "#007AFF",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                Thử lại
              </Text>
            </TouchableOpacity>
          </View>
        ) : prediction ? (
          <>
            {/* Hero Header with Gradient */}
            <LinearGradient
              colors={
                isDarkColorScheme
                  ? ["#1E3A8A", "#1E293B"]
                  : ["#007AFF", "#38BDF8"]
              }
              style={{
                paddingHorizontal: 20,
                paddingTop: insets.top + 10,
                paddingBottom: 32,
                marginBottom: -16,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  alignSelf: "flex-start",
                  padding: 8,
                  marginBottom: 12,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="analytics" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "rgba(255,255,255,0.8)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 2,
                    }}
                  >
                    {prediction.model_info?.ai_model?.includes("v2")
                      ? "FloodMLP v2"
                      : "Phân tích AI"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "900",
                      color: "#FFFFFF",
                      lineHeight: 30,
                    }}
                  >
                    {prediction.area_name}
                  </Text>
                </View>
              </View>

              {/* Timestamp + Admin Level badges */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color="rgba(255,255,255,0.9)"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.9)",
                      fontWeight: "600",
                    }}
                  >
                    {prediction.timestamp}
                  </Text>
                </View>
                {prediction.model_info?.confidence_level && (
                  <View
                    style={{
                      backgroundColor: "rgba(16,185,129,0.25)",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#A7F3D0",
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      {prediction.model_info.confidence_level}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>

            <View style={{ paddingHorizontal: 20, gap: 20 }}>
              {/* Valid Period Badge */}
              {prediction.valid_period && (
                <ValidPeriodBadge validPeriod={prediction.valid_period} />
              )}

              {/* Dynamic Forecast Timeline Area */}
              <View style={{ marginHorizontal: -20 }}>
                <PredictionTimelineSlider
                  visible={true}
                  inline={true}
                  selectedHorizon={selectedHorizon}
                  onHorizonChange={setSelectedHorizon}
                  isLoading={forecastLoading}
                  evaluatedAt={forecastData?.evaluated_at}
                />
              </View>

              {(() => {
                const targetDistrict = forecastData?.districts.find(d => d.area_id === id);
                if (!targetDistrict && selectedHorizon !== "now") return null;

                const evolution = selectedHorizon === "now" 
                  ? null 
                  : targetDistrict?.temporal_evolution?.find(e => e.horizon === selectedHorizon);
                  
                const colorData = selectedHorizon === "now"
                  ? targetDistrict?.color_timeline?.["now"]
                  : targetDistrict?.color_timeline?.[selectedHorizon];

                const precip = selectedHorizon === "now" 
                  ? forecastData?.weather_summary?.precip_now_mm 
                  : evolution?.precip_mm;

                if (selectedHorizon !== "now" && !evolution) return null;

                return (
                  <View
                    style={{
                      backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
                      borderRadius: 24,
                      padding: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.1,
                      shadowRadius: 16,
                      elevation: 8,
                      borderTopWidth: 4,
                      borderTopColor: colorData?.hex || "#94A3B8"
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: isDarkColorScheme ? "#94A3B8" : "#64748B", textTransform: "uppercase" }}>
                        Chi tiết rủi ro ({selectedHorizon === "now" ? "Hiện tại" : `+${selectedHorizon}`})
                      </Text>
                      {evolution && (
                        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Ionicons name={evolution.trend === "tang" ? "trending-up" : evolution.trend === "giam" ? "trending-down" : "remove"} size={14} color={evolution.trend === "tang" ? "#EF4444" : evolution.trend === "giam" ? "#10B981" : "#F59E0B"} style={{ marginRight: 4 }} />
                          <Text style={{ fontSize: 12, fontWeight: "600", color: isDarkColorScheme ? "#F1F5F9" : "#334155" }}>
                            {evolution.trend === "tang" ? "Tăng" : evolution.trend === "giam" ? "Giảm" : "Ổn định"}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: isDarkColorScheme ? "#94A3B8" : "#64748B", marginBottom: 4 }}>Mức độ ngập</Text>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colorData?.hex || "#3B82F6", marginRight: 8 }} />
                          <Text style={{ fontSize: 16, fontWeight: "800", color: colorData?.hex || (isDarkColorScheme ? "#F1F5F9" : "#1F2937") }}>
                            {selectedHorizon === "now" ? prediction.ensemble_prediction.risk_level : evolution?.risk_level}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: isDarkColorScheme ? "#334155" : "#E2E8F0", paddingLeft: 16 }}>
                         <Text style={{ fontSize: 12, color: isDarkColorScheme ? "#94A3B8" : "#64748B", marginBottom: 4 }}>Khả năng xảy ra</Text>
                         <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkColorScheme ? "#F1F5F9" : "#334155" }}>
                           {((selectedHorizon === "now" ? prediction.ensemble_prediction.probability : evolution?.probability) || 0) * 100}%
                         </Text>
                      </View>
                    </View>

                    {precip !== undefined && precip !== null && (
                      <View style={{ backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFC", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(59, 130, 246, 0.15)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                          <Ionicons name="rainy" size={18} color="#3B82F6" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 12, color: isDarkColorScheme ? "#94A3B8" : "#64748B" }}>Lượng mưa dị kiến</Text>
                          <Text style={{ fontSize: 14, fontWeight: "700", color: isDarkColorScheme ? "#F1F5F9" : "#0F172A", marginTop: 2 }}>{precip} mm</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })()}

              {/* Risk Overview Card — uses structured ensemble data */}
              <RiskOverviewCard
                probability={prediction.ensemble_prediction.probability}
                riskLevel={prediction.ensemble_prediction.risk_level}
                recommendation={prediction.ensemble_prediction.recommendation}
                confidence={prediction.ensemble_prediction.confidence}
                confidenceScore={prediction.ensemble_prediction.confidence_score}
                modelAgreementScore={prediction.ensemble_prediction.model_agreement_score}
                uncertaintyLevel={prediction.ensemble_prediction.uncertainty_level}
              />

              {/* Contributing Factors — from AI engine output */}
              {prediction.ai_engine_output?.contribution_scores && (
                <FactorsCard
                  contributionScores={{
                    intensity: prediction.ai_engine_output.contribution_scores.intensity ?? 0,
                    saturation: prediction.ai_engine_output.contribution_scores.saturation ?? 0,
                    accumulation: prediction.ai_engine_output.contribution_scores.accumulation ?? 0,
                    topography: prediction.ai_engine_output.contribution_scores.topography ?? 0,
                    hydrology: prediction.ai_engine_output.contribution_scores.hydrology ?? 0,
                  }}
                />
              )}

              {/* Impact Assessment */}
              {prediction.impact_assessment && (
                <ImpactAssessmentCard impact={prediction.impact_assessment} />
              )}

              {/* AI Consultant Advice */}
              {prediction.ai_consultant_advice && (
                <AiConsultantCard advice={prediction.ai_consultant_advice} />
              )}

              {/* Action Plan */}
              {prediction.action_plan && (
                <ActionPlanCard actionPlan={prediction.action_plan} />
              )}

              {/* Ensemble Details (Model info, confidence breakdown, data quality) */}
              {prediction.model_info && prediction.confidence_breakdown && prediction.data_quality && (
                <EnsembleDetailsCard
                  modelInfo={prediction.model_info}
                  confidenceBreakdown={prediction.confidence_breakdown}
                  dataQuality={prediction.data_quality}
                  weightingStrategy={prediction.weighting_strategy}
                  aiProbability={prediction.ai_engine_output?.probability ?? 0}
                  physicsProbability={prediction.physics_engine_output?.probability ?? 0}
                />
              )}

              {/* Interpretability explanation */}
              {prediction.interpretability?.explanation && (
                <View
                  style={{
                    backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
                    borderRadius: 20,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: "#007AFF",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name="bulb"
                      size={18}
                      color="#007AFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "800",
                        color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                      }}
                    >
                      Giải Thích AI
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isDarkColorScheme ? "#CBD5E1" : "#475569",
                      lineHeight: 22,
                    }}
                  >
                    {prediction.interpretability.explanation}
                  </Text>
                  {prediction.interpretability.historical_similarity && (
                    <View
                      style={{
                        marginTop: 12,
                        backgroundColor: isDarkColorScheme ? "#334155" : "#F8FAFC",
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          marginBottom: 6,
                        }}
                      >
                        Sự kiện lịch sử tương tự
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                        }}
                      >
                        {prediction.interpretability.historical_similarity.event_name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                          marginTop: 4,
                        }}
                      >
                        Tương đồng: {(prediction.interpretability.historical_similarity.similarity_score * 100).toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        ) : null}
      </Animated.ScrollView>
    </>
  );
}
