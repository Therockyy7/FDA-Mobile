// app/(tabs)/home.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  View,
} from "react-native";

import { TabLoadingScreen } from "~/components/ui/TabLoadingScreen";
import { Text } from "~/components/ui/text";
import { CommunityBanner } from "~/features/home/components/CommunityBanner";
import { EmergencyAlertBanner } from "~/features/home/components/EmergencyAlertBanner";
import { HomeHeader } from "~/features/home/components/HomeHeader";
import { WeatherInsightsSection } from "~/features/home/components/WeatherInsightsSection";
import { MOCK_ALERT } from "~/features/home/constants/home-data";
import { useHomeWeatherData } from "~/features/home/hooks/useHomeWeatherData";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    meteo,
    rainfallForecast,
    aiRisk,
    loading: weatherLoading,
    refresh: refreshWeather,
  } = useHomeWeatherData();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshWeather(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <TabLoadingScreen visible={isLoading} message="Đang tải..." />

      {/* Header with real weather */}
      <HomeHeader notificationCount={0} meteo={meteo} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Emergency Alert (only when active) */}
        <EmergencyAlertBanner alert={MOCK_ALERT} />

        {/* ═══ WEATHER SECTION ═══ */}
        {weatherLoading && !meteo ? (
          <View className="px-4 py-8 items-center">
            <ActivityIndicator size="small" color="#06B6D4" />
            <Text className="text-slate-400 text-xs mt-2">
              Đang tải dữ liệu thời tiết...
            </Text>
          </View>
        ) : meteo ? (
          <WeatherInsightsSection
            meteo={meteo}
            rainfallForecast={rainfallForecast}
            aiRisk={aiRisk}
          />
        ) : null}

        {/* ═══ COMMUNITY SECTION ═══ */}
        <CommunityBanner />
      </ScrollView>
    </View>
  );
}
