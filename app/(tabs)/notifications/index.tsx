
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    View,
} from "react-native";
import { EmptyNotificationsState } from "~/features/notifications/components/EmptyNotificationsState";
import { NotificationCard } from "~/features/notifications/components/NotificationCard";
import { NotificationFilters } from "~/features/notifications/components/NotificationFilters";
import { NotificationsHeader } from "~/features/notifications/components/NotificationsHeader";
import {
    FILTER_OPTIONS,
    MOCK_NOTIFICATIONS,
} from "~/features/notifications/constants/notifications-data";
import { Notification, NotificationPriority } from "~/features/notifications/types/notifications-types";
import { useColorScheme } from "~/lib/useColorScheme";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | NotificationPriority>("all");

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F9FAFB",
    statusBarStyle: isDarkColorScheme ? "light-content" : "dark-content",
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const handleMapPress = useCallback((notificationId: string) => {
    // console.log("View map for notification:", notificationId);
    router.push("/map" as any);
  }, [router]);

  const handleDirectionsPress = useCallback((notificationId: string) => {
    // console.log("Get directions for notification:", notificationId);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(
    () =>
      filter === "all"
        ? notifications
        : notifications.filter((n) => n.priority === filter),
    [filter, notifications]
  );

  const handleDetailsPress = useCallback((notificationId: string) => {
    router.push({
        pathname: '/notifications/[id]',
        params: { id: notificationId }
    });;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={colors.statusBarStyle as any}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <NotificationsHeader
        unreadCount={unreadCount}
        onFilterPress={() => {
          // console.log("Open filter modal");
        }}
      />

      {/* Filters */}
      <NotificationFilters
        filters={FILTER_OPTIONS}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Notifications List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={isDarkColorScheme ? "#60A5FA" : "#3B82F6"}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <EmptyNotificationsState onRefresh={onRefresh} />
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => handleDetailsPress(notification.id)}
              onMapPress={() => handleMapPress(notification.id)}
              onDirectionsPress={() => handleDirectionsPress(notification.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
