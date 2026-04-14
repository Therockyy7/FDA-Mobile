import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatAlertTitle } from "~/features/alerts/utils/formatAlertTitle";
import { SHADOW } from "~/lib/design-tokens";
import { cn } from "~/lib/utils";
import { getPriorityConfig } from "../lib/notifications-utils";
import { NotificationItem } from "../types/notifications-types";

interface NotificationCardProps {
  notification: NotificationItem;
  onPress: () => void;
}

export function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const config = getPriorityConfig(notification.severity);

  const timeAgo = React.useMemo(() => {
    try {
      const timestamp = notification.sentAt || notification.createdAt;
      if (!timestamp) return "Vừa xong";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Vừa xong";
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return "Vừa xong";
    }
  }, [notification.sentAt, notification.createdAt]);

  return (
    <TouchableOpacity
      testID="notifications-card-container"
      onPress={onPress}
      activeOpacity={0.65}
      className="flex-row items-center bg-white dark:bg-slate-800 rounded-2xl border-0 dark:border dark:border-slate-700 mb-2"
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 12,
        ...SHADOW.sm,
      }}
    >
      {/* ── Severity Avatar ── */}
      <View
        testID="notifications-card-avatar"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: config.bgColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: config.color + "30",
        }}
      >
        <Ionicons name={config.icon || "alert-circle"} size={22} color={config.color || "#666"} />
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1, gap: 1 }}>
        {/* Title Group */}
        <View>
          <Text
            testID="notifications-card-station"
            numberOfLines={1}
            className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-5"
          >
            {notification.stationName || "Trạm không xác định"}
          </Text>
          <Text
            testID="notifications-card-title"
            numberOfLines={1}
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-5"
          >
            {formatAlertTitle(notification.title || "Thông báo")}
          </Text>
        </View>

        {/* Content / Message */}
        <Text
          testID="notifications-card-content"
          numberOfLines={2}
          className="text-xs font-normal text-slate-500 dark:text-slate-400 leading-4 mt-0.5 opacity-90"
        >
          {notification.content || notification.alertMessage || "Không có thông tin chi tiết"}
        </Text>

        {/* Metadata Row: Time · Severity */}
        <View
          testID="notifications-card-meta"
          className="flex-row items-center mt-1 gap-1.5 flex-wrap"
        >
          <Text
            testID="notifications-card-time"
            className="text-xs font-semibold text-primary dark:text-secondary"
          >
            {timeAgo}
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500 opacity-60">·</Text>
          <Text
            testID="notifications-card-severity"
            className={cn("text-xs font-bold tracking-wide")}
            style={{ color: config.color || "#666" }}
          >
            {config.label || ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
