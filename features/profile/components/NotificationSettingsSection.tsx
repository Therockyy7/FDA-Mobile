// features/profile/components/NotificationSettingsSection.tsx
import React from "react";
import { Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

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
  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: "#1F2937",
          marginBottom: 16,
        }}
      >
        Tùy chọn thông báo
      </Text>

      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        {/* Emergency Alerts */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Cảnh báo khẩn cấp
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Nhận thông báo nguy hiểm ngay lập tức
            </Text>
          </View>
          <Switch
            value={emergencyAlerts}
            onValueChange={setEmergencyAlerts}
            trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
            thumbColor={emergencyAlerts ? "#10B981" : "#F3F4F6"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

        {/* Weather Updates */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Ionicons name="rainy" size={20} color="#3B82F6" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Cập nhật thời tiết
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Dự báo mưa và thời tiết hàng ngày
            </Text>
          </View>
          <Switch
            value={weatherUpdates}
            onValueChange={setWeatherUpdates}
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={weatherUpdates ? "#3B82F6" : "#F3F4F6"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

        {/* Traffic Alerts */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Ionicons name="car" size={20} color="#F59E0B" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Cảnh báo giao thông
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Tình trạng ngập đường và tắc đường
            </Text>
          </View>
          <Switch
            value={trafficAlerts}
            onValueChange={setTrafficAlerts}
            trackColor={{ false: "#D1D5DB", true: "#FDE68A" }}
            thumbColor={trafficAlerts ? "#F59E0B" : "#F3F4F6"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

        {/* Weekly Report */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Ionicons name="mail" size={20} color="#8B5CF6" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Báo cáo tuần
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Tổng kết tình hình hàng tuần qua email
            </Text>
          </View>
          <Switch
            value={weeklyReport}
            onValueChange={setWeeklyReport}
            trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
            thumbColor={weeklyReport ? "#8B5CF6" : "#F3F4F6"}
          />
        </View>
      </View>
    </View>
  );
};

export default NotificationSettingsSection;
