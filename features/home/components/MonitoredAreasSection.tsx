// features/home/components/MonitoredAreasSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Area } from "~/features/areas/types/areas-types";
import { MonitoredAreaCard } from "./MonitoredAreaCard";
import { MonitoredArea } from "../types/home-types";

interface MonitoredAreasSectionProps {
  areas: MonitoredArea[];
  onAddArea?: () => void;
}

export function MonitoredAreasSection({
  areas,
  onAddArea,
}: MonitoredAreasSectionProps) {
  const router = useRouter();

  return (
    <View className="px-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-slate-900 dark:text-white text-lg font-bold">
          Khu vực đang theo dõi
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/areas" as any)}
          activeOpacity={0.7}
        >
          <Text className="text-sky-600 dark:text-sky-400 text-sm font-medium">
            Xem tất cả →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Area Cards */}
      <View className="gap-3">
        {areas.map((area) => (
          <MonitoredAreaCard key={area.id} area={area} />
        ))}
      </View>

      {/* Add New Area Button */}
      <TouchableOpacity
        onPress={() => router.push("/community" as any)}
        activeOpacity={0.7}
        className="mt-4"
      >
        <View className="rounded-2xl bg-sky-50 dark:bg-sky-900/40 px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {/* Avatar nhỏ + icon camera kiểu Facebook */}
            <View className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
              <Ionicons name="person-circle-outline" size={26} color="#0EA5E9" />
            </View>
            <View>
              <Text className="text-slate-900 dark:text-white text-sm font-semibold">
                Chia sẻ tình hình lũ lụt
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                Đăng ảnh, cập nhật để cảnh báo mọi người
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="camera-outline" size={20} color="#0EA5E9" />
            <Ionicons name="create-outline" size={20} color="#0EA5E9" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
