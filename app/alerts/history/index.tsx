// app/alerts/history/index.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/useColorScheme";
import AlertHistoryCard from "~/features/alerts/components/alert-history/AlertHistoryCard";
import AlertHistoryChips from "~/features/alerts/components/alert-history/AlertHistoryChips";
import AlertHistoryHeader from "~/features/alerts/components/alert-history/AlertHistoryHeader";
import AlertHistorySearchBar from "~/features/alerts/components/alert-history/AlertHistorySearchBar";
import AlertHistorySectionTitle from "~/features/alerts/components/alert-history/AlertHistorySectionTitle";
import type { AlertHistoryItem } from "~/features/alerts/types/alert-history.types";

const HEADER_HEIGHT = 64;

export default function AlertHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();

  const colors = useMemo(
    () => ({
      primary: "#137fec",
      background: isDarkColorScheme ? "#101922" : "#f6f7f8",
      card: isDarkColorScheme ? "rgba(30,41,59,0.4)" : "#FFFFFF",
      text: isDarkColorScheme ? "#FFFFFF" : "#0F172A",
      subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
      border: isDarkColorScheme ? "#334155" : "#E2E8F0",
      chipBg: isDarkColorScheme ? "rgba(30,41,59,0.9)" : "#FFFFFF",
      mutedBg: isDarkColorScheme ? "rgba(15,23,42,0.5)" : "#F8FAFC",
      divider: isDarkColorScheme ? "rgba(148,163,184,0.2)" : "rgba(15,23,42,0.08)",
      overlay: isDarkColorScheme ? "rgba(16,25,34,0.85)" : "rgba(246,247,248,0.85)",
    }),
    [isDarkColorScheme],
  );

  const [query, setQuery] = useState("");
  const [chipAll, setChipAll] = useState(true);

  const today: AlertHistoryItem[] = [
    {
      id: "1",
      station: "Trạm Lê Lợi - Pasteur",
      area: "District 1, HCM City",
      severity: "Critical",
      valueLabel: "Water Level",
      value: "25.5",
      unit: "cm",
      time: "10:30 AM",
      date: "Nov 24, 2023",
      channels: [
        { type: "push", status: "sent" },
        { type: "email", status: "failed" },
      ],
      actionLabel: "DETAILS",
      icon: "water_damage",
    },
    {
      id: "2",
      station: "Trạm Nguyễn Huệ",
      area: "District 1, HCM City",
      severity: "Warning",
      valueLabel: "Water Level",
      value: "18.2",
      unit: "cm",
      time: "09:15 AM",
      date: "Nov 24, 2023",
      channels: [
        { type: "push", status: "sent" },
        { type: "email", status: "sent" },
      ],
      actionLabel: "DETAILS",
      icon: "waves",
    },
  ];

  const yesterday: AlertHistoryItem[] = [
    {
      id: "3",
      station: "Trạm Tôn Đức Thắng",
      area: "District 4, HCM City",
      severity: "Resolved",
      valueLabel: "Peak Level",
      value: "15.0",
      unit: "cm",
      time: "08:00 AM",
      date: "Nov 23, 2023",
      channels: [
        { type: "push", status: "sent" },
        { type: "email", status: "sent" },
      ],
      actionLabel: "LOGS",
      icon: "water",
      dimmed: true,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AlertHistoryHeader
        title="Alert History"
        onBack={() => router.back()}
        onFilter={() => {}}
        colors={{
          text: colors.text,
          primary: colors.primary,
          border: colors.border,
          backgroundOverlay: colors.overlay,
        }}
        topInset={insets.top}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <AlertHistorySearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search station or area..."
            colors={{
              text: colors.text,
              subtext: colors.subtext,
              inputBg: isDarkColorScheme ? "rgba(30,41,59,0.5)" : "#FFFFFF",
            }}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <AlertHistoryChips
              chipAll={chipAll}
              onSelectAll={() => setChipAll(true)}
              onSelectCritical={() => setChipAll(false)}
              onSelectLast30Days={() => {}}
              colors={{
                primary: colors.primary,
                subtext: colors.subtext,
                chipBg: colors.chipBg,
                border: colors.border,
              }}
            />
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 14 }}>
          <AlertHistorySectionTitle title="Today" color={colors.subtext} />
          {today.map((item) => (
            <AlertHistoryCard
              key={item.id}
              item={item}
              colors={{
                primary: colors.primary,
                card: colors.card,
                text: colors.text,
                subtext: colors.subtext,
                mutedBg: colors.mutedBg,
                divider: colors.divider,
                border: colors.border,
                isDark: isDarkColorScheme,
              }}
            />
          ))}

          <View style={{ height: 10 }} />

          <AlertHistorySectionTitle title="Yesterday" color={colors.subtext} />
          {yesterday.map((item) => (
            <AlertHistoryCard
              key={item.id}
              item={item}
              colors={{
                primary: colors.primary,
                card: colors.card,
                text: colors.text,
                subtext: colors.subtext,
                mutedBg: colors.mutedBg,
                divider: colors.divider,
                border: colors.border,
                isDark: isDarkColorScheme,
              }}
            />
          ))}

          <View style={{ height: 18 }} />
        </View>

        <View style={{ alignItems: "center", paddingTop: 18, paddingBottom: 10 }}>
          <View
            style={{
              width: 120,
              height: 6,
              borderRadius: 999,
              backgroundColor: isDarkColorScheme ? "#334155" : "#CBD5E1",
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
