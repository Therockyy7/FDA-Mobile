import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 10,
        marginBottom: 6,
      }}
    >
      {/* ── Severity Avatar ── */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28, // Circle avatar to match Facebook style somewhat, but let's use squircle to keep FDA spirit
          backgroundColor: isDarkColorScheme
            ? config.darkBgColor || config.bgColor
            : config.bgColor,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: config.color + "30",
        }}
      >
        <Ionicons name={config.icon as any} size={28} color={config.color} />
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1, gap: 2, marginTop: 2 }}>
        {/* Title */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 15,
            color: colors.text,
            lineHeight: 22,
          }}
        >
          <Text style={{ fontWeight: "700" }}>{notification.stationName}</Text>
          <Text style={{ fontWeight: "400" }}>{" đã cảnh báo "}</Text>
          <Text style={{ fontWeight: "600" }}>
            {notification.title.toLowerCase()}
          </Text>
        </Text>

        {/* Content / Message */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 14,
            fontWeight: "400",
            color: colors.subtext,
            lineHeight: 20,
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
            marginTop: 4,
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {/* Relative Time */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.primary, // Make time colored like Facebook
            }}
          >
            {timeAgo}
          </Text>

          {/* Dot Separator */}
          <Text
            style={{
              fontSize: 13,
              color: colors.muted,
              opacity: 0.6,
            }}
          >
            ·
          </Text>

          {/* Severity Label */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: config.color,
            }}
          >
            {config.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
