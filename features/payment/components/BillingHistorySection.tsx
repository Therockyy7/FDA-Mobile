// features/payment/components/BillingHistorySection.tsx
// A compact preview card for the Profile screen.
// Tapping "Xem tất cả" navigates to the full billing screen.
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

const BillingHistorySection: React.FC = () => {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = isDarkColorScheme;

  const colors = {
    background: isDark ? "#0F172A" : "#F8FAFB",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#1F2937",
    subtext: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    divider: isDark ? "#334155" : "#F1F5F9",
    sectionTitle: isDark ? "#38BDF8" : "#007AFF",
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* Section Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(59, 130, 246, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Ionicons name="time-outline" size={16} color={colors.sectionTitle} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
          Lịch sử thanh toán
        </Text>
      </View>

      {/* Card */}
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          shadowColor: isDark ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Tap row */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
          }}
          onPress={() => router.push("/billing" as any)}
          activeOpacity={0.7}
        >
          {/* Receipt icon */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: isDark ? "rgba(96,165,250,0.1)" : "rgba(0,119,255,0.07)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Ionicons name="receipt-outline" size={22} color={colors.sectionTitle} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
              Xem lịch sử thanh toán
            </Text>
            <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 2 }}>
              Tra cứu tất cả giao dịch của bạn
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>

        {/* Bottom CTA */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
          }}
          onPress={() => router.push("/billing" as any)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={colors.sectionTitle}
            style={{ marginRight: 6 }}
          />
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.sectionTitle }}>
            Xem tất cả giao dịch
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BillingHistorySection;
