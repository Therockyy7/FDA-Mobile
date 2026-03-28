// app/complaints/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "~/utils/toast";
import { Text } from "~/components/ui/text";
import CreateComplaintModal from "~/features/complaints/components/CreateComplaintModal";
import { complaintService } from "~/features/complaints/services/complaint.service";
import { Complaint } from "~/features/complaints/types/complaint-types";
import { useColorScheme } from "~/lib/useColorScheme";

const HEADER_MAX_HEIGHT = 80;
const HEADER_MIN_HEIGHT = 50;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  "open" | "resolved" | "rejected",
  { label: string; bg: string; text: string; darkBg: string; dot: string }
> = {
  open: { label: "Đang xử lý", bg: "#FEF9C3", text: "#B45309", darkBg: "rgba(202,138,4,0.15)", dot: "#EAB308" },
  resolved: { label: "Đã giải quyết", bg: "#DCFCE7", text: "#16A34A", darkBg: "rgba(22,163,74,0.15)", dot: "#16A34A" },
  rejected: { label: "Bị từ chối", bg: "#FEE2E2", text: "#DC2626", darkBg: "rgba(220,38,38,0.15)", dot: "#EF4444" },
};

const StatusBadge = ({ status, isDark }: { status: "open" | "resolved" | "rejected"; isDark: boolean }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <View style={[styles.badge, { backgroundColor: isDark ? cfg.darkBg : cfg.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ colors, isDark, onNew }: { colors: Record<string, string>; isDark: boolean; onNew: () => void }) => (
  <View style={styles.emptyWrapper}>
    <View style={[styles.emptyRing, { borderColor: isDark ? "#334155" : "#CBD5E1" }]}>
      <View style={[styles.emptyInner, { backgroundColor: colors.iconBg }]}>
        <Ionicons name="chatbubbles-outline" size={42} color={colors.accent} />
      </View>
    </View>

    <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có khiếu nại nào</Text>
    <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
      Nếu bạn gặp sự cố về đăng ký hoặc thanh toán, hãy tạo khiếu nại để chúng tôi hỗ trợ.
    </Text>

    <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.accent }]} onPress={onNew} activeOpacity={0.82}>
      <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
      <Text style={styles.emptyBtnText}>Tạo khiếu nại ngay</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ComplaintsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const colors = {
    background: isDark ? "#0F172A" : "#F8FAFB",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    headerBg: isDark ? "#0F172A" : "#F8FAFB",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    accent: isDark ? "#F59E0B" : "#D97706",
    iconBg: isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(217, 119, 6, 0.1)",
    shadow: isDark ? "#000000" : "#94A3B8",
    danger: "#EF4444",
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["complaints", "my"],
    queryFn: () => complaintService.getMyComplaints(),
    staleTime: 60_000,
  });

  const records = data?.data ?? [];
  const openCount = records.filter((r) => r.status === "open").length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSubmitComplaint = async (subject: string, description: string, paymentId: string) => {
    setIsSubmitting(true);
    try {
      await complaintService.createComplaint({ subject, description, paymentId });
      toast.success("Gửi khiếu nại thành công. Chúng tôi sẽ sớm phản hồi cho bạn.");
      setIsModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["complaints", "my"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi tạo khiếu nại. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const headerElevation = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 6],
    extrapolate: "clamp",
  });
  const titleSize = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [22, 17],
    extrapolate: "clamp",
  });
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const topPad = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 20);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <Stack.Screen options={{ headerShown: false }} />

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
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={colors.accent} />
          </TouchableOpacity>

          <Animated.Text style={[styles.headerTitle, { color: colors.text, fontSize: titleSize as any }]}>
            Hỗ trợ & Khiếu nại
          </Animated.Text>

          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.iconBg }]}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: subtitleOpacity, paddingHorizontal: 20, paddingBottom: 6 }}>
          <Text style={{ fontSize: 13, color: colors.subtext }}>
            {records.length > 0 ? `${openCount} khiếu nại đang chờ xử lý` : "Phiếu hỗ trợ của bạn"}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* ── Content ─── */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + topPad + 16,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 100, // extra padding for FAB if needed
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.accent]} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={[styles.stateText, { color: colors.subtext, marginTop: 14 }]}>
              Đang tải danh sách khiếu nại...
            </Text>
          </View>
        )}

        {!isLoading && isError && (
          <View style={styles.centerState}>
            <View style={[styles.errorIconWrap, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
            </View>
            <Text style={[styles.stateTitle, { color: colors.text }]}>Không thể tải dữ liệu</Text>
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              Vui lòng kiểm tra kết nối internet và thử lại.
            </Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.accent }]} onPress={() => refetch()}>
              <Ionicons name="refresh-outline" size={15} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && records.length === 0 && (
          <EmptyState colors={colors} isDark={isDark} onNew={() => setIsModalVisible(true)} />
        )}

        {!isLoading && !isError && records.length > 0 && (
          <View style={{ gap: 16 }}>
            {records.map((r: Complaint) => {
              const formattedDate = new Date(r.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
              });
              
              return (
                <View key={r.id} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border, shadowColor: colors.shadow }]}>
                  <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.dateText, { color: colors.subtext }]}>{formattedDate}</Text>
                    <StatusBadge status={r.status} isDark={isDark} />
                  </View>
                  
                  <View style={styles.cardBody}>
                    <Text style={[styles.subjectText, { color: colors.text }]}>{r.subject}</Text>
                    <Text style={[styles.descText, { color: colors.subtext }]}>{r.description}</Text>
                  </View>

                  {r.adminResponse && (
                    <View style={[styles.adminResponseBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <View style={styles.adminHeader}>
                        <Ionicons name="headset" size={14} color={colors.accent} style={{ marginRight: 6 }} />
                        <Text style={[styles.adminTitle, { color: colors.accent }]}>Phản hồi từ Admin</Text>
                      </View>
                      <Text style={[styles.adminResponseText, { color: colors.text }]}>{r.adminResponse}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>

      {/* ── Floating Action Button ─── */}
      {!isLoading && !isError && records.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.accent, bottom: insets.bottom + 24 }]}
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.fabText}>Tạo mới</Text>
        </TouchableOpacity>
      )}

      {/* ── Create Modal ─── */}
      <CreateComplaintModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitComplaint}
        loading={isSubmitting}
      />
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
  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  // States
  centerState: { paddingTop: 60, alignItems: "center", paddingHorizontal: 24 },
  stateTitle: { fontSize: 17, fontWeight: "700", marginTop: 16, marginBottom: 6 },
  stateText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  errorIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  retryBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 20 },
  // Empty
  emptyWrapper: { paddingTop: 40, alignItems: "center" },
  emptyRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginBottom: 28 },
  emptyInner: { width: 84, height: 84, borderRadius: 42, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 21, fontWeight: "800", marginBottom: 10, textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 28, paddingHorizontal: 16 },
  emptyBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  emptyBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  // Card List
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  dateText: { fontSize: 13, fontWeight: "500" },
  cardBody: { padding: 16 },
  subjectText: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 22 },
  adminResponseBox: { marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 12, borderWidth: 1 },
  adminHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  adminTitle: { fontSize: 12, fontWeight: "700" },
  adminResponseText: { fontSize: 14, lineHeight: 20 },
  // FAB
  fab: { position: "absolute", right: 20, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, borderRadius: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabText: { color: "#FFF", fontSize: 15, fontWeight: "700", marginLeft: 6 },
});
