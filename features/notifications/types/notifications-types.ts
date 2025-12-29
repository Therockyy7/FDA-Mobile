
export type NotificationPriority = "critical" | "high" | "medium" | "low";
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
