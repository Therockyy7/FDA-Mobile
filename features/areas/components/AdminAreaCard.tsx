import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { AdminArea } from "~/features/areas/types/admin-area.types";
import { useColorScheme } from "~/lib/useColorScheme";

interface AdminAreaCardProps {
  area: AdminArea;
  onPress: () => void;
}

export function AdminAreaCard({ area, onPress }: AdminAreaCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBorder: isDarkColorScheme ? "#334155" : "#E2E8F0",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    iconBg: isDarkColorScheme ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
    iconColor: "#3B82F6",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: colors.iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <MaterialCommunityIcons
          name="city-variant-outline"
          size={24}
          color={colors.iconColor}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          {area.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 13,
              color: colors.subtext,
              backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {area.level === "city"
              ? "Thành phố"
              : area.level === "district"
                ? "Quận/Huyện"
                : "Phường/Xã"}
          </Text>
        </View>
      </View>

      <View>
        <LinearGradient
          colors={["#3B82F6", "#2563EB"]}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="analytics" size={18} color="white" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}
