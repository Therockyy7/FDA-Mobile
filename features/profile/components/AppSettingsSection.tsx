// features/profile/components/AppSettingsSection.tsx
import React from "react";
import { Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";

type Props = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
};

const AppSettingsSection: React.FC<Props> = ({
  darkMode,
  setDarkMode,
  autoRefresh,
  setAutoRefresh,
  soundEnabled,
  setSoundEnabled,
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
        Cài đặt ứng dụng
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
        {/* Dark Mode */}
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
              <Ionicons name="moon" size={20} color="#6366F1" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Chế độ tối
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Giao diện tối bảo vệ mắt
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
            thumbColor={darkMode ? "#6366F1" : "#F3F4F6"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

        {/* Auto Refresh */}
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
              <Ionicons name="refresh" size={20} color="#10B981" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Tự động cập nhật
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Làm mới dữ liệu mỗi 5 phút
            </Text>
          </View>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
            thumbColor={autoRefresh ? "#10B981" : "#F3F4F6"}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#F3F4F6" }} />

        {/* Sound */}
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
              <Ionicons name="volume-high" size={20} color="#EC4899" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginLeft: 8,
                }}
              >
                Âm thanh
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: "#6B7280",
              }}
            >
              Phát âm báo khi có cảnh báo
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: "#D1D5DB", true: "#F9A8D4" }}
            thumbColor={soundEnabled ? "#EC4899" : "#F3F4F6"}
          />
        </View>
      </View>
    </View>
  );
};

export default AppSettingsSection;
