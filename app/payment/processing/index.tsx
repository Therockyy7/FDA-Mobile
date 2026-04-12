// app/payment/processing/index.tsx
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import PaymentStateIllustration from "~/features/payment/components/PaymentStateIllustration";
import { useColorScheme } from "~/lib/useColorScheme";

type FlowPhase = "opening" | "returned" | "error";

/**
 * Processing screen – opens PayOS in an in-app / custom tab browser.
 * After the browser session ends, we show a "returned" state so the user
 * is not stuck on an endless spinner (common when paying on the same device).
 *
 * Params:
 *   paymentUrl – PayOS checkout URL
 *   orderCode  – passed through to /payment/success for status polling
 */
export default function PaymentProcessingScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const params = useLocalSearchParams<{
    paymentUrl?: string;
    orderCode?: string;
  }>();

  const [flowPhase, setFlowPhase] = useState<FlowPhase>("opening");
  const openedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    accent: "#0077BE",
  };

  const clearOpenTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openPayment = useCallback(async () => {
    const url = params.paymentUrl;
    if (!url) {
      setFlowPhase("error");
      return;
    }

    setFlowPhase("opening");
    openedRef.current = false;
    clearOpenTimeout();

    timeoutRef.current = setTimeout(() => {
      if (!openedRef.current) {
        setFlowPhase("error");
      }
    }, 5000);

    try {
      await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: "close",
        showTitle: true,
        enableBarCollapsing: true,
      });
      openedRef.current = true;
      clearOpenTimeout();
      setFlowPhase("returned");
    } catch {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          openedRef.current = true;
          clearOpenTimeout();
          setFlowPhase("returned");
        } else {
          clearOpenTimeout();
          setFlowPhase("error");
        }
      } catch {
        clearOpenTimeout();
        setFlowPhase("error");
      }
    }
  }, [params.paymentUrl]);

  useEffect(() => {
    openPayment();
    return () => {
      clearOpenTimeout();
    };
  }, [openPayment]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/plans" as any);
    }
  };

  const handleCheckPaymentResult = () => {
    const oc = params.orderCode;
    router.replace({
      pathname: "/payment/success",
      params:
        oc != null && String(oc).length > 0
          ? { orderCode: String(oc) }
          : {},
    } as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {flowPhase === "opening" && (
          <PaymentStateIllustration
            variant="processing"
            title="Đang chuyển đến cổng thanh toán..."
            subtitle="Vui lòng không đóng ứng dụng. Bạn sẽ được chuyển đến PayOS để hoàn tất thanh toán."
          />
        )}

        {flowPhase === "returned" && (
          <>
            <PaymentStateIllustration
              variant="returned"
              title="Bạn đã quay lại ứng dụng"
              subtitle="Nếu bạn đã chuyển khoản hoặc hoàn tất trên PayOS, hãy kiểm tra kết quả thanh toán. Bạn cũng có thể mở lại trang PayOS nếu cần."
            />
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={handleCheckPaymentResult}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.primaryBtnText}>Kiểm tra kết quả thanh toán</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={openPayment}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="open-outline"
                  size={18}
                  color={colors.subtext}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.secondaryBtnText, { color: colors.subtext }]}>
                  Mở lại trang thanh toán
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={handleGoBack}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={18}
                  color={colors.subtext}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.secondaryBtnText, { color: colors.subtext }]}>
                  Quay lại chọn gói
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {flowPhase === "error" && (
          <>
            <PaymentStateIllustration
              variant="error"
              title="Không thể mở cổng thanh toán"
              subtitle="Đã xảy ra lỗi khi chuyển đến trang thanh toán. Vui lòng thử lại."
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                onPress={openPayment}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.primaryBtnText}>Thử lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={handleGoBack}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={18}
                  color={colors.subtext}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.secondaryBtnText, { color: colors.subtext }]}>
                  Quay lại chọn gói
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
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
