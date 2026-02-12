import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { ConclusionCard } from "~/features/prediction/components/ConclusionCard";
import { FactorsCard } from "~/features/prediction/components/FactorsCard";
import { RecommendationsCard } from "~/features/prediction/components/RecommendationsCard";
import { RiskOverviewCard } from "~/features/prediction/components/RiskOverviewCard";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import { PredictionResponse } from "~/features/prediction/types/prediction.types";
import { parseAdvice } from "~/features/prediction/utils/adviceParser";
import { useColorScheme } from "~/lib/useColorScheme";

export default function PredictionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollLogLastRef = useRef(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  // #region agent log
  useFocusEffect(
    useCallback(() => {
      fetch("http://127.0.0.1:7242/ingest/1d6f14c8-c23f-4143-adbd-6650871f1c1c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "app/prediction/[id].tsx:focus",
          message: "PredictionScreen focused",
          data: { id },
          timestamp: Date.now(),
          hypothesisId: "H2",
        }),
      }).catch(() => {});
      return () => {
        fetch("http://127.0.0.1:7242/ingest/1d6f14c8-c23f-4143-adbd-6650871f1c1c", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "app/prediction/[id].tsx:blur",
            message: "PredictionScreen blurred",
            data: {},
            timestamp: Date.now(),
            hypothesisId: "H2",
          }),
        }).catch(() => {});
      };
    }, [id])
  );
  // #endregion

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

  const onRefresh = React.useCallback(() => {
    if (id) {
      setRefreshing(true);
      loadPrediction(id);
    }
  }, [id]);

  // Parse AI advice (needed for content; keep ScrollView mounted so ref is always set)
  const parsedAdvice = prediction
    ? parseAdvice(prediction.ai_consultant_advice)
    : null;

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
        onLayout={() => {
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/1d6f14c8-c23f-4143-adbd-6650871f1c1c", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "app/prediction/[id].tsx:ScrollView.onLayout",
              message: "Prediction ScrollView mounted",
              data: {},
              timestamp: Date.now(),
              hypothesisId: "H2",
            }),
          }).catch(() => {});
          // #endregion
        }}
        onScroll={() => {
          // #region agent log
          const now = Date.now();
          if (now - scrollLogLastRef.current > 600) {
            scrollLogLastRef.current = now;
            fetch("http://127.0.0.1:7242/ingest/1d6f14c8-c23f-4143-adbd-6650871f1c1c", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "app/prediction/[id].tsx:ScrollView.onScroll",
                message: "Prediction user scroll",
                data: {},
                timestamp: now,
                hypothesisId: "H1",
              }),
            }).catch(() => {});
          }
          // #endregion
        }}
        scrollEventThrottle={64}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {loading && !refreshing ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text
              style={{
                marginTop: 16,
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
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
            <Text style={{ color: "#EF4444", textAlign: "center" }}>{error}</Text>
          </View>
        ) : prediction && parsedAdvice ? (
          <>
            {/* Hero Header with Gradient */}
            <LinearGradient
              colors={
                isDarkColorScheme
                  ? ["#1E3A8A", "#1E293B"]
                  : ["#3B82F6", "#60A5FA"]
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
                    Phân tích AI
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignSelf: "flex-start",
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
                  {new Date(prediction.timestamp).toLocaleString("vi-VN")}
                </Text>
              </View>
            </LinearGradient>

            <View style={{ paddingHorizontal: 20, gap: 20 }}>
              {/* Risk Overview Card */}
              <RiskOverviewCard
                riskLevel={parsedAdvice.riskLevel}
                riskPercentage={parsedAdvice.riskPercentage}
                riskLabel={parsedAdvice.riskLabel}
              />

              {/* Key Factors Card */}
              <FactorsCard
                slope={parsedAdvice.factors.slope}
                saturation={parsedAdvice.factors.saturation}
                historySimilarity={parsedAdvice.factors.historySimilarity}
              />

              {/* Recommendations Card */}
              {parsedAdvice.recommendations.length > 0 && (
                <RecommendationsCard
                  recommendations={parsedAdvice.recommendations}
                />
              )}

              {/* Conclusion Card */}
              <ConclusionCard
                icon={parsedAdvice.conclusion.icon}
                text={parsedAdvice.conclusion.text}
              />
            </View>
          </>
        ) : null}
      </Animated.ScrollView>
    </>
  );
}
