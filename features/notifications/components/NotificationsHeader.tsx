
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
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
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
            <Ionicons name="notifications" size={24} color="#3B82F6" />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#1F2937",
                marginLeft: 8,
              }}
            >
              Thông báo
            </Text>
          </View>
          {unreadCount > 0 && (
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#6B7280",
                marginTop: 4,
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
            borderRadius: 20,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
