// features/payment/components/PaymentStatusCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { PaymentResultState } from "../types/payment-types";
import { getPaymentStatusUI } from "../utils/payment-utils";

type Props = {
  status: PaymentResultState;
};

const PaymentStatusCard: React.FC<Props> = ({ status }) => {
  const { isDarkColorScheme } = useColorScheme();
  const config = getPaymentStatusUI(status);

  const showSpinner = status === "loading" || status === "pending";

  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
  };

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
      {/* Status Icon / Spinner */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: config.bgColor },
        ]}
      >
        {showSpinner ? (
          <ActivityIndicator size="large" color={config.color} />
        ) : (
          <Ionicons
            name={config.icon as keyof typeof Ionicons.glyphMap}
            size={48}
            color={config.color}
          />
        )}
      </View>

      {/* Status Label */}
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>

      {/* Subtext */}
      {status === "paid" && (
        <Text
          style={[
            styles.subtext,
            { color: isDarkColorScheme ? "#94A3B8" : "#64748B" },
          ]}
        >
          Gói của bạn đã được kích hoạt.
        </Text>
      )}
      {status === "timeout" && (
        <Text
          style={[
            styles.subtext,
            { color: isDarkColorScheme ? "#94A3B8" : "#64748B" },
          ]}
        >
          Xác nhận thanh toán đang xử lý, vui lòng kiểm tra lại sau.
        </Text>
      )}
      {status === "pending" && (
        <Text
          style={[
            styles.subtext,
            { color: isDarkColorScheme ? "#94A3B8" : "#64748B" },
          ]}
        >
          Đang xác nhận thanh toán...
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PaymentStatusCard;
