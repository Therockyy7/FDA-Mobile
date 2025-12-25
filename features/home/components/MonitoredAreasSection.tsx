// features/home/components/MonitoredAreasSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Area } from "~/features/areas/types/areas-types";
import { MonitoredAreaCard } from "./MonitoredAreaCard";

interface MonitoredAreasSectionProps {
  areas: Area[];
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
        onPress={onAddArea || (() => router.push("/my-areas/add" as any))}
        activeOpacity={0.7}
        className="mt-3"
      >
        <View className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 items-center">
          <View className="flex-row items-center gap-2">
            <Ionicons name="add-circle-outline" size={22} color="#0EA5E9" />
            <Text className="text-sky-600 dark:text-sky-400 text-sm font-semibold">
              Thêm khu vực mới
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
