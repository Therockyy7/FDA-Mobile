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
  const isDark = isDarkColorScheme;

  const colors = {
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    pageBtn: isDark ? "#263047" : "#F1F5F9",
    pageBtnText: isDark ? "#F1F5F9" : "#1F2937",
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;



  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        style={[styles.pageBtn, { backgroundColor: colors.pageBtn, opacity: hasPrev ? 1 : 0.35 }]}
        onPress={() => onChangePage(Math.max(1, currentPage - 1))}
        disabled={!hasPrev}
      >
        <Ionicons name="chevron-back" size={16} color={colors.pageBtnText} />
        <Text style={[styles.pageBtnText, { color: colors.pageBtnText }]}>Trước</Text>
      </TouchableOpacity>

      <View style={[styles.pagePill, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.pageLabel, { color: colors.text }]}>{currentPage}</Text>
        <Text style={[styles.pageSep, { color: colors.subtext }]}>/</Text>
        <Text style={[styles.pageLabel, { color: colors.subtext }]}>{totalPages}</Text>
      </View>

      <TouchableOpacity
        style={[styles.pageBtn, { backgroundColor: colors.pageBtn, opacity: hasNext ? 1 : 0.35 }]}
        onPress={() => onChangePage(Math.min(totalPages, currentPage + 1))}
        disabled={!hasNext}
      >
        <Text style={[styles.pageBtnText, { color: colors.pageBtnText }]}>Tiếp</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.pageBtnText} />
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  pageLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  pageSep: {
    fontSize: 14,
  },
});

export default NotificationPaginationInfo;
