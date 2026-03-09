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
      style={{
        flex: 1,
        backgroundColor: colors.mutedBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 0.8,
          color: colors.subtext,
          marginBottom: 6,
          textTransform: "uppercase",
          fontWeight: "700",
        }}
      >
        {label}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
        <Text style={{ fontSize: 22, color: accent, fontWeight: "800" }}>{value}</Text>
        {unit ? (
          <Text style={{ fontSize: 12, color: colors.subtext, marginBottom: 2 }}>
            {unit}
          </Text>
        ) : null}
      </View>
      {secondary ? (
        <Text style={{ fontSize: 10, color: colors.subtext, marginTop: 2 }}>
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}

export default AlertHistoryValueCard;
