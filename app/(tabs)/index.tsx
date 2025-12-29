// app/(tabs)/index.tsx
import React, { useState } from "react";
import { RefreshControl, ScrollView, StatusBar, View } from "react-native";

import { CityOverviewStats } from "~/features/home/components/CityOverviewStats";
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

        <MonitoredAreasSection areas={HOME_AREAS} />

        <CityOverviewStats stats={DANANG_STATS} />
      </ScrollView>
    </View>
  );
}
