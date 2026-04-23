import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useColorScheme } from "~/lib/useColorScheme";
import { useTranslation } from "~/features/i18n";
import { BillingCycle, PricingPlan, UserSubscription } from "../types/plans-types";
import BillingToggle from "./BillingToggle";
import FeatureComparisonTable from "./FeatureComparisonTable";
import PricingCard from "./PricingCard";

// Payment
import DurationSelectionModal from "~/features/payment/components/DurationSelectionModal";
import DowngradeConfirmDialog from "~/features/payment/components/DowngradeConfirmDialog";
import { paymentService } from "~/features/payment/services/payment.service";
import { plansSubscriptionCurrentQueryKey } from "~/features/plans/constants/queryKeys";
import { DurationMonths } from "~/features/payment/types/payment-types";
import {
  PAYMENT_CANCEL_URL,
  PAYMENT_RETURN_URL,
} from "~/features/payment/utils/payment-utils";

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
  const isDark = isDarkColorScheme;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  // Upgrade flow
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Downgrade flow
  const [downgradeDialogVisible, setDowngradeDialogVisible] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);

  const sortedPlans = [...plans].sort(
    (a, b) => getPlanRank(a.code) - getPlanRank(b.code),
  );

  const handleActionPress = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      Alert.alert(
        t("auth.loginRequired.title"),
        t("auth.loginRequired.descUpgrade"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("auth.login"),
            onPress: () => router.push("/(auth)/sign-in" as any),
          },
        ],
      );
      return;
    }

    const currentRank = currentSubscription
      ? getPlanRank(currentSubscription.tierCode || currentSubscription.tier || "")
      : -1;
    const planRank = getPlanRank(plan.code);
    const isCurrentPlan =
      currentSubscription &&
      (currentSubscription.tierCode?.toUpperCase() ===
        plan.code.toUpperCase() ||
        currentSubscription.tier?.toUpperCase() === plan.code.toUpperCase());

    if (isCurrentPlan) return;

    if (plan.code === "FREE") {
      setDowngradeDialogVisible(true);
    } else {
      setSelectedPlan(plan);
      setDurationModalVisible(true);
    }
  };

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
        router.push({
          pathname: "/payment/processing" as any,
          params: {
            paymentUrl: response.data.paymentUrl,
            orderCode: String(response.data.orderCode),
          },
        });
      } else {
        Alert.alert(t("common.error"), response.message || t("plans.payment.createError"));
      }
    } catch {
      Alert.alert(t("common.error"), t("common.error.generic"));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDowngradeConfirm = async () => {
    setDowngradeLoading(true);
    try {
      const response = await paymentService.downgradeToFree();
      setDowngradeDialogVisible(false);
      if (response.success) {
        await queryClient.invalidateQueries({
          queryKey: plansSubscriptionCurrentQueryKey,
        });
        Alert.alert(t("plans.downgrade.success"), t("plans.downgrade.successDesc"));
      } else {
        Alert.alert(t("common.error"), response.message || t("plans.downgrade.error"));
      }
    } catch {
      Alert.alert(t("common.error"), t("common.error.generic"));
    } finally {
      setDowngradeLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.mainWrapper,
        { backgroundColor: isDark ? "#0F172A" : "#F8FAFB" },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Comparison Table */}
        <View style={styles.comparisonContainer}>
          <FeatureComparisonTable plans={sortedPlans} />
        </View>

        {/* Billing Toggle */}
        <View style={styles.toggleContainer}>
          <BillingToggle
            value={billingCycle}
            onChange={setBillingCycle}
          />
        </View>

        {/* Plan Cards */}
        <View style={styles.cardsContainer}>
          {sortedPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              currentSubscription={currentSubscription}
              isAuthenticated={isAuthenticated}
              onActionPress={handleActionPress}
              loading={isLoadingSubscription}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
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
      <DowngradeConfirmDialog
        visible={downgradeDialogVisible}
        onClose={() => setDowngradeDialogVisible(false)}
        onConfirm={handleDowngradeConfirm}
        loading={downgradeLoading}
        currentPlanName={currentSubscription?.planName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  toggleContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 0,
  },
  comparisonContainer: {
    marginTop: 0,
  },
});

export default PricingPlansList;
