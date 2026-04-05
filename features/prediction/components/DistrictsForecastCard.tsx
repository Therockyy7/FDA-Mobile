import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

import { PredictionService } from "../services/prediction.service";
import { getRiskConfigByLevel } from "../types/prediction.types";

interface MappedForecastData {
  weather_summary: {
    precip_now_mm: number;
    humidity_pct: number;
  };
  districts: {
    area_id: string;
    area_name: string;
    status: string;
    now: {
      risk_level: string;
      probability: number;
    };
    temporal_evolution: {
      horizon: string;
      probability: number;
      risk_level: string;
    }[];
  }[];
}

export function DistrictsForecastCard() {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const [data, setData] = useState<MappedForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const areaIds = ["3", "5", "7"];
      const results = await Promise.all(
        areaIds.map((id) => PredictionService.getFloodRiskPrediction(id))
      );

      const mappedData: MappedForecastData = {
        weather_summary: {
          precip_now_mm:
            results[0]?.forecast?.aiPrediction?.components?.weather?.precipitation_3h_mm || 0,
          humidity_pct:
            results[0]?.forecast?.aiPrediction?.components?.weather?.avg_humidity_pct || 0,
        },
        districts: results.map((res, index) => ({
          area_id: res.administrativeArea?.id || areaIds[index],
          area_name: res.administrativeArea?.name || `Quận ${areaIds[index]}`,
          status: res.status || "Normal",
          now: {
            risk_level: res.forecast?.aiPrediction?.riskLevel || "Thấp",
            probability: res.forecast?.aiPrediction?.ensembleProbability || 0,
          },
          temporal_evolution:
            res.forecast?.windows?.map((w) => ({
              horizon: w.horizon,
              probability: w.probability,
              risk_level: w.status,
            })) || [],
        })),
      };

      setData(mappedData);
    } catch (err: any) {
      setError(err.message || "Không thể tải dự báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const themeConfig = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F8FAFC" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    primary: "#6366F1",
    primaryLight: isDarkColorScheme ? "rgba(99,102,241,0.15)" : "#EEF2FF",
    rowHover: isDarkColorScheme ? "rgba(51,65,85,0.5)" : "#F8FAFC",
  };

  if (loading) {
    return (
      <View
        style={{
          padding: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" color={themeConfig.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <TouchableOpacity
          onPress={fetchData}
          style={{
            backgroundColor: themeConfig.cardBg,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: themeConfig.border,
            borderStyle: "dashed",
          }}
        >
          <Text style={{ fontSize: 13, color: themeConfig.subtext }}>
            Không thể tải dự báo. Chạm để thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{ paddingHorizontal: 16, paddingVertical: 4, paddingBottom: 24 }}
    >
      {/* ═══ Ultra Compact Header + Weather Bar ═══ */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 4,
              height: 14,
              borderRadius: 2,
              backgroundColor: themeConfig.primary,
            }}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: themeConfig.text,
              letterSpacing: -0.2,
            }}
          >
            Dự báo
          </Text>
        </View>

        {/* Unified weather pills */}
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: themeConfig.cardBg,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: themeConfig.border,
            }}
          >
            <Ionicons name="rainy" size={10} color="#0EA5E9" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: themeConfig.text,
              }}
            >
              {data.weather_summary.precip_now_mm}mm
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: themeConfig.cardBg,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: themeConfig.border,
            }}
          >
            <Ionicons name="water" size={10} color="#6366F1" />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: themeConfig.text,
              }}
            >
              {data.weather_summary.humidity_pct}%
            </Text>
          </View>
          <TouchableOpacity
            onPress={fetchData}
            activeOpacity={0.6}
            style={{ paddingLeft: 4 }}
          >
            <Ionicons name="sync" size={14} color={themeConfig.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══ Elegant Consolidated List ═══ */}
      <View
        style={{
          backgroundColor: themeConfig.cardBg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: themeConfig.border,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.03,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {data.districts.map((district, idx) => {
          const nowConfig = getRiskConfigByLevel(district.now.risk_level);
          const isLast = idx === data.districts.length - 1;

          return (
            <MotiView
              key={district.area_id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                delay: idx * 50,
                duration: 300,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/prediction/${district.area_id}` as any)
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: themeConfig.border,
                }}
              >
                {/* 1. Name & Alert Indicator */}
                <View style={{ flex: 1.2, paddingRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: themeConfig.text,
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                  >
                    {district.area_name}
                  </Text>
                  {district.status && district.status !== "Normal" ? (
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "700",
                        color: "#F59E0B",
                      }}
                      numberOfLines={1}
                    >
                      ⚠️ {district.status}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "500",
                        color: themeConfig.subtext,
                      }}
                      numberOfLines={1}
                    >
                      Bình thường
                    </Text>
                  )}
                </View>

                {/* 2. Mini Horizontal Timeline */}
                <View
                  style={{
                    flex: 1.5,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {district.temporal_evolution.map((h, i) => {
                    if (i > 1) return null; // Show max 2 future points (3h and 5h) to save space
                    const hConfig = getRiskConfigByLevel(h.risk_level);
                    return (
                      <View
                        key={h.horizon}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: isDarkColorScheme
                            ? `${hConfig.color}15`
                            : `${hConfig.color}10`,
                          paddingHorizontal: 4,
                          paddingVertical: 3,
                          borderRadius: 6,
                          gap: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "700",
                            color: themeConfig.subtext,
                          }}
                        >
                          {h.horizon}
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "800",
                            color: hConfig.color,
                          }}
                        >
                          {(h.probability * 100).toFixed(0)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* 3. Current Probability */}
                <View
                  style={{
                    flex: 0.8,
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: nowConfig.color,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "900",
                        color: nowConfig.color,
                        letterSpacing: -0.5,
                      }}
                    >
                      {(district.now.probability * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}
