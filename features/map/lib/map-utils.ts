// features/map/lib/map-utils.ts
export function getStatusColor(status: "safe" | "warning" | "danger") {
  switch (status) {
    case "safe":
      return {
        main: "#10B981",
        bg: "#D1FAE5",
        text: "#065F46",
      };
    case "warning":
      return {
        main: "#F59E0B",
        bg: "#FEF3C7",
        text: "#92400E",
      };
    case "danger":
      return {
        main: "#EF4444",
        bg: "#FEE2E2",
        text: "#991B1B",
      };
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as NodeJS.Timeout;
  };
}
