// features/alerts/components/alert-history/AlertHistoryCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import type {
  AlertHistoryItem,
  AlertHistorySeverity,
} from "../../types/alert-history.types";

interface AlertHistoryCardProps {
  item: AlertHistoryItem;
  onPress?: () => void;
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

/* ─── Severity config (icon, colours, label) ─── */
const SEVERITY_CONFIG: Record<
  AlertHistorySeverity,
  {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgLight: string;
    bgDark: string;
    label: string;
  }
> = {
  critical: {
    icon: "alert-circle",
    color: "#EF4444",
    bgLight: "#FEE2E2",
    bgDark: "rgba(239,68,68,0.18)",
    label: "NGUY HIỂM",
  },
  warning: {
    icon: "warning",
    color: "#F59E0B",
    bgLight: "#FEF3C7",
    bgDark: "rgba(245,158,11,0.18)",
    label: "CẢNH BÁO",
  },
  caution: {
    icon: "alert-circle",
    color: "#F97316",
    bgLight: "#FFF7ED",
    bgDark: "rgba(249,115,22,0.18)",
    label: "CHÚ Ý",
  },
};

/* ─── Severity title suffix ─── */
const severityTitle = (severity: AlertHistorySeverity): string => {
  const map: Record<AlertHistorySeverity, string> = {
    critical: "Mực nước nguy hiểm",
    warning: "Mực nước cảnh báo",
    caution: "Mực nước cần chú ý",
  };
  return map[severity];
};

export function AlertHistoryCard({
  item,
  onPress,
  colors,
}: AlertHistoryCardProps) {
  const cfg = SEVERITY_CONFIG[item.severity];
  const isUnread = item.status === "open";

  /* Relative time – Vietnamese locale */
  const timeAgo = useMemo(() => {
    try {
      const date = new Date(item.triggeredAt);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch {
      return "Vừa xong";
    }
  }, [item.triggeredAt]);

  /* Build display title: "Trạm Abc – Mực nước nguy hiểm" */
  const title = `${item.stationName} – ${severityTitle(item.severity)}`;

  /* Unread highlight bg */
  const cardBg = isUnread
    ? colors.isDark
      ? "rgba(19,127,236,0.06)"
      : "rgba(19,127,236,0.04)"
    : "transparent";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: cardBg,
        borderRadius: 16,
        gap: 12,
      }}
    >
      {/* ── Severity avatar ── */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.isDark ? cfg.bgDark : cfg.bgLight,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: cfg.color + "30",
        }}
      >
        <Ionicons name={cfg.icon} size={24} color={cfg.color} />
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1, gap: 3 }}>
        {/* Title */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: isUnread ? "800" : "600",
            color: colors.text,
            letterSpacing: -0.1,
          }}
        >
          {title}
        </Text>

        {/* Description / message */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 13.5,
            fontWeight: "400",
            color: isUnread ? colors.text : colors.subtext,
            lineHeight: 19,
            opacity: isUnread ? 0.85 : 0.7,
          }}
        >
          {item.message}
        </Text>

        {/* Metadata row: station code · time · severity badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 2,
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {/* Station code */}
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
          >
            <Ionicons
              name="location"
              size={11}
              color={colors.subtext}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: colors.subtext,
              }}
            >
              {item.stationCode}
            </Text>
          </View>

          {/* Dot separator */}
          <Text
            style={{
              fontSize: 10,
              color: colors.subtext,
              opacity: 0.5,
            }}
          >
            ·
          </Text>

          {/* Relative time */}
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
          >
            <Ionicons
              name="time-outline"
              size={11}
              color={colors.subtext}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: isUnread ? colors.primary : colors.subtext,
              }}
            >
              {timeAgo}
            </Text>
          </View>

          {/* Dot separator */}
          <Text
            style={{
              fontSize: 10,
              color: colors.subtext,
              opacity: 0.5,
            }}
          >
            ·
          </Text>

          {/* Severity mini-badge */}
          <View
            style={{
              backgroundColor: cfg.color + "18",
              paddingHorizontal: 6,
              paddingVertical: 1.5,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                fontSize: 9.5,
                fontWeight: "800",
                color: cfg.color,
                letterSpacing: 0.4,
              }}
            >
              {cfg.label}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Unread dot indicator ── */}
      {isUnread && (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
            marginLeft: 4,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 3,
          }}
        />
      )}

      {/* ── Chevron (read items only) ── */}
      {!isUnread && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.subtext}
          style={{ opacity: 0.4, marginLeft: 2 }}
        />
      )}
    </TouchableOpacity>
  );
}

export default AlertHistoryCard;
