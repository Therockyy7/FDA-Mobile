// features/alerts/components/alert-history/AlertHistoryValueCard.tsx
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface AlertHistoryValueCardProps {
  label: string;
  value: string;
  unit?: string;
  secondary?: string;
  accent: string;
  colors: {
    text: string;
    subtext: string;
    mutedBg: string;
    border: string;
  };
}

export function AlertHistoryValueCard({
  label,
  value,
  unit,
  secondary,
  accent,
  colors,
}: AlertHistoryValueCardProps) {
  return (
    <View
      testID="alerts-history-value-card"
      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-100 dark:bg-slate-800"
    >
      <Text
        testID="alerts-history-value-card-label"
        className="text-caption text-slate-600 dark:text-slate-400 mb-1.5 uppercase font-bold tracking-wider"
      >
        {label}
      </Text>

      <View className="flex-row items-end gap-1.5">
        <Text
          testID="alerts-history-value-card-value"
          style={{ color: accent }}
          className="text-2xl font-bold"
        >
          {value}
        </Text>
        {unit ? (
          <Text testID="alerts-history-value-card-unit" className="text-body-sm text-slate-600 dark:text-slate-400 mb-0.5">
            {unit}
          </Text>
        ) : null}
      </View>
      {secondary ? (
        <Text testID="alerts-history-value-card-secondary" className="text-caption text-slate-600 dark:text-slate-400 mt-0.5">
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}

export default AlertHistoryValueCard;
