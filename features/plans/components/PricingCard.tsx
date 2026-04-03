import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { BillingCycle, PricingPlan, UserSubscription } from "../types/plans-types";
import PricingBadge from "./premium/PricingBadge";

type Props = {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  currentSubscription: UserSubscription | null;
  isAuthenticated: boolean;
  onActionPress?: (plan: PricingPlan) => void;
  loading?: boolean;
};

const PLAN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  FREE: "cloud-outline",
  PREMIUM: "flash",
  MONITOR: "shield-checkmark",
};

const getPlanRank = (code: string): number => {
  const map: Record<string, number> = { FREE: 0, PREMIUM: 1, MONITOR: 2 };
  return map[(code || "").toUpperCase()] ?? 99;
};

const formatPrice = (price: number): string => {
  if (price === 0) return "Miễn phí";
  return price.toLocaleString("vi-VN");
};

const PricingCard: React.FC<Props> = ({
  plan,
  billingCycle,
  currentSubscription,
  isAuthenticated,
  onActionPress,
  loading = false,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const upperCode = (plan.code || "").toUpperCase();
  const iconName = PLAN_ICONS[upperCode] || "cube";
  const price = billingCycle === "monthly" ? plan.priceMonth : plan.priceYear;

  const isPremium = upperCode === "PREMIUM";
  const isMonitor = upperCode === "MONITOR";
  const isFree = upperCode === "FREE";

  const currentRank = currentSubscription
    ? getPlanRank(currentSubscription.tierCode || currentSubscription.tier || "")
    : -1;
  const planRank = getPlanRank(upperCode);
  const isCurrentPlan =
    isAuthenticated &&
    currentSubscription &&
    (currentSubscription.tierCode?.toUpperCase() === upperCode ||
      currentSubscription.tier?.toUpperCase() === upperCode);
  const isUpgrade =
    isAuthenticated && planRank > currentRank && !isCurrentPlan;
  const isDowngrade =
    isAuthenticated && planRank < currentRank && !isCurrentPlan;

  let buttonLabel = "";
  if (isCurrentPlan) buttonLabel = "Đang dùng";
  else if (!isAuthenticated) buttonLabel = "Chọn";
  else if (isUpgrade) buttonLabel = "Nâng cấp";
  else if (isDowngrade) buttonLabel = "Hạ cấp";

  const BRAND = "#007AFF";

  const colors = {
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    cardBorder: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    text: isDark ? "#F1F5F9" : "#111827",
    subtext: isDark ? "#94A3B8" : "#6B7280",
    muted: isDark ? "#475569" : "#9CA3AF",
    // CTA states
    ctaUpgradeBg: BRAND,
    ctaUpgradeText: "#FFFFFF",
    ctaCurrentBg: isDark ? "rgba(0,122,255,0.12)" : "rgba(0,122,255,0.08)",
    ctaCurrentText: BRAND,
    ctaCurrentBorder: "rgba(0,122,255,0.2)",
    ctaDowngradeBg: isDark ? "#1E293B" : "#F8FAFB",
    ctaDowngradeText: isDark ? "#94A3B8" : "#6B7280",
    ctaDowngradeBorder: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
    ctaFreeBg: isDark ? "#1E293B" : "#F8FAFB",
    ctaFreeText: BRAND,
    ctaFreeBorder: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
  };

  const billingLabel = billingCycle === "monthly" ? "tháng" : "năm";

  const getCtaStyle = () => {
    if (isCurrentPlan) {
      return {
        bg: colors.ctaCurrentBg,
        text: colors.ctaCurrentText,
        border: colors.ctaCurrentBorder,
        borderWidth: 1,
      };
    }
    if (isUpgrade) {
      return { bg: colors.ctaUpgradeBg, text: colors.ctaUpgradeText, border: "transparent", borderWidth: 0 };
    }
    if (isDowngrade) {
      return { bg: colors.ctaDowngradeBg, text: colors.ctaDowngradeText, border: colors.ctaDowngradeBorder, borderWidth: 1 };
    }
    // Free / not authenticated
    return { bg: colors.ctaFreeBg, text: colors.ctaFreeText, border: colors.ctaFreeBorder, borderWidth: 1 };
  };

  const ctaStyle = getCtaStyle();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Top row: icon + badges + price */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons
            name={iconName}
            size={20}
            color={isFree ? (isDark ? "#94A3B8" : "#9CA3AF") : BRAND}
          />
        </View>

        <View style={styles.badgeGroup}>
          {isPremium && <PricingBadge label="Phổ biến" variant="popular" />}
          {isMonitor && <PricingBadge label="Nâng cao" variant="priority" />}
          {isCurrentPlan && <PricingBadge label="Đang dùng" variant="current" />}
        </View>

        <View style={styles.priceBlock}>
          <Text style={[styles.priceValue, { color: colors.text }]}>
            {formatPrice(price)}
          </Text>
          {price > 0 && (
            <Text style={[styles.priceUnit, { color: colors.muted }]}>
              /{billingLabel}
            </Text>
          )}
        </View>
      </View>

      {/* Bottom row: plan name + CTA */}
      <View style={styles.bottomRow}>
        <Text
          style={[styles.planName, { color: colors.text }]}
          numberOfLines={1}
        >
          {plan.name}
        </Text>

        <TouchableOpacity
          onPress={() => onActionPress?.(plan)}
          disabled={loading || !!isCurrentPlan}
          activeOpacity={0.7}
          style={[
            styles.cta,
            {
              backgroundColor: ctaStyle.bg,
              borderColor: ctaStyle.border,
              borderWidth: ctaStyle.borderWidth,
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: ctaStyle.text }]}>
            {buttonLabel}
          </Text>
          {(isUpgrade || (!isAuthenticated && !isCurrentPlan)) && (
            <Ionicons
              name="arrow-forward"
              size={13}
              color={ctaStyle.text}
              style={{ marginLeft: 4 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,122,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeGroup: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
    paddingHorizontal: 8,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export default PricingCard;
