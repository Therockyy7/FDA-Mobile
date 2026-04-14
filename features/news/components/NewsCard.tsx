import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { AnnouncementItem, NewsPriority } from "../types/news-types";

interface NewsCardProps {
  item: AnnouncementItem;
  onPress: () => void;
}

const getPriorityConfig = (priority: NewsPriority) => {
  switch (priority) {
    case "low":
      return { color: "#9CA3AF", label: "LOW" };
    case "high":
      return { color: "#F97316", label: "HIGH" };
    case "urgent":
      return { color: "#EF4444", label: "URGENT" };
    case "normal":
    default:
      return { color: "#3B82F6", label: "NORMAL" };
  }
};

export function NewsCard({ item, onPress }: NewsCardProps) {
  const { isDarkColorScheme } = useColorScheme();

  // null translates to treated as unread for UI
  const isRead = item.isRead === true;

  const priorityConfig = getPriorityConfig(item.priority);

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#111827",
    subtext: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    border: isDarkColorScheme ? "#334155" : "#E5E7EB",
  };

  const timeAgo = (() => {
    try {
        const date = new Date(item.publishedAt);
        return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
        return "Gần đây";
    }
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {/* Top badges row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
        <View
          style={{
            backgroundColor: priorityConfig.color,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "white", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 }}>
            {priorityConfig.label}
          </Text>
        </View>

        {!isRead && (
          <View
            style={{
              backgroundColor: "#EF4444",
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 }}>
              CHƯA ĐỌC
            </Text>
          </View>
        )}
      </View>

      {/* Optional Thumbnail Image */}
      {!!item.imageUrl && (
        <Image
          source={item.imageUrl}
          style={{ width: "100%", height: 160, borderRadius: 10, marginBottom: 12 }}
          contentFit="cover"
          transition={200}
        />
      )}

      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: colors.text,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: colors.subtext,
          lineHeight: 18,
          marginBottom: 12,
        }}
        numberOfLines={2}
      >
        {item.summary}
      </Text>

      {/* Meta row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="eye-outline" size={13} color={colors.subtext} />
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.subtext }}>
            {item.viewCount} lượt xem
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="time-outline" size={13} color={colors.subtext} />
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.subtext }}>
            {timeAgo}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
