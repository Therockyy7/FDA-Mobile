import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import type {
  ConfidenceBreakdown,
  DataQuality,
  ModelInfo,
  WeightingStrategy,
} from "../types/prediction.types";

interface EnsembleDetailsCardProps {
  modelInfo: ModelInfo;
  confidenceBreakdown: ConfidenceBreakdown;
  dataQuality: DataQuality;
  weightingStrategy: WeightingStrategy;
  aiProbability: number;
  physicsProbability: number;
}

export function EnsembleDetailsCard({
  modelInfo,
  confidenceBreakdown,
  dataQuality,
  weightingStrategy,
  aiProbability,
  physicsProbability,
}: EnsembleDetailsCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const [expanded, setExpanded] = useState(false);

  const qualityItems = [
    {
      label: "Lịch sử mưa",
      value: dataQuality.rainfall_history_quality,
      icon: "rainy" as const,
    },
    {
      label: "Độ mới cảm biến",
      value: 1 - dataQuality.sensor_staleness,
      icon: "hardware-chip" as const,
    },
    {
      label: "Chất lượng địa hình",
      value: dataQuality.terrain_quality,
      icon: "map" as const,
    },
  ];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 400, duration: 500 }}
    >
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
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="brain"
              size={22}
              color="white"
            />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
              }}
            >
              Chi Tiết Mô Hình
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                marginTop: 2,
              }}
            >
              {modelInfo.ensemble_version}
            </Text>
          </View>
        </View>

        {/* Model Badges */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: "#6366F120",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#6366F1" }}>
              🧠 {modelInfo.ai_model.split("(")[0].trim()}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#06B6D420",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#06B6D4" }}>
              ⚙️ {modelInfo.physics_model.split("+")[0].trim()}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#10B98120",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#10B981" }}>
              🛰️ {modelInfo.satellite_model.split("(")[0].trim()}
            </Text>
          </View>
        </View>

        {/* AI vs Physics comparison */}
        <View
          style={{
            backgroundColor: isDarkColorScheme ? "#334155" : "#F8FAFC",
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 10,
            }}
          >
            So Sánh Mô Hình
          </Text>

          {/* AI bar */}
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#6366F1" }}>
                AI ({(weightingStrategy.ai_weight * 100).toFixed(0)}%)
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#6366F1" }}>
                {(aiProbability * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: isDarkColorScheme ? "#475569" : "#E2E8F0", borderRadius: 3 }}>
              <View
                style={{
                  height: "100%",
                  width: `${Math.min(aiProbability * 100, 100)}%`,
                  backgroundColor: "#6366F1",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>

          {/* Physics bar */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#06B6D4" }}>
                Vật Lý ({(weightingStrategy.physics_weight * 100).toFixed(0)}%)
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#06B6D4" }}>
                {(physicsProbability * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: isDarkColorScheme ? "#475569" : "#E2E8F0", borderRadius: 3 }}>
              <View
                style={{
                  height: "100%",
                  width: `${Math.min(physicsProbability * 100, 100)}%`,
                  backgroundColor: "#06B6D4",
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        </View>

        {/* Data Quality */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 10,
            }}
          >
            Chất Lượng Dữ Liệu
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {qualityItems.map((item) => {
              const pct = item.value * 100;
              const color = pct >= 80 ? "#16A34A" : pct >= 50 ? "#CA8A04" : "#DC2626";
              return (
                <View
                  key={item.label}
                  style={{
                    flex: 1,
                    backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                    borderRadius: 12,
                    padding: 10,
                    alignItems: "center",
                  }}
                >
                  <Ionicons name={item.icon as any} size={18} color={color} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      color,
                      marginTop: 4,
                    }}
                  >
                    {pct.toFixed(0)}%
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "600",
                      color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                      textAlign: "center",
                      marginTop: 2,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 4,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={isDarkColorScheme ? "#64748B" : "#94A3B8"}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: isDarkColorScheme ? "#64748B" : "#94A3B8",
              }}
            >
              Nguồn mưa 12h: {dataQuality.rainfall_12h_source}
            </Text>
          </View>
        </View>

        {/* Expandable confidence breakdown */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Phân tích tin cậy chi tiết
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={isDarkColorScheme ? "#94A3B8" : "#64748B"}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={{ marginTop: 12, gap: 8 }}>
            {Object.entries(confidenceBreakdown.breakdown_components).map(
              ([key, comp]) => (
                <View
                  key={key}
                  style={{
                    backgroundColor: isDarkColorScheme ? "#334155" : "#F8FAFC",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: isDarkColorScheme ? "#E2E8F0" : "#334155",
                        textTransform: "capitalize",
                      }}
                    >
                      {key.replace(/_/g, " ")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color:
                          comp.confidence === "Very High" || comp.confidence === "High"
                            ? "#16A34A"
                            : comp.confidence === "Medium"
                              ? "#CA8A04"
                              : "#DC2626",
                      }}
                    >
                      {comp.confidence}
                    </Text>
                  </View>
                  {comp.reason && (
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "500",
                        color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                        marginTop: 4,
                        lineHeight: 16,
                      }}
                    >
                      {comp.reason}
                    </Text>
                  )}
                </View>
              ),
            )}
            {/* Rationale */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                lineHeight: 18,
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              {confidenceBreakdown.confidence_rationale}
            </Text>
          </View>
        )}
      </View>
    </MotiView>
  );
}
