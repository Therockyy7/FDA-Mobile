import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { usePricingPlans } from "~/features/plans/hooks/usePricingPlans";
import PricingPlansList from "~/features/plans/components/PricingPlansList";
import { useColorScheme } from "~/lib/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function GuestProfileScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  const {
    data: plansData,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans,
    isRefetching: isRefetchingPlans,
  } = usePricingPlans();

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
  };

  const plans = plansData?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Hồ sơ của bạn</Text>
            <Text style={styles.headerSubtitle}>
              Khám phá các gói dịch vụ cảnh báo ngay
            </Text>
          </View>
          <TouchableOpacity
             style={styles.loginBtn}
             onPress={() => router.push("/(auth)/sign-in")}
          >
             <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingPlans}
            onRefresh={refetchPlans}
            tintColor={isDarkColorScheme ? "#38BDF8" : "#007AFF"}
          />
        }
      >
        {/* Loading State */}
        {isLoadingPlans && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              Đang tải danh sách các gói...
            </Text>
          </View>
        )}

        {/* Error State */}
        {plansError && !isLoadingPlans && (
          <View style={styles.stateContainer}>
            <Ionicons name="cloud-offline" size={48} color={colors.subtext} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              Không thể tải bảng giá
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

        {/* Plans Content */}
        {!isLoadingPlans && !plansError && plans.length > 0 && (
          <PricingPlansList
            plans={plans}
            currentSubscription={null}
            isAuthenticated={false}
            isLoadingPlans={isLoadingPlans}
            isLoadingSubscription={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  loginBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
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
  stateText: {
    marginTop: 12,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
