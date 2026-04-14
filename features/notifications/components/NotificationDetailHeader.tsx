// features/notifications/components/NotificationDetailHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { PriorityConfig } from "~/features/notifications/types/notifications-types";

interface NotificationDetailHeaderProps {
  title: string;
  stationName?: string;
  timeAgo: string;
  config: PriorityConfig;
}

export function NotificationDetailHeader({
  title,
  stationName,
  timeAgo,
  config,
}: NotificationDetailHeaderProps) {
  const router = useRouter();

  return (
    <View
      testID="notification-detail-header"
      style={{ paddingTop: 43, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1 }}
      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
        <TouchableOpacity
          testID="notification-detail-back-button"
          onPress={() => router.back()}
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
            marginTop: -4,
          }}
          className="bg-slate-900/6 dark:bg-slate-300/15"
        >
          <Ionicons name="arrow-back" size={22} className="text-slate-900 dark:text-slate-100" color="currentColor" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginTop: -2 }}>
          <View
            testID="notification-detail-priority-badge"
            style={{
              alignSelf: "flex-start",
              backgroundColor: config.color + "15",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginBottom: 6,
            }}
          >
            <Text
              style={{ fontSize: 11, fontWeight: "800", color: config.color, textTransform: "uppercase" }}
            >
              {config.label}
            </Text>
          </View>

          <Text
            testID="notification-detail-title"
            style={{ fontSize: 20, fontWeight: "700", lineHeight: 26, marginBottom: 8 }}
            className="text-slate-900 dark:text-slate-100"
          >
            {title}
          </Text>

          {stationName && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Ionicons name="location" size={14} className="text-slate-500 dark:text-slate-400" color="currentColor" />
              <Text
                testID="notification-detail-station-name"
                style={{ fontSize: 14, fontWeight: "600" }}
                className="text-slate-500 dark:text-slate-400"
              >
                {stationName}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="time-outline" size={14} className="text-slate-400 dark:text-slate-500" color="currentColor" />
            <Text
              testID="notification-detail-time-ago"
              style={{ fontSize: 13, fontWeight: "500" }}
              className="text-slate-400 dark:text-slate-500"
            >
              {timeAgo}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
