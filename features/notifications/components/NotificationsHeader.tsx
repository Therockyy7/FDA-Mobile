
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface NotificationsHeaderProps {
  unreadCount: number;
  onFilterPress?: () => void;
}

export function NotificationsHeader({
  unreadCount,
  onFilterPress,
}: NotificationsHeaderProps) {
  const { isDarkColorScheme } = useColorScheme();

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#FFFFFF",
    border: isDarkColorScheme ? "#1E293B" : "#E5E7EB",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    buttonBg: isDarkColorScheme ? "#1E293B" : "#F3F4F6",
    buttonIcon: isDarkColorScheme ? "#E2E8F0" : "#1F2937",
  };

  return (
    <View
      style={{
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 54,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDarkColorScheme ? "#1E3A8A" : "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="notifications" size={20} color="#3B82F6" />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: colors.text,
              }}
            >
              Thông báo
            </Text>
          </View>
          {unreadCount > 0 && (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.subtext,
                marginTop: 4,
                marginLeft: 46,
              }}
            >
              {unreadCount} thông báo chưa đọc
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onFilterPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.buttonBg,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={20} color={colors.buttonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
