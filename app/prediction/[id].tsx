import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  scrollTo,
  runOnUI,
} from "react-native-reanimated";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { AiFactorsCard } from "~/features/prediction/components/AiFactorsCard";
import { CommunityReportsCard } from "~/features/prediction/components/CommunityReportsCard";
import { ForecastWindowsCard } from "~/features/prediction/components/ForecastWindowsCard";
import { HybridEnsembleCard } from "~/features/prediction/components/HybridEnsembleCard";
import { ImpactCard } from "~/features/prediction/components/ImpactCard";
import { NewAiConsultantCard } from "~/features/prediction/components/NewAiConsultantCard";
import {
  PREDICTION_HEADER_MAX_HEIGHT,
  PredictionHeroHeader,
} from "~/features/prediction/components/PredictionHeroHeader";
import { SatelliteVerificationCard } from "~/features/prediction/components/SatelliteVerificationCard";
import { StationsCard } from "~/features/prediction/components/StationsCard";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import { PredictionResponse } from "~/features/prediction/types/prediction.types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function PredictionScreen() {
  const { id, scrollTo: scrollToParam } = useLocalSearchParams<{
    id: string;
    scrollTo?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Reanimated scroll — same pattern as Profile screen ────────────────────
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // ── Track satellite card Y for auto-scroll ────────────────────────────────
  const satelliteCardY = useRef<number>(0);
  const didScrollToSatellite = useRef(false);

  // ── Auto-clear flood overlay when user returns from map ───────────────────
  // Layers are only shown while user is on the map screen; coming back always
  // resets them so they don't persist unexpectedly.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      // Skip the very first focus (initial screen open)
      if (isFirstFocus.current) {
        return () => {
          // Mark first focus done when screen loses focus for the first time
          isFirstFocus.current = false;
        };
      }
      // User came back (e.g. from map) — clear flood polygons from map
      useSatelliteFloodStore.getState().clear();
    }, []),
  );

  const loadPrediction = useCallback(async (areaId: string) => {
    try {
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
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      loadPrediction(id);
    }
  }, [id, loadPrediction]);

  // ── Auto-scroll to SatelliteVerificationCard when coming from pill ─────────
  useEffect(() => {
    if (scrollToParam === "satellite" && !loading && !didScrollToSatellite.current) {
      const t = setTimeout(() => {
        if (satelliteCardY.current > 0) {
          runOnUI(() => {
            scrollTo(scrollRef, 0, satelliteCardY.current - 16, true);
          })();
          didScrollToSatellite.current = true;
        }
      }, 450);
      return () => clearTimeout(t);
    }
  }, [scrollToParam, loading]);

  const onRefresh = useCallback(() => {
    if (id) {
      setRefreshing(true);
      loadPrediction(id);
    }
  }, [id, loadPrediction]);

  const bgColor = isDarkColorScheme ? "#0B1A33" : "#F1F5F9";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <Animated.ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: PREDICTION_HEADER_MAX_HEIGHT,
            paddingBottom: insets.bottom + 32,
            flexGrow: 1,
          }}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366F1"]}
              tintColor="#6366F1"
              progressViewOffset={PREDICTION_HEADER_MAX_HEIGHT}
            />
          }
        >
          {error ? (
            /* ── Error ── */
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 24,
                backgroundColor: isDarkColorScheme ? "#1E293B" : "#FEE2E2",
                alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Ionicons name="alert-circle" size={36} color="#EF4444" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkColorScheme ? "#F1F5F9" : "#1F2937", marginBottom: 8 }}>
                Không thể tải dự báo
              </Text>
              <Text style={{ fontSize: 13, color: "#EF4444", textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  backgroundColor: "#6366F1",
                  paddingHorizontal: 28, paddingVertical: 12,
                  borderRadius: 14,
                  flexDirection: "row", alignItems: "center", gap: 8,
                }}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : prediction ? (
            /* ── Content ── */
            <View style={{ paddingHorizontal: 16, paddingTop: 24, gap: 16 }}>
              {/* Summary banner */}
              <View style={{
                backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
                borderRadius: 16, padding: 14,
                flexDirection: "row", alignItems: "flex-start", gap: 10,
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
              }}>
                <Ionicons name="document-text-outline" size={16} color={isDarkColorScheme ? "#94A3B8" : "#64748B"} style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 12, color: isDarkColorScheme ? "#CBD5E1" : "#475569", lineHeight: 19, flex: 1 }}>
                  {prediction.summary}
                </Text>
              </View>

              <ForecastWindowsCard
                windows={prediction.forecast.windows}
                evaluatedAt={prediction.evaluatedAt}
              />

              <ImpactCard aiPrediction={prediction.forecast.aiPrediction} />

              <HybridEnsembleCard prediction={prediction} />

              {/* 🛰️ Satellite card — capture Y for pill auto-scroll */}
              <View
                onLayout={(e) => {
                  const y = PREDICTION_HEADER_MAX_HEIGHT + 24 + e.nativeEvent.layout.y;
                  satelliteCardY.current = y;
                  if (
                    scrollToParam === "satellite" &&
                    !didScrollToSatellite.current &&
                    e.nativeEvent.layout.y > 0
                  ) {
                    runOnUI(() => {
                      scrollTo(scrollRef, 0, y - 16, true);
                    })();
                    didScrollToSatellite.current = true;
                  }
                }}
              >
                <SatelliteVerificationCard
                  areaId={prediction.administrativeAreaId}
                  areaName={prediction.administrativeArea?.name}
                />
              </View>

              <AiFactorsCard aiPrediction={prediction.forecast.aiPrediction} />
              <StationsCard stations={prediction.contributingStations} />
              <CommunityReportsCard reports={prediction.communityReports} />

              {prediction.aiConsultant?.finalSummary ? (
                <NewAiConsultantCard aiConsultant={prediction.aiConsultant} />
              ) : null}

              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingTop: 4 }}>
                <Ionicons name="time-outline" size={12} color={isDarkColorScheme ? "#475569" : "#94A3B8"} />
                <Text style={{ fontSize: 11, color: isDarkColorScheme ? "#475569" : "#94A3B8" }}>
                  Đánh giá lúc {new Date(prediction.evaluatedAt).toLocaleString("vi-VN")}
                </Text>
              </View>
            </View>
          ) : null}
        </Animated.ScrollView>

        {/* Absolute header — sits on top of ScrollView */}
        {prediction && (
          <PredictionHeroHeader prediction={prediction} scrollY={scrollY} />
        )}

        {/* ── Loading overlay — full-screen centered, above everything ── */}
        {loading && !refreshing && (
          <View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: bgColor,
            }}
          >
            <View style={{
              width: 72, height: 72, borderRadius: 24,
              backgroundColor: isDarkColorScheme ? "#1E293B" : "#EEF2FF",
              alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: isDarkColorScheme ? "#E2E8F0" : "#1E293B", marginBottom: 4 }}>
              Đang phân tích AI...
            </Text>
            <Text style={{ fontSize: 12, color: isDarkColorScheme ? "#94A3B8" : "#64748B", textAlign: "center" }}>
              Tổng hợp dữ liệu từ vệ tinh, cảm biến và mô hình thời tiết
            </Text>
          </View>
        )}
      </View>
    </>
  );
}


