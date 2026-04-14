import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { SHADOW } from "~/lib/design-tokens";
import type { ForecastWindow } from "../types/prediction.types";

interface Props {
  windows: ForecastWindow[];
  evaluatedAt: string;
}

const WINDOW_STATUS_COLOR: Record<string, string> = {
  Normal: "#10B981",
  Moderate: "#F59E0B",
  High: "#EF4444",
  Critical: "#7C3AED",
};

const WINDOW_LABEL: Record<string, string> = {
  Normal: "Bình thường",
  Moderate: "Cảnh báo",
  High: "Nguy hiểm",
  Critical: "Rất nguy hiểm",
};

export function ForecastWindowsCard({ windows, evaluatedAt }: Props) {
  const evalDate = new Date(evaluatedAt);
  const evalStr = evalDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4" style={SHADOW.md} testID="prediction-forecast-windows-card">
      <SectionHeader
        title="Dự báo theo giờ"
        subtitle={`Cập nhật lúc ${evalStr}`}
        testID="prediction-forecast-windows-header"
        className="mb-3.5"
        rightAction={
          <View className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-900 items-center justify-center">
            <Ionicons name="time" size={16} color="#3B82F6" />
          </View>
        }
      />

      <View className="flex-row gap-2">
        {windows.map((w) => {
          const color = WINDOW_STATUS_COLOR[w.status] ?? "#94A3B8";
          const prob = Math.round(w.probability * 100);
          return (
            <View
              key={w.horizon}
              className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 items-center gap-1"
              style={{ borderTopWidth: 3, borderTopColor: color }}
              testID={`prediction-forecast-window-${w.horizon}`}
            >
              <Text className="text-lg font-black" style={{ color }}>{prob}%</Text>
              <Text className="text-[11px] font-bold text-slate-800 dark:text-slate-100 text-center">
                {WINDOW_LABEL[w.status] ?? w.status}
              </Text>
              <View className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">+{w.horizon}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
