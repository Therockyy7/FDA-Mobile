// features/profile/components/SubscriptionSection.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useTranslation } from "~/features/i18n";
import { UserSubscription } from "~/features/plans/types/plans-types";
import { useColorScheme } from "~/lib/useColorScheme";

type Props = {
  subscription: UserSubscription | null;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const getTierColor = (tierCode: string) => {
  switch ((tierCode || "").toUpperCase()) {
    case "FREE":
      return "#325f9c";
    case "PREMIUM":
      return "#007AFF";
    case "MONITOR":
      return "#8B5CF6";
    default:
      return "#325f9c";
  }
};

const getTierIcon = (tierCode: string): keyof typeof Ionicons.glyphMap => {
  switch ((tierCode || "").toUpperCase()) {
    case "FREE":
      return "cloud";
    case "PREMIUM":
      return "flash";
    case "MONITOR":
      return "shield";
    default:
      return "cube";
  }
};

const formatPrice = (price: number): string => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")}đ/tháng`;
};

const getStatusLabel = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "Đang hoạt động";
    case "cancelled":
      return "Đã hủy";
    case "expired":
      return "Đã hết hạn";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "#10B981";
    case "cancelled":
      return "#F59E0B";
    case "expired":
      return "#EF4444";
    default:
      return "#64748B";
  }
};

const SubscriptionSection: React.FC<Props> = ({
  subscription,
  isLoading,
  error,
  onRetry,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();
  const { t } = useTranslation();

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFB",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
    sectionTitle: isDarkColorScheme ? "#38BDF8" : "#007AFF",
  };

  const tierColor = subscription
    ? getTierColor(subscription.tierCode || subscription.tier || "")
    : colors.subtext;
  const tierIcon = subscription
    ? getTierIcon(subscription.tierCode || subscription.tier || "")
    : "help-circle";

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* Section Header */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isDarkColorScheme
              ? "rgba(96, 165, 250, 0.15)"
              : "rgba(59, 130, 246, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Ionicons name="pricetag" size={16} color={colors.sectionTitle} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
          {t("subscription.title")}
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
          shadowColor: isDarkColorScheme ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Loading */}
        {isLoading && (
          <View style={{ padding: 24, alignItems: "center" }}>
            <ActivityIndicator size="small" color={colors.sectionTitle} />
            <Text style={{ marginTop: 8, color: colors.subtext, fontSize: 13 }}>
              {t("subscription.loading")}
            </Text>
          </View>
        )}

        {/* Error */}
        {!isLoading && error && (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: "#EF4444",
                fontSize: 13,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {t("subscription.error")}
            </Text>
            {onRetry && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#007AFF",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignSelf: "center",
                }}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}
                >
                  {t("common.retry")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Subscription Info */}
        {!isLoading && !error && (
          <>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
              onPress={() => router.push("/plans/current")}
              activeOpacity={0.7}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F9",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Ionicons name={tierIcon} size={26} color={tierColor} />
                </View>

                {/* Plan Name + Status */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      {subscription?.planName || t("subscription.noPlan")}
                    </Text>
                  </View>
                  {subscription && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 2,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: getStatusColor(subscription.status),
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: "#FFFFFF",
                          }}
                        >
                          {(() => {
                            switch (
                              (subscription?.status || "").toLowerCase()
                            ) {
                              case "active":
                                return t("subscription.status.active");
                              case "cancelled":
                                return t("subscription.status.cancelled");
                              case "expired":
                                return t("subscription.status.expired");
                              default:
                                return subscription?.status;
                            }
                          })()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Chevron */}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.subtext}
              />
            </TouchableOpacity>

            {/* View Plans CTA */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 14,
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                backgroundColor: isDarkColorScheme ? "#0F172A" : "#F8FAFB",
              }}
              onPress={() => router.push("/plans")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={colors.sectionTitle}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.sectionTitle,
                }}
              >
                {subscription
                  ? t("subscription.viewAll")
                  : t("subscription.viewPlans")}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default SubscriptionSection;
