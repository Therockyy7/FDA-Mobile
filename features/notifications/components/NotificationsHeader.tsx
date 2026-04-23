import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StatusBar, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useOfflineBannerPadding } from "~/components/OfflineBanner";
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
  const offlinePadding = useOfflineBannerPadding();

  // Theme colors synchronized with HomeHeader
  const colors = {
    background: isDarkColorScheme ? "#0B1A33" : "#FFFFFF",
    cardBg: isDarkColorScheme ? "#1E293B" : "#F8FAFC",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        paddingTop:
          (Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 12) + offlinePadding,
        paddingBottom: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Logo + Texts */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <LinearGradient
            colors={["#007AFF", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              shadowColor: "#007AFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Ionicons name="notifications" size={22} color="white" />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: unreadCount > 0 ? "#EF4444" : colors.subtext,
                  fontWeight: unreadCount > 0 ? "700" : "500",
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} thông báo mới`
                  : `Cập nhật hệ thống`}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.5,
              }}
            >
              Thông báo
            </Text>
          </View>
        </View>

        {/* Right: Actions */}
        {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={onFilterPress}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: colors.cardBg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={20} color={colors.subtext} />
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
}
