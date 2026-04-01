// app/payment/processing/index.tsx
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import PaymentStateIllustration from "~/features/payment/components/PaymentStateIllustration";
import { useColorScheme } from "~/lib/useColorScheme";

/**
 * Processing screen – shows a loading state while we attempt to open
 * the PayOS checkout URL in the system browser. If the open fails
 * within 5 seconds we show a retry / go-back UI.
 *
 * Navigation params expected:
 *   paymentUrl – the PayOS checkout URL
 *   orderCode  – (optional) saved for reference
 */
export default function PaymentProcessingScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const params = useLocalSearchParams<{
    paymentUrl?: string;
    orderCode?: string;
  }>();

  const [error, setError] = useState(false);
  const openedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    accent: "#0077BE",
  };

  // Attempt to open payment URL
  const openPayment = useCallback(async () => {
    const url = params.paymentUrl;
    if (!url) {
      setError(true);
      return;
    }

    setError(false);
    openedRef.current = false;

    // Set a 5-second timeout for failure detection
    timeoutRef.current = setTimeout(() => {
      if (!openedRef.current) {
        setError(true);
      }
    }, 5000);

    try {
      // Try expo-web-browser first (opens an in-app browser on iOS,
      // Chrome Custom Tab on Android)
      const result = await WebBrowser.openBrowserAsync(url, {
        dismissButtonStyle: "close",
        showTitle: true,
        enableBarCollapsing: true,
      });
      openedRef.current = true;

      // When the browser closes, the user returns here.
      // If the user completed payment, PayOS would have deep-linked
      // to /payment/success. If they just closed the browser, we stay here.
      if (result.type === "cancel" || result.type === "dismiss") {
        // User closed the browser without completing
        // Stay on this screen – they can retry or go back
      }
    } catch {
      // Fallback to Linking.openURL
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          openedRef.current = true;
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    }

    // Clear timeout if we got here without error
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [params.paymentUrl]);

  useEffect(() => {
    openPayment();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [openPayment]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/plans" as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {!error ? (
          <>
            {/* Processing state */}
            <PaymentStateIllustration
              variant="processing"
              title="Đang chuyển đến cổng thanh toán..."
              subtitle="Vui lòng không đóng ứng dụng. Bạn sẽ được chuyển đến PayOS để hoàn tất thanh toán."
            />
          </>
        ) : (
          <>
            {/* Error state */}
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
                style={[
                  styles.secondaryBtn,
                  { borderColor: colors.border },
                ]}
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
