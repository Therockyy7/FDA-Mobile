// app/alerts/history/index.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AlertHistoryCard from "~/features/alerts/components/alert-history/AlertHistoryCard";
import AlertHistoryChips from "~/features/alerts/components/alert-history/AlertHistoryChips";
import AlertHistoryHeader from "~/features/alerts/components/alert-history/AlertHistoryHeader";
import AlertHistoryPagination from "~/features/alerts/components/alert-history/AlertHistoryPagination";
import AlertHistorySearchBar from "~/features/alerts/components/alert-history/AlertHistorySearchBar";
import AlertHistorySectionTitle from "~/features/alerts/components/alert-history/AlertHistorySectionTitle";
import type { AlertHistoryItem } from "~/features/alerts/types/alert-history.types";
import { useColorScheme } from "~/lib/useColorScheme";
import { useAlertHistoryData } from "~/features/alerts/hooks/useAlertHistoryData";

export default function AlertHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const PAGE_SIZE = 5;

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
  const [activeSeverity, setActiveSeverity] = useState<
    "all" | "critical" | "warning" | "caution"
  >("all");
  const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const headerHeight = insets.top + 56;
  const floatingTop = headerHeight;
  const floatingHeight = 108;
  const contentPaddingTop = floatingTop + floatingHeight + 8;

  React.useEffect(() => {
    if (query.trim().length > 0) {
      setPageNumber(1);
    }
  }, [query]);

  const {
    alerts,
    allAlerts,
    totalPages,
    totalCountAll,
    severityCounts,
    isLoading,
    refreshing,
    refresh,
  } = useAlertHistoryData({
    pageNumber,
    pageSize: PAGE_SIZE,
    severity: activeSeverity === "all" ? undefined : activeSeverity,
  });

  const filteredAllAlerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAlerts.filter((item) => {
      if (activeSeverity !== "all" && item.severity !== activeSeverity) {
        return false;
      }
      if (!q) return true;
      return [item.stationName, item.stationCode, item.message]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });
  }, [allAlerts, activeSeverity, query]);

  const useLocalSearch = query.trim().length > 0;
  const totalPagesDisplay = useLocalSearch
    ? Math.max(1, Math.ceil(filteredAllAlerts.length / PAGE_SIZE))
    : Math.max(totalPages, 1);

  React.useEffect(() => {
    if (pageNumber > totalPagesDisplay) {
      setPageNumber(totalPagesDisplay);
    }
  }, [pageNumber, totalPagesDisplay]);

  const pagedAlerts = useMemo(() => {
    if (!useLocalSearch) return alerts;
    const start = (pageNumber - 1) * PAGE_SIZE;
    return filteredAllAlerts.slice(start, start + PAGE_SIZE);
  }, [alerts, filteredAllAlerts, pageNumber, useLocalSearch]);

  const sections = useMemo(() => {
    const sorted = [...pagedAlerts].sort(
      (a, b) =>
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
    );
    const groups: { title: string; items: AlertHistoryItem[] }[] = [];

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const getTitle = (date: Date) => {
      if (isSameDay(date, today)) return "Hôm nay";
      if (isSameDay(date, yesterday)) return "Hôm qua";
      return date.toLocaleDateString("vi-VN");
    };

    sorted.forEach((item) => {
      const date = new Date(item.triggeredAt);
      const title = getTitle(date);
      const last = groups[groups.length - 1];
      if (!last || last.title !== title) {
        groups.push({ title, items: [item] });
      } else {
        last.items.push(item);
      }
    });

    return groups;
  }, [pagedAlerts]);

  const paginationItems = useMemo(() => {
    if (totalPagesDisplay <= 1) return [1];
    const items: Array<number | "ellipsis"> = [];
    const add = (item: number | "ellipsis") => {
      if (items[items.length - 1] !== item) items.push(item);
    };

    const windowStart = Math.max(2, pageNumber - 1);
    const windowEnd = Math.min(totalPagesDisplay - 1, pageNumber + 1);

    add(1);
    if (windowStart > 2) add("ellipsis");
    for (let i = windowStart; i <= windowEnd; i += 1) add(i);
    if (windowEnd < totalPagesDisplay - 1) add("ellipsis");
    add(totalPagesDisplay);

    return items;
  }, [pageNumber, totalPagesDisplay]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AlertHistoryHeader
        title="Alert History"
        onBack={() => router.back()}
        colors={{
          text: colors.text,
          primary: colors.primary,
          border: colors.border,
          backgroundOverlay: colors.background,
        }}
        topInset={insets.top}
      />

      <View
        style={{
          position: "absolute",
          top: floatingTop,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          zIndex: 9,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
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
            activeSeverity={activeSeverity}
            dropdownOpen={severityDropdownOpen}
            onToggleDropdown={() => setSeverityDropdownOpen((prev) => !prev)}
            onSelectSeverity={(severity) => {
              if (severityCounts[severity] === 0) {
                Alert.alert("Không có dữ liệu", "Không có cảnh báo cho mức này.");
                return;
              }
              setPageNumber(1);
              setActiveSeverity(severity);
              setSeverityDropdownOpen(false);
            }}
            severityCounts={severityCounts}
            totalCount={totalCountAll}
            onSelectAll={() => {
              setPageNumber(1);
              setActiveSeverity("all");
              setSeverityDropdownOpen(false);
            }}
            onSelectLast30Days={() =>
              Alert.alert(
                "Chưa ra mắt",
                "Bộ lọc 30 ngày sẽ được cập nhật trong phiên bản tới.",
              )
            }
            colors={{
              primary: colors.primary,
              subtext: colors.subtext,
              chipBg: colors.chipBg,
              border: colors.border,
            }}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 14 }}>
          {isLoading ? (
            <AlertHistorySectionTitle title="Đang tải..." color={colors.subtext} />
          ) : sections.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <AlertHistorySectionTitle
                title="Không có cảnh báo nào"
                color={colors.subtext}
              />
            </View>
          ) : (
            sections.map((section) => (
              <View key={section.title} style={{ gap: 14 }}>
                <AlertHistorySectionTitle title={section.title} color={colors.subtext} />
                {section.items.map((item) => (
                  <AlertHistoryCard
                    key={item.alertId}
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
                <View style={{ height: 6 }} />
              </View>
            ))
          )}
        </View>

        <AlertHistoryPagination
          items={paginationItems}
          pageNumber={pageNumber}
          totalPages={totalPagesDisplay}
          onChangePage={setPageNumber}
          colors={{
            primary: colors.primary,
            text: colors.text,
            subtext: colors.subtext,
            border: colors.border,
            background: colors.card,
          }}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
