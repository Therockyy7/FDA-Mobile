import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import type { ImpactAssessment } from "../types/prediction.types";

interface ImpactAssessmentCardProps {
  impact: ImpactAssessment;
}

export function ImpactAssessmentCard({ impact }: ImpactAssessmentCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  const depthColor =
    impact.potential_depth_m >= 0.5
      ? "#DC2626"
      : impact.potential_depth_m >= 0.3
        ? "#EA580C"
        : impact.potential_depth_m >= 0.1
          ? "#CA8A04"
          : "#16A34A";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", delay: 300, duration: 500 }}
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
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#EA580C20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="warning" size={20} color="#EA580C" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
            }}
          >
            Đánh Giá Tác Động
          </Text>
        </View>

        {/* Depth + Description */}
        <View
          style={{
            backgroundColor: `${depthColor}12`,
            borderRadius: 16,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: depthColor,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="water"
              size={20}
              color={depthColor}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              }}
            >
              Độ sâu ngập dự kiến
            </Text>
          </View>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "900",
              color: depthColor,
              marginBottom: 4,
            }}
          >
            {impact.potential_depth_m.toFixed(2)}
            <Text style={{ fontSize: 18 }}> m</Text>
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isDarkColorScheme ? "#CBD5E1" : "#475569",
              lineHeight: 22,
            }}
          >
            {impact.depth_impact_description}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {/* Evacuation Badge */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: impact.evacuation_needed
                ? isDarkColorScheme ? "rgba(220, 38, 38, 0.15)" : "#FEF2F2"
                : isDarkColorScheme ? "rgba(22, 163, 74, 0.15)" : "#F0FDF4",
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Ionicons
              name={impact.evacuation_needed ? "exit" : "shield-checkmark"}
              size={22}
              color={impact.evacuation_needed ? "#DC2626" : "#16A34A"}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: impact.evacuation_needed ? "#DC2626" : "#16A34A",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {impact.evacuation_needed ? "Cần Di Tản" : "Không Cần Di Tản"}
            </Text>
          </View>

          {/* Affected Population */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="people"
              size={22}
              color="#3B82F6"
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginTop: 4,
              }}
            >
              {impact.estimated_affected_population.toLocaleString()}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
                textAlign: "center",
              }}
            >
              Dân số ảnh hưởng
            </Text>
          </View>

          {/* Transportation */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Ionicons name="car" size={22} color="#8B5CF6" />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {typeof impact.transportation_impact === "string"
                ? impact.transportation_impact
                : impact.transportation_impact?.status || "N/A"}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              }}
            >
              Giao thông
            </Text>
          </View>

          {/* Structures */}
          <View
            style={{
              flex: 1,
              minWidth: "45%",
              backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Ionicons name="home" size={22} color="#F59E0B" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
                marginTop: 4,
              }}
            >
              {impact.affected_structures_estimate}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: isDarkColorScheme ? "#94A3B8" : "#64748B",
              }}
            >
              Công trình bị ảnh hưởng
            </Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
