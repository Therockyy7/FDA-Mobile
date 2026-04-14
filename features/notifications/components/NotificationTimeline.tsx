// features/notifications/components/NotificationTimeline.tsx
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { MAP_COLORS } from "~/lib/design-tokens";
import { useColorScheme } from "~/lib/useColorScheme";
import type { PriorityConfig } from "~/features/notifications/types/notifications-types";

interface TimelineItem {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

interface NotificationTimelineProps {
  config: PriorityConfig;
  timeAgo: string;
  waterLevel?: number | null;
}

export function NotificationTimeline({
  config,
  timeAgo,
  waterLevel,
}: NotificationTimelineProps) {
  const { isDarkColorScheme } = useColorScheme();
  const c = isDarkColorScheme ? MAP_COLORS.dark : MAP_COLORS.light;

  const items: TimelineItem[] = [
    {
      icon: "time-outline",
      color: config.color,
      title: "Phát hiện ban đầu",
      desc: `${timeAgo} ${waterLevel ? `- ${waterLevel}cm` : ""}`,
    },
    {
      icon: "shield-checkmark-outline",
      color: "#10B981",
      title: "Hệ thống cảnh báo",
      desc: `Cấp độ ${config.label}`,
    },
    {
      icon: "megaphone-outline",
      color: "#F59E0B",
      title: "Thông báo cộng đồng",
      desc: "Đã gửi cảnh báo",
    },
  ];

  return (
    <View
      testID="notification-detail-timeline"
      style={{
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: isDarkColorScheme ? 1 : 0,
        borderColor: c.border,
      }}
      className="bg-white dark:bg-slate-800"
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: "#8B5CF620",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="git-branch-outline" size={18} color="#8B5CF6" />
        </View>
        <Text
          style={{ fontSize: 16, fontWeight: "700" }}
          className="text-slate-900 dark:text-slate-100"
        >
          Diễn biến
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        {items.map((item, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: item.color + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700" }}
                className="text-slate-900 dark:text-slate-100"
              >
                {item.title}
              </Text>
              <Text
                style={{ fontSize: 13, marginTop: 2 }}
                className="text-slate-500 dark:text-slate-400"
              >
                {item.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
