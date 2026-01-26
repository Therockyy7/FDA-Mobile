// features/alerts/components/alert-history/AlertHistoryChips.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";

interface ChipProps {
  active: boolean;
  label: string;
  rightIcon?: string;
  colors: {
    primary: string;
    subtext: string;
    chipBg: string;
    border: string;
  };
  onPress: () => void;
}

function Chip({ active, label, rightIcon, colors, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        backgroundColor: active ? colors.primary : colors.chipBg,
        borderWidth: active ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "800",
          color: active ? "#fff" : colors.subtext,
        }}
      >
        {label}
      </Text>
      {rightIcon ? (
        <Ionicons
          name={rightIcon as any}
          size={14}
          color={active ? "#fff" : colors.subtext}
        />
      ) : null}
    </TouchableOpacity>
  );
}

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
    all: "All Alerts",
    critical: "Critical",
    warning: "Warning",
    caution: "Caution",
  };

  const activeLabel =
    activeSeverity === "all"
      ? `${labelMap.all} (${totalCount})`
      : `${labelMap[activeSeverity]} (${severityCounts[activeSeverity]})`;

  return (
    <View style={{ gap: 8, paddingBottom: 8 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Chip
          active={activeSeverity === "all"}
          label={`${labelMap.all} (${totalCount})`}
          colors={colors}
          onPress={onSelectAll}
        />
        <Chip
          active={activeSeverity !== "all"}
          label={activeLabel}
          rightIcon={dropdownOpen ? "chevron-up" : "chevron-down"}
          colors={colors}
          onPress={onToggleDropdown}
        />
        <Chip
          active={false}
          label="Last 30 Days"
          rightIcon="calendar-outline"
          colors={colors}
          onPress={onSelectLast30Days}
        />
      </View>

      {dropdownOpen ? (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {(["critical", "warning", "caution"] as const).map(
            (severity) => (
              <Chip
                key={severity}
                active={activeSeverity === severity}
                label={`${labelMap[severity]} (${severityCounts[severity]})`}
                colors={colors}
                onPress={() => onSelectSeverity(severity)}
              />
            ),
          )}
        </View>
      ) : null}
    </View>
  );
}

export default AlertHistoryChips;
