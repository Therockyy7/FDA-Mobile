
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { CityStats } from "../types/home-types";

interface CityOverviewStatsProps {
  stats: CityStats;
}

export function CityOverviewStats({ stats }: CityOverviewStatsProps) {
  const router = useRouter();

  return (
    <View className="px-4 mt-6 mb-4">
      <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">
        Tổng quan {stats.cityName}
      </Text>

      <LinearGradient
        colors={["#0EA5E9", "#0284C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-xl p-4"
        style={{
          shadowColor: "#0EA5E9",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
          borderRadius: 20,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <MaterialIcons name="location-city" size={22} color="white" />
            </View>
            <View>
              <Text className="text-white text-base font-bold">
                Tình trạng hiện tại
              </Text>
              <Text className="text-white/80 text-xs">
                {stats.lastUpdated}
              </Text>
            </View>
          </View>
          <View className="bg-amber-500 rounded-full px-3 py-1.5">
            <Text className="text-white text-xs font-bold">
              {stats.statusText}
            </Text>
          </View>
        </View>

        {/* Main Stats */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-white/15 rounded-lg p-3">
            <Text className="text-white/70 text-xs mb-1">Khu vực ngập</Text>
            <Text className="text-white text-2xl font-bold">
              {stats.floodedAreas}
            </Text>
            <Text className="text-white/70 text-[10px] mt-0.5">
              / {stats.totalAreas} khu vực
            </Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-lg p-3">
            <Text className="text-white/70 text-xs mb-1">Cảm biến</Text>
            <Text className="text-white text-2xl font-bold">
              {stats.activeSensors}
            </Text>
            <Text className="text-white/70 text-[10px] mt-0.5">
              / {stats.totalSensors} hoạt động
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white/10 rounded-lg p-2.5">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MaterialIcons name="water-drop" size={14} color="white" />
              <Text className="text-white/80 text-[10px]">Mực nước TB</Text>
            </View>
            <Text className="text-white text-lg font-bold">
              {stats.averageWaterLevel}m
            </Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-lg p-2.5">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MaterialIcons name="grain" size={14} color="white" />
              <Text className="text-white/80 text-[10px]">Lượng mưa 24h</Text>
            </View>
            <Text className="text-white text-lg font-bold">
              {stats.rainfall24h}mm
            </Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-lg p-2.5">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MaterialIcons name="people" size={14} color="white" />
              <Text className="text-white/80 text-[10px]">
                Dân số ảnh hưởng
              </Text>
            </View>
            <Text className="text-white text-sm font-bold">
              {stats.affectedPopulation}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/map" as any)}
          className="mt-3 bg-white/20 rounded-lg p-3 flex-row items-center justify-center gap-2"
        >
          <MaterialIcons name="map" size={18} color="white" />
          <Text className="text-white text-sm font-semibold">
            Xem bản đồ chi tiết
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
