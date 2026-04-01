
export type NotificationPriority = "critical" | "warning" | "caution" | "info";
export type NotificationCategory = "flood" | "water_level" | "weather" | "traffic" | "system";

export interface Notification {
  id: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  location: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  description?: string;
  affectedArea?: string;
  waterLevel?: number;
  actions?: {
    viewMap?: boolean;
    getDirections?: boolean;
    viewDetails?: boolean;
  };
}

export interface PriorityConfig {
  color: string;
  bgColor: string;
  darkBgColor: string;
  icon: "alert-circle" | "warning" | "information-circle" | "checkmark-circle";
  label: string;
  level: string;
}

export interface FilterOption {
  key: "all" | NotificationPriority;
  label: string;
  color?: string;
}

export interface NotificationItem {
  alertId: string;
  stationId: string;
  stationName: string;
  stationCode: string;
  severity: "critical" | "warning" | "caution" | "info" | string;
  severityName: string;
  waterLevel: number;
  alertMessage: string;
  triggeredAt: string;
  notificationId: string;
  title: string;
  content: string;
  sentAt: string;
  deliveredAt: string | null;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  success: boolean;
  message: string;
  notifications: NotificationItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationHistoryRequest {
  startDate?: string; // ISO 8601
  endDate?: string;   // ISO 8601
  pageNumber?: number;
  pageSize?: number;
}
