import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { PredictionResponse } from "../types/prediction.types";

const STATUS_CONFIG: Record<string, {
  gradient: readonly [string, string, ...string[]];
  accent: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  Normal:   { gradient: ["#059669", "#10B981"], accent: "#A7F3D0", label: "Bình thường",   icon: "shield-checkmark" },
  Moderate: { gradient: ["#D97706", "#F59E0B"], accent: "#FDE68A", label: "Cảnh báo vừa", icon: "warning" },
  High:     { gradient: ["#DC2626", "#EF4444"], accent: "#FCA5A5", label: "Nguy hiểm cao", icon: "alert-circle" },
  Severe:   { gradient: ["#7C3AED", "#A78BFA"], accent: "#DDD6FE", label: "Rất nguy hiểm", icon: "flash" },
};

interface Props {
  prediction: PredictionResponse;
}

export function PredictionHeroHeader({ prediction }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cfg = STATUS_CONFIG[prediction.status] ?? STATUS_CONFIG.Normal;
  const prob = Math.round((prediction.forecast.aiPrediction.ensembleProbability ?? 0) * 100);
  const conf = Math.round((prediction.forecast.aiPrediction.confidence ?? 0) * 100);

  return (
    <LinearGradient
      colors={cfg.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
        paddingBottom: 36,
        marginBottom: -20,
      }}
    >
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          padding: 8,
          marginBottom: 16,
          borderRadius: 20,
          backgroundColor: "rgba(0,0,0,0.2)",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Quay lại</Text>
      </TouchableOpacity>

      {/* Area name + status icon */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 }}>
        <View style={{
          width: 48, height: 48, borderRadius: 16,
          backgroundColor: "rgba(0,0,0,0.2)",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name={cfg.icon} size={26} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 }}>
            {prediction.administrativeArea.level === "ward" ? "Phường / Xã" : "Khu vực"}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff", lineHeight: 28 }}>
            {prediction.administrativeArea.name}
          </Text>
        </View>
        {/* Status pill */}
        <View style={{
          backgroundColor: "rgba(0,0,0,0.25)",
          paddingHorizontal: 12, paddingVertical: 6,
          borderRadius: 20,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
        }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#fff" }}>{cfg.label}</Text>
        </View>
      </View>

      {/* Big probability ring + quick stats */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        {/* Probability circle */}
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: "rgba(0,0,0,0.25)",
          borderWidth: 3, borderColor: "rgba(255,255,255,0.5)",
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>{prob}%</Text>
          <Text style={{ fontSize: 9, fontWeight: "600", color: "rgba(255,255,255,0.75)", letterSpacing: 0.5 }}>RỦI RO</Text>
        </View>

        {/* Quick stats */}
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <StatChip icon="analytics-outline" label="Độ tin cậy" value={`${conf}%`} />
            <StatChip icon="layers-outline" label="Mức độ" value={`Cấp ${prediction.severityLevel}`} />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <StatChip icon="water-outline" label="Trạm" value={`${prediction.contributingStations.length} trạm`} />
            <StatChip icon="people-outline" label="Báo cáo" value={`${prediction.communityReports.length} cộng đồng`} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

function StatChip({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: 10, padding: 8,
      flexDirection: "row", alignItems: "center", gap: 6,
    }}>
      <Ionicons name={icon} size={13} color="rgba(255,255,255,0.8)" />
      <View>
        <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontWeight: "600", letterSpacing: 0.3 }}>{label}</Text>
        <Text style={{ fontSize: 12, color: "#fff", fontWeight: "800" }}>{value}</Text>
      </View>
    </View>
  );
}
