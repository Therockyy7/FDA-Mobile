import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import type { Subscription } from "../types/subscription.types";
import TierBadge from "./TierBadge";

interface SubscriptionStatusWidgetProps {
  current: Subscription | null;
  onPressManage?: () => void;
}

const buildSummaryItems = (current: Subscription | null) => {
  if (!current) return [];
  const items: {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
  }[] = [];

  if (current.dispatchDelay) {
    items.push({
      key: "delay",
      icon: "time-outline",
      text: `${current.dispatchDelay.highPrioritySeconds}s / ${current.dispatchDelay.lowPrioritySeconds}s`,
    });
  }

  if (current.availableChannels?.length) {
    items.push({
      key: "channels",
      icon: "chatbubbles-outline",
      text: current.availableChannels.join(", "),
    });
  }

  if (current.maxRetries !== undefined) {
    items.push({
      key: "retries",
      icon: "refresh-outline",
      text: `${current.maxRetries} lần`,
    });
  }

  return items;
};

const SubscriptionStatusWidget: React.FC<SubscriptionStatusWidgetProps> = ({
  current,
  onPressManage,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFC",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    sectionTitle: isDarkColorScheme ? "#60A5FA" : "#3B82F6",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
  };
  const statusText = current?.status || "Chưa xác định";
  const endDateText = current?.endDate
    ? new Date(current.endDate).toLocaleDateString("vi-VN")
    : "Đang cập nhật";
  const summaryItems = buildSummaryItems(current);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
          paddingLeft: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: isDarkColorScheme
                ? "rgba(96, 165, 250, 0.15)"
                : "rgba(59, 130, 246, 0.1)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name="card" size={16} color={colors.sectionTitle} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
            Gói đăng ký của bạn
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onPressManage}
        activeOpacity={0.8}
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: colors.cardBg,
          borderWidth: 1,
          borderColor: colors.border,
          marginHorizontal: 16,
          marginTop: 12,
          shadowColor: isDarkColorScheme ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
            gap: 10,
          }}
        >
          {current ? (
            <TierBadge tier={current.tierCode} />
          ) : (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: colors.divider,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.subtext,
                }}
              >
                Chưa có gói
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 13, color: colors.subtext }}>
            {statusText}
          </Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
            {current?.planName || "Xem các gói phù hợp"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 4 }}>
            {endDateText}
          </Text>
        </View>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {summaryItems.length > 0 ? (
            summaryItems.slice(0, 3).map((item) => (
              <View
                key={item.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  maxWidth: "100%",
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={colors.sectionTitle}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.subtext,
                    marginLeft: 6,
                  }}
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 12, color: colors.subtext }}>
              Xem chi tiết gói đăng ký
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SubscriptionStatusWidget;
