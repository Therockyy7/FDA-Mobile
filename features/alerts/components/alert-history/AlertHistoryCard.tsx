// features/alerts/components/alert-history/AlertHistoryCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AlertHistoryItem, AlertHistorySeverity } from "../../types/alert-history.types";
import AlertHistoryChannelsRow from "./AlertHistoryChannelsRow";
import AlertHistoryValueCard from "./AlertHistoryValueCard";

interface AlertHistoryCardProps {
  item: AlertHistoryItem;
  colors: {
    primary: string;
    card: string;
    text: string;
    subtext: string;
    mutedBg: string;
    divider: string;
    border: string;
    isDark: boolean;
  };
}

const iconName = (k: AlertHistoryItem["icon"]) => {
  switch (k) {
    case "water_damage":
      return "water-outline";
    case "waves":
      return "pulse-outline";
    case "water":
    default:
      return "water-outline";
  }
};

const severityStyle = (
  severity: AlertHistorySeverity,
  isDark: boolean,
  primary: string,
) => {
  if (severity === "Critical") {
    return {
      border: "rgba(239,68,68,0.3)",
      tagBg: "#EF4444",
      tagText: "#fff",
      accent: "#EF4444",
      iconBg: "rgba(239,68,68,0.1)",
    };
  }
  if (severity === "Warning") {
    return {
      border: "rgba(245,158,11,0.3)",
      tagBg: "#F59E0B",
      tagText: "#fff",
      accent: "#F59E0B",
      iconBg: "rgba(245,158,11,0.1)",
    };
  }
  return {
    border: "rgba(19,127,236,0.18)",
    tagBg: "rgba(19,127,236,0.16)",
    tagText: primary,
    accent: "#94A3B8",
    iconBg: isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.06)",
  };
};

export function AlertHistoryCard({ item, colors }: AlertHistoryCardProps) {
  const style = severityStyle(item.severity, colors.isDark, colors.primary);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: style.border,
        overflow: "hidden",
        opacity: item.dimmed ? 0.8 : 1,
      }}
    >
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: style.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={iconName(item.icon)} size={18} color={style.accent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>
                {item.station}
              </Text>
              <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 2 }}>
                {item.area}
              </Text>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: style.tagBg,
              marginLeft: 12,
            }}
          >
            <Text
              style={{
                color: style.tagText,
                fontSize: 10,
                letterSpacing: 1,
                fontWeight: "800",
              }}
            >
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
          <AlertHistoryValueCard
            label={item.valueLabel}
            value={item.value}
            unit={item.unit}
            accent={style.accent}
            colors={{
              text: colors.text,
              subtext: colors.subtext,
              mutedBg: colors.mutedBg,
              border: colors.isDark
                ? "rgba(148,163,184,0.12)"
                : "rgba(15,23,42,0.06)",
            }}
          />
          <AlertHistoryValueCard
            label={item.severity === "Resolved" ? "Resolved At" : "Triggered"}
            value={item.time}
            secondary={item.date}
            accent={colors.text}
            colors={{
              text: colors.text,
              subtext: colors.subtext,
              mutedBg: colors.mutedBg,
              border: colors.isDark
                ? "rgba(148,163,184,0.12)"
                : "rgba(15,23,42,0.06)",
            }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            paddingTop: 12,
          }}
        >
          <AlertHistoryChannelsRow channels={item.channels} subtext={colors.subtext} />

          <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "800" }}>
              {item.actionLabel}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default AlertHistoryCard;
