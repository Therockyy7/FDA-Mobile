// features/alerts/types/alert-history.types.ts

export type AlertHistorySeverity = "caution" | "warning" | "critical";

export interface AlertHistoryNotification {
  notificationId: string;
  channel: number;
  channelName: string;
  priority: number;
  priorityName: string;
  status: string;
  statusName: string;
  sentAt: string | null;
  deliveredAt: string | null;
  errorMessage: string | null;
  title: string;
}

export interface AlertHistoryItem {
  alertId: string;
  stationId: string;
  stationName: string;
  stationCode: string;
  severity: AlertHistorySeverity;
  priority: number;
  waterLevel: number;
  message: string;
  triggeredAt: string;
  resolvedAt: string | null;
  status: "open" | "closed";
  notifications: AlertHistoryNotification[];
}

export interface AlertHistoryResponse {
  success: boolean;
  message: string;
  alerts: AlertHistoryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
