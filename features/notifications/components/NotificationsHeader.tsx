import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface NotificationsHeaderProps {
  unreadCount: number;
  onFilterPress?: () => void;
}

export function NotificationsHeader({
  unreadCount,
  onFilterPress,
}: NotificationsHeaderProps) {
  return (
    <View
      testID="notifications-header-container"
      style={{
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 54,
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}
      className="bg-white dark:bg-[#0B1A33] border-b border-slate-200 dark:border-slate-800"
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
              testID="notifications-header-icon-box"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
              className="bg-blue-50 dark:bg-blue-900"
            >
              <Ionicons name="notifications" size={20} color="#007AFF" />
            </View>
            <Text
              testID="notifications-header-title"
              style={{ fontSize: 20, fontWeight: "800" }}
              className="text-slate-900 dark:text-slate-100"
            >
              Thông báo
            </Text>
          </View>
          {unreadCount > 0 && (
            <Text
              testID="notifications-header-unread-count"
              style={{ fontSize: 12, fontWeight: "600", marginTop: 4, marginLeft: 46 }}
              className="text-slate-500 dark:text-slate-400"
            >
              {unreadCount} thông báo chưa đọc
            </Text>
          )}
        </View>

        <TouchableOpacity
          testID="notifications-header-filter-button"
          onPress={onFilterPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
          className="bg-slate-100 dark:bg-slate-800"
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={20} className="text-slate-900 dark:text-slate-100" color="currentColor" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
