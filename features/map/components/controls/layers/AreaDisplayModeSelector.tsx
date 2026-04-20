// features/map/components/controls/layers/AreaDisplayModeSelector.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface AreaDisplayModeSelectorProps {
  selectedMode: "user" | "admin";
  onChange: (mode: "user" | "admin") => void;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  borderColor: string;
  isDarkColorScheme: boolean;
  isFreePlan?: boolean;
}

export function AreaDisplayModeSelector({
  selectedMode,
  onChange,
  accentColor,
  textColor,
  subtextColor,
  cardBg,
  borderColor,
  isDarkColorScheme,
  isFreePlan = false,
}: AreaDisplayModeSelectorProps) {
  const router = useRouter();

  const lockedColor = isDarkColorScheme ? "#475569" : "#CBD5E1";
  const lockedBg = isDarkColorScheme ? "#1E293B" : "#F1F5F9";
  const lockBadgeBg = isDarkColorScheme ? "#F59E0B" : "#F59E0B";

  const handleAdminPress = () => {
    if (isFreePlan) {
      // Do nothing — the hint below explains the action
      return;
    }
    onChange("admin");
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: subtextColor,
          marginBottom: 12,
          letterSpacing: 0.5,
        }}
      >
        CHẾ ĐỘ KHU VỰC
      </Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* User Areas */}
        <TouchableOpacity
          onPress={() => onChange("user")}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: cardBg,
            borderWidth: 2,
            borderColor: selectedMode === "user" ? accentColor : borderColor,
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor:
                selectedMode === "user"
                  ? `${accentColor}20`
                  : isDarkColorScheme ? "#475569" : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="person-circle"
              size={24}
              color={selectedMode === "user" ? accentColor : subtextColor}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: selectedMode === "user" ? accentColor : textColor,
              textAlign: "center",
            }}
          >
            Khu vực của tôi
          </Text>
        </TouchableOpacity>

        {/* Admin Areas / AI Forecast */}
        <TouchableOpacity
          onPress={handleAdminPress}
          activeOpacity={isFreePlan ? 1 : 0.7}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: isFreePlan ? lockedBg : cardBg,
            borderWidth: 2,
            borderColor: isFreePlan
              ? lockedColor
              : selectedMode === "admin"
              ? accentColor
              : borderColor,
            alignItems: "center",
            gap: 8,
            opacity: isFreePlan ? 0.85 : 1,
          }}
        >
          {/* Lock badge overlay */}
          {isFreePlan && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: lockBadgeBg,
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <Ionicons name="lock-closed" size={11} color="#fff" />
            </View>
          )}

          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: isFreePlan
                ? isDarkColorScheme ? "#334155" : "#E2E8F0"
                : selectedMode === "admin"
                ? `${accentColor}20`
                : isDarkColorScheme ? "#475569" : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="shield-crown"
              size={24}
              color={
                isFreePlan
                  ? lockedColor
                  : selectedMode === "admin"
                  ? accentColor
                  : subtextColor
              }
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isFreePlan
                ? lockedColor
                : selectedMode === "admin"
                ? accentColor
                : textColor,
              textAlign: "center",
            }}
          >
            Dự báo AI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info / Upgrade hint */}
      {isFreePlan ? (
        <TouchableOpacity
          onPress={() => router.push("/plans")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 12,
            backgroundColor: isDarkColorScheme ? "#78350F20" : "#FEF3C720",
            borderWidth: 1,
            borderColor: isDarkColorScheme ? "#F59E0B40" : "#FCD34D",
            gap: 8,
            marginTop: 12,
          }}
        >
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={{ flex: 1, fontSize: 11, color: "#F59E0B", lineHeight: 16, fontWeight: "600" }}>
            Tính năng <Text style={{ fontWeight: "800" }}>Dự báo AI</Text> chỉ dành cho gói Premium.{" "}
            <Text style={{ textDecorationLine: "underline" }}>Đăng ký ngay →</Text>
          </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            padding: 12,
            borderRadius: 12,
            backgroundColor: `${accentColor}10`,
            gap: 8,
            marginTop: 12,
          }}
        >
          <Ionicons name="information-circle" size={16} color={accentColor} />
          <Text style={{ flex: 1, fontSize: 11, color: subtextColor, lineHeight: 16 }}>
            {selectedMode === "user"
              ? "Hiển thị các khu vực bạn đã tạo"
              : "Hiển thị các khu vực được Admin phân tích sẵn với AI"}
          </Text>
        </View>
      )}
    </View>
  );
}
