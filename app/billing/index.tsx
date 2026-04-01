// app/billing/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { paymentService } from "~/features/payment/services/payment.service";
import { PaymentRecord } from "~/features/payment/types/payment-types";
import { useColorScheme } from "~/lib/useColorScheme";
import { StatusFilter, StatusOption } from "~/components/ui/status-filter";

const PAGE_SIZE = 10;
const HEADER_MAX_HEIGHT = 130;
const HEADER_MIN_HEIGHT = 50;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  "paid" | "pending" | "cancelled",
  { label: string; bg: string; text: string; darkBg: string; dot: string }
> = {
  paid: { label: "Đã thanh toán", bg: "#DCFCE7", text: "#16A34A", darkBg: "rgba(22,163,74,0.15)", dot: "#16A34A" },
  pending: { label: "Chờ thanh toán", bg: "#FEF9C3", text: "#B45309", darkBg: "rgba(202,138,4,0.15)", dot: "#EAB308" },
  cancelled: { label: "Đã hủy", bg: "#FEE2E2", text: "#DC2626", darkBg: "rgba(220,38,38,0.15)", dot: "#EF4444" },
};

const StatusBadge = ({ status, isDark }: { status: "paid" | "pending" | "cancelled"; isDark: boolean }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: isDark ? cfg.darkBg : cfg.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── Billing Row ──────────────────────────────────────────────────────────────
const BillingRow = ({
  record,
  colors,
  isDark,
  isLast,
}: {
  record: PaymentRecord;
  colors: Record<string, string>;
  isDark: boolean;
  isLast: boolean;
}) => {
  const date = record.paidAt ?? record.createdAt;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";
  const formattedAmount = record.amount.toLocaleString("vi-VN") + "đ";

  return (
    <View style={[styles.row, { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.divider }]}>
      <View style={[styles.planIconWrap, { backgroundColor: colors.iconBg }]}>
        <Ionicons name="receipt-outline" size={18} color={colors.accent} />
      </View>

      <View style={styles.rowMiddle}>
        <Text style={[styles.planName, { color: colors.text }]} numberOfLines={1}>
          {record.planName}
        </Text>
        <Text style={[styles.orderMeta, { color: colors.subtext }]}>
          #{record.orderCode} · {record.durationMonths} tháng · {formattedDate}
        </Text>
        <StatusBadge status={record.status} isDark={isDark} />
      </View>

      <Text style={[styles.amount, { color: colors.text }]}>{formattedAmount}</Text>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ colors, isDark, onUpgrade }: { colors: Record<string, string>; isDark: boolean; onUpgrade: () => void }) => (
  <View style={styles.emptyWrapper}>
    <View style={[styles.emptyRing, { borderColor: isDark ? "#334155" : "#CBD5E1" }]}>
      <View style={[styles.emptyInner, { backgroundColor: isDark ? "rgba(96,165,250,0.08)" : "rgba(0,119,255,0.06)" }]}>
        <Ionicons name="receipt-outline" size={42} color={colors.accent} />
      </View>
    </View>

    <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có giao dịch nào</Text>
    <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
      Sau khi nâng cấp gói dịch vụ, lịch sử thanh toán sẽ xuất hiện tại đây.
    </Text>

    <View style={[styles.hintBox, { backgroundColor: isDark ? "rgba(96,165,250,0.05)" : "rgba(0,119,255,0.03)", borderColor: isDark ? "#334155" : "#DBEAFE" }]}>
      {[
        { icon: "flash" as const, label: "Cảnh báo tức thì ưu tiên cao" },
        { icon: "chatbubble-ellipses" as const, label: "Nhận thông báo qua SMS" },
        { icon: "shield-checkmark" as const, label: "Theo dõi không giới hạn khu vực" },
      ].map((item) => (
        <View key={item.label} style={styles.hintRow}>
          <View style={[styles.hintIconWrap, { backgroundColor: isDark ? "rgba(96,165,250,0.1)" : "rgba(0,119,255,0.08)" }]}>
            <Ionicons name={item.icon} size={14} color={colors.accent} />
          </View>
          <Text style={[styles.hintText, { color: colors.subtext }]}>{item.label}</Text>
        </View>
      ))}
    </View>

    <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: colors.accent }]} onPress={onUpgrade} activeOpacity={0.82}>
      <Ionicons name="arrow-up-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
      <Text style={styles.upgradeBtnText}>Khám phá các gói dịch vụ</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BillingScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  const [page, setPage] = useState(1);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "cancelled">("all");

  const colors = {
    background: isDark ? "#0F172A" : "#F8FAFB",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    headerBg: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#1A2540" : "#F1F5F9",
    accent: isDark ? "#60A5FA" : "#007AFF",
    iconBg: isDark ? "rgba(96,165,250,0.1)" : "rgba(0,119,255,0.08)",
    pageBtn: isDark ? "#263047" : "#F1F5F9",
    pageBtnText: isDark ? "#F1F5F9" : "#1F2937",
    shadow: isDark ? "#000000" : "#94A3B8",
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payment", "history", page],
    queryFn: () => paymentService.getPaymentHistory(page, PAGE_SIZE),
    staleTime: 30_000,
  });

  const records = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const filteredRecords = records.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const filterOptions: StatusOption<"paid" | "pending" | "cancelled">[] = [
    { value: "all", label: "Tất cả" },
    { value: "paid", label: "Giao dịch thành công" },
    { value: "pending", label: "Đang chờ xử lý" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // Animated header values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const headerElevation = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 8],
    extrapolate: "clamp",
  });
  const titleSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [22, 17],
    extrapolate: "clamp",
  });
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Chỉ lấy giá trị lớn nhất thay vì cộng dồn (tránh lỗi padding kép trên Android)
  const topPad = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 20);

  const changePage = useCallback((next: number) => {
    setPage(next);
    // Scroll to top on page change
    scrollY.setValue(0);
  }, [scrollY]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.headerBg}
        translucent
      />

      {/* ── Animated Header ─── */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            paddingTop: topPad,
            height: Animated.add(headerHeight, topPad),
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            shadowColor: colors.shadow,
            elevation: headerElevation as any,
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
          },
        ]}
      >
        {/* Back button row */}
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={colors.accent} />
          </TouchableOpacity>

          <Animated.Text style={[styles.headerTitle, { color: colors.text, fontSize: titleSize as any }]}>
            Lịch sử thanh toán
          </Animated.Text>

          {/* Placeholder for symmetry */}
          <View style={{ width: 36 }} />
        </View>

        {/* Subtitle that fades on scroll */}
        <Animated.View style={{ opacity: subtitleOpacity, paddingHorizontal: 20, paddingBottom: 6 }}>
          <Text style={{ fontSize: 13, color: colors.subtext }}>
            {totalCount > 0 ? `${totalCount} giao dịch của bạn` : "Tra cứu tất cả giao dịch"}
          </Text>
        </Animated.View>

        {/* Status Filter */}
        <Animated.View style={{ opacity: subtitleOpacity, paddingBottom: 8 }}>
          <StatusFilter
            options={filterOptions}
            selected={statusFilter}
            onSelect={(val) => setStatusFilter(val as any)}
            activeColor={colors.accent}
          />
        </Animated.View>
      </Animated.View>

      {/* ── Content ─── */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + topPad + 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Loading */}
        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={[styles.stateText, { color: colors.subtext, marginTop: 14 }]}>
              Đang tải lịch sử thanh toán...
            </Text>
          </View>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <View style={styles.centerState}>
            <View style={[styles.errorIconWrap, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
              <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            </View>
            <Text style={[styles.stateText, { color: colors.text, fontWeight: "700", fontSize: 17, marginTop: 16 }]}>
              Không thể tải lịch sử
            </Text>
            <Text style={[styles.stateText, { color: colors.subtext, fontSize: 14, marginTop: 6 }]}>
              Vui lòng kiểm tra kết nối và thử lại.
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.accent, marginTop: 20 }]}
              onPress={() => refetch()}
            >
              <Ionicons name="refresh-outline" size={15} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !isError && records.length === 0 && (
          <EmptyState colors={colors} isDark={isDark} onUpgrade={() => router.push("/plans" as any)} />
        )}

        {/* Records */}
        {!isLoading && !isError && records.length > 0 && (
          <>
            {/* Summary pill */}
            <View style={[styles.summaryPill, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.summaryDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.summaryText, { color: colors.subtext }]}>
                {statusFilter === "all" ? (
                  <>Tổng <Text style={{ color: colors.text, fontWeight: "700" }}>{totalCount}</Text> giao dịch</>
                ) : (
                  <>Tìm thấy <Text style={{ color: colors.text, fontWeight: "700" }}>{filteredRecords.length}</Text> giao dịch phù hợp</>
                )}
              </Text>
            </View>

            {/* Card */}
            {filteredRecords.length > 0 ? (
              <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, shadowColor: colors.shadow }]}>
                {filteredRecords.map((r, i) => (
                  <BillingRow
                    key={r.id}
                    record={r}
                    colors={colors}
                    isDark={isDark}
                    isLast={i === filteredRecords.length - 1}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.centerState, { paddingTop: 40 }]}>
                 <View style={[styles.emptyInner, { backgroundColor: colors.iconBg, width: 72, height: 72, borderRadius: 36, marginBottom: 16 }]}>
                  <Ionicons name="filter-outline" size={32} color={colors.accent} />
                </View>
                <Text style={[styles.stateText, { color: colors.text, fontWeight: "700", fontSize: 16 }]}>Không khớp kết quả</Text>
                <Text style={[styles.stateText, { color: colors.subtext, fontSize: 13, marginTop: 4 }]}>
                  Không có giao dịch nào ở trang này khớp với bộ lọc.
                </Text>
                <TouchableOpacity 
                  style={[styles.retryBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9", marginTop: 16 }]} 
                  onPress={() => setStatusFilter("all")}
                >
                  <Text style={{ color: colors.text, fontWeight: "700" }}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Pagination */}
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, { backgroundColor: colors.pageBtn, opacity: hasPrev ? 1 : 0.35 }]}
                onPress={() => changePage(Math.max(1, page - 1))}
                disabled={!hasPrev}
              >
                <Ionicons name="chevron-back" size={16} color={colors.pageBtnText} />
                <Text style={[styles.pageBtnText, { color: colors.pageBtnText }]}>Trước</Text>
              </TouchableOpacity>

              <View style={[styles.pagePill, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.pageLabel, { color: colors.text }]}>{page}</Text>
                <Text style={[styles.pageSep, { color: colors.subtext }]}>/</Text>
                <Text style={[styles.pageLabel, { color: colors.subtext }]}>{totalPages}</Text>
              </View>

              <TouchableOpacity
                style={[styles.pageBtn, { backgroundColor: colors.pageBtn, opacity: hasNext ? 1 : 0.35 }]}
                onPress={() => changePage(Math.min(totalPages, page + 1))}
                disabled={!hasNext}
              >
                <Text style={[styles.pageBtnText, { color: colors.pageBtnText }]}>Tiếp</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.pageBtnText} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: "flex-end",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "800",
    textAlign: "center",
  },
  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  planIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  rowMiddle: {
    flex: 1,
    gap: 4,
  },
  planName: {
    fontSize: 14,
    fontWeight: "700",
  },
  orderMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
    minWidth: 72,
  },
  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  // States
  centerState: {
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  // Summary
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  summaryDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  summaryText: {
    fontSize: 13,
  },
  // Card
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  // Empty
  emptyWrapper: {
    paddingTop: 32,
    alignItems: "center",
  },
  emptyRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  emptyInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  hintBox: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 28,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hintIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  hintText: {
    fontSize: 14,
    flex: 1,
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },
  upgradeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
