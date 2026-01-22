// features/alerts/types/alert-history.types.ts

export type AlertHistorySeverity = "Critical" | "Warning" | "Resolved";

export type AlertHistoryChannelType = "push" | "email" | "sms";
export type AlertHistoryChannelStatus = "sent" | "failed";

export interface AlertHistoryChannel {
  type: AlertHistoryChannelType;
  status: AlertHistoryChannelStatus;
}

export interface AlertHistoryItem {
  id: string;
  station: string;
  area: string;
  severity: AlertHistorySeverity;
  valueLabel: string;
  value: string;
  unit: string;
  time: string;
  date: string;
  channels: AlertHistoryChannel[];
  actionLabel: string;
  icon: "water" | "waves" | "water_damage";
  dimmed?: boolean;
}
