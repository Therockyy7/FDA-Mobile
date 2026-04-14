// app/(tabs)/notifications/[id].tsx
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { getPriorityConfig } from "~/features/notifications/lib/notifications-utils";
import { NotificationItem } from "~/features/notifications/types/notifications-types";
import { formatAlertTitle } from "~/features/alerts/utils/formatAlertTitle";
import { NotificationDetailHeader } from "~/features/notifications/components/NotificationDetailHeader";
import { NotificationWaterLevelCard } from "~/features/notifications/components/NotificationWaterLevelCard";
import { NotificationMapPreview } from "~/features/notifications/components/NotificationMapPreview";
import { NotificationTimeline } from "~/features/notifications/components/NotificationTimeline";

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const notification = useMemo(() => {
    const queries = queryClient.getQueriesData({
      queryKey: ["notifications", "history"],
    });
    for (const [, queryData] of queries) {
      if (!queryData) continue;
      const data = queryData as any;

      if (data?.notifications && Array.isArray(data.notifications)) {
        const found = data.notifications.find(
          (n: NotificationItem) => n.notificationId === id,
        );
        if (found) return found as NotificationItem;
      }

      if (data?.pages && Array.isArray(data.pages)) {
        const found = data.pages
          .flatMap((p: any) => p.notifications || [])
          .find((n: NotificationItem) => n.notificationId === id);
        if (found) return found as NotificationItem;
      }
    }
    return null;
  }, [id, queryClient]);

  const config = getPriorityConfig(notification?.severity || "info");

  if (!notification) {
    return (
      <View
        testID="notification-detail-not-found"
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}
        className="bg-slate-50 dark:bg-[#0B1A33]"
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#FEF3C7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={50} color="#F59E0B" />
        </View>
        <Text
          style={{ fontSize: 20, fontWeight: "800", marginBottom: 8, textAlign: "center" }}
          className="text-slate-900 dark:text-slate-100"
        >
          Không tìm thấy
        </Text>
        <Text
          style={{ fontSize: 14, textAlign: "center", marginBottom: 24 }}
          className="text-slate-500 dark:text-slate-400"
        >
          Thông báo này không tồn tại hoặc đã bị xóa
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 32, paddingVertical: 14, backgroundColor: "#007AFF", borderRadius: 12 }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timeAgo = (() => {
    try {
      const date = new Date(notification.sentAt || notification.createdAt);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return "Vừa xong";
    }
  })();

  const descContent = notification.content || notification.alertMessage;

  return (
    <View
      testID="notification-detail-container"
      style={{ flex: 1 }}
      className="bg-slate-50 dark:bg-[#0B1A33]"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 45 }} showsVerticalScrollIndicator={false}>
        <NotificationDetailHeader
          title={formatAlertTitle(notification.title)}
          stationName={notification.stationName}
          timeAgo={timeAgo}
          config={config}
        />

        {notification.waterLevel !== undefined && notification.waterLevel !== null && (
          <NotificationWaterLevelCard
            waterLevel={notification.waterLevel}
            stationCode={notification.stationCode}
          />
        )}

        {notification.stationId && (
          <NotificationMapPreview
            stationId={notification.stationId}
            stationName={notification.stationName}
          />
        )}

        <NotificationTimeline
          config={config}
          timeAgo={timeAgo}
          waterLevel={notification.waterLevel}
        />

        {descContent && (
          <View
            testID="notification-detail-description"
            style={{
              marginHorizontal: 20,
              borderRadius: 24,
              padding: 20,
              marginBottom: 20,
            }}
            className="bg-white dark:bg-slate-800"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#06B6D420",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="document-text-outline" size={18} color="#06B6D4" />
              </View>
              <Text
                style={{ fontSize: 16, fontWeight: "700" }}
                className="text-slate-900 dark:text-slate-100"
              >
                Chi tiết
              </Text>
            </View>
            <Text
              style={{ fontSize: 15, lineHeight: 24 }}
              className="text-slate-500 dark:text-slate-400"
            >
              {descContent}
            </Text>
          </View>
        )}

        {notification.stationId && (
          <View style={{ marginHorizontal: 20, gap: 12 }}>
            <TouchableOpacity
              testID="notification-detail-view-map-button"
              onPress={() =>
                router.push({ pathname: "/map", params: { stationId: notification.stationId } } as any)
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: "#007AFF",
              }}
            >
              <Ionicons name="map" size={20} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>Xem bản đồ</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
