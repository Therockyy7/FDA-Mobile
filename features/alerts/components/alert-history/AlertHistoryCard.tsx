// features/alerts/components/alert-history/AlertHistoryCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Badge } from "~/components/ui/Badge";
import { Text } from "~/components/ui/text";
import { SHADOW } from "~/lib/design-tokens";
import type {
  AlertHistoryItem,
  AlertHistorySeverity,
} from "../../types/alert-history.types";
import { formatAlertTitle } from "../../utils/formatAlertTitle";

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

/* ─── Severity config (icon, badge variant mapping) ─── */
const SEVERITY_CONFIG: Record<
  AlertHistorySeverity,
  {
    icon: keyof typeof Ionicons.glyphMap;
    badgeVariant: "critical" | "danger" | "warning";
    label: string;
  }
> = {
  critical: {
    icon: "alert-circle",
    badgeVariant: "critical",
    label: "NGUY HIỂM",
  },
  warning: {
    icon: "warning",
    badgeVariant: "warning",
    label: "CẢNH BÁO",
  },
  caution: {
    icon: "alert-circle",
    badgeVariant: "danger",
    label: "CHÚ Ý",
  },
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

  /* Display title – strip prefix before ":" from API message */
  const title = formatAlertTitle(item.message) || item.stationName;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      testID="alerts-history-card"
      className="flex-row items-center py-3.5 px-3.5 rounded-2xl gap-3 bg-slate-50 dark:bg-slate-900/30"
      style={isUnread ? SHADOW.sm : undefined}
    >
      {/* ── Severity badge avatar ── */}
      <View className="w-11 h-11 rounded-xl bg-flood-light-safe dark:bg-flood-dark-safe items-center justify-center border border-opacity-30 border-flood-safe">
        <Ionicons name={cfg.icon} size={22} color={colors.primary} />
      </View>

      {/* ── Content ── */}
      <View className="flex-1 gap-1">
        {/* Title */}
        <Text
          numberOfLines={2}
          testID="alerts-history-card-title"
          className={`text-body-md font-semibold text-slate-900 dark:text-slate-50 ${
            isUnread ? "font-bold" : "font-semibold"
          }`}
        >
          {title}
        </Text>

        {/* Metadata row: time · severity badge */}
        <View className="flex-row items-center gap-1.5 flex-wrap">
          {/* Relative time */}
          <Text
            testID="alerts-history-card-time"
            className={`text-caption font-medium ${
              isUnread
                ? "text-primary dark:text-primary"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {timeAgo}
          </Text>

          {/* Dot separator */}
          <Text className="text-caption text-slate-600 dark:text-slate-400 opacity-50">
            ·
          </Text>

          {/* Severity badge */}
          <Badge
            testID="alerts-history-card-severity-badge"
            variant={cfg.badgeVariant}
            size="sm"
            label={cfg.label}
          />
        </View>
      </View>

      {/* ── Unread dot indicator ── */}
      {isUnread && (
        <View
          testID="alerts-history-card-unread-indicator"
          className="w-2 h-2 rounded-full bg-primary ml-0.5"
          style={SHADOW.sm}
        />
      )}

      {/* ── Chevron (read items only) ── */}
      {!isUnread && (
        <Ionicons
          testID="alerts-history-card-chevron"
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
