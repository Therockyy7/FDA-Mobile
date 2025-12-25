
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface Props {
  sensorCount: number;
  affectedStreets: string[];
}

export function AreaSensorsAndStreets({
  sensorCount,
  affectedStreets,
}: Props) {
  return (
    <View className="px-4 mt-6">
      <View className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Sensors */}
        <TouchableOpacity
          className="flex-row items-center justify-between p-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
              <MaterialIcons name="sensors" size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-slate-900 dark:text-white text-base font-semibold">
                Cảm biến liên quan
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                {sensorCount} thiết bị đang hoạt động
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />

        {/* Streets */}
        <View className="p-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center">
              <MaterialIcons name="warning" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-slate-900 dark:text-white text-base font-semibold">
                Đường bị ảnh hưởng
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">
                {affectedStreets.length} tuyến đường
              </Text>
            </View>
          </View>
          <View className="gap-2 ml-13">
            {affectedStreets.map((street, index) => (
              <View key={index} className="flex-row items-center gap-2">
                <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <Text className="text-slate-600 dark:text-slate-400 text-sm">
                  {street}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
