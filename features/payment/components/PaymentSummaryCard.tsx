// features/payment/components/PaymentSummaryCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { SubscriptionPaymentDto } from "../types/payment-types";
import { formatVND, getPaymentStatusLabel } from "../utils/payment-utils";

type Props = {
  payment: SubscriptionPaymentDto;
};

const PaymentSummaryCard: React.FC<Props> = ({ payment }) => {
  const { isDarkColorScheme } = useColorScheme();

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
    accent: "#0077BE",
  };

  const rows: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      label: "Mã đơn hàng",
      value: `#${payment.orderCode}`,
      icon: "receipt-outline",
    },
    {
      label: "Tên gói",
      value: payment.planName,
      icon: "pricetag-outline",
    },
    {
      label: "Thời hạn",
      value: `${payment.durationMonths} tháng`,
      icon: "calendar-outline",
    },
    {
      label: "Số tiền",
      value: formatVND(payment.amount),
      icon: "card-outline",
    },
    {
      label: "Trạng thái",
      value: getPaymentStatusLabel(payment.status),
      icon: "information-circle-outline",
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={18} color={colors.accent} />
        <Text style={[styles.headerText, { color: colors.text }]}>
          Chi tiết thanh toán
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Detail Rows */}
      {rows.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={row.icon}
                size={16}
                color={colors.subtext}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.rowLabel, { color: colors.subtext }]}>
                {row.label}
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                {
                  color:
                    row.label === "Số tiền" ? colors.accent : colors.text,
                },
              ]}
            >
              {row.value}
            </Text>
          </View>
          {index < rows.length - 1 && (
            <View
              style={[
                styles.rowDivider,
                { backgroundColor: colors.divider },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },
});

export default PaymentSummaryCard;
