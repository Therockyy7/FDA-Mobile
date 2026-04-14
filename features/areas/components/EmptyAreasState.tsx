// features/areas/components/EmptyAreasState.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";

interface EmptyAreasStateProps {
  onAddPress: () => void;
}

export function EmptyAreasState({ onAddPress }: EmptyAreasStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
      }}
      testID="empty-areas-state"
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          borderWidth: 4,
          borderColor: "white",
          ...SHADOW.lg,
        }}
        className="bg-slate-100 dark:bg-slate-700"
        testID="empty-areas-state-icon"
      >
        <MaterialIcons name="location-off" size={56} className="text-slate-400 dark:text-slate-500" />
      </View>

      <Text
        className="text-slate-900 dark:text-slate-100 font-black mb-3 tracking-tight text-center"
        style={{ fontSize: 22 }}
        testID="empty-areas-state-title"
      >
        Chưa có khu vực nào
      </Text>

      <Text
        className="text-slate-500 dark:text-slate-400 text-center font-medium"
        style={{ fontSize: 15, paddingHorizontal: 40, lineHeight: 22 }}
        testID="empty-areas-state-description"
      >
        Thêm địa điểm quan trọng để theo dõi{"\n"}tình hình lũ lụt theo thời gian thực
      </Text>

      <TouchableOpacity
        onPress={onAddPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 28,
          paddingVertical: 16,
          borderRadius: 16,
          marginTop: 32,
          ...SHADOW.lg,
        }}
        className="bg-blue-600 dark:bg-blue-600"
        activeOpacity={0.8}
        testID="empty-areas-state-add-button"
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text
          className="text-white font-bold tracking-wide"
          style={{ fontSize: 16 }}
        >
          Thêm khu vực đầu tiên
        </Text>
      </TouchableOpacity>
    </View>
  );
}
