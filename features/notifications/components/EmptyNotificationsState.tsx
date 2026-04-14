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
  const handleRefresh = React.useCallback(() => {
    try {
      onRefresh?.();
    } catch (error) {
      console.error("Refresh error:", error);
    }
  }, [onRefresh]);

  return (
    <View
      testID="notifications-empty-container"
      className="flex-1 items-center justify-center py-20"
    >
      <View
        testID="notifications-empty-icon-wrapper"
        className="w-24 h-24 rounded-full items-center justify-center mb-5"
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.2)",
        }}
      >
        <Ionicons name="shield-checkmark" size={48} color="#10B981" />
      </View>
      <Text
        testID="notifications-empty-title"
        className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 text-center"
      >
        Khu vực của bạn an toàn
      </Text>
      <Text
        testID="notifications-empty-subtitle"
        className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center px-10 leading-5"
      >
        Hiện tại không có cảnh báo nào. Chúng tôi sẽ thông báo cho bạn khi có
        thông tin mới.
      </Text>
      <TouchableOpacity
        testID="notifications-empty-refresh"
        onPress={handleRefresh}
        className="mt-6 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800"
        activeOpacity={0.7}
      >
        <Text
          testID="notifications-empty-refresh-label"
          className="text-sm font-bold text-slate-800 dark:text-slate-100"
        >
          Tải lại
        </Text>
      </TouchableOpacity>
    </View>
  );
}
