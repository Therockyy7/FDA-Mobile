// app/(tabs)/index.tsx
import React, { useState } from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";
import { MOCK_AREAS } from "~/features/areas/constants/areas-data";
import { CityOverviewStats } from "~/features/home/components/CityOverviewStats";
import { EmergencyAlertBanner } from "~/features/home/components/EmergencyAlertBanner";
import { HomeHeader } from "~/features/home/components/HomeHeader";
import { MonitoredAreasSection } from "~/features/home/components/MonitoredAreasSection";
import { QuickActionsGrid } from "~/features/home/components/QuickActionsGrid";
import {
  DANANG_STATS,
  MOCK_ALERT,

  QUICK_ACTIONS,
} from "~/features/home/constants/home-data";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

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

      {/* Header */}
      <HomeHeader notificationCount={3} />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Emergency Alert Banner */}
        <EmergencyAlertBanner alert={MOCK_ALERT} />

        {/* Quick Actions Grid */}
        <QuickActionsGrid actions={QUICK_ACTIONS} />

        {/* Monitored Areas Section */}
        <MonitoredAreasSection areas={MOCK_AREAS} />

        {/* City Overview Stats */}
        <CityOverviewStats stats={DANANG_STATS} />
      </ScrollView>
    </View>
  );
}
