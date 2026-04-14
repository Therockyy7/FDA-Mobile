import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import { getRiskConfigByLevel } from "../types/prediction.types";
import { getRiskGradient } from "../lib/districts-forecast-helpers";
import { useLocalForecast } from "../hooks/useLocalForecast";

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────

function DistrictsForecastSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View className="px-4 py-1 pb-6" testID="prediction-forecast-districts-skeleton">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Animated.View className="w-1 h-4 rounded-sm bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
          <View>
            <Animated.View className="w-36 h-3.5 rounded-md bg-slate-200 dark:bg-slate-700 mb-1" style={{ opacity: pulseAnim }} />
            <Animated.View className="w-24 h-2.5 rounded bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
          </View>
        </View>
        <Animated.View className="w-14 h-7 rounded-2xl bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
      </View>
      <Animated.View className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 mb-2.5" style={{ opacity: pulseAnim }} />
      <View className="flex-row gap-2 mb-2.5">
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} className="flex-1 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
        ))}
      </View>
      <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
        <Animated.View className="w-28 h-2.5 rounded bg-slate-200 dark:bg-slate-700 mb-2.5" style={{ opacity: pulseAnim }} />
        {[1, 2].map((i) => (
          <View key={i} className="flex-row items-center justify-between py-2">
            <Animated.View className="w-8 h-2.5 rounded bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
            <Animated.View className="w-20 h-2 rounded bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
            <Animated.View className="w-9 h-5 rounded-lg bg-slate-200 dark:bg-slate-700" style={{ opacity: pulseAnim }} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function DistrictsForecastCard() {
  const router = useRouter();
  const { loadState, data, errorMsg, refetch } = useLocalForecast();

  const isLoading = loadState !== "done" && loadState !== "error";
  if (isLoading) return <DistrictsForecastSkeleton />;

  if (loadState === "error" || !data) {
    return (
      <View className="px-4 pb-6" testID="prediction-forecast-districts-error">
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 items-center border border-dashed border-slate-200 dark:border-slate-700 gap-2"
        >
          <MaterialCommunityIcons name="reload" size={22} color="#64748B" />
          <Text className="text-[13px] text-slate-500 dark:text-slate-400 text-center">
            {errorMsg ?? "Không thể tải dự báo"}
          </Text>
          <Text className="text-[11px] text-indigo-500 font-bold">Chạm để thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { areaId, areaName, locationLabel, prediction } = data;
  const ai = prediction.forecast?.aiPrediction;
  const riskLevel = ai?.riskLevel ?? prediction.status ?? "Thấp";
  const probability = Math.round((ai?.ensembleProbability ?? 0) * 100);
  const riskCfg = getRiskConfigByLevel(riskLevel);
  const gradient = getRiskGradient(riskLevel);
  const windows = prediction.forecast?.windows?.slice(0, 3) ?? [];

  const precipNow = ai?.components?.weather?.precipitation_3h_mm ?? 0;
  const humidity = ai?.components?.weather?.avg_humidity_pct ?? 0;
  const soilSaturation = ai?.components?.saturation?.saturation_level ?? 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      className="px-4 py-1 pb-6"
      testID="prediction-forecast-districts-card"
    >
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-1 h-9 rounded-sm bg-indigo-500" />
          <View>
            <Text className="text-[15px] font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Dự Báo Vị Trí Của Bạn
            </Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="location" size={10} color="#6366F1" />
              <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-medium" numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => refetch(true)}
          activeOpacity={0.6}
          className="flex-row items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl"
          testID="prediction-forecast-districts-refresh"
        >
          <Ionicons name="sync" size={12} color="#64748B" />
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Cập nhật</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Risk Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/prediction/${areaId}` as any)}
        className="mb-2.5"
        style={{ ...SHADOW.lg, shadowColor: riskCfg.color }}
        testID="prediction-forecast-districts-hero"
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 18 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-[10px] font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.7)" }}>
                NGUY CƠ NGẬP LỤT
              </Text>
              <Text className="text-[22px] font-black tracking-tight mt-0.5 text-white">{areaName}</Text>
            </View>
            <View className="bg-white/20 px-3 py-1.5 rounded-2xl">
              <Text className="text-white text-[13px] font-black">{prediction.status ?? riskLevel}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3.5">
            <View
              className="w-[70px] h-[70px] rounded-full items-center justify-center"
              style={{ borderWidth: 3, borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Text className="text-[22px] font-black tracking-tight text-white">{probability}%</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs leading-[18px]" style={{ color: "rgba(255,255,255,0.85)" }} numberOfLines={3}>
                {prediction.aiConsultant?.finalSummary
                  ? prediction.aiConsultant.finalSummary.slice(0, 100) + "..."
                  : ai?.impact?.recommendation ?? "Theo dõi bản tin cập nhật để nắm bắt tình hình."}
              </Text>
              <View className="flex-row items-center gap-1 mt-1.5">
                <Text className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>Xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={10} color="rgba(255,255,255,0.6)" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Key Metrics Row */}
      <View className="flex-row gap-2 mb-2.5">
        <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-700 items-center gap-1" testID="prediction-forecast-districts-precip">
          <Ionicons name="rainy" size={18} color="#0EA5E9" />
          <Text className="text-[15px] font-black text-sky-500">{precipNow}<Text className="text-[9px]">mm</Text></Text>
          <Text className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Lượng mưa</Text>
        </View>
        <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-700 items-center gap-1" testID="prediction-forecast-districts-humidity">
          <MaterialCommunityIcons name="water-percent" size={18} color="#6366F1" />
          <Text className="text-[15px] font-black text-indigo-500">{humidity}<Text className="text-[9px]">%</Text></Text>
          <Text className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Độ ẩm</Text>
        </View>
        <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-700 items-center gap-1" testID="prediction-forecast-districts-soil">
          <MaterialCommunityIcons name="terrain" size={18} color="#F59E0B" />
          <Text className="text-[15px] font-black text-amber-500">{Math.round(soilSaturation * 100)}<Text className="text-[9px]">%</Text></Text>
          <Text className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Bão hòa đất</Text>
        </View>
      </View>

      {/* Forecast Timeline */}
      {windows.length > 0 && (
        <View
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          style={SHADOW.sm}
          testID="prediction-forecast-districts-timeline"
        >
          <View className="flex-row items-center gap-1.5 px-3.5 pt-2.5 pb-1.5">
            <Ionicons name="time-outline" size={12} color="#6366F1" />
            <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">DỰ BÁO THEO KHUNG GIỜ</Text>
          </View>
          {windows.map((w) => {
            const wCfg = getRiskConfigByLevel(w.status);
            const prob = Math.round(w.probability * 100);
            return (
              <View key={w.horizon} className="flex-row items-center px-3.5 py-2.5 border-t border-slate-200 dark:border-slate-700" testID={`prediction-forecast-districts-window-${w.horizon}`}>
                <Text className="w-9 text-xs font-black text-indigo-500">{w.horizon}</Text>
                <View className="flex-1 mx-2.5">
                  <View className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <View className="h-full rounded-full" style={{ width: `${Math.min(100, prob)}%`, backgroundColor: wCfg.color }} />
                  </View>
                </View>
                <View className="flex-row items-center gap-1.5 min-w-[80px] justify-end">
                  <Text className="text-sm font-black" style={{ color: wCfg.color }}>{prob}%</Text>
                  <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${wCfg.color}18` }}>
                    <Text className="text-[9px] font-bold" style={{ color: wCfg.color }}>{w.status}</Text>
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
