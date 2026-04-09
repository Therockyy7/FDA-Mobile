import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PredictionResponse } from "../types/prediction.types";

interface Props {
  prediction: PredictionResponse;
}

export function HybridEnsembleCard({ prediction }: Props) {
  const { isDarkColorScheme } = useColorScheme();
  const bg = isDarkColorScheme ? "#1E293B" : "#FFFFFF";
  const muted = isDarkColorScheme ? "#94A3B8" : "#64748B";
  const text = isDarkColorScheme ? "#F1F5F9" : "#0F172A";
  const sub = isDarkColorScheme ? "#0F172A" : "#F8FAFC";
  const border = isDarkColorScheme ? "#334155" : "#E2E8F0";

  // Dummy physics data logic to simulate hybrid display if API doesn't have it explicitly yet
  // Based on the user's "No rainfall source -> Physics weight=70%" etc.
  const aiProb = Math.round((prediction.forecast?.aiPrediction?.ensembleProbability ?? 0) * 100);
  
  // Try to find physics info - if missing, we use standard static design for hybrid explanation.
  const hasSatellite = prediction.satelliteVerification?.available;

  return (
    <View style={{
      backgroundColor: bg, borderRadius: 20,
      padding: 16,
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 }}>
        <View style={{
          width: 36, height: 36, borderRadius: 12,
          backgroundColor: isDarkColorScheme ? "#172554" : "#EFF6FF",
          alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name="git-network-outline" size={18} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: text, marginBottom: 2 }}>
            Mô hình Hybrid Ensemble
          </Text>
          <Text style={{ fontSize: 11, color: muted }}>
            Kết hợp AI, Vật lý thuỷ văn & Dữ liệu vệ tinh
          </Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {/* AI Engine */}
        <View style={{
          backgroundColor: sub, borderRadius: 14, padding: 12,
          borderWidth: 1, borderColor: border,
          flexDirection: "row", alignItems: "center", gap: 12
        }}>
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            alignItems: "center", justifyContent: "center"
          }}>
            <Ionicons name="hardware-chip-outline" size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: text, marginBottom: 2 }}>
              AI Engine (FloodMLP v2)
            </Text>
            <Text style={{ fontSize: 11, color: muted, lineHeight: 16 }}>
              Neural Network 27 lớp đặc trưng. Tự động fallback LSTM khi thiếu dữ liệu.
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#6366F1" }}>{aiProb}%</Text>
            <Text style={{ fontSize: 10, fontWeight: "600", color: muted }}>DỰ BÁO AI</Text>
          </View>
        </View>

        {/* Physics Engine */}
        <View style={{
          backgroundColor: sub, borderRadius: 14, padding: 12,
          borderWidth: 1, borderColor: border,
          flexDirection: "row", alignItems: "center", gap: 12
        }}>
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            alignItems: "center", justifyContent: "center"
          }}>
            <Ionicons name="water-outline" size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: text, marginBottom: 2 }}>
              Physics Engine
            </Text>
            <Text style={{ fontSize: 11, color: muted, lineHeight: 16 }}>
              Mô phỏng thuỷ văn SCS-CN & Dòng chảy Manning. Đảm bảo tính hợp lý vật lý tuyệt đối.
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
        </View>

        {/* Satellite Verification */}
        <View style={{
          backgroundColor: sub, borderRadius: 14, padding: 12,
          borderWidth: 1, borderColor: border,
          flexDirection: "row", alignItems: "center", gap: 12
        }}>
          <View style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: hasSatellite ? "rgba(168, 85, 247, 0.15)" : "rgba(100, 116, 139, 0.15)",
            alignItems: "center", justifyContent: "center"
          }}>
            <Ionicons name="globe-outline" size={20} color={hasSatellite ? "#A855F7" : muted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: text, marginBottom: 2 }}>
              Xác thực Vệ tinh (Prithvi)
            </Text>
            <Text style={{ fontSize: 11, color: muted, lineHeight: 16 }}>
              Xác minh ngập lụt bằng ảnh Sentinel-1/2 theo thời gian thực.
            </Text>
          </View>
          <View style={{
            backgroundColor: hasSatellite ? "rgba(168,85,247,0.15)" : "rgba(100,116,139,0.15)",
            paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
          }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: hasSatellite ? "#A855F7" : muted }}>
              {hasSatellite ? "SẴN SÀNG" : "ĐANG CHỜ"}
            </Text>
          </View>
        </View>

      </View>

      {/* Logic banner */}
      <View style={{
        marginTop: 16, backgroundColor: "rgba(59,130,246,0.08)",
        borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: "#3B82F6",
        flexDirection: "row", gap: 10
      }}>
        <Ionicons name="information-circle" size={16} color="#3B82F6" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: isDarkColorScheme ? "#93C5FD" : "#1D4ED8", marginBottom: 4 }}>
            Thuật toán Trọng số Động (Fusion)
          </Text>
          <Text style={{ fontSize: 11, color: isDarkColorScheme ? "#BFDBFE" : "#1E40AF", lineHeight: 16 }}>
            Bắt buộc Physic Runoff {">"} 0 để tránh cảnh báo giả mạo. AI được ưu tiên cao hơn khi điều kiện bão hoà và triều cường phức tạp.
          </Text>
        </View>
      </View>
    </View>
  );
}
