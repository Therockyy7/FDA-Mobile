// app/payment/cancel/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import PaymentStateIllustration from "~/features/payment/components/PaymentStateIllustration";
import { useColorScheme } from "~/lib/useColorScheme";

export default function PaymentCancelScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const params = useLocalSearchParams();

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    accent: "#0077BE",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
  };

  const handleGoBack = () => {
    router.replace("/plans" as any);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Illustration */}
        <PaymentStateIllustration
          variant="cancel"
          title="Thanh toán đã bị hủy"
          subtitle="Giao dịch thanh toán của bạn đã bị hủy. Bạn có thể quay lại để chọn gói dịch vụ phù hợp bất cứ lúc nào."
        />

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.subtext}
            style={{ marginRight: 8, marginTop: 1 }}
          />
          <Text
            style={[styles.infoText, { color: colors.subtext }]}
          >
            Không có khoản thanh toán nào được thực hiện. Gói dịch vụ hiện tại
            của bạn không bị ảnh hưởng.
          </Text>
        </View>

        {/* Action */}
        <View style={styles.actionSection}>
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
            <Text style={styles.primaryBtnText}>Quay lại chọn gói</Text>
          </TouchableOpacity>
        </View>
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
  infoBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    flex: 1,
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
});
