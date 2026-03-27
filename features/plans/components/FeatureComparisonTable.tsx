// features/plans/components/FeatureComparisonTable.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PricingPlan } from "../types/plans-types";

type Props = {
  plans: PricingPlan[];
};

const PLAN_ORDER = ["FREE", "PREMIUM", "MONITOR"] as const;
const PLAN_LABELS: Record<string, string> = {
  FREE: "Miễn phí",
  PREMIUM: "Cao cấp",
  MONITOR: "Giám sát",
};
const PLAN_ACCENT: Record<string, string> = {
  FREE: "#325f9c",
  PREMIUM: "#007AFF",
  MONITOR: "#8B5CF6",
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
      if (v === "-1" || v.toLowerCase() === "unlimited") return "Không giới hạn";
      return v;
    },
  },
  {
    key: "sms_alerts",
    label: "Cảnh báo SMS",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "sms_alerts")?.featureValue;
      const result = parseBool(v);
      if (result === true) return "✓";
      if (result === false) return "—";
      return v ?? "—";
    },
  },
  {
    key: "email_alerts",
    label: "Cảnh báo Email",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "email_alerts")?.featureValue;
      const result = parseBool(v);
      if (result === true) return "✓";
      if (result === false) return "—";
      return v ?? "—";
    },
  },
  {
    key: "call_alerts",
    label: "Gọi điện cảnh báo",
    getValue: (plan) => {
      const v = plan.features.find((f) =>
        f.featureKey === "call_alerts" || f.featureKey === "phone_alerts"
      )?.featureValue;
      const result = parseBool(v);
      if (result === true) return "✓";
      if (result === false) return "—";
      return v ?? "—";
    },
  },
  {
    key: "dispatch_delay",
    label: "Độ trễ gửi cảnh báo",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "dispatch_delay")?.featureValue;
      if (!v || v === "0") return "—";
      return v;
    },
  },
  {
    key: "max_retries",
    label: "Số lần gửi lại tối đa",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "max_retries")?.featureValue;
      if (!v || v === "0") return "—";
      if (v.toLowerCase() === "unlimited" || v === "-1") return "Không giới hạn";
      return `${v} lần`;
    },
  },
  {
    key: "priority_level",
    label: "Ưu tiên cảnh báo",
    getValue: (plan) => {
      const v = plan.features.find((f) => f.featureKey === "priority_level")?.featureValue;
      if (!v) return "—";
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  {
    key: "api_access",
    label: "API truy xuất dữ liệu",
    getValue: (plan) => {
      const v = plan.features.find((f) =>
        f.featureKey === "api_access" || f.featureKey === "data_api"
      )?.featureValue;
      const result = parseBool(v);
      if (result === true) return "✓";
      if (result === false) return "—";
      return v ?? "—";
    },
  },
  {
    key: "in_app_notifications",
    label: "Cảnh báo qua App FDA",
    getValue: (plan) => {
      const v = plan.features.find((f) =>
        f.featureKey === "in_app_notifications" ||
        f.featureKey === "push_notifications" ||
        f.featureKey === "app_alerts"
      )?.featureValue;
      const result = parseBool(v);
      if (result === true) return "✓";
      if (result === false) return "—";
      return v ?? "✓"; // Default to ✓ since this is the free plan basic feature
    },
  },
];

const FeatureComparisonTable: React.FC<Props> = ({ plans }) => {
  const { isDarkColorScheme } = useColorScheme();

  const sortedPlans = [...plans].sort((a, b) => {
    const aIdx = PLAN_ORDER.indexOf((a.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    const bIdx = PLAN_ORDER.indexOf((b.code || "").toUpperCase() as typeof PLAN_ORDER[number]);
    return aIdx - bIdx;
  });

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F0F4F8",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    divider: isDarkColorScheme ? "#1E293B" : "#F1F5F9",
    popularAccent: "#007AFF",
  };

  const getAccent = (code: string) => PLAN_ACCENT[(code || "").toUpperCase()] || "#325f9c";

  return (
    <View style={{ marginTop: 32, marginBottom: 16 }}>
      {/* Section Title */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        So sánh các tính năng
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.subtext }]}>
        Chi tiết quyền lợi của từng gói thành viên
      </Text>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.table, { backgroundColor: colors.cardBg }]}>
          {/* Header Row */}
          <View style={[styles.row, styles.headerRow]}>
            <View style={[styles.cell, styles.featureCell]}>
              <Text style={[styles.headerText, { color: colors.subtext }]}>Tính năng</Text>
            </View>
            {sortedPlans.map((plan) => (
              <View
                key={plan.code}
                style={[
                  styles.cell,
                  styles.planCell,
                  {
                    borderLeftWidth: (plan.code || "").toUpperCase() === "PREMIUM" ? 2 : 0,
                    borderLeftColor: colors.popularAccent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.headerText,
                    {
                      color:
                        (plan.code || "").toUpperCase() === "PREMIUM"
                          ? colors.popularAccent
                          : colors.subtext,
                      fontWeight: (plan.code || "").toUpperCase() === "PREMIUM" ? "800" : "700",
                    },
                  ]}
                >
                  {PLAN_LABELS[(plan.code || "").toUpperCase()] || plan.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Feature Rows */}
          {COMPARISON_ROWS.map((row, rowIndex) => (
            <View
              key={row.key}
              style={[
                styles.row,
                {
                  backgroundColor:
                    rowIndex % 2 === 0
                      ? colors.cardBg
                      : isDarkColorScheme
                      ? "#1E293B"
                      : "#F8FAFC",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <View style={[styles.cell, styles.featureCell]}>
                <Text style={[styles.featureLabel, { color: colors.text }]}>{row.label}</Text>
              </View>
              {sortedPlans.map((plan) => {
                const value = row.getValue(plan);
                const isCheck = value === "✓";
                const isDash = value === "—";

                return (
                  <View
                    key={`${plan.code}-${row.key}`}
                    style={[
                      styles.cell,
                      styles.planCell,
                      {
                        borderLeftWidth: (plan.code || "").toUpperCase() === "PREMIUM" ? 2 : 0,
                        borderLeftColor: colors.popularAccent,
                      },
                    ]}
                  >
                    {isCheck ? (
                      <Ionicons name="checkmark" size={18} color={getAccent(plan.code)} />
                    ) : isDash ? (
                      <Text style={[styles.cellValue, { color: colors.subtext }]}>{value}</Text>
                    ) : (
                      <Text
                        style={[
                          styles.cellValue,
                          {
                            color:
                              (plan.code || "").toUpperCase() === "PREMIUM" ? colors.text : colors.subtext,
                            fontWeight: (plan.code || "").toUpperCase() === "PREMIUM" ? "700" : "500",
                          },
                        ]}
                      >
                        {value}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  table: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  row: {
    flexDirection: "row",
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  cell: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  featureCell: {
    minWidth: 170,
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  planCell: {
    minWidth: 90,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  cellValue: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default FeatureComparisonTable;
