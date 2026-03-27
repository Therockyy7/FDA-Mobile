import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { useCurrentSubscription } from "~/features/plans/hooks/useCurrentSubscription";
import { useColorScheme } from "~/lib/useColorScheme";

const getTierColor = (tierCode: string) => {
  switch ((tierCode || "").toUpperCase()) {
    case "FREE":
      return "#325f9c";
    case "PREMIUM":
      return "#007AFF";
    case "MONITOR":
      return "#8B5CF6";
    default:
      return "#325f9c";
  }
};

const getTierIcon = (tierCode: string): keyof typeof Ionicons.glyphMap => {
  switch ((tierCode || "").toUpperCase()) {
    case "FREE":
      return "cloud";
    case "PREMIUM":
      return "flash";
    case "MONITOR":
      return "shield-checkmark";
    default:
      return "cube";
  }
};

const getStatusLabel = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "Đang hoạt động";
    case "free":
      return "Đang sử dụng";
    case "cancelled":
      return "Đã hủy";
    case "expired":
      return "Đã hết hạn";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "active":
    case "free":
      return "#10B981";
    case "cancelled":
      return "#F59E0B";
    case "expired":
      return "#EF4444";
    default:
      return "#64748B";
  }
};

export default function CurrentPlanScreen() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  const { data, isLoading, error } = useCurrentSubscription();

  const colors = {
    background: isDarkColorScheme ? "#0F172A" : "#F8FAFB",
    cardBg: isDarkColorScheme ? "#1E293B" : "#FFFFFF",
    text: isDarkColorScheme ? "#F1F5F9" : "#1F2937",
    subtext: isDarkColorScheme ? "#94A3B8" : "#64748B",
    border: isDarkColorScheme ? "#334155" : "#E2E8F0",
    divider: isDarkColorScheme ? "#334155" : "#F1F5F9",
    iconBg: isDarkColorScheme
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.05)",
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack.Screen
          options={{
            headerTitle: "Chi tiết gói dịch vụ",
            headerStyle: { backgroundColor: colors.cardBg },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !data?.subscription) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Stack.Screen
          options={{
            headerTitle: "Chi tiết gói dịch vụ",
            headerStyle: { backgroundColor: colors.cardBg },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#EF4444"
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{ color: colors.text, fontSize: 16, textAlign: "center" }}
        >
          Đã có lỗi xảy ra hoặc bạn chưa có gói dịch vụ nào.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: "#007AFF",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sub = data.subscription;
  const tierColor = getTierColor(sub.tierCode);
  const tierIcon = getTierIcon(sub.tierCode);

  const InfoRow = ({
    label,
    value,
    icon,
    disableBorder = false,
  }: {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    disableBorder?: boolean;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: disableBorder ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: colors.iconBg,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 14,
        }}
      >
        <Ionicons name={icon} size={18} color={tierColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: colors.subtext, fontSize: 13, marginBottom: 4 }}
        >
          {label}
        </Text>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          headerTitle: "Chi tiết gói dịch vụ",
          headerShown: true,
          headerStyle: { backgroundColor: colors.cardBg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: 24,
            padding: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: isDarkColorScheme ? "#000" : "#64748B",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
            shadowRadius: 16,
            elevation: 4,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDarkColorScheme
                ? "rgba(255,255,255,0.05)"
                : "#F1F5F9",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name={tierIcon} size={40} color={tierColor} />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: colors.text,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {sub.planName}
          </Text>

          <View
            style={{
              backgroundColor: getStatusColor(sub.status),
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}
            >
              {getStatusLabel(sub.status)}
            </Text>
          </View>

          <Text
            style={{
              color: colors.subtext,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {sub.description}
          </Text>
        </View>

        {/* Detailed Information Section */}
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: 24,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <InfoRow
            icon="cash-outline"
            label="Giá phí (Tháng)"
            value={
              sub.priceMonth === 0
                ? "Miễn phí"
                : `${sub.priceMonth.toLocaleString("vi-VN")}đ`
            }
          />
          <InfoRow
            icon="calendar-outline"
            label="Ngày bắt đầu"
            value={
              sub.startDate
                ? new Date(sub.startDate).toLocaleDateString("vi-VN")
                : "Không xác định"
            }
          />
          <InfoRow
            icon="time-outline"
            label="Ngày hết hạn"
            value={
              sub.endDate
                ? new Date(sub.endDate).toLocaleDateString("vi-VN")
                : "Không có (vô thời hạn)"
            }
          />
          <InfoRow
            icon="chatbubbles-outline"
            label="Kênh nhận thông báo"
            value={sub.availableChannels?.join(", ") || "—"}
          />
          <InfoRow
            icon="timer-outline"
            label="Thời gian trễ ưu tiên cao"
            value={`${
              sub.dispatchDelay?.highPrioritySeconds || 0
            } giây`}
          />
          <InfoRow
            icon="hourglass-outline"
            label="Thời gian trễ ưu tiên thấp"
            value={`${
              sub.dispatchDelay?.lowPrioritySeconds || 0
            } giây`}
          />
          <InfoRow
            icon="repeat-outline"
            label="Số lần gửi lại tối đa"
            value={`${sub.maxRetries || 1} lần`}
            disableBorder
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
