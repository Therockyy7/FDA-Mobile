import { SensorStatus } from "../constants/map-data";

export const getStatusColor = (status: SensorStatus) => {
  const colors = {
    safe: { main: "#10B981", bg: "#ECFDF5", text: "#047857" },
    warning: { main: "#F59E0B", bg: "#FFFBEB", text: "#B45309" },
    danger: { main: "#EF4444", bg: "#FEF2F2", text: "#DC2626" },
  };
  return colors[status];
};
