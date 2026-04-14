import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import { AdminArea } from "~/features/areas/types/admin-area.types";

// Design token for accent color
const ACCENT_COLOR = "#007AFF";
const ACCENT_GRADIENT = ["#007AFF", "#2563EB"] as const;

interface AdminAreaCardProps {
  area: AdminArea;
  onPress: () => void;
}

export function AdminAreaCard({ area, onPress }: AdminAreaCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
        ...SHADOW.sm,
      }}
      className="bg-white dark:bg-slate-800 border-border-light dark:border-border-dark"
      testID="admin-area-card"
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
        className="bg-blue-50 dark:bg-blue-500/10"
      >
        <MaterialCommunityIcons
          name="city-variant-outline"
          size={24}
          color={ACCENT_COLOR}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          className="text-slate-900 dark:text-slate-100 font-bold mb-1"
          style={{ fontSize: 16 }}
          testID="admin-area-card-name"
        >
          {area.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
            <Text
              className="text-slate-600 dark:text-slate-400 font-semibold"
              style={{ fontSize: 13 }}
              testID="admin-area-card-level"
            >
            {area.level === "city"
              ? "Thành phố"
              : area.level === "district"
                ? "Quận/Huyện"
                : "Phường/Xã"}
            </Text>
          </View>
        </View>
      </View>

      <View>
        <LinearGradient
          colors={ACCENT_GRADIENT}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
          testID="admin-area-card-icon"
        >
          <Ionicons name="analytics" size={18} color="white" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}
