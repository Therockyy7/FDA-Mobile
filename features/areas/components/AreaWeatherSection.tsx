
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface Props {
  rainfall24h: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

export function AreaWeatherSection({
  rainfall24h,
  temperature,
  humidity,
  windSpeed,
}: Props) {
  return (
    <View className="px-4 mt-6">
      <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">
        Thông tin thời tiết
      </Text>
      <View className="flex-row gap-3">
        {[
          {
            icon: "rainy",
            label: "Lượng mưa 24h",
            value: `${rainfall24h}mm`,
            color: "#3B82F6",
            bg: "#EFF6FF",
          },
          {
            icon: "thermometer",
            label: "Nhiệt độ",
            value: `${temperature}°C`,
            color: "#F59E0B",
            bg: "#FEF3C7",
          },
        ].map((stat, index) => (
          <View
            key={index}
            className="flex-1 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
            style={{ backgroundColor: stat.bg }}
          >
            <Ionicons name={stat.icon as any} size={28} color={stat.color} />
            <Text
              className="text-xs font-medium mt-3 mb-1"
              style={{ color: stat.color }}
            >
              {stat.label}
            </Text>
            <Text className="text-2xl font-black" style={{ color: stat.color }}>
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row gap-3 mt-3">
        {[
          {
            icon: "water",
            label: "Độ ẩm",
            value: `${humidity}%`,
            color: "#06B6D4",
          },
          {
            icon: "speedometer",
            label: "Tốc độ gió",
            value: `${windSpeed}km/h`,
            color: "#8B5CF6",
          },
        ].map((stat, index) => (
          <View
            key={index}
            className="flex-1 rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
          >
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium mt-2 mb-1">
              {stat.label}
            </Text>
            <Text className="text-slate-900 dark:text-white text-xl font-bold">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
