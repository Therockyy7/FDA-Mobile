// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";

import { TabLoadingScreen } from "~/components/ui/TabLoadingScreen";
import { CityOverviewStats } from "~/features/home/components/CityOverviewStats";
import { CommunityBanner } from "~/features/home/components/CommunityBanner";
import { EmergencyAlertBanner } from "~/features/home/components/EmergencyAlertBanner";
import { HomeHeader } from "~/features/home/components/HomeHeader";
import { MonitoredAreasSection } from "~/features/home/components/MonitoredAreasSection";
import { QuickActionsGrid } from "~/features/home/components/QuickActionsGrid";
import {
    DANANG_STATS,
    HOME_AREAS,
    MOCK_ALERT,
    QUICK_ACTIONS,
} from "~/features/home/constants/home-data";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Loading Screen */}
      <TabLoadingScreen visible={isLoading} message="Đang tải trang chủ..." />

      <HomeHeader notificationCount={0} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <EmergencyAlertBanner alert={MOCK_ALERT} />

        <QuickActionsGrid actions={QUICK_ACTIONS} />

        <CommunityBanner />

        <MonitoredAreasSection areas={HOME_AREAS} />

        <CityOverviewStats stats={DANANG_STATS} />
      </ScrollView>
    </View>
  );
}
