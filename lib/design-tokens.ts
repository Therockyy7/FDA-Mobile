// lib/design-tokens.ts
// RN-specific style constants that cannot be expressed as NativeWind classes.
// DO NOT put color hex values here if they already exist as Tailwind token classes.
// Import always via ~/lib/design-tokens (never relative path).

// ==================== SHADOWS ====================
// Values sourced from features/map/lib/map-ui-utils.ts (CARD_SHADOW, OVERLAY_SHADOW, ALERT_SHADOW)

export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

// ==================== BORDER RADIUS ====================
// Values sourced from features/map/lib/map-ui-utils.ts (RADIUS)
// Note: `progress` key is intentionally omitted per architecture spec.

export const RADIUS = {
  badge: 20,
  chip: 12,
  card: 16,
  sheet: 24,
  fab: 14,
  button: 12,
  iconBox: 12,
  full: 9999,
} as const;

// ==================== FLOOD SEVERITY COLORS ====================
// JS-only color values matching Tailwind flood-* tokens.
// Use these when NativeWind classes are not applicable (SVG fill/stroke, borderColor, chart library props).

export const FLOOD_COLORS = {
  safe: "#10B981",      // flood-safe
  warning: "#F59E0B",   // flood-warning
  danger: "#EF4444",    // flood-danger
  critical: "#991B1B",  // flood-critical
} as const;

// Extended severity palette for chart components (4-level: safe/caution/warning/critical)
// Caution is distinct from flood-warning to support finer-grained flood alert levels.
export const SEVERITY_PALETTE = {
  safe:     { primary: "#10B981", bg: "#D1FAE5", text: "#059669" },
  caution:  { primary: "#FBBF24", bg: "#FEF3C7", text: "#D97706" },
  warning:  { primary: "#F97316", bg: "#FFEDD5", text: "#EA580C" },
  critical: { primary: "#EF4444", bg: "#FEE2E2", text: "#DC2626" },
} as const;

// ==================== DARK MODE EXCEPTION CONSTANTS ====================
// Only for JS-only contexts (react-native-maps props, tab bar) that cannot use NativeWind classes.
// Values sourced from features/map/lib/map-ui-utils.ts (LIGHT_BG, DARK_BG)

export const MAP_COLORS = {
  light: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#1F2937",
    subtext: "#64748B",
    muted: "#9CA3AF",
    border: "#E2E8F0",
    divider: "#F1F5F9",
    accent: "#007AFF",
  },
  dark: {
    background: "#0F172A",
    card: "#1E293B",
    text: "#F1F5F9",
    subtext: "#94A3B8",
    muted: "#334155",
    border: "#334155",
    divider: "#1A2540",
    accent: "#3B82F6",
  },
} as const;

// ==================== NOTIFICATION RISK COLORS & OVERLAYS ====================
// Water level risk indicators and semi-transparent overlay colors for notification cards.
// Thresholds: >= 40cm critical, 20-40cm warning, 10-20cm caution, < 10cm normal.

export const NOTIFICATION_TOKENS = {
  riskColors: {
    critical: "#DC2626",   // >= 40cm water level
    warning: "#F59E0B",    // 20-40cm water level
    caution: "#D97706",    // 10-20cm water level
    normal: "#10B981",     // < 10cm water level
  },
  overlays: {
    light: "rgba(0,0,0,0.04)",
    dark: "rgba(255,255,255,0.05)",
  },
} as const;

// ==================== TAB BAR COLORS ====================
// JS-only dark mode exception — react-navigation tabBarStyle needs JS color values.
// active/inactive use FDA brand. background/border match Tailwind bg-dark/bg-light tokens.

export const TAB_COLORS = {
  light: {
    active: "#0077BE",
    inactive: "#6B7280",
    background: "#FFFFFF",
    border: "#E2E8F0",
  },
  dark: {
    active: "#00B4D8",
    inactive: "#9CA3AF",
    background: "#0B1A33",
    border: "#1E293B",
  },
} as const;

// ==================== MAP ICON COLORS ====================
// Icon tint colors for interactive layer sheet controls (selected/unselected states).
// Used by AreaDisplayModeSelector, BaseMapSelector for icon tinting across light/dark modes.

export const MAP_ICON_COLORS = {
  light: {
    active: "#007AFF",    // Primary blue when selected
    inactive: "#64748B",  // Slate-600 when unselected
  },
  dark: {
    active: "#3B82F6",    // Brighter blue in dark mode
    inactive: "#94A3B8",  // Slate-400 in dark mode
  },
} as const;

// ==================== MAP SEMANTIC COLORS ====================
// Domain-specific accent colors for map features (origin/destination, etc.).
// These are intentionally NOT dark-mode dependent — semantic meaning is consistent across themes.

export const MAP_SEMANTIC_COLORS = {
  origin: "#16A34A",      // Green for origin/start location
  destination: "#4F46E5", // Indigo for destination/end location
} as const;

// ==================== MAP OVERLAY LAYER COLORS ====================
// Color tokens for overlay layer toggle items (OverlayLayerItem component).
// Centralized color palette for flood, traffic, weather, community layers.

export const MAP_OVERLAY_LAYER_COLORS = {
  primary: "#007AFF",    // Primary blue (default)
  warning: "#F97316",    // Orange for warning/caution
  purple: "#8B5CF6",     // Purple for weather/precipitation
  success: "#10B981",    // Green for success/healthy state
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get theme-aware palette from MAP_COLORS
 * @param isDark - true for dark mode, false for light mode
 * @returns Theme-appropriate color palette with card, text, subtext, border, etc.
 */
export function getPaletteForTheme(isDark: boolean) {
  return isDark ? MAP_COLORS.dark : MAP_COLORS.light;
}
