import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { AiPrediction } from "../types/prediction.types";

interface Props {
  aiPrediction: AiPrediction;
}

export function ImpactCard({ aiPrediction }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const bg = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text = isDarkColorScheme ? "#F1F5F9" : "#0F172A";
  const sub = isDarkColorScheme ? "#0F172A" : "#F8FAFC";

  const impact = aiPrediction.impact;
  const rec = impact.recommendation;

  // Pick color based on recommendation content
  const recColor = rec.includes("🟢")
    ? "#10B981"
    : rec.includes("🟡")
      ? "#F59E0B"
      : rec.includes("🟠")
        ? "#EA580C"
        : rec.includes("🔴")
          ? "#EF4444"
          : "#64748B";

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        padding: 16,
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
          marginBottom: 14,
          gap: 8,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isDarkColorScheme ? "#0F172A" : "#FFF7ED",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="flash-outline" size={16} color="#F97316" />
        </View>
        <Text style={{ fontSize: 13, fontWeight: "800", color: text }}>
          Đánh giá tác động
        </Text>
      </View>

      {/* Metrics row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: sub,
            borderRadius: 14,
            padding: 12,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "rgba(59,130,246,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="water" size={18} color="#3B82F6" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#3B82F6" }}>
            {impact.estimated_depth_m}m
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: muted,
              textAlign: "center",
              marginTop: 2,
            }}
          >
            Độ sâu ước tính
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: sub,
            borderRadius: 14,
            padding: 12,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "rgba(245,158,11,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="map-outline" size={18} color="#F59E0B" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#F59E0B" }}>
            {impact.estimated_area_affected}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: muted,
              textAlign: "center",
              marginTop: 2,
            }}
          >
            Diện tích ảnh hưởng
          </Text>
        </View>
      </View>
    </View>
  );
}
