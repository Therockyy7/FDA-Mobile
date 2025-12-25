
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface Props {
  statusText: string;
  statusColor: string;
  currentLevel: number;
  warningLevel: number;
  dangerLevel: number;
  lastUpdate: string;
  waterPercentage: number; // 0–100
}

export function AreaStatusCard({
  statusText,
  statusColor,
  currentLevel,
  warningLevel,
  dangerLevel,
  lastUpdate,
  waterPercentage,
}: Props) {
  return (
    <View className="px-4 mt-5">
      <LinearGradient
        colors={[statusColor, statusColor + "DD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-5 shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
              Tình trạng hiện tại
            </Text>
            <Text className="text-white text-2xl font-black">
              {statusText}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white/80 text-xs font-medium mb-1">
              Mực nước
            </Text>
            <Text className="text-white text-5xl font-black tracking-tighter">
              {currentLevel.toFixed(1)}
              <Text className="text-xl">m</Text>
            </Text>
          </View>
        </View>

        <View className="bg-white/20 rounded-full h-3 overflow-hidden mb-3">
          <View
            className="bg-white h-full rounded-full"
            style={{ width: `${Math.min(waterPercentage, 100)}%` }}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-yellow-300" />
            <Text className="text-white/80 text-xs">
              Cảnh báo: {warningLevel.toFixed(1)}m
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-red-300" />
            <Text className="text-white/80 text-xs">
              Nguy hiểm: {dangerLevel.toFixed(1)}m
            </Text>
          </View>
        </View>

        <Text className="text-white/60 text-xs mt-4">
          Cập nhật: {lastUpdate}
        </Text>
      </LinearGradient>
    </View>
  );
}
