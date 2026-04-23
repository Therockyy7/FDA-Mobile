// app/alerts/history/index.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AlertHistoryCard from "~/features/alerts/components/alert-history/AlertHistoryCard";
import AlertHistoryChips from "~/features/alerts/components/alert-history/AlertHistoryChips";
import AlertHistoryFooter from "~/features/alerts/components/alert-history/AlertHistoryFooter";
import AlertHistoryHeader from "~/features/alerts/components/alert-history/AlertHistoryHeader";
import AlertHistorySectionTitle from "~/features/alerts/components/alert-history/AlertHistorySectionTitle";
import AlertHistorySearchBar from "~/features/alerts/components/alert-history/AlertHistorySearchBar";
import { useAlertHistoryData } from "~/features/alerts/hooks/useAlertHistoryData";
import { useAlertHistoryInfiniteQuery } from "~/features/alerts/hooks/useAlertHistoryInfiniteQuery";
import type { AlertHistoryItem } from "~/features/alerts/types/alert-history.types";
import { useColorScheme } from "~/lib/useColorScheme";
import { useTranslation } from "~/features/i18n";

export default function AlertHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();
  const PAGE_SIZE = 10;

  const colors = useMemo(
    () => ({
      primary: "#137fec",
      background: isDarkColorScheme ? "#101922" : "#f6f7f8",
      card: isDarkColorScheme ? "rgba(30,41,59,0.4)" : "#FFFFFF",
      text: isDarkColorScheme ? "#FFFFFF" : "#0B1A33",
      subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
      border: isDarkColorScheme ? "#334155" : "#E2E8F0",
      chipBg: isDarkColorScheme ? "rgba(30,41,59,0.9)" : "#FFFFFF",
      mutedBg: isDarkColorScheme ? "rgba(15,23,42,0.5)" : "#F8FAFC",
      divider: isDarkColorScheme
        ? "rgba(148,163,184,0.2)"
        : "rgba(15,23,42,0.08)",
      overlay: isDarkColorScheme
        ? "rgba(16,25,34,0.85)"
        : "rgba(246,247,248,0.85)",
    }),
    [isDarkColorScheme],
  );

  const [query, setQuery] = useState("");
  const [activeSeverity, setActiveSeverity] = useState<
    "all" | "critical" | "warning" | "caution"
  >("all");
  const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false);

  // ── Infinite scroll query (main data) ──────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useAlertHistoryInfiniteQuery({
    pageSize: PAGE_SIZE,
    severity: activeSeverity === "all" ? undefined : activeSeverity,
  });

  // ── Page info from last loaded page ───────────────────────────────────
  const pageInfo = useMemo(() => {
    if (!data) return { currentPage: 1, totalPages: 1 };
    const lastPage = data.pages[data.pages.length - 1];
    return {
      currentPage: lastPage?.pageNumber ?? 1,
      totalPages: lastPage?.totalPages ?? 1,
    };
  }, [data]);

  const allPages = useMemo(() => data?.pages ?? [], [data]);

  // ── Severity counts (separate query, low pageSize, just for chips) ───────
  const {
    totalCountAll,
    severityCounts,
    refresh: refreshCounts,
  } = useAlertHistoryData({
    pageNumber: 1,
    pageSize: 50,
    severity: undefined,
  });

  // ── Flatten all pages into one array ─────────────────────────────────────
  const flatAlerts = useMemo(
    () => allPages.flatMap((page) => page.alerts ?? []),
    [allPages],
  );

  // ── Search filter (client-side, across all loaded pages) ─────────────────
  const filteredAlerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatAlerts;
    return flatAlerts.filter((item) => {
      return [item.stationName, item.stationCode, item.message]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });
  }, [flatAlerts, query]);

  // ── Group by date for section headers ────────────────────────────────────
  const sections = useMemo(() => {
    const sorted = [...filteredAlerts].sort(
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
      if (isSameDay(date, today)) return t("alerts.today");
      if (isSameDay(date, yesterday)) return t("alerts.yesterday");
      return date.toLocaleDateString();
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
  }, [filteredAlerts]);

  // Flat list needs a flat array with section headers
  type ListRow =
    | { kind: "section"; title: string }
    | { kind: "item"; item: AlertHistoryItem };

  const listData = useMemo<ListRow[]>(() => {
    const rows: ListRow[] = [];
    sections.forEach((section) => {
      rows.push({ kind: "section", title: section.title });
      section.items.forEach((item) => rows.push({ kind: "item", item }));
    });
    return rows;
  }, [sections]);

  const handleRefresh = useCallback(() => {
    refetch();
    refreshCounts();
  }, [refetch, refreshCounts]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const headerHeight = insets.top + 56;
  const floatingTop = headerHeight;
  const floatingHeight = 108;
  const contentPaddingTop = floatingTop + floatingHeight + 8;

  const renderItem = ({ item }: { item: ListRow }) => {
    if (item.kind === "section") {
      return (
        <View style={{ paddingHorizontal: 8, paddingTop: 6, paddingBottom: 4 }}>
          <AlertHistorySectionTitle title={item.title} color={colors.subtext} />
        </View>
      );
    }
    return (
      <View style={{ paddingHorizontal: 8 }}>
        <AlertHistoryCard
          item={item.item}
          onPress={() => router.push(`/alerts/history/${item.item.alertId}` as any)}
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
      </View>
    );
  };

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <AlertHistorySectionTitle title={t("alerts.history.loading")} color={colors.subtext} />
        </View>
      );
    }
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <AlertHistorySectionTitle title={t("alerts.history.empty")} color={colors.subtext} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AlertHistoryHeader
        title={t("alerts.history")}
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
          placeholder="Tìm kiếm theo trạm hoặc khu vực..."
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
              if (severity !== "all" && severityCounts[severity] === 0) {
                Alert.alert(t("alerts.history.noDataForLevel"), t("alerts.history.noDataForLevel"));
                return;
              }
              setActiveSeverity(severity);
              setSeverityDropdownOpen(false);
            }}
            severityCounts={severityCounts}
            totalCount={totalCountAll}
            onSelectAll={() => setActiveSeverity("all")}
            onSelectLast30Days={() =>
              Alert.alert("Chưa ra mắt", "Bộ lọc 30 ngày sẽ được cập nhật trong phiên bản tới.")
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

      <FlatList
        data={listData}
        keyExtractor={(item, index) =>
          item.kind === "section" ? `section-${item.title}-${index}` : item.item.alertId
        }
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingBottom: 24,
          paddingHorizontal: 8,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={
          <AlertHistoryFooter
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={loadMore}
            currentPage={pageInfo.currentPage}
            totalPages={pageInfo.totalPages}
            textColor={colors.text}
            inactiveBg={isDarkColorScheme ? "#1E293B" : "#E2E8F0"}
            inactiveBorder={colors.border}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}
