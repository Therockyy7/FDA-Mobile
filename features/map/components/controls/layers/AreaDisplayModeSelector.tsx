// features/map/components/controls/layers/AreaDisplayModeSelector.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
}: AreaDisplayModeSelectorProps) {
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

        {/* Admin Areas */}
        <TouchableOpacity
          onPress={() => onChange("admin")}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            backgroundColor: cardBg,
            borderWidth: 2,
            borderColor: selectedMode === "admin" ? accentColor : borderColor,
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
                selectedMode === "admin"
                  ? `${accentColor}20`
                  : isDarkColorScheme ? "#475569" : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="shield-crown"
              size={24}
              color={selectedMode === "admin" ? accentColor : subtextColor}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: selectedMode === "admin" ? accentColor : textColor,
              textAlign: "center",
            }}
          >
            Dự báo AI
          </Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}
