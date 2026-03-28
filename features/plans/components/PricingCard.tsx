import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions, Platform } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate,
  withSpring,
  withTiming,
  useSharedValue,
  withSequence,
  withDelay,
  SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { BillingCycle, PricingPlan, UserSubscription } from "../types/plans-types";
import PricingBadge from "./premium/PricingBadge";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_MARGIN = 12;

type Props = {
  plan: PricingPlan;
  index: number;
  scrollX: SharedValue<number>;
  billingCycle: BillingCycle;
  currentSubscription: UserSubscription | null;
  isAuthenticated: boolean;
  onActionPress?: (plan: PricingPlan) => void;
  loading?: boolean;
  isMobile?: boolean;
};

const PLAN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  FREE: "cloud-outline",
  PREMIUM: "flash",
  MONITOR: "shield-checkmark",
};

const PLAN_GRADIENTS: Record<string, [string, string]> = {
  FREE: ["#F1F5F9", "#E2E8F0"],
  PREMIUM: ["#3B82F6", "#1E4ED8"],
  MONITOR: ["#8B5CF6", "#6D28D9"],
};

const DARK_PLAN_GRADIENTS: Record<string, [string, string]> = {
  FREE: ["#1E293B", "#0F172A"],
  PREMIUM: ["#1D4ED8", "#111827"],
  MONITOR: ["#6D28D9", "#111827"],
};

const getPlanRank = (code: string): number => {
  const map: Record<string, number> = { FREE: 0, PREMIUM: 1, MONITOR: 2 };
  return map[(code || "").toUpperCase()] ?? 99;
};

const formatPrice = (price: number): string => {
  if (price === 0) return "0";
  return price.toLocaleString("vi-VN");
};

const PricingCard: React.FC<Props> = ({
  plan,
  index,
  scrollX,
  billingCycle,
  currentSubscription,
  isAuthenticated,
  onActionPress,
  loading = false,
  isMobile = false,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const upperCode = (plan.code || "").toUpperCase();
  const iconName = PLAN_ICONS[upperCode] || "cube";
  const gradients = isDark ? DARK_PLAN_GRADIENTS[upperCode] : PLAN_GRADIENTS[upperCode];
  const price = billingCycle === "monthly" ? plan.priceMonth : plan.priceYear;
  
  const isPremium = upperCode === "PREMIUM";
  const isMonitor = upperCode === "MONITOR";
  const isFree = upperCode === "FREE";

  const currentRank = currentSubscription ? getPlanRank(currentSubscription.tierCode || currentSubscription.tier || "") : -1;
  const planRank = getPlanRank(upperCode);
  const isCurrentPlan = isAuthenticated && currentSubscription && (currentSubscription.tierCode?.toUpperCase() === upperCode || currentSubscription.tier?.toUpperCase() === upperCode);
  const isUpgrade = isAuthenticated && planRank > currentRank && !isCurrentPlan;
  const isDowngrade = isAuthenticated && planRank < currentRank && !isCurrentPlan;

  // ─── Animation Logic ────────────────────────────────────────────────────────
  const animatedStyle = useAnimatedStyle(() => {
    const range = [
      (index - 1) * (CARD_WIDTH + CARD_MARGIN * 2),
      index * (CARD_WIDTH + CARD_MARGIN * 2),
      (index + 1) * (CARD_WIDTH + CARD_MARGIN * 2),
    ];

    const scale = interpolate(
      scrollX.value,
      range,
      [0.92, 1, 0.92],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      range,
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    const elevation = interpolate(
      scrollX.value,
      range,
      [2, 12, 2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
      shadowRadius: interpolate(scrollX.value, range, [4, 16, 4], Extrapolate.CLAMP),
      shadowOpacity: interpolate(scrollX.value, range, [0.1, 0.25, 0.1], Extrapolate.CLAMP),
      elevation,
    };
  });

  const buttonScale = useSharedValue(1);
  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.96, { duration: 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  // ─── Button Config ──────────────────────────────────────────────────────────
  let buttonLabel = "";
  let accentColor = gradients[0];
  if (isCurrentPlan) buttonLabel = "Đang sử dụng";
  else if (!isAuthenticated) buttonLabel = "Bắt đầu ngay";
  else if (isUpgrade) buttonLabel = "Nâng cấp ngay";
  else if (isDowngrade) buttonLabel = "Hạ cấp";

  const displayFeatures = plan.features.slice(0, 4);

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <LinearGradient
        colors={gradients}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Glow Overlay for Premium/Monitor */}
        {(isPremium || isMonitor) && (
          <View style={[styles.glow, { backgroundColor: isPremium ? "rgba(96, 165, 250, 0.15)" : "rgba(167, 139, 250, 0.15)" }]} />
        )}

        <View style={styles.cardHeader}>
          <View style={styles.headerTop}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)" }]}>
              <Ionicons name={iconName} size={28} color={isFree ? (isDark ? "#94A3B8" : "#475569") : "#FFFFFF"} />
            </View>
            
            {isPremium && <PricingBadge label="Phổ biến" variant="popular" />}
            {isCurrentPlan && <PricingBadge label="Đang dùng" variant="current" />}
            {isMonitor && <PricingBadge label="Ưu tiên" variant="priority" />}
          </View>

          <Text style={[styles.planName, { color: isFree ? (isDark ? "#F1F5F9" : "#1E293B") : "#FFFFFF" }]}>
            {plan.name}
          </Text>
          <Text style={[styles.planDesc, { color: isFree ? (isDark ? "#94A3B8" : "#64748B") : "rgba(255,255,255,0.8)" }]}>
            {plan.description}
          </Text>
        </View>

        {/* Price Section - Hidden from top if centered at bottom for current plan */}
        {!isCurrentPlan && (
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceValue, { color: isFree ? (isDark ? "#F1F5F9" : "#1E293B") : "#FFFFFF" }]}>
                {formatPrice(price)}
              </Text>
              <View>
                  <Text style={[styles.currency, { color: isFree ? (isDark ? "#94A3B8" : "#64748B") : "rgba(255,255,255,0.6)" }]}>vnđ</Text>
                  <Text style={[styles.billingCycle, { color: isFree ? (isDark ? "#94A3B8" : "#64748B") : "rgba(255,255,255,0.6)" }]}>
                  /{billingCycle === "monthly" ? "tháng" : "năm"}
                  </Text>
              </View>
            </View>
            
            {billingCycle === "yearly" && upperCode !== "FREE" && (
               <View style={styles.savingTag}>
                  <Text style={styles.savingText}>Tiết kiệm 20%</Text>
               </View>
            )}
          </View>
        )}
 
        <View style={[styles.divider, { backgroundColor: isFree ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") : "rgba(255,255,255,0.15)" }]} />
 
        <View style={[styles.featuresList, isCurrentPlan && { flex: 0, marginBottom: 20 }]}>
          {displayFeatures.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: isFree ? (isDark ? "#64748B" : "#94A3B8") : "#FFFFFF" }]} />
              <Text 
                numberOfLines={1}
                style={[styles.featureText, { color: isFree ? (isDark ? "#CBD5E1" : "#475569") : "#FFFFFF" }]}
              >
                {f.featureName}
              </Text>
            </View>
          ))}
        </View>
 
        {/* Active Plan: Huge Centered Price at Bottom */}
        {isCurrentPlan ? (
           <View style={styles.activePriceContainer}>
             <View style={{ alignItems: 'center' }}>
                <Text style={[styles.activePriceValue, { color: isFree ? (isDark ? "#F1F5F9" : "#1E293B") : "#FFFFFF" }]}>
                    {formatPrice(price)}
                </Text>
                <View style={styles.activePriceInfo}>
                    <Text style={[styles.activeCurrency, { color: isFree ? (isDark ? "#94A3B8" : "#64748B") : "rgba(255,255,255,0.6)" }]}>VNĐ</Text>
                    <Text style={[styles.activeCycle, { color: isFree ? (isDark ? "#94A3B8" : "#64748B") : "rgba(255,255,255,0.6)" }]}>
                    /{billingCycle === "monthly" ? "tháng" : "năm"}
                    </Text>
                </View>
             </View>
           </View>
        ) : (
          <Animated.View style={btnAnimStyle}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => onActionPress?.(plan)}
              disabled={loading}
              style={[
                styles.ctaButton,
                isFree ? styles.ctaFree : (isDark ? styles.ctaDark : styles.ctaLight),
                isDowngrade && (isDark ? styles.ctaDowngradeDark : styles.ctaDowngrade),
              ]}
            >
              <Text style={[
                  styles.ctaText,
                  isFree && !isDowngrade ? { color: isDark ? "#F1F5F9" : "#1E293B" } : { color: isDark ? "#FFFFFF" : "#1E293B" },
                  isDowngrade && { color: "#1E293B" }, // Always dark text on white button
              ]}>
                {buttonLabel}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Shimmer Sweep Effect (Spotlight Pass) */}
        {!isFree && (
            <View style={styles.rimLight} />
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    overflow: Platform.OS === "android" ? "hidden" : "visible",
  },
  gradientContainer: {
    padding: 24,
    borderRadius: 32,
    flex: 1,
    height: 480,
  },
  glow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  cardHeader: {
    marginBottom: 20,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  planName: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  planDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  priceValue: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },
  currency: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  billingCycle: {
    fontSize: 13,
    fontWeight: "600",
  },
  savingTag: {
      backgroundColor: "rgba(16, 185, 129, 0.15)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(16, 185, 129, 0.3)",
      marginBottom: 8,
  },
  savingText: {
      color: "#10B981",
      fontSize: 11,
      fontWeight: "900",
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 24,
  },
  featuresList: {
    flex: 1,
    gap: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  ctaButton: {
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaLight: {
    backgroundColor: "#FFFFFF",
  },
  ctaDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  ctaFree: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(148, 163, 184, 0.2)",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaDowngrade: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaDowngradeDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaDisabled: {
    opacity: 0.5,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "800",
  },
  activePriceContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: 0,
    paddingBottom: 40,
  },
  activePriceValue: {
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 70,
  },
  activePriceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 0,
  },
  activeCurrency: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  activeCycle: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.8,
  },
  rimLight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 32,
  },
});

export default PricingCard;
