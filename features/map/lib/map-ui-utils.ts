// features/map/lib/map-ui-utils.ts
// Shared UI design constants and utilities — align with features/home & features/plans design system

import { useColorScheme } from "~/lib/useColorScheme";

// ==================== STATUS BADGE ====================

export const STATUS_BADGE = {
  dotSize: 6,
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 20,
  fontSize: 11,
  fontWeight: "800" as const,
  letterSpacing: 1,
};

// ==================== SHADOWS ====================

export const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

export const OVERLAY_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 4,
};

export const ALERT_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.25,
  shadowRadius: 20,
  elevation: 12,
};

// ==================== BORDER RADIUS ====================

export const RADIUS = {
  badge: 20,
  chip: 12,
  card: 16,
  sheet: 24,
  fab: 14,
  button: 12,
  iconBox: 12,
  progress: 8,
  full: 9999,
};

// ==================== ANIMATION ====================

export const PULSE_ANIM = {
  scaleTo: 1.015,
  duration: 1200,
};

// ==================== COLORS ====================

export const LIGHT_BG = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1F2937",
  subtext: "#64748B",
  muted: "#9CA3AF",
  border: "#E2E8F0",
  divider: "#F1F5F9",
  accent: "#007AFF",
};

export const DARK_BG = {
  background: "#0F172A",
  card: "#1E293B",
  text: "#F1F5F9",
  subtext: "#94A3B8",
  muted: "#334155",
  border: "#334155",
  divider: "#1A2540",
  accent: "#3B82F6",
};

// ==================== HOOK ====================

export interface MapColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  muted: string;
  border: string;
  divider: string;
  accent: string;
}

/** Returns consistent theme-aware colors — call once at component top */
export function useMapColors(): MapColors {
  const { isDarkColorScheme } = useColorScheme();
  return isDarkColorScheme ? DARK_BG : LIGHT_BG;
}
