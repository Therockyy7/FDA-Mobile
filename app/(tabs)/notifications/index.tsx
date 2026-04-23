import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
import { NotificationPaginationInfo } from "~/features/notifications/components/NotificationPaginationInfo";
import { NotificationsHeader } from "~/features/notifications/components/NotificationsHeader";
import NotificationTabToggle from "~/features/notifications/components/NotificationTabToggle";
import { useNotificationHistory } from "~/features/notifications/hooks/useNotificationHistory";
import { NotificationItem } from "~/features/notifications/types/notifications-types";
import { useColorScheme } from "~/lib/useColorScheme";
import { useTranslation } from "~/features/i18n";

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();
  
  // Tab state: "alerts" | "news"
  const [activeTab, setActiveTab] = useState<"alerts" | "news">("alerts");

  const alertsListRef = useRef<FlatList>(null);
  const newsListRef = useRef<FlatList>(null);

  const [alertsPage, setAlertsPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);

  // --- ALERTS/NOTIFICATIONS DATA ---
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
    isRefetching: isRefetchingAlerts,
  } = useNotificationHistory({ pageNumber: alertsPage, pageSize: 10 });

  const notifications = useMemo(() => {
    return alertsData?.notifications || [];
  }, [alertsData]);

  const alertsTotalPages = alertsData?.totalPages || 1;

  const handleAlertsPageChange = (page: number) => {
    setAlertsPage(page);
    alertsListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // --- NEWS DATA ---
  const {
    data: newsData,
    isLoading: isLoadingNews,
    refetch: refetchNews,
    isRefetching: isRefetchingNews,
  } = useNewsfeed({ page: newsPage, pageSize: 10 });

  const news = useMemo(() => {
    return newsData?.data || [];
  }, [newsData]);

  const newsTotalPages = newsData?.totalPages || 1;

  const handleNewsPageChange = (page: number) => {
    setNewsPage(page);
    newsListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const hasUnreadNews = useMemo(() => {
    return news.some((item) => item.isRead === false);
  }, [news]);

  const markAllMutation = useMarkAllNewsRead();
  const handleMarkAllRead = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => Alert.alert(t("common.success"), t("notif.markAllReadSuccess")),
      onError: () => Alert.alert(t("common.error"), t("notif.markAllReadError")),
    });
  };

  // Theme colors
  const colors = {
    background: isDarkColorScheme ? "#0B1A33" : "#F9FAFB",
    statusBarStyle: isDarkColorScheme ? "light-content" : "dark-content",
    tabBg: isDarkColorScheme ? "#1E293B" : "#E5E7EB",
    activeTabBg: "#007AFF",
    inactiveText: isDarkColorScheme ? "#94A3B8" : "#6B7280",
    text: isDarkColorScheme ? "#FFFFFF" : "#111827",
  };

  const handleAlertPress = useCallback((notificationId: string) => {
    router.push({
      pathname: '/notifications/[id]',
      params: { id: notificationId },
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
              {markAllMutation.isPending ? t("common.processing") : `✓ ${t("notif.markAllRead")}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content Area */}
      {activeTab === "news" ? (
        <FlatList
          ref={newsListRef}
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderNewsItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingNews}
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
          ListFooterComponent={
            news.length > 0 ? (
              <NotificationPaginationInfo
                  currentPage={newsPage}
                  totalPages={newsTotalPages}
                  onChangePage={handleNewsPageChange}
              />
            ) : null
          }
        />
      ) : (
        <FlatList
          ref={alertsListRef}
          data={notifications}
          keyExtractor={(item) => item.notificationId}
          renderItem={renderAlertItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingAlerts}
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
          ListFooterComponent={
            notifications.length > 0 ? (
              <NotificationPaginationInfo
                currentPage={alertsPage}
                totalPages={alertsTotalPages}
                onChangePage={handleAlertsPageChange}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
