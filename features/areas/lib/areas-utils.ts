
import { Ionicons } from "@expo/vector-icons";
import { AreaStatus, StatusColors } from "../types/areas-types";

export const getStatusConfig = (status: AreaStatus): StatusColors => {
  const configs: Record<AreaStatus, StatusColors> = {
    safe: {
      main: "#10B981",
      bg: "#ECFDF5",
      text: "#047857",
      gradient: ["#10B981", "#059669"] as const,
    },
    warning: {
      main: "#F59E0B",
      bg: "#FFFBEB",
      text: "#B45309",
      gradient: ["#F59E0B", "#D97706"] as const,
    },
    danger: {
      main: "#EF4444",
      bg: "#FEF2F2",
      text: "#DC2626",
      gradient: ["#EF4444", "#DC2626"] as const,
    },
  };
  return configs[status];
};

export const getStatusIcon = (
  status: AreaStatus
): keyof typeof Ionicons.glyphMap => {
  const icons: Record<AreaStatus, keyof typeof Ionicons.glyphMap> = {
    safe: "shield-checkmark",
    warning: "warning",
    danger: "alert-circle",
  };
  return icons[status];
};

export const calculateWaterPercentage = (
  current: number,
  max: number
): number => {
  return Math.min((current / max) * 100, 100);
};
