
import { Ionicons } from "@expo/vector-icons";
import { NotificationCategory, NotificationPriority, PriorityConfig } from "../types/notifications-types";

export const getPriorityConfig = (priority: NotificationPriority): PriorityConfig => {
  const configs: Record<NotificationPriority, PriorityConfig> = {
    critical: {
      color: "#DC2626",
      bgColor: "#FEE2E2",
      darkBgColor: "#7F1D1D",
      icon: "alert-circle",
      label: "KHẨN CẤP",
      level: "1"
    },
    high: {
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      darkBgColor: "#78350F",
      icon: "warning",
      label: "QUAN TRỌNG",
      level: "2"
    },
    medium: {
      color: "#3B82F6",
      bgColor: "#DBEAFE",
      darkBgColor: "#1E3A8A",
      icon: "information-circle",
      label: "THÔNG BÁO",
      level: "3"
    },
    low: {
      color: "#10B981",
      bgColor: "#D1FAE5",
      darkBgColor: "#065F46",
      icon: "checkmark-circle",
      label: "CẬP NHẬT",
      level: "4"
    },
  };
  return configs[priority];
};

export const getCategoryIcon = (
  category: NotificationCategory
): keyof typeof Ionicons.glyphMap => {
  const icons: Record<NotificationCategory, keyof typeof Ionicons.glyphMap> = {
    flood: "water",
    water_level: "trending-up",
    weather: "rainy",
    traffic: "car",
    system: "settings",
  };
  return icons[category];
};
