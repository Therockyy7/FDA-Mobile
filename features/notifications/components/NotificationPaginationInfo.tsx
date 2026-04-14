import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

interface NotificationPaginationInfoProps {
  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}

export function NotificationPaginationInfo({
  currentPage,
  totalPages,
  onChangePage,
}: NotificationPaginationInfoProps) {
  const { isDarkColorScheme } = useColorScheme();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // JS-only dark mode exception: Ionicons color prop requires a JS value
  const iconColor = isDarkColorScheme ? "#F1F5F9" : "#1F2937";

  return (
    <View
      testID="notifications-pagination-container"
      style={styles.pagination}
    >
      <TouchableOpacity
        testID="notifications-pagination-prev"
        style={[
          styles.pageBtn,
          { opacity: hasPrev ? 1 : 0.35, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 14 },
        ]}
        onPress={() => onChangePage(Math.max(1, currentPage - 1))}
        disabled={!hasPrev}
      >
        <Ionicons name="chevron-back" size={16} color={iconColor} />
        <Text
          testID="notifications-pagination-prev-label"
          className="text-sm font-semibold text-slate-800 dark:text-slate-100"
        >
          Trước
        </Text>
      </TouchableOpacity>

      <View
        testID="notifications-pagination-info"
        style={[
          styles.pagePill,
          { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, borderWidth: 1, borderColor: isDarkColorScheme ? "#334155" : "#E2E8F0" },
        ]}
      >
        <Text
          testID="notifications-pagination-current"
          className="text-sm font-bold text-slate-800 dark:text-slate-100"
        >
          {currentPage}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">/</Text>
        <Text
          testID="notifications-pagination-total"
          className="text-sm font-bold text-slate-500 dark:text-slate-400"
        >
          {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        testID="notifications-pagination-next"
        style={[
          styles.pageBtn,
          { opacity: hasNext ? 1 : 0.35, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 14 },
        ]}
        onPress={() => onChangePage(Math.min(totalPages, currentPage + 1))}
        disabled={!hasNext}
      >
        <Text
          testID="notifications-pagination-next-label"
          className="text-sm font-semibold text-slate-800 dark:text-slate-100"
        >
          Tiếp
        </Text>
        <Ionicons name="chevron-forward" size={16} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 12,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  pagePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

export default NotificationPaginationInfo;
