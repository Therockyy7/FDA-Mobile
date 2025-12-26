// app/area-detail/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert as RNAlert,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { Text } from "~/components/ui/text";
import { AreaChartsAndForecast } from "~/features/areas/components/AreaChartsAndForecast";
import { AreaDetailActions } from "~/features/areas/components/AreaDetailActions";
import { AreaDetailHeader } from "~/features/areas/components/AreaDetailHeader";
import { AreaSensorsAndStreets } from "~/features/areas/components/AreaSensorsAndStreets";
import { AreaStatusCard } from "~/features/areas/components/AreaStatusCard";
import { AreaWeatherSection } from "~/features/areas/components/AreaWeatherSection";
import {
  AREA_DETAIL_MAP,
  type AreaDetailExtra,
} from "~/features/areas/constants/area-detail-constants";

import { getStatusConfig } from "~/features/home/lib/home-utils";
import type { Area } from "~/features/areas/types/areas-types";
import { ALL_AREAS } from "~/features/areas/constants/all-areas-data";

interface WaterLevelData {
  value: number;
  label: string;
  dataPointText?: string;
}

interface ForecastData {
  time: string;
  level: number;
  status: "safe" | "warning" | "danger";
  rainfall: number;
}

export default function AreaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<"history" | "forecast">(
    "history",
  );

  const area: Area | undefined = useMemo(
    () => ALL_AREAS.find((a) => a.id === id),
    [id],
  );

  const extra: AreaDetailExtra | undefined =
    id && AREA_DETAIL_MAP[id as string];

    // console.log("extra: ", extra);
    // console.log("area: ", area);
    

  if ( !extra || !area ) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Text className="text-slate-900 dark:text-white font-semibold mb-3">
          Không tìm thấy dữ liệu khu vực
        </Text>
        <AreaDetailActions
          onShowMap={() => router.push("/map")}
          onDelete={() => router.back()}
        />
      </View>
    );
  }

  const statusConfig = getStatusConfig(area.status);

  const historyData: WaterLevelData[] = extra.history.map((h, idx) => ({
    value: h.level,
    label: h.time,
    dataPointText: idx === extra.history.length - 1 ? `${h.level}m` : undefined,
  }));

  const forecastData: ForecastData[] = extra.forecast;
  const waterPercentage = (area.waterLevel / extra.dangerLevel) * 100;

  const handleDelete = () => {
    RNAlert.alert("Xóa khu vực", "Bạn có chắc chắn muốn xóa khu vực này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <AreaDetailHeader
        statusColor={statusConfig.iconColor}
        name={area.name}
        district={area.district}
        description={extra.description}
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <AreaStatusCard
          statusText={area.statusText}
          statusColor={statusConfig.iconColor}
          currentLevel={area.waterLevel}
          warningLevel={extra.warningLevel}
          dangerLevel={extra.dangerLevel}
          lastUpdate={area.lastUpdate}
          waterPercentage={waterPercentage}
        />

        <AreaWeatherSection
          rainfall24h={extra.rainfall24h}
          temperature={extra.temperature}
          humidity={extra.humidity}
          windSpeed={extra.windSpeed}
        />

        <AreaChartsAndForecast
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          statusColor={statusConfig.iconColor}
          historyData={historyData}
          forecastData={forecastData}
        />

        <AreaSensorsAndStreets
          sensorCount={area.sensorCount}
          affectedStreets={area.affectedStreets}
        />

        <AreaDetailActions
          onShowMap={() => router.push("/map")}
          onDelete={handleDelete}
        />
      </ScrollView>
    </View>
  );
}
