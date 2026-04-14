import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { formatAlertTitle } from "~/features/alerts/utils/formatAlertTitle";
import { useColorScheme } from "~/lib/useColorScheme";
import { getPriorityConfig } from "../lib/notifications-utils";
import { NotificationItem } from "../types/notifications-types";

interface NotificationCardProps {
  notification: NotificationItem;
  onPress: () => void;
  onMapPress?: () => void;
  onDirectionsPress?: () => void;
}

export function NotificationCard({
  notification,
  onPress,
  onMapPress,
  onDirectionsPress,
}: NotificationCardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const config = getPriorityConfig(notification.severity);

  // Theme colors
  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    muted: isDarkColorScheme ? "#64748B" : "#9CA3AF",
    border: isDarkColorScheme ? "#334155" : "#F3F4F6",
    primary: isDarkColorScheme ? "#3B82F6" : "#2563EB",
  };

  const timeAgo = React.useMemo(() => {
    try {
      const date = new Date(notification.sentAt || notification.createdAt);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return "Vừa xong";
    }
  }, [notification]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkColorScheme ? 0 : 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* ── Severity Avatar ── */}
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: isDarkColorScheme
            ? config.darkBgColor || config.bgColor
            : config.bgColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: config.color + "30",
          marginTop: 2,
        }}
      >
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1, gap: 2 }}>
        {/* Title Group */}
        <View style={{ gap: 2 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: -0.3,
            }}
          >
            {notification.stationName}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: config.color,
            }}
          >
            {formatAlertTitle(notification.title)}
          </Text>
        </View>

        {/* Content / Message */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: colors.subtext,
            lineHeight: 18,
            marginTop: 2,
          }}
        >
          {notification.content || notification.alertMessage}
        </Text>

        {/* Metadata Row: Time · Severity */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {/* Relative Time */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: colors.muted,
            }}
          >
            {timeAgo}
          </Text>

          {/* Dot Separator */}
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
              opacity: 0.6,
            }}
          >
            ·
          </Text>

          {/* Severity Label */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: config.color,
              letterSpacing: 0.2,
            }}
          >
            {config.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
