import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PricingPlan } from "../types/plans-types";
import { useTranslation } from "~/features/i18n";

type Props = {
  plans: PricingPlan[];
};

const PLAN_ORDER = ["FREE", "PREMIUM", "MONITOR"] as const;
const BRAND = "#007AFF";

const getPlanLabels = (t: any): Record<string, string> => ({
  FREE: t("plans.tier.free", "Miễn phí"),
  PREMIUM: "Premium",
  MONITOR: "Monitor",
});

/** Same tiers as enterprise column in PricingCard — hide from comparison table. */
const PLAN_CODES_HIDDEN_FROM_COMPARISON = new Set(["MONITOR", "ENTERPRISE"]);

function isPlanHiddenFromComparison(p: PricingPlan): boolean {
  const code = (p.code || "").toUpperCase();
  if (PLAN_CODES_HIDDEN_FROM_COMPARISON.has(code)) return true;
  if (/\benterprise\b/i.test(p.name || "")) return true;
  return false;
}

interface FeatureRow {
  key: string;
  label: string;
  getValue: (plan: PricingPlan) => string | null;
}

const getComparisonRows = (t: any): FeatureRow[] => [
  {
    key: "monitored_areas_max",
    label: t("plans.comparison.monitoredAreas"),
    getValue: (plan) => {
      const v = plan.features?.find((f) => f.featureKey === "monitored_areas_max")?.featureValue;
      return v || "—";
    },
  },
  {
    key: "alert_channels",
    label: t("plans.comparison.alertChannels"),
    getValue: (plan) => {
      const v = plan.features?.find((f) => f.featureKey === "alert_channels")?.featureValue;
      if (!v) return "—";
      if (v.includes("Webhook")) return t("plans.comparison.allAndWebhook");
      if (v.includes("SMS")) return t("plans.comparison.pushEmailSms");
      return t("plans.comparison.pushEmail");
    },
  },
  {
    key: "ai_predictions",
    label: t("plans.comparison.aiPredictions"),
    getValue: (plan) => {
      const v = plan.features?.find((f) => f.featureKey === "ai_predictions")?.featureValue;
      if (!v || v === "Không" || v === "No") return "—";
      return v === "Có" || v === "Yes" || v === "Đầy đủ" || v === "Full" ? t("plans.comparison.yes") : v;
    },
  },
  {
    key: "safe_routes",
    label: t("plans.comparison.safeRoutes"),
    getValue: (plan) => {
      const v = plan.features?.find((f) => f.featureKey === "safe_routes")?.featureValue;
      if (!v || v === "Không" || v === "No") return "—";
      return v === "Có" || v === "Yes" ? t("plans.comparison.yes") : v;
    },
  },
  {
    key: "community_reports",
    label: t("plans.comparison.communityReports"),
    getValue: (plan) => {
      const v = plan.features?.find((f) => f.featureKey === "community_reports")?.featureValue;
      if (!v) return "—";
      if (v.includes("huy hiệu") || v.includes("Rep")) return t("plans.comparison.yesHighReputation");
      if (v.includes("Kiểm duyệt") || v.includes("Moderated")) return t("plans.comparison.moderated");
      return t("plans.comparison.yes");
    },
  },
];

// ─── Cell ─────────────────────────────────────────────────────────────────────

const Cell: React.FC<{ value: string | null; planCode: string; isDark: boolean }> = ({ value, planCode, isDark }) => {
  const isPremium = planCode === "PREMIUM";
  const isMonitor = planCode === "MONITOR";
  const isHighlighted = isPremium || isMonitor;
  const isCheck = value === "✓";
  const isDash = value === "—";

  if (isCheck) {
    return (
      <View style={[styles.checkBadge, { backgroundColor: isHighlighted ? `${BRAND}18` : `${BRAND}0A` }]}>
        <Ionicons name="checkmark" size={11} color={isHighlighted ? BRAND : "#10B981"} />
      </View>
    );
  }

  if (isDash) {
    return <Text style={[styles.dash, { color: isDark ? "#334155" : "#CBD5E1" }]}>—</Text>;
  }

  return (
    <Text
      style={[
        styles.cellText,
        { color: isHighlighted ? BRAND : isDark ? "#F1F5F9" : "#111827" },
        isHighlighted && styles.cellTextHighlight,
      ]}
      numberOfLines={2}
    >
      {value}
    </Text>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

const FeatureComparisonTable: React.FC<Props> = ({ plans }) => {
  const { isDarkColorScheme } = useColorScheme();
  const { t } = useTranslation();
  const isDark = isDarkColorScheme;

  const COMPARISON_ROWS = getComparisonRows(t);

  const sortedPlans = [...plans].sort((a, b) => {
    const aIdx = PLAN_ORDER.indexOf((a.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    const bIdx = PLAN_ORDER.indexOf((b.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    return aIdx - bIdx;
  });

  const tablePlans = sortedPlans.filter((p) => !isPlanHiddenFromComparison(p));

  const colors = {
    surface: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F6",
    divider: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F6",
    headerBg: isDark ? "#0F172A" : "#F8FAFB",
    text: isDark ? "#F1F5F9" : "#111827",
    subtext: isDark ? "#94A3B8" : "#6B7280",
    colHighlight: isDark ? "rgba(0,122,255,0.04)" : "rgba(0,122,255,0.03)",
  };

  return (
    <View style={styles.container}>
      {/* Section title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t("plans.comparison.title")}
      </Text>

      {/* Table */}
      <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Column Headers */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.labelCol, styles.labelCell]} />
          {tablePlans.map((plan) => {
            const isHighlight = plan.code !== "FREE";
            return (
              <View
                key={plan.code}
                style={[
                  styles.planCol,
                  styles.valueCell,
                  isHighlight && { backgroundColor: colors.colHighlight },
                ]}
              >
                <Text
                  style={[
                    styles.planLabel,
                    { color: isHighlight ? BRAND : colors.subtext },
                    isHighlight && styles.planLabelBold,
                  ]}
                >
                  {getPlanLabels(t)[plan.code || "FREE"] ?? plan.name}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Rows */}
        {COMPARISON_ROWS.map((row, i) => (
          <View
            key={row.key}
            style={[
              styles.row,
              i < COMPARISON_ROWS.length - 1 && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
            ]}
          >
            {/* Label */}
            <View style={[styles.labelCol, styles.labelCell]}>
              <Text style={[styles.rowLabel, { color: colors.subtext }]} numberOfLines={2}>
                {row.label}
              </Text>
            </View>

            {/* Plan values */}
            {tablePlans.map((plan) => {
              const isHighlight = plan.code !== "FREE";
              return (
                <View
                  key={`${plan.code}-${row.key}`}
                  style={[styles.planCol, styles.valueCell, isHighlight && { backgroundColor: colors.colHighlight }]}
                >
                  <Cell value={row.getValue(plan)} planCode={plan.code} isDark={isDark} />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  table: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
  },
  labelCol: {
    width: 100,
  },
  labelCell: {
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  planCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  valueCell: {
    paddingVertical: 12,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  planLabelBold: {
    fontWeight: "700",
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dash: {
    fontSize: 14,
    fontWeight: "300",
  },
  cellText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  cellTextHighlight: {
    fontWeight: "700",
  },
});

export default FeatureComparisonTable;
