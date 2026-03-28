import React, { useEffect, useState } from "react";
import { 
  Alert, 
  Dimensions, 
  StyleSheet, 
  View, 
  Platform, 
  StatusBar,
} from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  FadeInDown,
} from "react-native-reanimated";
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
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
const SIDE_SPACING = (SCREEN_WIDTH - CARD_WIDTH - CARD_MARGIN * 2) / 2;

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

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  // Upgrade flow state
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Downgrade flow state
  const [downgradeDialogVisible, setDowngradeDialogVisible] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);

  // ─── Animation Shared Values ───────────────────────────────────────────────
  const scrollX = useSharedValue(0);
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // ─── Guided Tour Animation ──────────────────────────────────────────────────
  useEffect(() => {
    // Spotlight/Guided Tour: Move through plans (Free -> Premium -> Monitor)
    // Then snap back to Premium (index 1) which is usually the best choice
    const premiumIdx = 1;
    
    const runTour = () => {
        if (!scrollViewRef.current) return;
        
        // Sequence: Start -> Plan 2 (Monitor) -> Snap back to Plan 1 (Premium)
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ x: SNAP_INTERVAL * 2, animated: true });
            
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: SNAP_INTERVAL * 1, animated: true });
            }, 1000);
        }, 1200);
    };

    runTour();
  }, []);

  const handleActionPress = (plan: PricingPlan) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Đăng nhập để tiếp tục",
        "Bạn cần đăng nhập để nâng cấp gói dịch vụ.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => router.push("/auth/login" as any) },
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
        Alert.alert("Lỗi", response.message || "Không thể tạo thanh toán.");
      }
    } catch (error: any) {
        Alert.alert("Lỗi", "Đã có sự cố xảy ra. Vui lòng thử lại sau.");
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
        await queryClient.invalidateQueries({ queryKey: ["plans", "subscription", "current"] });
        Alert.alert("Hạ cấp thành công", "Gói dịch vụ đã về Miễn phí.");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể hạ cấp.");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Vui lòng thử lại sau.");
    } finally {
      setDowngradeLoading(false);
    }
  };

  const sortedPlans = [...plans].sort((a, b) => getPlanRank(a.code) - getPlanRank(b.code));

  return (
    <View style={[styles.mainWrapper, { backgroundColor: isDark ? "#0F172A" : "#F8FAFB" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Billing Toggle (Fixed at top of content) */}
        <Animated.View 
            entering={FadeInDown.duration(600).delay(200)}
            style={styles.toggleContainer}
        >
          <BillingToggle value={billingCycle} onChange={setBillingCycle} />
        </Animated.View>

        {/* Snapping Carousel */}
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
        >
          {sortedPlans.map((plan, index) => (
            <Animated.View 
                key={plan.id}
                entering={FadeInDown.duration(800).delay(400 + index * 150)}
            >
              <PricingCard
                plan={plan}
                index={index}
                scrollX={scrollX}
                billingCycle={billingCycle}
                currentSubscription={currentSubscription}
                isAuthenticated={isAuthenticated}
                onActionPress={handleActionPress}
                loading={isLoadingSubscription}
                isMobile={true}
              />
            </Animated.View>
          ))}
        </Animated.ScrollView>

        {/* Feature Comparison Section */}
        <Animated.View 
            entering={FadeInDown.duration(800).delay(1000)}
            style={styles.comparisonWrapper}
        >
          <FeatureComparisonTable plans={sortedPlans} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Modals */}
      {selectedPlan && (
        <DurationSelectionModal
          visible={durationModalVisible}
          onClose={() => { setDurationModalVisible(false); setSelectedPlan(null); }}
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
    paddingTop: 20,
    paddingBottom: 60,
  },
  toggleContainer: {
    alignItems: "center",
    marginBottom: 32,
    zIndex: 10,
  },
  carouselContent: {
    paddingHorizontal: SIDE_SPACING - CARD_MARGIN,
    paddingBottom: 40,
  },
  comparisonWrapper: {
      paddingHorizontal: 20,
      marginTop: 20,
  },
});

export default PricingPlansList;
