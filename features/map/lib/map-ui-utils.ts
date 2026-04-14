// features/map/lib/map-ui-utils.ts
// Shared UI design constants and utilities — align with features/home & features/plans design system
// NOTE: CARD_SHADOW, OVERLAY_SHADOW, ALERT_SHADOW, RADIUS, LIGHT_BG, DARK_BG have been removed.
// Import SHADOW, RADIUS, MAP_COLORS from ~/lib/design-tokens instead.

import { useColorScheme } from "~/lib/useColorScheme";
import { MAP_COLORS } from "~/lib/design-tokens";

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

// ==================== ANIMATION ====================

export const PULSE_ANIM = {
  scaleTo: 1.015,
  duration: 1200,
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
  return isDarkColorScheme ? MAP_COLORS.dark : MAP_COLORS.light;
}
