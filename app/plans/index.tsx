// app/(tabs)/plans/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useUser } from "~/features/auth/stores/hooks";
import PricingPlansList from "~/features/plans/components/PricingPlansList";
import { useCurrentSubscription } from "~/features/plans/hooks/useCurrentSubscription";
import { usePricingPlans } from "~/features/plans/hooks/usePricingPlans";
import { useColorScheme } from "~/lib/useColorScheme";
import { useTranslation } from "~/features/i18n";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function PlansScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const user = useUser();
  const isAuthenticated = !!user;
  const { t } = useTranslation();

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
    statusBarStyle: isDarkColorScheme
      ? "light-content"
      : ("light-content" as const),
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

  const plans = plansData?.data ?? [];
  const subscription = subscriptionData?.subscription ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={[
          isDarkColorScheme ? "#1E3A5F" : "#007AFF",
          isDarkColorScheme ? "#0F172A" : "#1D4ED8",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("plans.title")}</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

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
        {/* Loading State */}
        {isLoadingPlans && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              {t("plans.loadingInfo")}
            </Text>
          </View>
        )}

        {/* Error State */}
        {plansError && !isLoadingPlans && (
          <View style={styles.stateContainer}>
            <Ionicons name="cloud-offline" size={48} color={colors.subtext} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              {t("plans.loadError")}
            </Text>
            <Text style={[styles.stateSubtitle, { color: colors.subtext }]}>
              {t("common.retry")}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetchPlans()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!isLoadingPlans && !plansError && plans.length === 0 && (
          <View style={styles.stateContainer}>
            <Ionicons
              name="pricetag-outline"
              size={48}
              color={colors.subtext}
            />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              {t("plans.empty")}
            </Text>
            <Text style={[styles.stateSubtitle, { color: colors.subtext }]}>
              {t("plans.emptyDesc")}
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
            plansError={null}
            subscriptionError={
              subscriptionError ? (subscriptionError as Error).message : null
            }
            onRetryPlans={() => refetchPlans()}
            onRetrySubscription={() => refetchSubscription()}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Platform.OS === "ios" ? 0 : 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
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
