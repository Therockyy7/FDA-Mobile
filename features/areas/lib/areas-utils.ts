
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
    critical: {
      main: "#991B1B",
      bg: "#FEE2E2",
      text: "#7F1D1D",
      gradient: ["#DC2626", "#991B1B"] as const,
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
    critical: "nuclear",
  };
  return icons[status];
};

export const calculateWaterPercentage = (
  current: number,
  max: number
): number => {
  return Math.min((current / max) * 100, 100);
};
