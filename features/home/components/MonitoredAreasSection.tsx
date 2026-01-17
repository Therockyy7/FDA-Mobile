// features/home/components/MonitoredAreasSection.tsx
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { MonitoredArea } from "../types/home-types";
import { MonitoredAreaCard } from "./MonitoredAreaCard";

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
    </View>
  );
}
