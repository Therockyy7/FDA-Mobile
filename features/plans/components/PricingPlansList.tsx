// features/plans/components/PricingPlansList.tsx
import React, { useState } from "react";
import { Alert, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "~/lib/useColorScheme";
import { BillingCycle, PricingPlan, UserSubscription } from "../types/plans-types";
import BillingToggle from "./BillingToggle";
import FeatureComparisonTable from "./FeatureComparisonTable";
import PricingCard from "./PricingCard";

// Payment components
import DurationSelectionModal from "~/features/payment/components/DurationSelectionModal";
import DowngradeConfirmDialog from "~/features/payment/components/DowngradeConfirmDialog";
import { paymentService } from "~/features/payment/services/payment.service";
import { DurationMonths } from "~/features/payment/types/payment-types";
import {
  PAYMENT_CANCEL_URL,
  PAYMENT_RETURN_URL,
} from "~/features/payment/utils/payment-utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_MOBILE = SCREEN_WIDTH < 768;

const getPlanRank = (code: string): number => {
  const map: Record<string, number> = { FREE: 0, PREMIUM: 1, MONITOR: 2 };
  return map[(code || "").toUpperCase()] ?? 99;
};

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
  const router = useRouter();
  const queryClient = useQueryClient();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  // Upgrade flow state
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Downgrade flow state
  const [downgradeDialogVisible, setDowngradeDialogVisible] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);

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
      ? getPlanRank(currentSubscription.tierCode || currentSubscription.tier || "")
      : -1;
    const planRank = getPlanRank(plan.code);
    const isCurrentPlan =
      currentSubscription &&
      (currentSubscription.tierCode?.toUpperCase() === plan.code.toUpperCase());

    if (isCurrentPlan) return;

    if (plan.code === "FREE") {
      // Downgrade to FREE – show confirmation dialog
      setDowngradeDialogVisible(true);
    } else if (planRank > currentRank) {
      // Upgrade – show duration selection
      setSelectedPlan(plan);
      setDurationModalVisible(true);
    } else if (planRank < currentRank) {
      // Downgrade to a paid plan – also treat as upgrade (new subscription)
      setSelectedPlan(plan);
      setDurationModalVisible(true);
    }
  };

  // ─── Upgrade: create payment link → navigate to processing ───────────
  const handleUpgradeConfirm = async (durationMonths: DurationMonths) => {
    if (!selectedPlan) return;

    setPaymentLoading(true);
    try {
      const response = await paymentService.createPaymentLink({
        planCode: selectedPlan.code as "PREMIUM" | "MONITOR",
        durationMonths,
        returnUrl: PAYMENT_RETURN_URL,
        cancelUrl: PAYMENT_CANCEL_URL,
      });

      setDurationModalVisible(false);
      setSelectedPlan(null);

      if (response.success && response.data?.paymentUrl) {
        // Navigate to processing screen with the payment URL
        router.push({
          pathname: "/payment/processing" as any,
          params: {
            paymentUrl: response.data.paymentUrl,
            orderCode: String(response.data.orderCode),
          },
        });
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Không thể tạo đường dẫn thanh toán. Vui lòng thử lại."
        );
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 400) {
        Alert.alert("Lỗi", message || "Thời hạn không hợp lệ. Vui lòng chọn lại.");
      } else if (status === 404) {
        Alert.alert("Lỗi", "Gói dịch vụ không tìm thấy. Vui lòng thử lại.");
      } else {
        Alert.alert(
          "Lỗi kết nối",
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet."
        );
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // ─── Downgrade to FREE ───────────────────────────────────────────────
  const handleDowngradeConfirm = async () => {
    setDowngradeLoading(true);
    console.log("🔽 [PricingPlansList] handleDowngradeConfirm called");
    try {
      const response = await paymentService.downgradeToFree();
      console.log("🔽 [PricingPlansList] downgrade response:", JSON.stringify(response));

      setDowngradeDialogVisible(false);

      if (response.success) {
        // Invalidate subscription cache
        await queryClient.invalidateQueries({
          queryKey: ["plans", "subscription", "current"],
        });

        Alert.alert(
          "Hạ cấp thành công",
          "Gói dịch vụ của bạn đã được chuyển về Miễn phí.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/plans" as any),
            },
          ]
        );
      } else {
        console.warn("🔽 [PricingPlansList] downgrade response.success is false:", response);
        Alert.alert("Lỗi", response.message || "Không thể hạ cấp gói. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("🔽 [PricingPlansList] downgrade CAUGHT error:");
      console.error("  → error.response?.status:", error?.response?.status);
      console.error("  → error.response?.data:", JSON.stringify(error?.response?.data));
      console.error("  → error.message:", error?.message);
      console.error("  → full error:", error);

      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;

      if (status === 404) {
        Alert.alert("Lỗi", serverMessage || "Gói dịch vụ không tìm thấy.");
      } else if (status === 400) {
        Alert.alert("Lỗi", serverMessage || "Yêu cầu không hợp lệ.");
      } else {
        Alert.alert(
          "Lỗi",
          serverMessage || `Không thể hạ cấp gói dịch vụ (HTTP ${status || "unknown"}). Vui lòng thử lại sau.`
        );
      }
    } finally {
      setDowngradeLoading(false);
    }
  };

  const sortedPlans = [...plans].sort((a, b) => {
    const order: Record<string, number> = { FREE: 0, PREMIUM: 1, MONITOR: 2 };
    return (order[(a.code || "").toUpperCase()] ?? 99) - (order[(b.code || "").toUpperCase()] ?? 99);
  });

  return (
    <>
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

      {/* Duration Selection Modal (Upgrade) */}
      {selectedPlan && (
        <DurationSelectionModal
          visible={durationModalVisible}
          onClose={() => {
            setDurationModalVisible(false);
            setSelectedPlan(null);
          }}
          onConfirm={handleUpgradeConfirm}
          planName={selectedPlan.name}
          planCode={selectedPlan.code}
          pricePerMonth={selectedPlan.priceMonth}
          loading={paymentLoading}
        />
      )}

      {/* Downgrade Confirmation Dialog */}
      <DowngradeConfirmDialog
        visible={downgradeDialogVisible}
        onClose={() => setDowngradeDialogVisible(false)}
        onConfirm={handleDowngradeConfirm}
        loading={downgradeLoading}
        currentPlanName={currentSubscription?.planName}
      />
    </>
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
