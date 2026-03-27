// features/plans/components/PricingCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { BillingCycle, PricingPlan, UserSubscription } from "../types/plans-types";

type Props = {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  currentSubscription: UserSubscription | null;
  isAuthenticated: boolean;
  onActionPress?: (plan: PricingPlan) => void;
  loading?: boolean;
  isMobile?: boolean;
};

// Map API plan code → Vietnamese display name
const PLAN_NAMES: Record<string, string> = {
  FREE: "Miễn phí",
  PREMIUM: "Cao cấp",
  MONITOR: "Giám sát",
};

const PLAN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  FREE: "cloud",
  PREMIUM: "flash",
  MONITOR: "shield",
};

const PLAN_ACCENT: Record<string, string> = {
  FREE: "#325f9c",
  PREMIUM: "#007AFF",
  MONITOR: "#8B5CF6",
};

const getPlanRank = (code: string): number => {
  const map: Record<string, number> = { FREE: 0, PREMIUM: 1, MONITOR: 2 };
  return map[(code || "").toUpperCase()] ?? 99;
};

const formatPrice = (price: number): string => {
  if (price === 0) return "0vnđ";
  return `${price.toLocaleString("vi-VN")}vnđ`;
};

const PricingCard: React.FC<Props> = ({
  plan,
  billingCycle,
  currentSubscription,
  isAuthenticated,
  onActionPress,
  loading = false,
  isMobile = false,
}) => {
  const { isDarkColorScheme } = useColorScheme();

  const upperCode = (plan.code || "").toUpperCase();
  const displayName = plan.name;
  const iconName = PLAN_ICONS[upperCode] || "cube";
  const accentColor = PLAN_ACCENT[upperCode] || "#325f9c";
  const price = billingCycle === "monthly" ? plan.priceMonth : plan.priceYear;
  const isPopular = upperCode === "PREMIUM";
  const isMonitor = upperCode === "MONITOR";

  const currentRank = currentSubscription ? getPlanRank(currentSubscription.tierCode || currentSubscription.tier || "") : -1;
  const planRank = getPlanRank(upperCode);
  const isCurrentPlan = isAuthenticated && currentSubscription && (currentSubscription.tierCode?.toUpperCase() === upperCode || currentSubscription.tier?.toUpperCase() === upperCode);
  const isUpgrade = isAuthenticated && planRank > currentRank && !isCurrentPlan;
  const isDowngrade = isAuthenticated && planRank < currentRank && !isCurrentPlan;

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    cardBgPopular: isDarkColorScheme ? "#1E3A5F" : "#EBF4FF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    popularBorder: "#007AFF",
    popularBadge: "#007AFF",
    popularBadgeText: "#FFFFFF",
    iconBg: isDarkColorScheme ? "#334155" : "#E5E7EB",
    iconBgPopular: isDarkColorScheme ? "#1E3A5F" : "#D5E3FF",
    buttonBorder: isMonitor ? "#8B5CF6" : "#325f9c",
    buttonText: isMonitor ? "#8B5CF6" : "#325f9c",
  };

  // Determine button state
  let buttonLabel = "";
  let buttonVariant: "primary" | "outline" | "current" | "getStarted" = "getStarted";
  let buttonDisabled = false;

  if (isCurrentPlan) {
    buttonLabel = "Gói hiện tại";
    buttonVariant = "current";
    buttonDisabled = true;
  } else if (!isAuthenticated) {
    buttonLabel = "Bắt đầu ngay";
    buttonVariant = isPopular ? "primary" : "outline";
  } else if (isUpgrade) {
    buttonLabel = "Nâng cấp";
    buttonVariant = "primary";
  } else if (isDowngrade) {
    buttonLabel = "Hạ cấp";
    buttonVariant = "outline";
  }

  // Use first 2-3 features from API
  const displayFeatures = plan.features.slice(0, 3);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isPopular ? colors.cardBgPopular : colors.cardBg,
          borderColor: isPopular ? colors.popularBorder : colors.border,
          borderWidth: isPopular ? 2 : 1,
          minHeight: isMobile ? undefined : 420,
          shadowOpacity: isPopular ? 0.15 : 0.05,
          transform: isPopular && !isMobile ? [{ translateY: -16 }] : [],
        },
      ]}
    >
      {/* Popular Badge */}
      {isPopular && !isMobile && (
        <View style={[styles.popularBadge, { backgroundColor: colors.popularBadge }]}>
          <Text style={[styles.popularBadgeText, { color: colors.popularBadgeText }]}>
            Phổ biến nhất
          </Text>
        </View>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>Đang dùng</Text>
        </View>
      )}

      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isPopular ? colors.iconBgPopular : colors.iconBg,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={28}
          color={isPopular ? accentColor : colors.subtext}
        />
      </View>

      {/* Plan Name */}
      <Text style={[styles.planName, { color: colors.text }]} numberOfLines={2}>
        {displayName}
      </Text>

      {/* Description */}
      <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={3}>
        {plan.description}
      </Text>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: colors.text }]}>
          {formatPrice(price)}
        </Text>
        <Text style={[styles.priceSuffix, { color: colors.subtext }]}>
          /{billingCycle === "monthly" ? "tháng" : "năm"}
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Features List */}
      <View style={styles.featuresContainer}>
        {displayFeatures.map((feature, index) => {
          const isIncluded =
            feature.featureValue !== "0" &&
            feature.featureValue !== "false" &&
            feature.featureValue !== "—" &&
            feature.featureValue !== "—" &&
            feature.featureValue !== "Không" &&
            feature.featureValue !== "disabled";

          return (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name={isIncluded ? "checkmark-circle" : "remove-circle"}
                size={16}
                color={isIncluded ? accentColor : colors.subtext}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.featureText, { color: colors.subtext }]} numberOfLines={1}>
                {feature.featureName}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.button,
          buttonVariant === "primary" && { backgroundColor: accentColor },
          buttonVariant === "outline" && {
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: colors.buttonBorder,
          },
          buttonVariant === "current" && {
            backgroundColor: isDarkColorScheme ? "#334155" : "#F1F5F6",
          },
          buttonVariant === "getStarted" && {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
        onPress={() => onActionPress?.(plan)}
        disabled={buttonDisabled || loading}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color:
                buttonVariant === "primary"
                  ? "#FFFFFF"
                  : buttonVariant === "current"
                  ? colors.subtext
                  : buttonVariant === "outline" || buttonVariant === "getStarted"
                  ? accentColor
                  : "#FFFFFF",
            },
          ]}
        >
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    left: "50%",
    marginLeft: -45,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  currentBadge: {
    position: "absolute",
    top: -12,
    right: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 1,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
  },
  priceSuffix: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 2,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 10,
    flex: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default PricingCard;
