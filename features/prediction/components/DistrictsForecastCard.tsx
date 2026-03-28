import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { PredictionService } from "../services/prediction.service";
import type { DistrictsForecastResponse } from "../types/districts-forecast.types";
import { getRiskConfigByLevel } from "../types/prediction.types";

export function DistrictsForecastCard() {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const [data, setData] = useState<DistrictsForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PredictionService.getDistrictsForecast("3,5,7");
      setData(result);
    } catch (err: any) {
      setError(err.message || "Không thể tải dự báo quận/huyện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          padding: 20,
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="small" color="#007AFF" />
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            color: isDarkColorScheme ? "#94A3B8" : "#64748B",
          }}
        >
          Đang tải dự báo quận/huyện...
        </Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <TouchableOpacity
          onPress={fetchData}
          style={{
            backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
          }}
        >
          <Ionicons name="refresh" size={24} color="#94A3B8" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              marginTop: 8,
            }}
          >
            Thử tải lại dự báo quận/huyện
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {/* Section Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDarkColorScheme
                  ? "rgba(59, 130, 246, 0.2)"
                  : "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="map" size={18} color="#3B82F6" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
              }}
            >
              Dự Báo Quận/Huyện
            </Text>
          </View>
          <TouchableOpacity onPress={fetchData} activeOpacity={0.7}>
            <Ionicons
              name="refresh"
              size={20}
              color={isDarkColorScheme ? "#94A3B8" : "#64748B"}
            />
          </TouchableOpacity>
        </View>

        {/* Weather Summary Bar */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDarkColorScheme ? "#1E293B" : "#F8FAFC",
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
            gap: 12,
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
          }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="rainy" size={16} color="#3B82F6" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "900",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginTop: 2,
              }}
            >
              {data.weather_summary.precip_now_mm}mm
            </Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              }}
            >
              Mưa hiện tại
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: isDarkColorScheme ? "#475569" : "#E2E8F0",
            }}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="water" size={16} color="#06B6D4" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "900",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginTop: 2,
              }}
            >
              {data.weather_summary.tide_height_m}m
            </Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              }}
            >
              Mực thủy triều
            </Text>
          </View>
          <View
            style={{
              width: 1,
              backgroundColor: isDarkColorScheme ? "#475569" : "#E2E8F0",
            }}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons name="calendar" size={16} color="#8B5CF6" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "900",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginTop: 2,
              }}
            >
              {data.weather_summary.yesterday_precip_mm}mm
            </Text>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              }}
            >
              Mưa hôm qua
            </Text>
          </View>
        </View>

        {/* Risk distribution chips */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {data.summary.risk_distribution.map((item) => {
            if (item.count === 0) return null;
            return (
              <View
                key={item.level}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: item.color.bg,
                  borderWidth: 1.5,
                  borderColor: item.color.hex,
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: item.color.hex,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: item.color.hex,
                  }}
                >
                  {item.level}: {item.count}
                </Text>
              </View>
            );
          })}
        </View>

        {/* District Cards */}
        <View style={{ gap: 10 }}>
          {data.districts.map((district, idx) => {
            const nowConfig = getRiskConfigByLevel(district.now.risk_level);
            return (
              <MotiView
                key={district.area_id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", delay: idx * 80, duration: 400 }}
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push(`/prediction/${district.area_id}` as any)
                  }
                >
                  <View
                    style={{
                      backgroundColor: isDarkColorScheme
                        ? "#1E293B"
                        : "#FFFFFF",
                      borderRadius: 18,
                      padding: 14,
                      borderLeftWidth: 5,
                      borderLeftColor: nowConfig.color,
                      shadowColor: nowConfig.color,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    {/* District header */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                          }}
                          numberOfLines={1}
                        >
                          {district.area_name}
                        </Text>
                        {district.status !== "Normal" && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginTop: 3,
                              gap: 4,
                            }}
                          >
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: "#F59E0B",
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: "#F59E0B",
                              }}
                            >
                              FDA: {district.status}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "900",
                            color: nowConfig.color,
                          }}
                        >
                          {(district.now.probability * 100).toFixed(0)}%
                        </Text>
                        <LinearGradient
                          colors={nowConfig.gradient as unknown as [string, string]}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "800",
                              color: "#FFFFFF",
                            }}
                          >
                            {nowConfig.label}
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>

                    {/* Timeline: now → 3h → 5h → 7h */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      {/* Now */}
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: nowConfig.color,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: "#FFFFFF",
                          }}
                        >
                          Hiện tại
                        </Text>
                      </View>

                      {district.temporal_evolution.map((h) => {
                        const hConfig = getRiskConfigByLevel(h.risk_level);
                        const trendIcon =
                          h.trend === "tang"
                            ? "↑"
                            : h.trend === "giam"
                              ? "↓"
                              : "→";
                        return (
                          <React.Fragment key={h.horizon}>
                            <Text
                              style={{
                                color: isDarkColorScheme ? "#475569" : "#CBD5E1",
                                fontSize: 12,
                              }}
                            >
                              →
                            </Text>
                            <View
                              style={{
                                paddingHorizontal: 6,
                                paddingVertical: 4,
                                backgroundColor: hConfig.color,
                                borderRadius: 6,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  fontWeight: "800",
                                  color: "#FFFFFF",
                                }}
                              >
                                {h.horizon}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "rgba(255,255,255,0.8)",
                                }}
                              >
                                {trendIcon}
                              </Text>
                            </View>
                          </React.Fragment>
                        );
                      })}
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      </View>
    </MotiView>
  );
}
