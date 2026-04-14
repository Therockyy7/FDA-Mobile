import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { FLOOD_COLORS } from "~/lib/design-tokens";
import type { ValidPeriod } from "../types/prediction.types";

interface ValidPeriodBadgeProps {
  validPeriod: ValidPeriod;
}

export function ValidPeriodBadge({ validPeriod }: ValidPeriodBadgeProps) {
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
  const statusColor = isActive ? FLOOD_COLORS.safe : FLOOD_COLORS.danger;

  return (
    <View
      testID="prediction-valid-period-badge"
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        borderWidth: 1,
      }}
      className={
        isActive
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/40"
          : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/40"
      }
    >
      {/* Status dot */}
      <View
        testID="prediction-valid-period-dot"
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: statusColor,
        }}
      />

      <View style={{ flex: 1 }}>
        <Text
          testID="prediction-valid-period-status"
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: statusColor,
          }}
        >
          {isActive ? "Dự báo đang hoạt động" : "Dự báo hết hạn"}
        </Text>
        <Text
          testID="prediction-valid-period-time"
          style={{
            fontSize: 11,
            fontWeight: "500",
            marginTop: 2,
          }}
          className="text-slate-500 dark:text-slate-400"
        >
          {formatTime(validPeriod.start)} – {formatTime(validPeriod.end)} ({validPeriod.duration_hours}h)
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
          }}
          className="text-slate-500 dark:text-slate-400"
        >
          Cập nhật tiếp
        </Text>
        <Text
          testID="prediction-valid-period-next-update"
          style={{
            fontSize: 11,
            fontWeight: "700",
          }}
          className="text-slate-700 dark:text-slate-200"
        >
          {formatTime(validPeriod.next_update_expected)}
        </Text>
      </View>
    </View>
  );
}
