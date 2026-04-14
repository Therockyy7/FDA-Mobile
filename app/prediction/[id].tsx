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
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useSatelliteFloodStore } from "~/features/map/stores/useSatelliteFloodStore";
import { useAdminAreasQuery } from "~/features/map/hooks/queries/useAdminAreasQuery";
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
import type { PredictionResponse } from "~/features/prediction/types/prediction.types";

export default function PredictionScreen() {
  const { id, scrollTo: scrollToParam } = useLocalSearchParams<{
    id: string;
    scrollTo?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Look up admin area geometry for satellite flood clipping ─────────────
  const adminAreasQuery = useAdminAreasQuery();
  const areaGeometry = React.useMemo(() => {
    if (!prediction?.administrativeAreaId || !adminAreasQuery.data) return null;
    const match = adminAreasQuery.data.find(
      (a: any) => a.id === prediction.administrativeAreaId,
    );
    return match?.geometry ?? null;
  }, [prediction?.administrativeAreaId, adminAreasQuery.data]);

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
    if (!areaId) {
      setError("Invalid area ID");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await PredictionService.getFloodRiskPrediction(areaId);
      setPrediction(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err || "Không thể tải dự báo rủi ro.");
      setError(msg);
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
    if (
      scrollToParam === "satellite" &&
      !loading &&
      !didScrollToSatellite.current
    ) {
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-slate-100 dark:bg-dark" testID="prediction-screen-root">
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
            <View className="flex-1 justify-center items-center p-6" testID="prediction-screen-error">
              <View className="w-[72px] h-[72px] rounded-3xl bg-red-50 dark:bg-slate-800 items-center justify-center mb-4">
                <Ionicons name="alert-circle" size={36} color="#EF4444" />
              </View>
              <Text className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-2 text-center">
                Không thể tải dự báo
              </Text>
              <Text className="text-[13px] text-red-500 text-center mb-6 leading-5">
                {error}
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-indigo-500 px-7 py-3 rounded-xl flex-row items-center gap-2"
                testID="prediction-screen-retry"
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text className="text-white font-bold text-sm">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : prediction ? (
            <View className="px-4 pt-6 gap-4" testID="prediction-screen-content">

              <ForecastWindowsCard
                windows={prediction.forecast.windows}
                evaluatedAt={prediction.evaluatedAt}
              />

              <ImpactCard aiPrediction={prediction.forecast.aiPrediction} />

              <HybridEnsembleCard prediction={prediction} />

              {/* 🛰️ Satellite card — capture Y for pill auto-scroll */}
              <View
                onLayout={(e) => {
                  const y =
                    PREDICTION_HEADER_MAX_HEIGHT + 24 + e.nativeEvent.layout.y;
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
                  areaGeometry={areaGeometry}
                />
              </View>

              <AiFactorsCard aiPrediction={prediction.forecast.aiPrediction} />
              <StationsCard stations={prediction.contributingStations} />
              <CommunityReportsCard reports={prediction.communityReports} />

              {prediction.aiConsultant?.finalSummary ? (
                <NewAiConsultantCard aiConsultant={prediction.aiConsultant} />
              ) : null}

              <View className="flex-row justify-center items-center gap-1.5 pt-1" testID="prediction-screen-eval-time">
                <Ionicons name="time-outline" size={12} color="#94A3B8" />
                <Text className="text-[11px] text-slate-400 dark:text-slate-600">
                  Đánh giá lúc{" "}
                  {new Date(prediction.evaluatedAt ?? Date.now()).toLocaleString("vi-VN")}
                </Text>
              </View>
            </View>
          ) : null}
        </Animated.ScrollView>

        {/* Absolute header — sits on top of ScrollView */}
        {prediction && (
          <PredictionHeroHeader prediction={prediction} scrollY={scrollY} />
        )}

        {loading && !refreshing && (
          <View
            className="absolute inset-0 justify-center items-center bg-slate-100 dark:bg-dark"
            testID="prediction-screen-loading"
          >
            <View className="w-[72px] h-[72px] rounded-3xl bg-indigo-50 dark:bg-slate-800 items-center justify-center mb-4">
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
            <Text className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-1">
              Đang phân tích AI...
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Tổng hợp dữ liệu từ vệ tinh, cảm biến và mô hình thời tiết
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
