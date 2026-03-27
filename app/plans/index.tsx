// app/(tabs)/plans/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { usePricingPlans } from "~/features/plans/hooks/usePricingPlans";
import { useCurrentSubscription } from "~/features/plans/hooks/useCurrentSubscription";
import PricingPlansList from "~/features/plans/components/PricingPlansList";
import { useColorScheme } from "~/lib/useColorScheme";
import { useUser } from "~/features/auth/stores/hooks";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function PlansScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const user = useUser();
  const isAuthenticated = !!user;

  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans,
    isRefetching: isRefetchingPlans,
  } = usePricingPlans();

  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription,
    isRefetching: isRefetchingSubscription,
  } = useCurrentSubscription();

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    headerBg: isDarkColorScheme ? "#1E293B" : "#1B4D89",
    statusBarStyle: isDarkColorScheme ? "light-content" : "light-content" as const,
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    heroBg: isDarkColorScheme ? "#1E293B" : "rgba(213,227,255,0.3)",
    heroText: isDarkColorScheme ? "#F1F5F9" : "#0d1c32",
    heroSubtext: isDarkColorScheme ? "#94A3B8" : "#39475f",
  };

  const plans = plansData?.data ?? [];
  const subscription = subscriptionData?.subscription ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.headerBg}
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bảng giá</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>


      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingPlans || isRefetchingSubscription}
            onRefresh={() => {
              refetchPlans();
              refetchSubscription();
            }}
            tintColor={isDarkColorScheme ? "#38BDF8" : "#007AFF"}
          />
        }
      >
        {/* Hero Panel */}
        <View style={[styles.hero, { backgroundColor: colors.heroBg, paddingBottom: 24 }]}>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>
            Chọn gói phù hợp để nhận cảnh báo nhanh hơn
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.heroSubtext }]}>
            Theo dõi ngập lụt, nhận cảnh báo sớm và quản lý khu vực quan tâm hiệu quả hơn.
          </Text>
        </View>

        {/* Loading State */}
        {isLoadingPlans && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              Đang tải thông tin bảng giá...
            </Text>
          </View>
        )}

        {/* Error State */}
        {plansError && !isLoadingPlans && (
          <View style={styles.stateContainer}>
            <Ionicons name="cloud-offline" size={48} color={colors.subtext} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              Không thể tải thông tin gói cước
            </Text>
            <Text style={[styles.stateSubtitle, { color: colors.subtext }]}>
              Vui lòng kiểm tra kết nối internet và thử lại.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetchPlans()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!isLoadingPlans && !plansError && plans.length === 0 && (
          <View style={styles.stateContainer}>
            <Ionicons name="pricetag-outline" size={48} color={colors.subtext} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              Không có gói cước nào
            </Text>
            <Text style={[styles.stateSubtitle, { color: colors.subtext }]}>
              Không có thông tin bảng giá tại thời điểm này.
            </Text>
          </View>
        )}

        {/* Plans Content */}
        {!isLoadingPlans && !plansError && plans.length > 0 && (
          <PricingPlansList
            plans={plans}
            currentSubscription={subscription}
            isAuthenticated={isAuthenticated}
            isLoadingPlans={isLoadingPlans}
            isLoadingSubscription={isLoadingSubscription}
            plansError={plansError?.message ?? null}
            subscriptionError={subscriptionError?.message ?? null}
            onRetryPlans={() => refetchPlans()}
            onRetrySubscription={() => refetchSubscription()}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  stateSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  stateText: {
    marginTop: 12,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
