---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "_bmad-output/project-context.md"
  - "documents/UI_DESIGN_SYSTEM_PLAN.md"
---

# UX Design Specification FDA-Mobile

**Author:** Anh Tuan
**Date:** 2026-04-14

---

## Executive Summary

### Project Vision

FDA-Mobile is an early flood detection and alert mobile application that combines real-time sensor data, interactive maps, and safe route recommendations to help Vietnamese residents proactively respond to rain and flooding disasters. The app transforms raw environmental sensor readings into actionable, human-readable warnings that guide users away from danger.

### Target Users

- **Residents in flood-prone areas** — people who live or work in zones regularly affected by heavy rain and flooding, needing early warning to prepare or evacuate
- **Daily commuters** — motorcycle and car drivers who need real-time route guidance to avoid flooded roads
- **Local community members** — citizens who contribute to and consume community-sourced flood reports

### Key Design Challenges

1. **Emergency readability under stress** — Users may be panicked, in heavy rain, or driving. UI must be instantly legible: high contrast, large tap targets, single-tap critical actions.
2. **Map information density** — Multiple layers (live sensor data, flood zones, safe routes, community reports) must coexist on the map without visual clutter or confusion.
3. **Severity differentiation** — Four alert levels (safe → warning → danger → critical) must be visually distinct and immediately understandable without reading text.
4. **Dark mode outdoor usability** — Nighttime and low-light conditions are the highest-risk moments; dark mode must prioritize function over aesthetics.

### Design Opportunities

1. **Flood severity color system as competitive advantage** — A consistent, intuitive color language builds user "muscle memory" so people instantly recognize risk level without reading.
2. **Map micro-interactions** — Smooth visual transitions when severity changes make the app feel alive and trustworthy, reinforcing that data is current.
3. **One-handed emergency UX** — Route suggestions and alert dismissal optimized for single-hand operation (user may be holding umbrella, on motorcycle, etc.).

---

## UI Design System Specification

> **Scope:** Visual/styling ONLY. No changes to business logic, API calls, navigation, or state management.
> **Source of truth:** `tailwind.config.js` + `lib/design-tokens.ts` (to be created)

---

## 1. Color Tokens

### Problem
Three separate color systems currently exist:
- `tailwind.config.js` — brand + flood + water + bg/text tokens
- `global.css` — HSL CSS variables (`--background`, `--primary`, etc.) — generic shadcn/ui defaults, NOT aligned with FDA brand
- `features/map/lib/map-ui-utils.ts` — `LIGHT_BG` / `DARK_BG` objects used via `isDarkColorScheme` ternary (116 files)

### Solution: Single Source of Truth in `tailwind.config.js`

All colors below are already defined in `tailwind.config.js` and are the canonical tokens. The `LIGHT_BG`/`DARK_BG` objects in `map-ui-utils.ts` must be replaced with these NativeWind classes.

#### Brand Colors
| Token | Class | Hex | Usage |
|-------|-------|-----|-------|
| `primary` | `bg-primary` / `text-primary` | `#0077BE` | CTAs, links, active states |
| `secondary` | `bg-secondary` / `text-secondary` | `#00B4D8` | Secondary actions, badges |
| `accent` | `bg-accent` / `text-accent` | `#FDB813` | Warnings, highlights |

#### Flood Severity Colors
| Token | Class | Hex | Meaning |
|-------|-------|-----|---------|
| `flood-safe` | `bg-flood-safe` / `text-flood-safe` | `#10B981` | No risk |
| `flood-warning` | `bg-flood-warning` / `text-flood-warning` | `#F59E0B` | Watch area |
| `flood-danger` | `bg-flood-danger` / `text-flood-danger` | `#EF4444` | Dangerous |
| `flood-critical` | `bg-flood-critical` / `text-flood-critical` | `#991B1B` | Evacuate |

> These four tokens are the most critical in the entire system. They must appear identically on map markers, alert cards, notification badges, and area cards — no exceptions.

#### Water Level Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `water-low` | `#67E8F9` | Map water overlay — low |
| `water-medium` | `#3B82F6` | Map water overlay — medium |
| `water-high` | `#1E40AF` | Map water overlay — high |
| `water-critical` | `#7C2D12` | Map water overlay — critical |

#### Background & Surface Colors
| Token | Light | Dark | NativeWind pattern |
|-------|-------|------|--------------------|
| Page background | `bg-bg-light` (`#F8FAFC`) | `bg-bg-dark` (`#0B1A33`) | `className="bg-bg-light dark:bg-bg-dark"` |
| Card surface | `#FFFFFF` | `#1E293B` | `className="bg-white dark:bg-slate-800"` |
| Divider | `#F1F5F9` | `#1A2540` | `className="bg-slate-100 dark:bg-slate-900"` |

#### Text Colors
| Role | Light | Dark | NativeWind pattern |
|------|-------|------|--------------------|
| Primary text | `#1E293B` | `#F1F5F9` | `className="text-slate-800 dark:text-slate-100"` |
| Secondary text | `#64748B` | `#94A3B8` | `className="text-slate-500 dark:text-slate-400"` |
| Muted text | `#9CA3AF` | `#334155` | `className="text-gray-400 dark:text-slate-700"` |

#### Border Colors
| Role | Light | Dark | NativeWind pattern |
|------|-------|------|--------------------|
| Default border | `#E2E8F0` | `#334155` | `className="border-border-light dark:border-border-dark"` |

### Dark Mode Rule
```
// ❌ BANNED — 116 files currently do this:
const { isDarkColorScheme } = useColorScheme();
color: isDarkColorScheme ? "#F1F5F9" : "#1E293B"

// ✅ CORRECT — NativeWind dark: prefix:
className="text-slate-800 dark:text-slate-100"
```
Exception: Non-NativeWind contexts only — map marker colors, tab bar icon tints, react-native-maps props.

---

## 2. Typography Scale

### Problem
Current arbitrary `fontSize` values found in codebase: `9, 10, 10.5, 11, 12, 13, 13.5, 14, 15, 16, 18, 20, 22, 58` — no consistent scale.

### Solution: 8-Step Scale (added to `tailwind.config.js`)

| Token | Size | Line Height | Weight | NativeWind class | Usage |
|-------|------|-------------|--------|-----------------|-------|
| `text-display` | 32px | 40px | 800 | `text-display` | Hero numbers (water level gauge) |
| `text-h1` | 24px | 32px | 700 | `text-2xl font-bold` | Screen titles |
| `text-h2` | 20px | 28px | 700 | `text-xl font-bold` | Section headers |
| `text-h3` | 18px | 24px | 600 | `text-lg font-semibold` | Card titles |
| `text-h4` | 16px | 22px | 600 | `text-base font-semibold` | Sub-headers |
| `text-body` | 14px | 20px | 400 | `text-sm` | Body text, descriptions |
| `text-body-sm` | 12px | 16px | 400 | `text-xs` | Captions, timestamps |
| `text-caption` | 11px | 14px | 600 | `text-[11px] font-semibold` | Badge labels, chip text |

> **Minimum readable size:** `11px` — never go below. The current `9px`, `10px`, `10.5px` values must be replaced with `11px` minimum.

### Typography tokens to add to `tailwind.config.js`:
```js
fontSize: {
  'display': ['32px', { lineHeight: '40px', fontWeight: '800' }],
  // 2xl (24px), xl (20px), lg (18px), base (16px), sm (14px), xs (12px)
  // are already Tailwind defaults — use those
  'caption': ['11px', { lineHeight: '14px', fontWeight: '600' }],
}
```

---

## 3. Shadow Scale

### Problem
Shadows defined in 3 places: `tailwind.config.js` `boxShadow`, `map-ui-utils.ts` RN style objects, `button.tsx` inline style. Android requires `elevation` (RN style), iOS uses `shadowColor/Offset/Opacity/Radius`. Both needed.

### Solution: Shared constants in `lib/design-tokens.ts`

```typescript
// lib/design-tokens.ts

// React Native shadow objects (use with style={} — NativeWind doesn't support elevation)
export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,          // Android
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

// Tailwind boxShadow tokens (already in tailwind.config.js, keep these):
// shadow-flood-card, shadow-danger-glow, shadow-warning-glow, shadow-safe-glow
```

### Usage Rule
```
// ❌ BANNED — inline shadow everywhere:
style={{ shadowColor: "#000", shadowOffset: {width:0, height:4}, elevation: 4 }}

// ✅ CORRECT — shared constant:
import { SHADOW } from "~/lib/design-tokens";
style={SHADOW.md}
```

---

## 4. Spacing & Border Radius

### Spacing — 4px Grid
Use Tailwind spacing scale (already 4px-based). Key values:
- `p-2` = 8px (tight padding — badges, chips)
- `p-3` = 12px (default component padding)
- `p-4` = 16px (card padding)
- `p-6` = 24px (screen horizontal padding)
- `gap-2` = 8px, `gap-3` = 12px, `gap-4` = 16px

### Border Radius (already in `tailwind.config.js`)
| Token | Value | Usage |
|-------|-------|-------|
| `rounded` (DEFAULT) | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Buttons (large), chips |
| `rounded-xl` | 16px | Cards |
| `rounded-2xl` | 20px | Bottom sheets, modals |
| `rounded-full` | 9999px | Badges, pills, avatars |

### Radius constants in `lib/design-tokens.ts`
```typescript
// For RN contexts where Tailwind class not applicable:
export const RADIUS = {
  badge: 20,   // rounded-full equivalent for small badges
  chip: 12,    // rounded-lg
  card: 16,    // rounded-xl
  sheet: 24,   // bottom sheets (beyond 2xl)
  fab: 14,     // floating action buttons
  button: 12,  // rounded-lg
  iconBox: 12, // icon containers
  full: 9999,
} as const;
```
> Note: `RADIUS` already exists in `map-ui-utils.ts` — move to `lib/design-tokens.ts`, delete from map-ui-utils.

---

## 5. Component Patterns

All new components follow the CVA + NativeWind pattern from `components/ui/button.tsx`. Each component must accept `testID` prop and `className` for overrides.

### 5.1 Badge (Severity)
```
Variants: safe | warning | danger | critical | info | default
Sizes: sm | md
Pattern: colored bg + white text + rounded-full
```
```tsx
// Usage:
<Badge variant="danger" testID="alert-badge-severity" />
// Renders: bg-flood-danger + white text + rounded-full
```

### 5.2 IconButton
```
Variants: primary | ghost | outline | destructive
Sizes: sm (32px) | md (40px) | lg (48px)
Pattern: square or circle, icon only, no label
Min touch target: 44pt (size lg = 48px covers this)
```

### 5.3 SectionHeader
```
Props: title, subtitle?, rightAction?
Pattern: h2 title + optional body-sm subtitle + optional trailing button
```

### 5.4 ListItem
```
Props: leading?, title, subtitle?, trailing?, onPress?
Pattern: horizontal row, 56px min height, left icon/avatar, right chevron/badge
```

### 5.5 Pill / Chip
```
Variants: filled | outline
Colors: inherit from flood severity tokens or brand tokens
Pattern: rounded-full, caption text, optional left icon, optional onPress (removable)
```

### 5.6 ScreenHeader
```
Props: title, subtitle?, leftAction?, rightAction?
Pattern: fixed top bar, h1 title, optional back button left, optional action right
```

### 5.7 Avatar
```
Sizes: sm (24px) | md (32px) | lg (40px) | xl (56px)
Pattern: circular image with fallback initials, rounded-full
```

### 5.8 Divider
```
Variants: horizontal | vertical
Colors: border-light / dark:border-border-dark
```

---

## 6. Dark Mode Strategy

### Rule
Use NativeWind `dark:` prefix exclusively. Remove all `isDarkColorScheme ? x : y` ternaries from component JSX/styles.

### Exception (allowed `isDarkColorScheme`):
- `react-native-maps` props (mapType, customMapStyle) — no NativeWind support
- Tab bar `activeTintColor` / `inactiveTintColor` in `_layout.tsx`
- Explicit JS color values passed to third-party libraries that don't accept className

### Migration pattern:
```tsx
// ❌ Before (116 files):
const { isDarkColorScheme } = useColorScheme();
<View style={{ backgroundColor: isDarkColorScheme ? "#1E293B" : "#FFFFFF" }}>

// ✅ After:
<View className="bg-white dark:bg-slate-800">
```

---

## 7. testID Convention

Pattern: `<feature>-<component>-<element>[-<qualifier>]`

### Examples by feature:
```
// Tab navigation
tabs-home-tab
tabs-map-tab
tabs-alerts-tab
tabs-areas-tab
tabs-profile-tab

// Home screen
home-header
home-header-notification-btn
home-weather-section
home-community-banner

// Map screen
map-search-input
map-layer-toggle-btn
map-station-marker-{id}
map-bottom-sheet
map-route-card

// Alerts
alerts-history-list
alerts-history-card-{id}
alerts-history-card-{id}-severity-badge
alerts-settings-toggle-{channel}

// Areas
areas-list
areas-card-{id}
areas-create-btn
areas-edit-sheet

// Notifications
notifications-list
notifications-card-{id}
notifications-tab-{type}

// Profile
profile-header
profile-avatar
profile-save-btn
profile-subscription-section
```

---

## 8. Files to Create / Modify

| File | Action | What changes |
|------|--------|-------------|
| `lib/design-tokens.ts` | **CREATE** | `SHADOW`, `RADIUS`, `ANIMATION` constants — single RN style source |
| `tailwind.config.js` | **EXTEND** | Add `fontSize.display` (32px) and `fontSize.caption` (11px) |
| `global.css` | **UPDATE** | Align `--primary`, `--background` etc. HSL vars with actual FDA brand colors |
| `components/ui/Badge.tsx` | **CREATE** | Severity badge with CVA variants |
| `components/ui/IconButton.tsx` | **CREATE** | Icon-only button with size variants |
| `components/ui/SectionHeader.tsx` | **CREATE** | Section title row |
| `components/ui/ListItem.tsx` | **CREATE** | Standard list row |
| `components/ui/Pill.tsx` | **CREATE** | Chip/pill with optional remove |
| `components/ui/ScreenHeader.tsx` | **CREATE** | Top navigation bar |
| `components/ui/Avatar.tsx` | **CREATE** | Circular image/initials |
| `components/ui/Divider.tsx` | **CREATE** | Horizontal/vertical separator |
| `features/map/lib/map-ui-utils.ts` | **SLIM DOWN** | Remove `LIGHT_BG`, `DARK_BG`, `RADIUS`, `CARD_SHADOW`, `OVERLAY_SHADOW`, `ALERT_SHADOW` → import from `lib/design-tokens.ts` |
| `lib/constants.ts` | **DEPRECATE** | `NAV_THEME` stays for now (used by React Navigation), annotate as legacy |

---

## 9. Audit Summary (Current State)

| Issue | Count | Severity |
|-------|-------|----------|
| Files using `isDarkColorScheme` ternary | 116 | High |
| Arbitrary `fontSize` values (non-scale) | 60+ instances | High |
| Inline `shadowColor`/`elevation` | 20+ instances | Medium |
| Hardcoded hex colors in `style={{}}` | 40+ instances | High |
| Missing `testID` on interactive elements | ~200+ | Medium |
| Duplicate `SEVERITY_COLORS` definitions | 2+ | Low |
| `map-ui-utils.ts` color objects vs tailwind tokens | 1 file | Medium |
