import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { getStatusConfig } from "../lib/home-utils";
import { Area } from "~/features/areas/types/areas-types";
import { cn } from "~/lib/utils";

interface MonitoredAreaCardProps {
  area: Area;
}

export function MonitoredAreaCard({ area }: MonitoredAreaCardProps) {
  const router = useRouter();
  const statusConfig = getStatusConfig(area.status);

 
  const ratio =
    area.maxLevel > 0
      ? Math.min((area.waterLevel / area.maxLevel) * 100, 100)
      : 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/area-detail/${area.id}` as any)}
      activeOpacity={0.7}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white text-base font-bold mb-1">
              {area.name}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs">
              Cập nhật {area.lastUpdate}
            </Text>
          </View>
          <View
            className={cn(
              "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
              statusConfig.bg,
            )}
          >
            <Ionicons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.iconColor}
            />
            <Text className={cn("text-xs font-semibold", statusConfig.text)}>
              {area.statusText}
            </Text>
          </View>
        </View>

        {/* Water Level Bar */}
        <View className="mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-slate-600 dark:text-slate-400 text-xs font-medium">
              Mực nước
            </Text>
            <Text className="text-slate-900 dark:text-white text-xs font-bold">
              {area.waterLevel}
              cm / {area.maxLevel}cm
            </Text>
          </View>
          <View className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <View
              className={cn(
                "h-full rounded-full",
                area.status === "danger" && "bg-red-500",
                area.status === "warning" && "bg-amber-500",
                area.status === "safe" && "bg-emerald-500",
                // area.status === "critical" && "bg-red-700",
              )}
              style={{
                width: `${ratio}%`,
              }}
            />
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="opacity" size={16} color="#64748B" />
            <Text className="text-slate-600 dark:text-slate-400 text-xs">
              {area.rainfall ?? "—"}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="sensors" size={16} color="#64748B" />
            <Text className="text-slate-600 dark:text-slate-400 text-xs">
              {(area.sensorCount ?? 0) + " cảm biến"}
            </Text>
          </View>
          {area.affectedStreets && area.affectedStreets.length > 0 && (
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons name="warning" size={16} color="#F59E0B" />
              <Text className="text-amber-600 dark:text-amber-400 text-xs font-medium">
                {area.affectedStreets.length} đường ngập
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
