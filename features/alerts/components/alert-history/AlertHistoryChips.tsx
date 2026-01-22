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

interface AlertHistoryChipsProps {
  chipAll: boolean;
  onSelectAll: () => void;
  onSelectCritical: () => void;
  onSelectLast30Days: () => void;
  colors: {
    primary: string;
    subtext: string;
    chipBg: string;
    border: string;
  };
}

export function AlertHistoryChips({
  chipAll,
  onSelectAll,
  onSelectCritical,
  onSelectLast30Days,
  colors,
}: AlertHistoryChipsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 10, paddingBottom: 8 }}>
      <Chip active={chipAll} label="All Alerts" colors={colors} onPress={onSelectAll} />
      <Chip
        active={!chipAll}
        label="Critical"
        rightIcon="chevron-down"
        colors={colors}
        onPress={onSelectCritical}
      />
      <Chip
        active={false}
        label="Last 30 Days"
        rightIcon="calendar-outline"
        colors={colors}
        onPress={onSelectLast30Days}
      />
    </View>
  );
}

export default AlertHistoryChips;
