
import { Ionicons } from "@expo/vector-icons";
import { NotificationCategory, NotificationPriority, PriorityConfig } from "../types/notifications-types";

export const getPriorityConfig = (priority: NotificationPriority | string): PriorityConfig => {
  const configs: Record<string, PriorityConfig> = {
    critical: {
      color: "#DC2626",
      bgColor: "#FEE2E2",
      darkBgColor: "#7F1D1D",
      icon: "alert-circle",
      label: "NGHIÊM TRỌNG",
      level: "1"
    },
    warning: {
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      darkBgColor: "#78350F",
      icon: "warning",
      label: "CẢNH BÁO",
      level: "2"
    },
    caution: {
      color: "#EAB308", // yellow-500
      bgColor: "#FEFCE8", // yellow-50
      darkBgColor: "#422006", // yellow-950/40 approx
      icon: "alert-circle",
      label: "CHÚ Ý",
      level: "3"
    },
    info: {
      color: "#3B82F6", // blue-500
      bgColor: "#EFF6FF", // blue-50
      darkBgColor: "#172554", // blue-950/40 approx
      icon: "information-circle",
      label: "THÔNG BÁO",
      level: "4"
    },
  };
  return configs[priority] ?? configs.info;
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
