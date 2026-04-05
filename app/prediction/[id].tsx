import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { AiFactorsCard } from "~/features/prediction/components/AiFactorsCard";
import { CommunityReportsCard } from "~/features/prediction/components/CommunityReportsCard";
import { ForecastWindowsCard } from "~/features/prediction/components/ForecastWindowsCard";
import { HybridEnsembleCard } from "~/features/prediction/components/HybridEnsembleCard";
import { ImpactCard } from "~/features/prediction/components/ImpactCard";
import { NewAiConsultantCard } from "~/features/prediction/components/NewAiConsultantCard";
import { PredictionHeroHeader } from "~/features/prediction/components/PredictionHeroHeader";
import { SatelliteVerificationCard } from "~/features/prediction/components/SatelliteVerificationCard";
import { StationsCard } from "~/features/prediction/components/StationsCard";
import { PredictionService } from "~/features/prediction/services/prediction.service";
import { PredictionResponse } from "~/features/prediction/types/prediction.types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function PredictionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
          flexGrow: 1,
          justifyContent: loading && !refreshing ? "center" : undefined,
          alignItems: loading && !refreshing ? "center" : undefined,
        }}
        scrollEventThrottle={64}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        {/* ── Loading ── */}
        {loading && !refreshing ? (
          <View style={{ alignItems: "center", padding: 24 }}>
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
        ) : error ? (
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
          <>
            {/* Hero header with gradient + stats */}
            <PredictionHeroHeader prediction={prediction} />

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

              {/* 3h / 5h / 7h forecast windows */}
              <ForecastWindowsCard
                windows={prediction.forecast.windows}
                evaluatedAt={prediction.evaluatedAt}
              />

              {/* Impact assessment */}
              <ImpactCard aiPrediction={prediction.forecast.aiPrediction} />

              {/* Hybrid Methodology */}
              <HybridEnsembleCard prediction={prediction} />

              {/* 🛰️ AI Prithvi Satellite Verification */}
              <SatelliteVerificationCard
                areaId={prediction.administrativeAreaId}
                areaName={prediction.administrativeArea?.name}
              />

              {/* AI factors breakdown */}
              <AiFactorsCard aiPrediction={prediction.forecast.aiPrediction} />

              {/* Monitoring stations */}
              <StationsCard stations={prediction.contributingStations} />

              {/* Community reports */}
              <CommunityReportsCard reports={prediction.communityReports} />

              {/* AI consultant detail */}
              {prediction.aiConsultant?.finalSummary ? (
                <NewAiConsultantCard aiConsultant={prediction.aiConsultant} />
              ) : null}

              {/* Evaluated at footer */}
              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingTop: 4 }}>
                <Ionicons name="time-outline" size={12} color={isDarkColorScheme ? "#475569" : "#94A3B8"} />
                <Text style={{ fontSize: 11, color: isDarkColorScheme ? "#475569" : "#94A3B8" }}>
                  Đánh giá lúc {new Date(prediction.evaluatedAt).toLocaleString("vi-VN")}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}


