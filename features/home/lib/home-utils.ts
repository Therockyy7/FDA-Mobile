
import { FloodLevel, StatusConfig } from "../types/home-types";

export const getStatusConfig = (status: FloodLevel): StatusConfig => {
  const configs: Record<FloodLevel, StatusConfig> = {
    safe: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "checkmark-circle",
      iconColor: "#10B981",
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      icon: "alert-circle",
      iconColor: "#F59E0B",
    },
    danger: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      icon: "alert",
      iconColor: "#EF4444",
    },
    critical: {
      bg: "bg-rose-100 dark:bg-rose-900/30",
      text: "text-rose-700 dark:text-rose-300",
      icon: "warning",
      iconColor: "#BE123C",
    },
  };
  return configs[status];
};
