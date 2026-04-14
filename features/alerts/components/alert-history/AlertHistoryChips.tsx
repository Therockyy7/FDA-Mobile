// features/alerts/components/alert-history/AlertHistoryChips.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Pill } from "~/components/ui/Pill";

export type AlertHistorySeverityFilter =
  | "all"
  | "critical"
  | "warning"
  | "caution";

interface AlertHistoryChipsProps {
  activeSeverity: AlertHistorySeverityFilter;
  dropdownOpen: boolean;
  onToggleDropdown: () => void;
  onSelectSeverity: (severity: AlertHistorySeverityFilter) => void;
  severityCounts: Record<Exclude<AlertHistorySeverityFilter, "all">, number>;
  totalCount: number;
  onSelectAll: () => void;
  onSelectLast30Days: () => void;
  colors: {
    primary: string;
    subtext: string;
    chipBg: string;
    border: string;
  };
}

export function AlertHistoryChips({
  activeSeverity,
  dropdownOpen,
  onToggleDropdown,
  onSelectSeverity,
  severityCounts,
  totalCount,
  onSelectAll,
  onSelectLast30Days,
  colors,
}: AlertHistoryChipsProps) {
  const labelMap: Record<AlertHistorySeverityFilter, string> = {
    all: "Tất cả",
    critical: "Nguy hiểm",
    warning: "Cảnh báo",
    caution: "Chú ý",
  };

  const activeLabel =
    activeSeverity === "all"
      ? `${labelMap.all} (${totalCount})`
      : `${labelMap[activeSeverity]} (${severityCounts[activeSeverity]})`;

  return (
    <View testID="alerts-history-chips" className="gap-2 pb-2">
      <View className="flex-row gap-2.5">
        <TouchableOpacity
          testID="alerts-history-chips-severity-toggle"
          onPress={onToggleDropdown}
          activeOpacity={0.7}
        >
          <Pill
            label={activeLabel}
            leftIcon={
              dropdownOpen ? (
                <Ionicons name="chevron-up" size={12} color="#fff" />
              ) : (
                <Ionicons name="chevron-down" size={12} color="#fff" />
              )
            }
            variant={activeSeverity !== "all" ? "filled" : "outline"}
            className="h-9"
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="alerts-history-chips-30days"
          onPress={onSelectLast30Days}
          activeOpacity={0.7}
        >
          <Pill
            label="30 ngày"
            leftIcon={<Ionicons name="calendar-outline" size={12} color="#fff" />}
            variant="outline"
            className="h-9"
          />
        </TouchableOpacity>
      </View>

      {dropdownOpen ? (
        <View className="flex-row gap-2 flex-wrap">
          <TouchableOpacity
            testID="alerts-history-chips-all"
            onPress={onSelectAll}
            activeOpacity={0.7}
          >
            <Pill
              label={`${labelMap.all} (${totalCount})`}
              variant={activeSeverity === "all" ? "filled" : "outline"}
              className="h-9"
            />
          </TouchableOpacity>
          {(["critical", "warning", "caution"] as const).map((severity) => (
            <TouchableOpacity
              key={severity}
              testID={`alerts-history-chips-${severity}`}
              onPress={() => onSelectSeverity(severity)}
              activeOpacity={0.7}
            >
              <Pill
                label={`${labelMap[severity]} (${severityCounts[severity]})`}
                variant={activeSeverity === severity ? "filled" : "outline"}
                className="h-9"
              />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default AlertHistoryChips;
