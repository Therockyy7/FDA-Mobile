// features/areas/components/EmptyAreasState.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

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
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          borderWidth: 4,
          borderColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <MaterialIcons name="location-off" size={56} color="#9CA3AF" />
      </View>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: "#111827",
          marginBottom: 12,
          letterSpacing: -0.5,
        }}
      >
        Chưa có khu vực nào
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: "#6B7280",
          textAlign: "center",
          marginBottom: 32,
          paddingHorizontal: 40,
          lineHeight: 22,
          fontWeight: "500",
        }}
      >
        Thêm địa điểm quan trọng để theo dõi{"\n"}tình hình lũ lụt theo thời
        gian thực
      </Text>

      <TouchableOpacity
        onPress={onAddPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: "#3B82F6",
          paddingHorizontal: 28,
          paddingVertical: 16,
          borderRadius: 16,
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "white",
            letterSpacing: 0.3,
          }}
        >
          Thêm khu vực đầu tiên
        </Text>
      </TouchableOpacity>
    </View>
  );
}
