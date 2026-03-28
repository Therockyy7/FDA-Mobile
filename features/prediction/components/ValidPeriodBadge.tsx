import React from "react";
import { View, Text } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import type { ValidPeriod } from "../types/prediction.types";

interface ValidPeriodBadgeProps {
  validPeriod: ValidPeriod;
}

export function ValidPeriodBadge({ validPeriod }: ValidPeriodBadgeProps) {
  const { isDarkColorScheme } = useColorScheme();

  const formatTime = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const isActive = validPeriod.status === "Active";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDarkColorScheme
          ? isActive ? "rgba(22, 163, 74, 0.15)" : "rgba(220, 38, 38, 0.15)"
          : isActive ? "#F0FDF4" : "#FEF2F2",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        borderWidth: 1,
        borderColor: isDarkColorScheme
          ? isActive ? "rgba(22, 163, 74, 0.3)" : "rgba(220, 38, 38, 0.3)"
          : isActive ? "#BBF7D0" : "#FECACA",
      }}
    >
      {/* Status dot */}
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isActive ? "#16A34A" : "#DC2626",
        }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: isActive ? "#16A34A" : "#DC2626",
          }}
        >
          {isActive ? "Dự báo đang hoạt động" : "Dự báo hết hạn"}
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            color: isDarkColorScheme ? "#94A3B8" : "#64748B",
            marginTop: 2,
          }}
        >
          {formatTime(validPeriod.start)} – {formatTime(validPeriod.end)} ({validPeriod.duration_hours}h)
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: isDarkColorScheme ? "#94A3B8" : "#64748B",
          }}
        >
          Cập nhật tiếp
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: isDarkColorScheme ? "#E2E8F0" : "#334155",
          }}
        >
          {formatTime(validPeriod.next_update_expected)}
        </Text>
      </View>
    </View>
  );
}
