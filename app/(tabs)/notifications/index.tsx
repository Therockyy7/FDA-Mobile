import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { NewsCard } from "~/features/news/components/NewsCard";
import { useMarkAllNewsRead } from "~/features/news/hooks/useMarkNewsRead";
import { useNewsfeed } from "~/features/news/hooks/useNewsfeed";
import { AnnouncementItem } from "~/features/news/types/news-types";
import { EmptyNotificationsState } from "~/features/notifications/components/EmptyNotificationsState";
import { NotificationCard } from "~/features/notifications/components/NotificationCard";
import { NotificationsHeader } from "~/features/notifications/components/NotificationsHeader";
import { useNotificationHistory } from "~/features/notifications/hooks/useNotificationHistory";
import { NotificationItem } from "~/features/notifications/types/notifications-types";
import { useColorScheme } from "~/lib/useColorScheme";
import NotificationTabToggle from "~/features/notifications/components/NotificationTabToggle";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  
  // Tab state: "alerts" | "news"
  const [activeTab, setActiveTab] = useState<"alerts" | "news">("alerts");

  // --- ALERTS/NOTIFICATIONS DATA ---
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    isFetchingNextPage: isFetchingNextAlerts,
    hasNextPage: hasNextAlerts,
    fetchNextPage: fetchNextAlerts,
    refetch: refetchAlerts,
    isRefetching: isRefetchingAlerts,
  } = useNotificationHistory({ pageSize: 10 });

  const notifications = useMemo(() => {
    if (!alertsData) return [];
    return alertsData.pages.flatMap((page) => page.notifications);
  }, [alertsData]);

  const loadMoreAlerts = () => {
    if (hasNextAlerts && !isFetchingNextAlerts) fetchNextAlerts();
  };

  // --- NEWS DATA ---
  const {
    data: newsData,
    isLoading: isLoadingNews,
    isFetchingNextPage: isFetchingNextNews,
    hasNextPage: hasNextNews,
    fetchNextPage: fetchNextNews,
    refetch: refetchNews,
    isRefetching: isRefetchingNews,
  } = useNewsfeed();

  const news = useMemo(() => {
    if (!newsData) return [];
    return newsData.pages.flatMap((page) => page.data);
  }, [newsData]);

  const hasUnreadNews = useMemo(() => {
    return news.some((item) => item.isRead === false);
  }, [news]);

  const markAllMutation = useMarkAllNewsRead();
  const handleMarkAllRead = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => Alert.alert("Thành công", "Đã đánh dấu tất cả là đã đọc."),
      onError: () => Alert.alert("Lỗi", "Không thể cập nhật trạng thái đã đọc."),
    });
  };

  const loadMoreNews = () => {
    if (hasNextNews && !isFetchingNextNews) fetchNextNews();
  };

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F9FAFB",
    statusBarStyle: isDarkColorScheme ? "light-content" : "dark-content",
    tabBg: isDarkColorScheme ? "#1E293B" : "#E5E7EB",
    activeTabBg: "#007AFF",
    inactiveText: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    text: isDarkColorScheme ? "#FFFFFF" : "#111827",
  };

  const handleAlertPress = useCallback((notificationId: string) => {
    router.push({
        pathname: '/notifications/[id]',
        params: { id: notificationId }
    });
  }, [router]);

  const handleNewsPress = useCallback((newsId: string) => {
    router.push({
        pathname: '/notifications/news/[id]',
        params: { id: newsId }
    });
  }, [router]);

  const renderAlertItem = ({ item }: { item: NotificationItem }) => (
    <NotificationCard
      notification={item}
      onPress={() => handleAlertPress(item.notificationId)}
    />
  );

  const renderNewsItem = ({ item }: { item: AnnouncementItem }) => (
    <NewsCard
      item={item}
      onPress={() => handleNewsPress(item.id)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={colors.statusBarStyle as any}
        backgroundColor="transparent"
        translucent
      />

      <NotificationsHeader
        unreadCount={activeTab === 'news' ? (hasUnreadNews ? 1 : 0) : 0} 
        onFilterPress={() => {}}
      />

      {/* Sliding Segmented Toggle */}
      <NotificationTabToggle 
          activeTab={activeTab} 
          onChange={setActiveTab} 
      />

      {/* Mark All Read Button for News */}
      {activeTab === "news" && hasUnreadNews && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8, alignItems: "flex-end" }}>
          <TouchableOpacity 
            onPress={handleMarkAllRead}
            disabled={markAllMutation.isPending}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              backgroundColor: isDarkColorScheme ? "#334155" : "#E2E8F0",
              borderRadius: 8,
              opacity: markAllMutation.isPending ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#007AFF" }}>
              {markAllMutation.isPending ? "Đang xử lý..." : "✓ Đánh dấu tất cả đã đọc"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content Area */}
      {activeTab === "news" ? (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderNewsItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingNews && !isFetchingNextNews}
              onRefresh={refetchNews}
              tintColor={isDarkColorScheme ? "#38BDF8" : "#007AFF"}
            />
          }
          ListEmptyComponent={
            isLoadingNews ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : (
              <EmptyNotificationsState onRefresh={refetchNews} />
            )
          }
          onEndReached={loadMoreNews}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextNews ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.inactiveText} />
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={renderAlertItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingAlerts && !isFetchingNextAlerts}
              onRefresh={refetchAlerts}
              tintColor={isDarkColorScheme ? "#38BDF8" : "#007AFF"}
            />
          }
          ListEmptyComponent={
            isLoadingAlerts ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : (
              <EmptyNotificationsState onRefresh={refetchAlerts} />
            )
          }
          onEndReached={loadMoreAlerts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextAlerts ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.inactiveText} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
