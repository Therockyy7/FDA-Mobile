// app/payment/success/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import PaymentStatusCard from "~/features/payment/components/PaymentStatusCard";
import PaymentSummaryCard from "~/features/payment/components/PaymentSummaryCard";
import { paymentService } from "~/features/payment/services/payment.service";
import {
  PaymentResultState,
  SubscriptionPaymentDto,
} from "~/features/payment/types/payment-types";
import {
  mapApiStatusToResultState,
  parseOrderCode,
} from "~/features/payment/utils/payment-utils";
import { plansSubscriptionCurrentQueryKey } from "~/features/plans/constants/queryKeys";
import { useColorScheme } from "~/lib/useColorScheme";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 60; // 60 × 3s = 3 minutes

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDarkColorScheme } = useColorScheme();
  const params = useLocalSearchParams();

  const orderCode = parseOrderCode(params.orderCode as string | undefined);

  const [resultState, setResultState] = useState<PaymentResultState>("loading");
  const [paymentData, setPaymentData] =
    useState<SubscriptionPaymentDto | null>(null);

  const pollCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const subscriptionInvalidatedRef = useRef(false);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    accent: "#0077BE",
  };

  // Poll payment status
  const pollStatus = useCallback(async () => {
    if (!orderCode || !mountedRef.current) return;

    try {
      const response = await paymentService.getPaymentStatus(orderCode);
      if (!mountedRef.current) return;

      const data = response.data;
      setPaymentData(data);

      if (data.status !== "pending") {
        // Terminal state reached – stop polling
        setResultState(mapApiStatusToResultState(data.status));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // Still pending
      pollCountRef.current += 1;
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        setResultState("timeout");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setResultState("pending");
      }
    } catch {
      // Network error during poll – just increment, keep trying
      pollCountRef.current += 1;
      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        if (mountedRef.current) {
          setResultState("timeout");
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  }, [orderCode]);

  // Start polling on mount
  useEffect(() => {
    mountedRef.current = true;

    if (!orderCode) {
      // No orderCode – show a generic success state
      setResultState("paid");
      return;
    }

    // Initial poll immediately
    pollStatus();

    // Then poll every 3 seconds
    intervalRef.current = setInterval(pollStatus, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderCode, pollStatus]);

  // Sync React Query subscription cache when payment is confirmed (avoids stale UI on Plans/Profile).
  useEffect(() => {
    if (resultState !== "paid" || subscriptionInvalidatedRef.current) return;
    subscriptionInvalidatedRef.current = true;
    queryClient.invalidateQueries({ queryKey: plansSubscriptionCurrentQueryKey });
  }, [resultState, queryClient]);

  const handleViewPlans = () => {
    router.replace("/plans/current" as any);
  };

  const handleGoBack = () => {
    router.replace("/plans" as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Kết quả thanh toán
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusSection}>
          <PaymentStatusCard status={resultState} />
        </View>

        {/* Payment Details */}
        {paymentData && resultState !== "loading" && (
          <View style={styles.detailsSection}>
            <PaymentSummaryCard payment={paymentData} />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {(resultState === "paid" || resultState === "timeout") && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              onPress={handleViewPlans}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pricetag-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.primaryBtnText}>Xem gói của tôi</Text>
            </TouchableOpacity>
          )}

          {(resultState === "cancelled" || resultState === "failed") && (
            <>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={handleGoBack}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.primaryBtnText}>
                  Quay lại chọn gói
                </Text>
              </TouchableOpacity>
            </>
          )}

          {resultState !== "loading" && resultState !== "pending" && (
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.subtext }]}>
                Quay lại gói dịch vụ
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  statusSection: {
    marginBottom: 20,
  },
  detailsSection: {
    marginBottom: 24,
  },
  actionSection: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
