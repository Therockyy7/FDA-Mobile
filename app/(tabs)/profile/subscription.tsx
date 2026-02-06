import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import TierBadge from "~/features/subscription/components/TierBadge";
import {
  cancelSubscription,
  fetchCurrentSubscription,
  selectSubscriptionCurrent,
  selectSubscriptionError,
  selectSubscriptionLoading,
} from "~/features/subscription/stores/subscription.slice";
import { useColorScheme } from "~/lib/useColorScheme";
import { toast } from "~/utils/toast";

export default function SubscriptionDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isDarkColorScheme } = useColorScheme();
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    sectionTitle: isDarkColorScheme ? "#60A5FA" : "#3B82F6",
  };
  const current = useAppSelector(selectSubscriptionCurrent);
  const loading = useAppSelector(selectSubscriptionLoading);
  const error = useAppSelector(selectSubscriptionError);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const modalColors = {
    card: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    title: isDarkColorScheme ? "#F8FAFC" : "#0F172A",
    body: isDarkColorScheme ? "#CBD5F5" : "#475569",
    keepBg: isDarkColorScheme ? "#334155" : "#E2E8F0",
    keepText: isDarkColorScheme ? "#F8FAFC" : "#0F172A",
  };

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCurrentSubscription());
    }, [dispatch]),
  );

  const handleRetry = useCallback(() => {
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  const tierCode = current?.tierCode ?? "FREE";
  const isPaid = tierCode !== "FREE";
  const isFreeTier = tierCode === "FREE";

  const handlePrimaryAction = useCallback(() => {
    if (isFreeTier) {
      router.push("/(tabs)/profile/plans");
      return;
    }
    setCancelError(null);
    setShowCancelModal(true);
  }, [isFreeTier, router]);

  const handleConfirmCancel = useCallback(async () => {
    try {
      setCancelError(null);
      await dispatch(cancelSubscription()).unwrap();
      setShowCancelModal(false);
      toast.success("Đã hủy gói đăng ký thành công.");
    } catch (err: any) {
      setCancelError(err?.message || "Không thể hủy gói đăng ký.");
    }
  }, [dispatch]);

  const startDateText = current?.startDate
    ? new Date(current.startDate).toLocaleDateString("vi-VN")
    : "Đang cập nhật";

  const endDateText = current?.endDate
    ? new Date(current.endDate).toLocaleDateString("vi-VN")
    : "Đang cập nhật";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkColorScheme ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: colors.background }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Gói đăng kí của bạn
          </Text>
          {isPaid ? (
            <TouchableOpacity
              style={[
                styles.headerChip,
                {
                  backgroundColor: isDarkColorScheme
                    ? "rgba(96,165,250,0.18)"
                    : "rgba(59,130,246,0.12)",
                  borderColor: colors.sectionTitle,
                },
              ]}
              onPress={() => router.push("/(tabs)/profile/plans")}
              activeOpacity={0.7}
              accessibilityLabel="View plans"
            >
              <Ionicons
                name="layers-outline"
                size={16}
                color={colors.sectionTitle}
              />
              <Text
                style={[styles.headerChipText, { color: colors.sectionTitle }]}
              >
                Plans
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {loading ? (
          <View
            style={{
              marginTop: 24,
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              backgroundColor: colors.cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <ActivityIndicator
              size="small"
              color={isDarkColorScheme ? "#60A5FA" : "#3B82F6"}
            />
            <Text style={{ marginTop: 12, color: colors.subtext }}>
              Đang tải thông tin gói đăng ký...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              marginTop: 24,
              padding: 20,
              backgroundColor: colors.cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
            >
              Không thể tải gói đăng ký
            </Text>
            <Text style={{ marginTop: 6, color: colors.subtext }}>{error}</Text>
            <Button onPress={handleRetry} style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
                Thử lại
              </Text>
            </Button>
          </View>
        ) : (
          <View
            style={{
              marginTop: 20,
              padding: 20,
              backgroundColor: colors.cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: colors.text }}
              >
                Gói hiện tại
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 12, color: colors.subtext }}>
                  {current?.planName || "Chưa xác định"}
                </Text>
                {current?.tierCode ? (
                  <View style={{ marginTop: 6 }}>
                    <TierBadge tier={current.tierCode} />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.sectionTitle,
                }}
              >
                {current?.tier || "Chưa xác định"}
              </Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, color: colors.subtext }}>
                Trạng thái: {current?.status || "Đang cập nhật"}
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.subtext, marginTop: 6 }}
              >
                Bắt đầu: {startDateText}
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.subtext, marginTop: 6 }}
              >
                Kết thúc: {endDateText}
              </Text>
            </View>

            {isPaid ? (
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
                onPress={() => router.push("/(tabs)/profile/plans")}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.sectionTitle,
                  }}
                >
                  So sánh gói
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.sectionTitle}
                />
              </TouchableOpacity>
            ) : null}

            <View style={{ marginTop: 16 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "800", color: colors.text }}
              >
                Quyền lợi
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.subtext, marginTop: 8 }}
              >
                Delay cao:{" "}
                {current?.dispatchDelay?.highPrioritySeconds !== undefined
                  ? `${current.dispatchDelay.highPrioritySeconds}s`
                  : "Đang cập nhật"}
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.subtext, marginTop: 6 }}
              >
                Delay thấp:{" "}
                {current?.dispatchDelay?.lowPrioritySeconds !== undefined
                  ? `${current.dispatchDelay.lowPrioritySeconds}s`
                  : "Đang cập nhật"}
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.subtext, marginTop: 6 }}
              >
                Gửi lại:{" "}
                {current?.maxRetries !== undefined
                  ? `${current.maxRetries} lần`
                  : "Đang cập nhật"}
              </Text>

              <Text
                style={{ fontSize: 13, color: colors.subtext, marginTop: 12 }}
              >
                Kênh cảnh báo
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {current?.availableChannels?.length ? (
                  current.availableChannels.map((channel) => (
                    <View
                      key={channel}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "#E0F2FE",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: "#0284C7",
                        }}
                      >
                        {channel}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.subtext }}>Đang cập nhật</Text>
                )}
              </View>
            </View>

            <Button onPress={handlePrimaryAction} style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "white" }}>
                {isFreeTier ? "Nâng Cấp" : "Hủy gói"}
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => (!loading ? setShowCancelModal(false) : null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => (!loading ? setShowCancelModal(false) : null)}
          />
          <View
            style={[styles.modalCard, { backgroundColor: modalColors.card }]}
          >
            <Text style={[styles.modalTitle, { color: modalColors.title }]}>
              Bạn muốn hủy gói?
            </Text>
            <Text style={[styles.modalBody, { color: modalColors.body }]}>
              Bạn sẽ mất đi các tiện ích của{" "}
              <Text style={{ fontWeight: "bold" }}>Premium</Text> khi chuyển về{" "}
              <Text style={{ fontWeight: "bold" }}>Free tier</Text>.
              {current?.dispatchDelay
                ? `\nCurrent delay: ${current.dispatchDelay.highPrioritySeconds}s / ${current.dispatchDelay.lowPrioritySeconds}s`
                : ""}
            </Text>

            {cancelError ? (
              <Text style={styles.modalError}>{cancelError}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.keepButton,
                  { backgroundColor: modalColors.keepBg },
                ]}
                onPress={() => setShowCancelModal(false)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.keepButtonText,
                    { color: modalColors.keepText },
                  ]}
                >
                  Tiếp Tục Gói
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmCancel}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác Nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 12,
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  headerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  headerChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  modalBody: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
  modalError: {
    marginTop: 10,
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  keepButton: {
    backgroundColor: "#E2E8F0",
  },
  keepButtonText: {
    color: "#0F172A",
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "700",
  },
});
