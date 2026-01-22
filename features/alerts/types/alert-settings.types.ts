// features/alerts/types/alert-settings.types.ts

export type AlertSeverity = "Caution" | "Warning" | "Critical";

export interface NotificationChannels {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface AlertSettings {
  areaId: string;
  areaName: string;
  minimumSeverity: AlertSeverity;
  notificationChannels: NotificationChannels;
  quietHours: QuietHours;
}

export interface AlertSettingsFormData {
  minimumSeverity: AlertSeverity;
  notificationChannels: NotificationChannels;
  quietHours: QuietHours;
}

export interface AlertSettingsColors {
  background: string;
  cardBg: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  mutedBg: string;
  divider: string;
  statusBarStyle: "light-content" | "dark-content";
}

export interface AlertSettingsHeaderColors {
  background: string;
  text: string;
  subtext: string;
  border: string;
}