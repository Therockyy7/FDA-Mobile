// features/profile/components/NotificationSettingsSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

type NotificationItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgLight: string;
  iconBgDark: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  trackColorOn: string;
  thumbColorOn: string;
};

type Props = {
  emergencyAlerts: boolean;
  setEmergencyAlerts: (v: boolean) => void;
  weatherUpdates: boolean;
  setWeatherUpdates: (v: boolean) => void;
  trafficAlerts: boolean;
  setTrafficAlerts: (v: boolean) => void;
  weeklyReport: boolean;
  setWeeklyReport: (v: boolean) => void;
};

const NotificationSettingsSection: React.FC<Props> = ({
  emergencyAlerts,
  setEmergencyAlerts,
  weatherUpdates,
  setWeatherUpdates,
  trafficAlerts,
  setTrafficAlerts,
  weeklyReport,
  setWeeklyReport,
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
    trackOff: isDarkColorScheme ? "#475569" : "#D1D5DB",
    thumbOff: isDarkColorScheme ? "#94A3B8" : "#F3F4F6",
  };

  const notifications: NotificationItem[] = [
    {
      id: "emergency",
      icon: "alert-circle",
      iconColor: "#EF4444",
      iconBgLight: "#FEE2E2",
      iconBgDark: "#7F1D1D",
      title: "Cảnh báo khẩn cấp",
      description: "Nhận thông báo nguy hiểm ngay lập tức",
      value: emergencyAlerts,
      onValueChange: setEmergencyAlerts,
      trackColorOn: "#FCA5A5",
      thumbColorOn: "#EF4444",
    },
    {
      id: "weather",
      icon: "rainy",
      iconColor: "#3B82F6",
      iconBgLight: "#DBEAFE",
      iconBgDark: "#1E3A5F",
      title: "Cập nhật thời tiết",
      description: "Dự báo mưa và thời tiết hàng ngày",
      value: weatherUpdates,
      onValueChange: setWeatherUpdates,
      trackColorOn: "#93C5FD",
      thumbColorOn: "#3B82F6",
    },
    {
      id: "traffic",
      icon: "car",
      iconColor: "#F59E0B",
      iconBgLight: "#FEF3C7",
      iconBgDark: "#78350F",
      title: "Cảnh báo giao thông",
      description: "Tình trạng ngập đường và tắc đường",
      value: trafficAlerts,
      onValueChange: setTrafficAlerts,
      trackColorOn: "#FDE68A",
      thumbColorOn: "#F59E0B",
    },
    {
      id: "weekly",
      icon: "mail",
      iconColor: "#8B5CF6",
      iconBgLight: "#EDE9FE",
      iconBgDark: "#4C1D95",
      title: "Báo cáo tuần",
      description: "Tổng kết tình hình hàng tuần qua email",
      value: weeklyReport,
      onValueChange: setWeeklyReport,
      trackColorOn: "#C4B5FD",
      thumbColorOn: "#8B5CF6",
    },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* Section Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: isDarkColorScheme ? "rgba(96, 165, 250, 0.15)" : "rgba(59, 130, 246, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Ionicons name="notifications" size={16} color={colors.sectionTitle} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
          Tùy chọn thông báo
        </Text>
      </View>

      {/* Settings Card */}
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          shadowColor: isDarkColorScheme ? "#000" : "#64748B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {notifications.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => item.onValueChange(!item.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {/* Icon Container */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: isDarkColorScheme ? item.iconBgDark : item.iconBgLight,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>

                {/* Text Content */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: colors.subtext,
                      lineHeight: 16,
                    }}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>

              {/* Switch */}
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: colors.trackOff, true: item.trackColorOn }}
                thumbColor={item.value ? item.thumbColorOn : colors.thumbOff}
                style={{ transform: [{ scale: 0.9 }] }}
              />
            </TouchableOpacity>

            {/* Divider */}
            {index < notifications.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.divider,
                  marginLeft: 74,
                }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Info Tip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginTop: 12,
          paddingHorizontal: 8,
        }}
      >
        <Ionicons name="information-circle-outline" size={14} color={colors.subtext} style={{ marginTop: 1 }} />
        <Text
          style={{
            fontSize: 11,
            color: colors.subtext,
            marginLeft: 6,
            flex: 1,
            lineHeight: 16,
          }}
        >
          Bạn có thể tắt tất cả thông báo trong cài đặt hệ thống của điện thoại
        </Text>
      </View>
    </View>
  );
};

export default NotificationSettingsSection;
