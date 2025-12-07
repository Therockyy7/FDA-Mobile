
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface EmptyNotificationsStateProps {
  onRefresh: () => void;
}

export function EmptyNotificationsState({
  onRefresh,
}: EmptyNotificationsStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#ECFDF5",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Ionicons name="shield-checkmark" size={48} color="#10B981" />
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#1F2937",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Khu vực của bạn an toàn
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: "#6B7280",
          textAlign: "center",
          paddingHorizontal: 40,
          lineHeight: 20,
        }}
      >
        Hiện tại không có cảnh báo nào. Chúng tôi sẽ thông báo cho bạn khi có
        thông tin mới.
      </Text>
      <TouchableOpacity
        onPress={onRefresh}
        style={{
          marginTop: 24,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: "#F3F4F6",
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#1F2937",
          }}
        >
          Tải lại
        </Text>
      </TouchableOpacity>
    </View>
  );
}
