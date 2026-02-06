import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import type { PlanItem } from "../types/subscription.types";
import TierBadge from "./TierBadge";

interface PlanCardProps {
  plan: PlanItem;
  isCurrent?: boolean;
  isSubscribeDisabled?: boolean;
  disabledReason?: string;
  onPressSubscribe?: () => void;
  onPressTierInfo?: () => void;
  onPressManageCancel?: () => void;
}

const formatPrice = (monthlyPrice?: number) => {
  if (monthlyPrice === undefined) return "Liên hệ";
  return `${monthlyPrice.toLocaleString("vi-VN")}₫/tháng`;
};

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrent = false,
  isSubscribeDisabled = false,
  disabledReason,
  onPressSubscribe,
  onPressTierInfo,
  onPressManageCancel,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const colors = {
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#0F172A",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    highlightBorder: isDarkColorScheme ? "#3B82F6" : "#93C5FD",
    price: isDarkColorScheme ? "#93C5FD" : "#1D4ED8",
    chipBg: isDarkColorScheme ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
    chipText: isDarkColorScheme ? "#FBBF24" : "#B45309",
  };

  return (
    <Card
      style={{
        padding: 18,
        borderRadius: 20,
        marginBottom: 18,
        borderColor: plan.highlight ? colors.highlightBorder : colors.border,
        borderWidth: 1,
        backgroundColor: colors.cardBg,
        width: "92%",
        maxWidth: 420,
        alignSelf: "center",
        shadowColor: isDarkColorScheme ? "#000" : "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
            {plan.name}
          </Text>
          {plan.description ? (
            <Text
              style={{ fontSize: 13, color: colors.subtext, marginTop: 6 }}
              numberOfLines={2}
            >
              {plan.description}
            </Text>
          ) : null}
        </View>
        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <TierBadge tier={plan.code} />
          {onPressTierInfo ? (
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDarkColorScheme
                  ? "rgba(148, 163, 184, 0.15)"
                  : "rgba(15, 23, 42, 0.06)",
              }}
              onPress={onPressTierInfo}
              activeOpacity={0.7}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.subtext}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {plan.highlight ? (
        <View
          style={{
            marginTop: 12,
            alignSelf: "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: colors.chipBg,
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: "700", color: colors.chipText }}
          >
            Most Popular
          </Text>
        </View>
      ) : null}

      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: colors.price,
          marginTop: 12,
        }}
      >
        {formatPrice(plan.monthlyPrice)}
      </Text>

      {plan.features && plan.features.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          {plan.features.map((feature) => (
            <Text
              key={feature}
              style={{
                fontSize: 13,
                color: colors.subtext,
                marginTop: 4,
              }}
            >
              • {feature}
            </Text>
          ))}
        </View>
      ) : null}

      <Button
        variant={isCurrent ? "secondary" : "default"}
        disabled={isCurrent || isSubscribeDisabled || !onPressSubscribe}
        onPress={onPressSubscribe}
        style={{ marginTop: 18 }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: isCurrent ? colors.text : "white",
          }}
        >
          {isCurrent ? "Gói hiện tại" : "Đăng ký"}
        </Text>
      </Button>

      {isSubscribeDisabled && !isCurrent ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 12, color: colors.subtext }}>
            {disabledReason || "Vui lòng hủy gói hiện tại trước khi chuyển."}
          </Text>
          {onPressManageCancel ? (
            <TouchableOpacity
              onPress={onPressManageCancel}
              activeOpacity={0.7}
              style={{ marginTop: 8 }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: colors.price }}
              >
                Quản lí gói
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
};

export default PlanCard;
