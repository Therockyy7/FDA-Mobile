// app/alerts/history/[alertId].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StatusBar, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

export default function AlertHistoryDetailScreen() {
  const router = useRouter();
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const colors = useMemo(
    () => ({
      primary: "#137fec",
      background: isDarkColorScheme ? "#101922" : "#f6f7f8",
      card: isDarkColorScheme ? "rgba(30,41,59,0.4)" : "#FFFFFF",
      text: isDarkColorScheme ? "#FFFFFF" : "#0B1A33",
      subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
      border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    }),
    [isDarkColorScheme],
  );

  return (
    <SafeAreaView
      testID="alerts-history-detail-screen"
      className={`flex-1 ${isDarkColorScheme ? "bg-slate-950" : "bg-slate-50"}`}
    >
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        testID="alerts-history-detail-header"
        className={`flex-row items-center px-4 py-3 gap-3 border-b ${
          isDarkColorScheme
            ? "bg-slate-950 border-b-slate-800"
            : "bg-slate-50 border-b-slate-200"
        }`}
      >
        <TouchableOpacity
          testID="alerts-history-detail-back"
          onPress={() => router.back()}
          activeOpacity={0.7}
          className={`w-9 h-9 rounded-3 items-center justify-center ${
            isDarkColorScheme
              ? "bg-slate-700/15"
              : "bg-slate-900/6"
          }`}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text
          testID="alerts-history-detail-title"
          className="text-lg font-bold text-slate-900 dark:text-slate-50 flex-1"
        >
          Chi tiết cảnh báo
        </Text>
      </View>

      {/* Placeholder content */}
      <View
        testID="alerts-history-detail-content"
        className="flex-1 items-center justify-center px-8 gap-4"
      >
        <View
          className={`w-18 h-18 rounded-5 items-center justify-center ${
            isDarkColorScheme
              ? "bg-primary/15"
              : "bg-primary/8"
          }`}
        >
          <Ionicons name="document-text-outline" size={32} color={colors.primary} />
        </View>

        <Text
          testID="alerts-history-detail-alert-id"
          className="text-lg font-bold text-slate-900 dark:text-slate-50 text-center"
        >
          Alert #{alertId}
        </Text>
        <Text
          testID="alerts-history-detail-description"
          className="text-body-sm font-normal text-slate-600 dark:text-slate-400 text-center leading-relaxed"
        >
          Chi tiết cảnh báo sẽ được hiển thị đầy đủ tại đây bao gồm mực nước,
          kênh thông báo, và timeline xử lý.
        </Text>
      </View>
    </SafeAreaView>
  );
}
