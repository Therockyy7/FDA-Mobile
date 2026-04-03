import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PricingPlan } from "../types/plans-types";

type Props = {
  plans: PricingPlan[];
};

const PLAN_ORDER = ["FREE", "PREMIUM", "MONITOR"] as const;
const BRAND = "#007AFF";

const PLAN_LABELS: Record<string, string> = {
  FREE: "Miễn phí",
  PREMIUM: "Premium",
  MONITOR: "Monitor",
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
    label: "Khu vực theo dõi",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "max_areas")?.featureValue;
      if (!v || v === "0") return "1";
      if (v === "-1" || v.toLowerCase() === "unlimited") return "Không giới hạn";
      return v;
    },
  },
  {
    key: "sms_alerts",
    label: "Cảnh báo SMS",
    getValue: (plan) => {
      const result = parseBool(plan.features.find((f) => f.featureKey === "sms_alerts")?.featureValue);
      return result === true ? "✓" : "—";
    },
  },
  {
    key: "email_alerts",
    label: "Cảnh báo Email",
    getValue: (plan) => {
      const result = parseBool(plan.features.find((f) => f.featureKey === "email_alerts")?.featureValue);
      return result === true ? "✓" : "—";
    },
  },
  {
    key: "call_alerts",
    label: "Gọi điện khẩn cấp",
    getValue: (plan) => {
      const result = parseBool(
        plan.features.find((f) => f.featureKey === "call_alerts" || f.featureKey === "phone_alerts")?.featureValue,
      );
      return result === true ? "✓" : "—";
    },
  },
  {
    key: "priority_level",
    label: "Ưu tiên xử lý",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "priority_level")?.featureValue;
      if (!v) return "—";
      const map: Record<string, string> = { low: "Thấp", medium: "Trung bình", high: "Cao", highest: "Cao nhất" };
      return map[v.toLowerCase()] ?? v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  {
    key: "api_access",
    label: "API & Dữ liệu",
    getValue: (plan) => {
      const result = parseBool(
        plan.features.find((f) => f.featureKey === "api_access" || f.featureKey === "data_api")?.featureValue,
      );
      return result === true ? "✓" : "—";
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
  const isDark = isDarkColorScheme;

  const sortedPlans = [...plans].sort((a, b) => {
    const aIdx = PLAN_ORDER.indexOf((a.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    const bIdx = PLAN_ORDER.indexOf((b.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    return aIdx - bIdx;
  });

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
        So sánh chi tiết
      </Text>

      {/* Table */}
      <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Column Headers */}
        <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
          <View style={styles.labelCol} />
          {sortedPlans.map((plan) => {
            const isHighlight = plan.code !== "FREE";
            return (
              <View
                key={plan.code}
                style={[styles.planCol, isHighlight && { backgroundColor: colors.colHighlight }]}
              >
                <Text
                  style={[
                    styles.planLabel,
                    { color: isHighlight ? BRAND : colors.subtext },
                    isHighlight && styles.planLabelBold,
                  ]}
                >
                  {PLAN_LABELS[plan.code || "FREE"] ?? plan.name}
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
            {sortedPlans.map((plan) => {
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
    paddingVertical: 10,
    paddingHorizontal: 12,
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
