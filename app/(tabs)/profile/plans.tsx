import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Text } from "~/components/ui/text";
import PlanCard from "~/features/subscription/components/PlanCard";
import { subscribeToPlan } from "~/features/subscription/stores/subscription.slice";
import type { PlanItem } from "~/features/subscription/types/subscription.types";
import { useColorScheme } from "~/lib/useColorScheme";
import { toast } from "~/utils/toast";

const PLAN_DATA: PlanItem[] = [
  {
    code: "FREE",
    name: "Gói Free",
    description: "Cảnh báo cơ bản cho người dùng miễn phí.",
    monthlyPrice: 0,
    features: ["Cảnh báo qua Push", "1 lần gửi lại", "Tần suất tiêu chuẩn"],
  },
  {
    code: "PREMIUM",
    name: "Gói Premium",
    description: "Tối ưu cảnh báo theo thời gian thực.",
    monthlyPrice: 59000,
    highlight: true,
    features: [
      "Cảnh báo nhanh hơn",
      "Kênh Push + SMS + Email",
      "Tối đa 3 lần gửi lại",
    ],
  },
  {
    code: "MONITOR",
    name: "Gói Monitor",
    description: "Theo dõi chuyên sâu cho nhóm vận hành.",
    monthlyPrice: 129000,
    features: [
      "Độ trễ thấp nhất",
      "Báo cáo theo khu vực",
      "Ưu tiên xử lý cảnh báo",
    ],
  },
];

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentTier = useAppSelector(
    (state) => state.subscription.current?.tierCode,
  );
  const currentPlanName = useAppSelector(
    (state) => state.subscription.current?.planName,
  );
  const { isDarkColorScheme } = useColorScheme();
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F9FAFB",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    sectionTitle: isDarkColorScheme ? "#60A5FA" : "#3B82F6",
    infoBg: isDarkColorScheme
      ? "rgba(96, 165, 250, 0.15)"
      : "rgba(59, 130, 246, 0.1)",
  };
  const tierCode = currentTier ?? "FREE";
  const isPaid = tierCode !== "FREE";

  const handleSubscribe = useCallback(
    async (plan: PlanItem) => {
      await dispatch(
        subscribeToPlan({ planCode: plan.code, durationMonths: 12 }),
      ).unwrap();
      toast.success("Đăng ký gói thành công.");
      router.push("/(tabs)/profile/subscription");
    },
    [dispatch, router],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
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
            Choose Your Plan
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {isPaid ? (
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              marginBottom: 16,
              marginLeft: 15,
              width: "92%",
              maxWidth: 420,
            }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
            >
              Gói đăng kí hiện tại {currentPlanName || "a paid plan"}
            </Text>
            <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 6 }}>
              Vui lòng hủy gói hiện tại trước khi chuyển đổi
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile/subscription")}
              activeOpacity={0.7}
              style={{ marginTop: 10 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.sectionTitle,
                }}
              >
                Quản lí gói
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text
            style={{ fontSize: 14, color: colors.subtext, textAlign: "center" }}
          >
            Nâng cấp để nhận cảnh báo nhanh hơn và nhiều quyền lợi hơn
          </Text>
        )}

        <View style={{ marginTop: 16 }}>
          {PLAN_DATA.map((plan) => (
            <PlanCard
              key={plan.code}
              plan={plan}
              isCurrent={currentTier === plan.code}
              isSubscribeDisabled={isPaid && currentTier !== plan.code}
              disabledReason="Vui lòng hủy gói hiện tại trước khi chuyển đổi"
              onPressSubscribe={() => handleSubscribe(plan)}
              onPressManageCancel={() =>
                router.push("/(tabs)/profile/subscription")
              }
            />
          ))}
        </View>
      </ScrollView>
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
});
