// app/(tabs)/home.tsx
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  View,
} from "react-native";

import { TabLoadingScreen } from "~/components/ui/TabLoadingScreen";
import { CommunityBanner } from "~/features/home/components/CommunityBanner";
import { HomeHeader } from "~/features/home/components/HomeHeader";
import {
  WeatherInsightsSection,
  WeatherInsightsSkeleton,
} from "~/features/home/components/WeatherInsightsSection";
import { useHomeWeatherData } from "~/features/home/hooks/useHomeWeatherData";
import { DistrictsForecastCard } from "~/features/prediction/components/DistrictsForecastCard";

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
    <View className="flex-1 bg-slate-50 dark:bg-slate-900" testID="home-screen">
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
        testID="home-scroll"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ═══ COMMUNITY SECTION (promoted to top) ═══ */}
        <View style={{ marginTop: 8 }}>
          <CommunityBanner />
        </View>

        {/* ═══ WEATHER SECTION ═══ */}
        {weatherLoading && !meteo ? (
          <WeatherInsightsSkeleton />
        ) : meteo ? (
          <WeatherInsightsSection
            meteo={meteo}
            rainfallForecast={rainfallForecast}
            aiRisk={aiRisk}
          />
        ) : null}

        {/* ═══ DISTRICTS FORECAST SECTION ═══ */}
        <DistrictsForecastCard />
      </ScrollView>
    </View>
  );
}
