import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import { PredictionResponse } from "../types/prediction.types";

interface Props {
  prediction: PredictionResponse;
}

export function HybridEnsembleCard({ prediction }: Props) {
  const aiProb = Math.round((prediction.forecast?.aiPrediction?.ensembleProbability ?? 0) * 100);
  const hasSatellite = prediction.satelliteVerification?.available;

  return (
    <View
      testID="prediction-hybrid-card"
      className="bg-white dark:bg-slate-800 rounded-2xl p-4"
      style={SHADOW.md}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 }}>
        <View className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 items-center justify-center">
          <Ionicons name="git-network-outline" size={18} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            testID="prediction-hybrid-title"
            className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-0.5"
          >
            Mô hình Hybrid Ensemble
          </Text>
          <Text
            testID="prediction-hybrid-subtitle"
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            Kết hợp AI, Vật lý thuỷ văn & Dữ liệu vệ tinh
          </Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {/* AI Engine */}
        <View
          testID="prediction-hybrid-ai-engine"
          className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 flex-row items-center gap-3"
        >
          <View className="w-10 h-10 rounded-xl bg-indigo-500/15 items-center justify-center">
            <Ionicons name="hardware-chip-outline" size={20} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-0.5">
              AI Engine (FloodMLP v2)
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4">
              Neural Network 27 lớp đặc trưng. Tự động fallback LSTM khi thiếu dữ liệu.
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              testID="prediction-hybrid-ai-prob"
              className="text-indigo-600 dark:text-indigo-400"
              style={{ fontSize: 16, fontWeight: "900" }}
            >
              {aiProb}%
            </Text>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              DỰ BÁO AI
            </Text>
          </View>
        </View>

        {/* Physics Engine */}
        <View
          testID="prediction-hybrid-physics-engine"
          className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 flex-row items-center gap-3"
        >
          <View className="w-10 h-10 rounded-xl bg-emerald-500/15 items-center justify-center">
            <Ionicons name="water-outline" size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-0.5">
              Physics Engine
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4">
              Mô phỏng thuỷ văn SCS-CN & Dòng chảy Manning. Đảm bảo tính hợp lý vật lý tuyệt đối.
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
        </View>

        {/* Satellite Verification */}
        <View
          testID="prediction-hybrid-satellite"
          className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 flex-row items-center gap-3"
        >
          <View
            className={hasSatellite ? "bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-xl items-center justify-center" : "bg-slate-100 dark:bg-slate-700 w-10 h-10 rounded-xl items-center justify-center"}
          >
            <Ionicons
              name="globe-outline"
              size={20}
              color={hasSatellite ? "#A855F7" : "#64748B"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-0.5">
              Xác thực Vệ tinh (Prithvi)
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4">
              Xác minh ngập lụt bằng ảnh Sentinel-1/2 theo thời gian thực.
            </Text>
          </View>
          <View
            className={hasSatellite ? "bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg" : "bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg"}
          >
            <Text
              testID="prediction-hybrid-satellite-status"
              className={hasSatellite ? "text-xs font-bold text-purple-600 dark:text-purple-400" : "text-xs font-bold text-slate-500 dark:text-slate-400"}
            >
              {hasSatellite ? "SẴN SÀNG" : "ĐANG CHỜ"}
            </Text>
          </View>
        </View>
      </View>

      {/* Logic banner */}
      <View
        testID="prediction-hybrid-logic"
        className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border-l-[3px] border-blue-500 flex-row gap-2.5"
      >
        <Ionicons name="information-circle" size={16} color="#3B82F6" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
            Thuật toán Trọng số Động (Fusion)
          </Text>
          <Text className="text-xs text-blue-600 dark:text-blue-400 leading-4">
            Bắt buộc Physic Runoff {">"} 0 để tránh cảnh báo giả mạo. AI được ưu tiên cao hơn khi điều kiện bão hoà và triều cường phức tạp.
          </Text>
        </View>
      </View>
    </View>
  );
}
