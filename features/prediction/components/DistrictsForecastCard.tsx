import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AreaService } from "~/features/areas/services/area.service";
import { useColorScheme } from "~/lib/useColorScheme";

import { PredictionService } from "../services/prediction.service";
import { getRiskConfigByLevel } from "../types/prediction.types";
import type { PredictionResponse } from "../types/prediction.types";

// ─────────────────────────────────────────────────────────────
// Skeleton sub-component
// ─────────────────────────────────────────────────────────────

const DistrictsForecastSkeleton = () => {
  const { isDarkColorScheme } = useColorScheme();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const skBg = isDarkColorScheme ? "#1E293B" : "#E2E8F0";
  const cardBg = isDarkColorScheme ? "#0F172A" : "#FFFFFF";
  const border = isDarkColorScheme ? "#334155" : "#F1F5F9";

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 4, paddingBottom: 24 }}>
      {/* Header skeleton */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Animated.View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: skBg, opacity: pulseAnim }} />
          <View>
            <Animated.View style={{ width: 150, height: 14, borderRadius: 6, backgroundColor: skBg, opacity: pulseAnim, marginBottom: 4 }} />
            <Animated.View style={{ width: 100, height: 10, borderRadius: 4, backgroundColor: skBg, opacity: pulseAnim }} />
          </View>
        </View>
        <Animated.View style={{ width: 60, height: 28, borderRadius: 14, backgroundColor: skBg, opacity: pulseAnim }} />
      </View>

      {/* Hero card skeleton */}
      <Animated.View style={{ height: 160, borderRadius: 20, backgroundColor: skBg, opacity: pulseAnim, marginBottom: 10 }} />

      {/* Stats row skeleton */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={{ flex: 1, height: 64, borderRadius: 14, backgroundColor: skBg, opacity: pulseAnim }} />
        ))}
      </View>

      {/* Timeline skeleton */}
      <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor: border, padding: 12 }}>
        <Animated.View style={{ width: 120, height: 11, borderRadius: 5, backgroundColor: skBg, opacity: pulseAnim, marginBottom: 10 }} />
        {[1, 2].map((i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
            <Animated.View style={{ width: 30, height: 10, borderRadius: 4, backgroundColor: skBg, opacity: pulseAnim }} />
            <Animated.View style={{ width: 80, height: 8, borderRadius: 4, backgroundColor: skBg, opacity: pulseAnim }} />
            <Animated.View style={{ width: 36, height: 18, borderRadius: 8, backgroundColor: skBg, opacity: pulseAnim }} />
          </View>
        ))}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getRiskGradient(riskLevel: string): readonly [string, string] {
  const upper = riskLevel?.toUpperCase() ?? "";
  if (upper.includes("CAO") || upper.includes("HIGH") || upper.includes("CAM"))
    return ["#DC2626", "#F87171"] as const;
  if (upper.includes("VANG") || upper.includes("MODERATE") || upper.includes("MED"))
    return ["#D97706", "#FBBF24"] as const;
  if (upper.includes("CRITICAL") || upper.includes("RAT"))
    return ["#7F1D1D", "#DC2626"] as const;
  return ["#059669", "#34D399"] as const;
}

function formatLocationName(parts: Location.LocationGeocodedAddress): string {
  // Build a compact Vietnamese ward-level label
  // expo-location LocationGeocodedAddress fields: district, city, subregion, region, street, name
  const ward = parts.district ?? parts.name ?? "";
  const cityPart = parts.city ?? parts.subregion ?? "";
  if (ward && cityPart) return `${ward}, ${cityPart}`;
  return ward || cityPart || "Vị trí hiện tại";
}

/** Normalize Vietnamese string: lowercase + remove diacritics for fuzzy comparison */
function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/**
 * Score how well an admin-area name matches a search term.
 * Higher = better match.
 *   100 – exact match (normalized)
 *    80 – area name starts with term
 *    60 – term starts with area name (area name is a substring prefix of term)
 *    40 – area name contains term
 *    20 – term contains area name
 *     0 – no match
 */
function scoreAreaMatch(areaName: string, searchTerm: string): number {
  const a = normalizeVi(areaName);
  const t = normalizeVi(searchTerm);
  if (!a || !t) return 0;
  if (a === t) return 100;
  if (a.startsWith(t)) return 80;
  if (t.startsWith(a)) return 60;
  if (a.includes(t)) return 40;
  if (t.includes(a)) return 20;
  return 0;
}

/** Given a list of admin areas and a search term, return the best-matching one or null */
function pickBestArea(
  areas: { id: string; name: string }[],
  term: string
): { id: string; name: string } | null {
  let best: { id: string; name: string } | null = null;
  let bestScore = 0;
  for (const area of areas) {
    const score = scoreAreaMatch(area.name, term);
    if (score > bestScore) {
      bestScore = score;
      best = area;
    }
  }
  return bestScore > 0 ? best : null;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

type LoadState = "idle" | "location" | "area" | "prediction" | "done" | "error";

interface LocalForecastData {
  areaId: string;
  areaName: string;
  locationLabel: string;
  prediction: PredictionResponse;
}

// ─────────────────────────────────────────────────────────────
// Module-level cache — persists across tab switches (unlike useState which resets on unmount)
// ─────────────────────────────────────────────────────────────
let _cachedForecast: LocalForecastData | null = null;
let _cacheTimestamp = 0;
/** Minimum ms before allowing a background re-fetch (5 minutes) */
const FORECAST_CACHE_TTL_MS = 5 * 60 * 1000;

export function DistrictsForecastCard() {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [data, setData] = useState<LocalForecastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const themeConfig = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    pageeBg: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F8FAFC" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    primary: "#6366F1",
  };

  const fetchForecast = useCallback(async (forceRefresh = false) => {
    try {
      // ── Cache-first: if cached data is fresh and not a forced refresh, use it ──
      if (!forceRefresh && _cachedForecast && Date.now() - _cacheTimestamp < FORECAST_CACHE_TTL_MS) {
        setData(_cachedForecast);
        setLoadState("done");
        return;
      }

      setErrorMsg(null);
      setData(null);

      // ── Step 1: Request location permission & get coords ──
      setLoadState("location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Ứng dụng cần quyền truy cập vị trí");
        setLoadState("error");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;

      // ── Step 2: Reverse geocode to get ward/district name ──
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationLabel = geo ? formatLocationName(geo) : "Vị trí hiện tại";

      // ── Step 3: Find matching ADMINISTRATIVE AREA ──
      // IMPORTANT: PredictionService requires IDs from /api/v1/admin/administrative-areas
      // NOT from /api/v1/areas/me (user areas). These are completely different systems.
      setLoadState("area");
      let areaId: string | null = null;
      let areaName: string = locationLabel;

      // Build candidate search terms from geocoded address (most-specific first)
      // For Vietnamese addresses: district = ward name, city = district/quan, subregion = city
      const candidateTerms: string[] = [];
      if (geo) {
        if (geo.district) candidateTerms.push(geo.district);
        if (geo.name && geo.name !== geo.district) candidateTerms.push(geo.name);
        if (geo.city) candidateTerms.push(geo.city);
        if (geo.subregion) candidateTerms.push(geo.subregion);
      }

      // ── Strategy: for each candidate term, fetch up to 20 results and pick the
      //    BEST-SCORING match (normalized name similarity), not blindly [0] ──
      for (const term of candidateTerms) {
        if (areaId) break;
        try {
          const adminRes = await AreaService.getAdminAreas({
            searchTerm: term,
            pageNumber: 1,
            pageSize: 20,
          });
          if (adminRes.administrativeAreas.length > 0) {
            const best = pickBestArea(adminRes.administrativeAreas, term);
            if (best) {
              areaId = best.id;
              areaName = best.name;
              console.log(`✅ [DistrictsForecastCard] Best match: "${best.name}" (${best.id}) for term "${term}"`);
            } else {
              // All results scored 0 for this term — skip; next term may be better
              console.log(`⚠️ [DistrictsForecastCard] No good match in ${adminRes.administrativeAreas.length} results for "${term}"`);
            }
          }
        } catch {
          console.warn(`⚠️ Admin area search failed for term: "${term}"`);
        }
      }

      // ── Fallback: load ALL wards and score against every candidate term ──
      if (!areaId) {
        console.warn("⚠️ No area found via candidate terms — running full-list scoring fallback...");
        try {
          const allRes = await AreaService.getAdminAreas({ pageNumber: 1, pageSize: 100 });
          if (allRes.administrativeAreas.length > 0) {
            // Score each area against ALL candidate terms, take the highest
            let topScore = 0;
            let topArea: { id: string; name: string } | null = null;
            for (const area of allRes.administrativeAreas) {
              for (const term of candidateTerms) {
                const s = scoreAreaMatch(area.name, term);
                if (s > topScore) {
                  topScore = s;
                  topArea = area;
                }
              }
            }
            const chosen = topArea ?? allRes.administrativeAreas[0];
            areaId = chosen.id;
            areaName = chosen.name;
            console.log(`⚠️ [DistrictsForecastCard] Fallback chose "${chosen.name}" (score=${topScore})`);
          }
        } catch {
          console.warn("⚠️ Could not fetch admin areas list");
        }
      }

      if (!areaId) {
        setErrorMsg("Không tìm thấy khu vực phù hợp");
        setLoadState("error");
        return;
      }

      // ── Step 4: Fetch prediction ──
      setLoadState("prediction");
      const prediction = await PredictionService.getFloodRiskPrediction(areaId);

      const newData: LocalForecastData = { areaId, areaName, locationLabel, prediction };

      // Save to module-level cache so tab switches don't re-trigger the full pipeline
      _cachedForecast = newData;
      _cacheTimestamp = Date.now();

      setData(newData);
      setLoadState("done");
    } catch (err: any) {
      console.error("❌ DistrictsForecastCard error:", err);
      setErrorMsg(err?.message || "Không thể tải dự báo");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  // ── Loading state → Skeleton ──
  const isLoading = loadState !== "done" && loadState !== "error";
  if (isLoading) return <DistrictsForecastSkeleton />;

  // ── Error state ──
  if (loadState === "error" || !data) {
    return (
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <TouchableOpacity
          onPress={() => fetchForecast()}
          style={{
            backgroundColor: themeConfig.cardBg,
            borderRadius: 16,
            padding: 20,
            alignItems: "center",
            borderWidth: 1,
            borderColor: themeConfig.border,
            borderStyle: "dashed",
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="reload" size={22} color={themeConfig.subtext} />
          <Text style={{ fontSize: 13, color: themeConfig.subtext, textAlign: "center" }}>
            {errorMsg ?? "Không thể tải dự báo"}
          </Text>
          <Text style={{ fontSize: 11, color: themeConfig.primary, fontWeight: "700" }}>
            Chạm để thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { areaId, areaName, locationLabel, prediction } = data;
  const forecast = prediction.forecast;
  const ai = forecast?.aiPrediction;
  const riskLevel = ai?.riskLevel ?? prediction.status ?? "Thấp";
  const probability = Math.round((ai?.ensembleProbability ?? 0) * 100);
  const riskCfg = getRiskConfigByLevel(riskLevel);
  const gradient = getRiskGradient(riskLevel);
  const windows = forecast?.windows?.slice(0, 3) ?? [];

  // Key metrics
  const precipNow = ai?.components?.weather?.precipitation_3h_mm ?? 0;
  const humidity = ai?.components?.weather?.avg_humidity_pct ?? 0;
  const soilSaturation = ai?.components?.saturation?.saturation_level ?? 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={{ paddingHorizontal: 16, paddingVertical: 4, paddingBottom: 24 }}
    >
      {/* ── Section Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: themeConfig.primary }} />
          <View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: themeConfig.text,
                letterSpacing: -0.3,
              }}
            >
              Dự Báo Vị Trí Của Bạn
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="location" size={10} color={themeConfig.primary} />
              <Text
                style={{ fontSize: 10, color: themeConfig.subtext, fontWeight: "500" }}
                numberOfLines={1}
              >
                {locationLabel}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => fetchForecast(true)}
          activeOpacity={0.6}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
          }}
        >
          <Ionicons name="sync" size={12} color={themeConfig.subtext} />
          <Text style={{ fontSize: 10, color: themeConfig.subtext, fontWeight: "600" }}>
            Cập nhật
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Hero Risk Card ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/prediction/${areaId}` as any)}
        style={{
          marginBottom: 10,
          shadowColor: riskCfg.color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 14,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 18 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600", letterSpacing: 1 }}>
                NGUY CƠ NGẬP LỤT
              </Text>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginTop: 2 }}>
                {areaName}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
              }}
            >
              <Text style={{ color: "white", fontSize: 13, fontWeight: "800" }}>
                {prediction.status ?? riskLevel}
              </Text>
            </View>
          </View>

          {/* Probability display */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.35)",
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 22, fontWeight: "900", letterSpacing: -1 }}>
                {probability}%
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 18 }}
                numberOfLines={3}
              >
                {prediction.aiConsultant?.finalSummary
                  ? prediction.aiConsultant.finalSummary.slice(0, 100) + "..."
                  : forecast?.aiPrediction?.impact?.recommendation ?? "Theo dõi bản tin cập nhật để nắm bắt tình hình."}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: "700" }}>
                  Xem chi tiết
                </Text>
                <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.6)" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Key Metrics Row ── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        {/* Precipitation */}
        <View
          style={{
            flex: 1,
            backgroundColor: themeConfig.cardBg,
            borderRadius: 14,
            padding: 10,
            borderWidth: 1,
            borderColor: themeConfig.border,
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons name="rainy" size={18} color="#0EA5E9" />
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#0EA5E9" }}>
            {precipNow}
            <Text style={{ fontSize: 9 }}>mm</Text>
          </Text>
          <Text style={{ fontSize: 9, color: themeConfig.subtext, fontWeight: "500" }}>
            Lượng mưa
          </Text>
        </View>

        {/* Humidity */}
        <View
          style={{
            flex: 1,
            backgroundColor: themeConfig.cardBg,
            borderRadius: 14,
            padding: 10,
            borderWidth: 1,
            borderColor: themeConfig.border,
            alignItems: "center",
            gap: 4,
          }}
        >
          <MaterialCommunityIcons name="water-percent" size={18} color="#6366F1" />
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#6366F1" }}>
            {humidity}
            <Text style={{ fontSize: 9 }}>%</Text>
          </Text>
          <Text style={{ fontSize: 9, color: themeConfig.subtext, fontWeight: "500" }}>
            Độ ẩm
          </Text>
        </View>

        {/* Soil saturation */}
        <View
          style={{
            flex: 1,
            backgroundColor: themeConfig.cardBg,
            borderRadius: 14,
            padding: 10,
            borderWidth: 1,
            borderColor: themeConfig.border,
            alignItems: "center",
            gap: 4,
          }}
        >
          <MaterialCommunityIcons name="terrain" size={18} color="#F59E0B" />
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#F59E0B" }}>
            {Math.round(soilSaturation * 100)}
            <Text style={{ fontSize: 9 }}>%</Text>
          </Text>
          <Text style={{ fontSize: 9, color: themeConfig.subtext, fontWeight: "500" }}>
            Bão hòa đất
          </Text>
        </View>
      </View>

      {/* ── Forecast Timeline ── */}
      {windows.length > 0 && (
        <View
          style={{
            backgroundColor: themeConfig.cardBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: themeConfig.border,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkColorScheme ? 0.2 : 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingTop: 11,
              paddingBottom: 6,
            }}
          >
            <Ionicons name="time-outline" size={12} color={themeConfig.primary} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: themeConfig.subtext }}>
              DỰ BÁO THEO KHUNG GIỜ
            </Text>
          </View>

          {windows.map((w, idx) => {
            const wCfg = getRiskConfigByLevel(w.status);
            const prob = Math.round(w.probability * 100);
            return (
              <View
                key={w.horizon}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderTopWidth: 1,
                  borderTopColor: themeConfig.border,
                  backgroundColor: idx % 2 === 1
                    ? (isDarkColorScheme ? "rgba(51,65,85,0.3)" : "#F8FAFC")
                    : "transparent",
                }}
              >
                {/* Horizon label */}
                <Text style={{ width: 36, fontSize: 12, fontWeight: "800", color: themeConfig.primary }}>
                  {w.horizon}
                </Text>

                {/* Probability bar */}
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDarkColorScheme ? "#1E293B" : "#E2E8F0",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, prob)}%`,
                        height: "100%",
                        borderRadius: 3,
                        backgroundColor: wCfg.color,
                      }}
                    />
                  </View>
                </View>

                {/* Percent + risk label */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minWidth: 80, justifyContent: "flex-end" }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: wCfg.color }}>
                    {prob}%
                  </Text>
                  <View
                    style={{
                      backgroundColor: isDarkColorScheme ? `${wCfg.color}20` : `${wCfg.color}15`,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: "700", color: wCfg.color }}>
                      {w.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </MotiView>
  );
}
