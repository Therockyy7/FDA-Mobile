import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StatusBar,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Text } from "~/components/ui/text";

interface Props {
  statusColor: string;
  name: string;
  district: string;
  description?: string;
  onBack: () => void;
  containerStyle?: ViewStyle;
}

export function AreaDetailHeader({
  statusColor,
  name,
  district,
  description,
  onBack,
  containerStyle,
}: Props) {
  return (
    <LinearGradient
      colors={[statusColor, statusColor + "CC"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        {
          paddingTop:
            Platform.OS === "ios" ? 50 : (StatusBar.currentHeight ?? 0) + 10,
          paddingBottom: 20,
          paddingHorizontal: 16,
        },
        containerStyle,
      ]}
    >
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold flex-1 text-center">
          Chi tiết khu vực
        </Text>

        <View className="w-10 h-10" />
      </View>

      <View>
        <Text className="text-white text-3xl font-black mb-2">{name}</Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
          <Text className="text-white/80 text-sm font-medium flex-1">
            {district}
          </Text>
        </View>
        {description && (
          <Text className="text-white/75 text-xs mt-2">{description}</Text>
        )}
      </View>
    </LinearGradient>
  );
}
