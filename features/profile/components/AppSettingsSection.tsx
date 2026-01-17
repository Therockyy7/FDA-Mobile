// features/profile/components/AppSettingsSection.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, View } from "react-native";
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
  // Dynamic colors based on dark mode state
  const colors = {
    background: darkMode ? "#1E293B" : "white",
    containerBg: darkMode ? "#0F172A" : "#F9FAFB",
    border: darkMode ? "#334155" : "#E5E7EB",
    divider: darkMode ? "#334155" : "#F3F4F6",
    title: darkMode ? "#F1F5F9" : "#1F2937",
    text: darkMode ? "#E2E8F0" : "#1F2937",
    subtext: darkMode ? "#94A3B8" : "#6B7280",
  };

  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "800",
          color: colors.title,
          marginBottom: 16,
        }}
      >
        Cài đặt ứng dụng
      </Text>

      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
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
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: darkMode ? "#312E81" : "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={darkMode ? "moon" : "sunny"} size={20} color={darkMode ? "#A5B4FC" : "#6366F1"} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {darkMode ? "Chế độ tối" : "Chế độ sáng"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: colors.subtext,
                  }}
                >
                  {darkMode ? "Bảo vệ mắt vào ban đêm" : "Giao diện sáng, rõ ràng"}
                </Text>
              </View>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#D1D5DB", true: "#6366F1" }}
            thumbColor={"white"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider }} />

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
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: darkMode ? "#064E3B" : "#ECFDF5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="refresh" size={20} color="#10B981" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Tự động cập nhật
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: colors.subtext,
                  }}
                >
                  Làm mới dữ liệu mỗi 5 phút
                </Text>
              </View>
            </View>
          </View>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            trackColor={{ false: "#D1D5DB", true: "#10B981" }}
            thumbColor={"white"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider }} />

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
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: darkMode ? "#831843" : "#FDF2F8",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="volume-high" size={20} color="#EC4899" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Âm thanh
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: colors.subtext,
                  }}
                >
                  Phát âm báo khi có cảnh báo
                </Text>
              </View>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: "#D1D5DB", true: "#EC4899" }}
            thumbColor={"white"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>
      </View>
    </View>
  );
};

export default AppSettingsSection;
