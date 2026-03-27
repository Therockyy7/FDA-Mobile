// features/plans/components/PricingPlansList.tsx
import React, { useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { BillingCycle, PricingPlan, UserSubscription } from "../types/plans-types";
import BillingToggle from "./BillingToggle";
import FeatureComparisonTable from "./FeatureComparisonTable";
import PricingCard from "./PricingCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_MOBILE = SCREEN_WIDTH < 768;

type Props = {
  plans: PricingPlan[];
  currentSubscription: UserSubscription | null;
  isAuthenticated: boolean;
  isLoadingPlans?: boolean;
  isLoadingSubscription?: boolean;
  plansError?: string | null;
  subscriptionError?: string | null;
  onRetryPlans?: () => void;
  onRetrySubscription?: () => void;
};

const PricingPlansList: React.FC<Props> = ({
  plans,
  currentSubscription,
  isAuthenticated,
  isLoadingSubscription = false,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
  };

  const handleActionPress = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Đăng nhập để tiếp tục",
        "Bạn cần đăng nhập để nâng cấp gói dịch vụ.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => {} },
        ]
      );
      return;
    }

    const currentRank = currentSubscription
      ? { FREE: 0, PREMIUM: 1, MONITOR: 2 }[currentSubscription.tierCode] ?? -1
      : -1;
    const planRank = { FREE: 0, PREMIUM: 1, MONITOR: 2 }[plan.code] ?? 99;
    const action =
      planRank > currentRank ? "nâng cấp" : planRank < currentRank ? "hạ cấp" : "đăng ký";

    Alert.alert(
      `${plan.name}`,
      `Bạn muốn ${action} sang gói ${plan.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tiếp tục",
          onPress: () => {
            Alert.alert("Thông báo", "Tính năng thanh toán đang được phát triển.");
          },
        },
      ]
    );
  };

  const sortedPlans = [...plans].sort((a, b) => {
    const order: Record<string, number> = { FREE: 0, PREMIUM: 1, MONITOR: 2 };
    return (order[(a.code || "").toUpperCase()] ?? 99) - (order[(b.code || "").toUpperCase()] ?? 99);
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Billing Toggle */}
      <View style={styles.toggleSection}>
        <BillingToggle value={billingCycle} onChange={setBillingCycle} />
      </View>

      {/* Plan Cards */}
      <View style={[styles.cardsContainer, IS_MOBILE && styles.cardsVertical]}>
        {sortedPlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            currentSubscription={currentSubscription}
            isAuthenticated={isAuthenticated}
            onActionPress={handleActionPress}
            loading={isLoadingSubscription}
            isMobile={IS_MOBILE}
          />
        ))}
      </View>

      {/* Feature Comparison Table */}
      <FeatureComparisonTable plans={sortedPlans} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  toggleSection: { alignItems: "center", marginBottom: 24 },
  cardsContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  cardsVertical: {
    flexDirection: "column",
  },
});

export default PricingPlansList;
