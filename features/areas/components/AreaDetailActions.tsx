
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface Props {
  onShowMap: () => void;
  onDelete: () => void;
}

export function AreaDetailActions({ onShowMap, onDelete }: Props) {
  return (
    <View className="px-4 mt-6 gap-3">
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-blue-500 active:bg-blue-600"
        activeOpacity={0.8}
        onPress={onShowMap}
      >
        <Ionicons name="map" size={20} color="white" />
        <Text className="text-white text-base font-bold">
          Xem trên bản đồ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        className="flex-row items-center justify-center gap-2 py-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 active:bg-red-100"
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <Text className="text-red-500 text-base font-bold">
          Xóa khu vực
        </Text>
      </TouchableOpacity>
    </View>
  );
}
