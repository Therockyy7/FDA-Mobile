import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, Platform, Dimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PricingPlan } from "../types/plans-types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  plans: PricingPlan[];
};

const PLAN_ORDER = ["FREE", "PREMIUM", "MONITOR"] as const;

const PLAN_CONFIG: Record<string, { label: string; accent: string; sub: string; gradient: [string, string] }> = {
  FREE: { 
    label: "Cơ bản", 
    sub: "Free",
    accent: "#94A3B8", 
    gradient: ["#F1F5F9", "#E2E8F0"] 
  },
  PREMIUM: { 
    label: "Đề xuất", 
    sub: "Premium",
    accent: "#3B82F6", 
    gradient: ["#3B82F6", "#1D4ED8"] 
  },
  MONITOR: { 
    label: "Nâng cao", 
    sub: "Monitor",
    accent: "#8B5CF6", 
    gradient: ["#8B5CF6", "#6D28D9"] 
  },
};

interface FeatureRow {
  key: string;
  label: string;
  getValue: (plan: PricingPlan) => string | null;
}

const parseBool = (v: string | undefined | null): boolean | null => {
  if (!v) return null;
  const lower = v.toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes" || lower === "enabled") return true;
  if (lower === "false" || lower === "0" || lower === "no" || lower === "disabled") return false;
  return null;
};

const COMPARISON_ROWS: FeatureRow[] = [
  {
    key: "max_areas",
    label: "Số khu vực theo dõi",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "max_areas")?.featureValue;
      if (!v || v === "0") return "1";
      if (v === "-1" || v.toLowerCase() === "unlimited") return "Vô hạn";
      return v;
    },
  },
  {
    key: "sms_alerts",
    label: "Cảnh báo SMS",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "sms_alerts")?.featureValue;
      const result = parseBool(v);
      return result === true ? "✓" : "—";
    },
  },
  {
    key: "email_alerts",
    label: "Cảnh báo Email",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "email_alerts")?.featureValue;
      const result = parseBool(v);
      return result === true ? "✓" : "—";
    },
  },
  {
    key: "call_alerts",
    label: "Gọi điện khẩn cấp",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "call_alerts" || f.featureKey === "phone_alerts")?.featureValue;
      const result = parseBool(v);
      return result === true ? "✓" : "—";
    },
  },
  {
    key: "priority_level",
    label: "Độ ưu tiên xử lý",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "priority_level")?.featureValue;
      if (!v) return "—";
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  {
    key: "api_access",
    label: "API & Webhook",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "api_access" || f.featureKey === "data_api")?.featureValue;
      const result = parseBool(v);
      return result === true ? "✓" : "—";
    },
  },
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

const ComparisonValue: React.FC<{ value: string | null; planCode: string; isDark: boolean }> = ({ value, planCode, isDark }) => {
  const accent = PLAN_CONFIG[planCode]?.accent || "#3B82F6";
  const isCheck = value === "✓";
  const isDash = value === "—";
  const isUnlimited = value === "Vô hạn" || value === "Vô hạn";
  const isHigh = value?.toLowerCase() === "high" || value === "Cao";

  if (isCheck) {
    return (
      <View style={[styles.checkBadge, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)" }]}>
        <Ionicons name="checkmark-sharp" size={14} color={accent} />
      </View>
    );
  }

  if (isDash) {
    return <Text style={[styles.dashText, { color: isDark ? "#475569" : "#CBD5E1" }]}>—</Text>;
  }

  if (isUnlimited || isHigh) {
    return (
        <View style={[styles.semanticPill, { borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
            <Text style={[styles.semanticText, { color: accent }]}>{value}</Text>
        </View>
    );
  }

  return <Text style={[styles.valueText, { color: isDark ? "#F1F5F9" : "#1E293B" }]}>{value}</Text>;
};

const PlanHeaderMini: React.FC<{ plan: PricingPlan; isDark: boolean }> = ({ plan, isDark }) => {
    const config = PLAN_CONFIG[plan.code || "FREE"];
    const isPremium = plan.code === "PREMIUM";

    return (
        <View style={[styles.headerMini, isPremium && styles.headerMiniPremium]}>
            <Text style={[styles.headerMiniSub, { color: isPremium ? "#60A5FA" : (isDark ? "#94A3B8" : "#64748B") }]}>
                {config.sub}
            </Text>
            <Text style={[styles.headerMiniLabel, { color: isPremium ? (isDark ? "#F8FAFC" : "#1E40AF") : (isDark ? "#CBD5E1" : "#1E293B") }]}>
                {config.label}
            </Text>
            {isPremium && <View style={styles.premiumActiveDot} />}
        </View>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const FeatureComparisonTable: React.FC<Props> = ({ plans }) => {
  const { isDarkColorScheme } = useColorScheme();
  const isDark = isDarkColorScheme;

  const sortedPlans = [...plans].sort((a, b) => {
    const aIdx = PLAN_ORDER.indexOf((a.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    const bIdx = PLAN_ORDER.indexOf((b.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    return aIdx - bIdx;
  });

  const colors = {
    surface: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
    text: isDark ? "#F1F5F9" : "#1E293B",
    subtext: isDark ? "#94A3B8" : "#64748B",
    featureHeaderBg: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
    premiumColumnBg: isDark ? "rgba(59, 130, 246, 0.04)" : "rgba(59, 130, 246, 0.02)",
  };

  return (
    <Animated.View 
        entering={FadeInDown.duration(800).delay(800)}
        style={styles.container}
    >
      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: colors.text }]}>Chi tiết đặc quyền</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Đảm bảo an toàn tối đa với các tính năng vượt trội</Text>
      </View>

      <View style={[styles.sectionSurface, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Comparison Table Header */}
        <View style={[styles.comparisonHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.columnSpacer} />
            {sortedPlans.map((plan) => (
                <View key={plan.code} style={styles.planCol}>
                    <PlanHeaderMini plan={plan} isDark={isDark} />
                </View>
            ))}
        </View>

        {/* Feature Comparison Rows */}
        {COMPARISON_ROWS.map((row, i) => (
            <Animated.View 
                key={row.key}
                entering={FadeInDown.duration(600).delay(1000 + i * 100)}
                style={styles.featureBlock}
            >
                {/* Full Width Feature Label */}
                <View style={[styles.featureRowHeader, { backgroundColor: colors.featureHeaderBg }]}>
                    <Text style={[styles.featureLabel, { color: colors.text }]}>{row.label}</Text>
                </View>
                
                {/* 3-Column Values */}
                <View style={styles.valuesRow}>
                    <View style={styles.columnSpacer} />
                    {sortedPlans.map((plan) => (
                        <View 
                            key={`${plan.code}-${row.key}`} 
                            style={[
                                styles.planCol, 
                                styles.valueCell,
                                plan.code === "PREMIUM" && { backgroundColor: colors.premiumColumnBg }
                            ]}
                        >
                            <ComparisonValue value={row.getValue(plan)} planCode={plan.code} isDark={isDark} />
                        </View>
                    ))}
                </View>
            </Animated.View>
        ))}

        {/* Subtle premium column glow overlay (Z-index top) */}
        <View 
            pointerEvents="none" 
            style={[styles.premiumGlowOverlay, { left: "33.33%" }]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  sectionSurface: {
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
        },
        android: {
            elevation: 4,
        }
    })
  },
  comparisonHeader: {
      flexDirection: "row",
      paddingVertical: 12,
      borderBottomWidth: 1,
      backgroundColor: "transparent",
  },
  columnSpacer: {
      width: 0, // No spacer needed in this integrated label design or small spacer if labels were left
  },
  planCol: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
  },
  headerMini: {
      alignItems: "center",
  },
  headerMiniSub: {
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
  },
  headerMiniLabel: {
      fontSize: 12,
      fontWeight: "800",
  },
  headerMiniPremium: {
      transform: [{ scale: 1.1 }],
  },
  premiumActiveDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "#3B82F6",
      marginTop: 4,
  },
  featureBlock: {
      borderBottomWidth: 0,
  },
  featureRowHeader: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      alignItems: "center",
      borderBottomWidth: 0.5,
      borderBottomColor: "rgba(0,0,0,0.05)",
  },
  featureLabel: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: -0.2,
      opacity: 0.8,
  },
  valuesRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "rgba(0,0,0,0.02)",
  },
  valueCell: {
      paddingVertical: 16,
      height: 60,
  },
  premiumGlowOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: SCREEN_WIDTH / 3,
      backgroundColor: "transparent",
      zIndex: 10,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: "rgba(59, 130, 246, 0.08)",
  },
  // ─── Value Styles ───
  checkBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
  },
  dashText: {
      fontSize: 16,
      fontWeight: "200",
  },
  semanticPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
  },
  semanticText: {
      fontSize: 11,
      fontWeight: "900",
  },
  valueText: {
      fontSize: 13,
      fontWeight: "800",
  },
});

export default FeatureComparisonTable;
