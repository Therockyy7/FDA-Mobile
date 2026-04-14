// features/map/components/controls/layers/LayerSheetHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

interface LayerSheetHeaderProps {
  onClose: () => void;
}

export function LayerSheetHeader({ onClose }: LayerSheetHeaderProps) {
  return (
    <View className="px-5 py-4">
      <View className="flex-row items-center justify-between border-b border-border">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
            <MaterialIcons name="layers" size={22} color="#007AFF" />
          </View>
          <View>
            <Text className="text-lg font-bold text-foreground" testID="map-layer-header-title">
              Lớp bản đồ
            </Text>
            <Text className="text-xs text-muted-foreground">
              Tùy chỉnh hiển thị
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="w-9 h-9 rounded-full bg-muted items-center justify-center"
          testID="map-layer-sheet-close-btn"
        >
          <Ionicons name="close" size={20} className="text-muted-foreground" color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
