# Code Review 3-1: Triage & Classification

**Story:** 3-1-migrate-notification-list-components  
**Review Layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor  
**Date:** 2026-04-14

---

## Normalized Findings (Pre-Dedup)

### From Blind Hunter (Adversarial Review)

1. Removed Props Without Deprecation (NotificationCard.tsx) — `onMapPress`, `onDirectionsPress` removed from destructuring; interface still declares them. Silent break for callers.

2. Missing CSS Token `text-caption` (NotificationCard.tsx:107) — Uses undefined Tailwind class; will fall back to default size.

3. Invalid Opacity Modifier `bg-flood-safe/20` (EmptyNotificationsState.tsx:18) — NativeWind doesn't support `/20` syntax on React Native; semitransparent green won't apply.

4. Orphaned `config.darkBgColor` (NotificationCard.tsx) — Removed from usage but still exported by `getPriorityConfig`; dead code confusion.

5. Inconsistent Shadow Opacity (NotificationTabToggle.tsx:129) — New `SHADOW.sm` has 6% opacity; old inline had 10%. Visual hierarchy silently weakens.

6. Hard-Coded Brand Color Instead of Token (NotificationTabToggle.tsx:132) — `backgroundColor: "#0077BE"` breaks pattern; not using design token.

7. Dark Mode Hook/CSS Class Mismatch (NotificationPaginationInfo.tsx:23) — `isDarkColorScheme` hook vs NativeWind `dark:` classes may disagree on dark mode state.

8. Border Logic Removed (NotificationCard.tsx:40) — Original had conditional `borderWidth` on `isDarkColorScheme`; new code always shows border in dark mode via className.

9. Removed Dark Mode Avatar Color Logic (NotificationCard.tsx:68-69) — Lost fallback `config.darkBgColor || config.bgColor`; now just `config.bgColor`. May render wrong in dark mode.

10. Unvalidated SHADOW Import (NotificationCard.tsx:8) — `SHADOW.sm` uses 6% opacity without explanation; inconsistent with other cards.

11. Dark Mode Race Condition (NotificationFilters.tsx) — Hook removed; color depends on `isActive` only. If CSS dark mode updates but hook doesn't re-render, mismatch occurs.

12. Style Composition Precedence Undefined (NotificationPaginationInfo.tsx:43-49) — Mixed `className` + `style` on same element; NativeWind translation order undefined.

13. Silent Behavioral Change in Disabled Buttons (NotificationPaginationInfo.tsx) — `opacity` in style array may override NativeWind opacity differently.

### From Edge Case Hunter

1. `config.color` undefined/null (NotificationCard.tsx:59) — Type error risk on concatenation; no guard before `.color` usage in style.

2. Invalid `config.icon` Ionicons glyph (NotificationCard.tsx:62) — Icon name not validated; renders error/fallback silently.

3. Both date fields undefined (NotificationCard.tsx:28) — `new Date(undefined)` creates Invalid Date; try-catch returns empty string but UX broken.

4. Missing content AND message (NotificationCard.tsx:91) — Empty text renders blank line instead of fallback.

5. Missing/empty title (NotificationCard.tsx:81) — Blank title if `formatAlertTitle` not safe against undefined.

6. Missing station name (NotificationCard.tsx:74) — Undefined `stationName` loses alert context.

7. Unhandled `onRefresh` error (EmptyNotificationsState.tsx:39) — Callback may throw; no error boundary.

### From Acceptance Auditor

1. **AC4 Violation** — NotificationTabToggle line 133: `backgroundColor: "#0077BE"` hardcoded in indicator style (not JS-only exception context).

---

## Deduplicated Findings

### Finding Group 1: Dark Mode Strategy Inconsistency (Blind #7, Blind #8, Blind #9, Blind #11)
- **Title:** Dark mode dark mode hook/CSS class mismatch creates inconsistent colors
- **Source:** blind+blind+blind+blind
- **Detail:** Multiple components removed `useColorScheme()` hook and switched to NativeWind `dark:` classes. However, not all app state may respect `dark:` prefix detection. PaginationInfo still uses hook for Ionicons (JS-only context), but buttons use classes. FiltersUI removed hook entirely. TabToggle kept hook only for container. This architectural mismatch risks color inconsistencies if hook state diverges from CSS dark mode state. Original had consistent hook-driven logic; new hybrid approach is fragile.
- **Location:** NotificationCard.tsx, NotificationFilters.tsx, NotificationPaginationInfo.tsx, NotificationTabToggle.tsx
- **Classification:** patch

### Finding Group 2: Hardcoded Color in Indicator Style (Blind #6, Auditor #1)
- **Title:** AC4 violation: hardcoded hex color `#0077BE` in NotificationTabToggle indicator style
- **Source:** blind+auditor
- **Detail:** NotificationTabToggle line 133 has `backgroundColor: "#0077BE"` in StyleSheet indicator definition. This violates AC#4 (zero hardcoded hex in style={{}}). While component notes this as "FDA brand primary: JS-only", it's a StyleSheet context (not Animated), so it should use a design token constant. Auditor correctly flagged this as violation.
- **Location:** NotificationTabToggle.tsx:133
- **Classification:** patch

### Finding Group 3: Missing/Invalid CSS Tokens (Blind #2, Blind #3)
- **Title:** Two CSS token issues: undefined `text-caption` class and invalid `/20` opacity modifier
- **Source:** blind+blind
- **Detail:** 
  - EmptyNotificationsState uses `bg-flood-safe/20` with opacity modifier; NativeWind on React Native doesn't support `/20` syntax. Semitransparent green won't render. Should use `backgroundColor` style prop with `opacity` prop separately.
  - NotificationCard uses `className="text-caption"` for severity label, but this class is not defined in Tailwind config. Will render default text size instead of caption (11px).
- **Location:** EmptyNotificationsState.tsx:18, NotificationCard.tsx:107
- **Classification:** patch

### Finding Group 4: Removed Props Breaking Callers (Blind #1)
- **Title:** Props `onMapPress` and `onDirectionsPress` removed from NotificationCard without deprecation
- **Source:** blind
- **Detail:** NotificationCard interface still declares `onMapPress` and `onDirectionsPress` as optional props, but they're removed from function destructuring. Any parent passing these props will have them silently ignored. No deprecation warning or error thrown. This is a silent breaking change if callers depend on these props.
- **Location:** NotificationCard.tsx:19-23
- **Classification:** decision_needed (need to confirm: should we remove from interface entirely, deprecate with console warning, or keep for backwards compat?)

### Finding Group 5: Shadow Opacity Inconsistency (Blind #5, Blind #10)
- **Title:** Shadow opacity changed from 10% to 6% without rationale
- **Source:** blind+blind
- **Detail:** Original NotificationTabToggle indicator used `shadowOpacity: 0.1` (10%). New code uses `...SHADOW.sm` which has 6% opacity. NotificationCard also switched to `SHADOW.sm` (6%), changing from original 4% opacity. Visual hierarchy weakens; no comment explains the token choice. Inconsistent with design intent.
- **Location:** NotificationTabToggle.tsx:133, NotificationCard.tsx:47
- **Classification:** defer (design decision, not functional bug, but should verify with designer)

### Finding Group 6: Unguarded Data Access (Edge #1, Edge #2, Edge #3, Edge #4, Edge #5, Edge #6)
- **Title:** Missing fallbacks for undefined notification fields and config properties
- **Source:** edge+edge+edge+edge+edge+edge
- **Detail:** NotificationCard renders without guards on several fields: `config.color` (used in style, may be undefined), `config.icon` (passed to Ionicons, may be invalid glyph), both `notification.sentAt` and `notification.createdAt` (new Date(undefined) fails), `notification.content` || `notification.alertMessage` (both undefined leaves blank line), `notification.stationName` (undefined loses context), `formatAlertTitle(notification.title)` (unsafe if title undefined). EmptyNotificationsState `onRefresh` callback may throw without error boundary.
- **Location:** NotificationCard.tsx:28, 59, 62, 74, 81, 91; EmptyNotificationsState.tsx:39
- **Classification:** patch

### Finding Group 7: Dead Code and Orphaned Exports (Blind #4)
- **Title:** Orphaned `config.darkBgColor` export in `getPriorityConfig`
- **Source:** blind
- **Detail:** NotificationCard removed usage of `config.darkBgColor` in avatar background. Function `getPriorityConfig` in notifications-utils.ts still exports this field, creating dead code and confusion about dark mode strategy.
- **Location:** notifications-utils.ts (export), NotificationCard.tsx (usage removed)
- **Classification:** defer (pre-existing; out of scope for this PR unless we also audit/update the utility)

### Finding Group 8: Style Composition Precedence (Blind #12, Blind #13)
- **Title:** Mixed `className` + `style` on same elements causes undefined precedence
- **Source:** blind+blind
- **Detail:** NotificationPaginationInfo mixes `className="..."` with inline `style={[...]}` on same View/TouchableOpacity. NativeWind translates classes to StyleSheet; when both exist, precedence order is undefined on React Native. The `opacity` property in style array may override or be overridden unpredictably by className-generated styles. Disabled button state opacity behavior is fragile.
- **Location:** NotificationPaginationInfo.tsx:43-49 (buttons), 31-32 (info pill)
- **Classification:** patch

---

## Classification Summary

| Category | Count | IDs |
|----------|-------|-----|
| **patch** | 6 | 1, 2, 3, 6, 8 |
| **decision_needed** | 1 | 4 |
| **defer** | 2 | 5, 7 |
| **dismiss** | 0 | — |

**Total Findings:** 9  
**Failed Layers:** None  
**Review Status:** ⚠️ Significant gaps found — requires developer action on 7 findings

---

## Next: Present findings to user

