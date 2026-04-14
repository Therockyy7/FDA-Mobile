# Migration Checklist — FDA-Mobile Design System

_Mandatory checklist for migrating existing screens to the new design system components (Epic 0+). Apply to EVERY file in scope for a given story._

---

## Importing Shared Components

```typescript
// Single-path import from barrel (preferred)
import { Badge, ListItem, ScreenHeader } from "~/components/ui";

// Direct file import (also valid)
import { Badge } from "~/components/ui/Badge";
```

**Never** use relative imports:

```typescript
// BANNED
import { Badge } from "../../components/ui/Badge";
import { Badge } from "../ui";
```

---

## Per-Story Migration Checklist (Mandatory Order)

Apply to EVERY file in scope for the story. Complete ALL 7 steps before marking story as done.

- [ ] **Step 1 — TERNARIES:** Replace `isDarkColorScheme` ternaries with `dark:` NativeWind prefix
  - Exception: `MAP_COLORS` and `TAB_COLORS` usage in `lib/design-tokens.ts` context stays (non-NativeWind contexts like maps, tab bar icons)
  - Example: `isDarkColorScheme ? "#fff" : "#000"` → `className="text-white dark:text-black"`

- [ ] **Step 2 — HEX COLORS:** Replace hardcoded hex in `style={{}}` with Tailwind token classes
  - Example: `style={{ color: "#1E293B" }}` → `className="text-slate-800"`
  - Reference design tokens in `tailwind.config.js` for correct class names

- [ ] **Step 3 — SHADOWS:** Replace inline shadow props with `style={SHADOW.x}` from `~/lib/design-tokens`
  - Example: `style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, ... }}` → `style={SHADOW.md}`
  - NativeWind v4 does NOT support Android `elevation` — shadows must use `style={SHADOW.x}` pattern
  - Available shadow tokens: `SHADOW.sm`, `SHADOW.md`, `SHADOW.lg`

- [ ] **Step 4 — FONTSIZE:** Replace arbitrary fontSize with 8-step typography scale (11px minimum)
  - Example: `style={{ fontSize: 10 }}` → `className="text-caption"` (11px)
  - Never use fontSize below 11px — emergency readability requirement
  - Reference typography scale in `tailwind.config.js`

- [ ] **Step 5 — TESTID:** Add `testID` to all interactive elements
  - Convention: `<feature>-<component>-<element>[-<qualifier>]`
  - Examples: `testID="home-search-button"`, `testID="alerts-card-0-badge"`
  - Required for Maestro E2E testing

- [ ] **Step 6 — TYPECHECK:** Run `npm run typecheck` — verify 0 new errors from changed files
  - Pre-existing TypeScript errors may exist — only verify your changes introduce 0 new errors

- [ ] **Step 7 — MAESTRO:** Write/update Maestro flow for the screen
  - Covers the happy path at minimum
  - Uses `testID` attributes added in Step 5

---

## 6 Banned Anti-Patterns

| # | BANNED | CORRECT | Reason |
|---|--------|---------|--------|
| 1 | `export default MyComponent` | `export function MyComponent` (named) | Breaks tree-shaking, inconsistent import syntax |
| 2 | `cn(className, variants({...}))` | `cn(variants({...}), className)` | className must be LAST for override priority |
| 3 | `style={{ color: "#1E293B" }}` hardcoded hex | `className="text-slate-800 dark:text-slate-100"` | Breaks dark mode, not token-aligned |
| 4 | `isDarkColorScheme` ternary in JSX | `dark:` NativeWind prefix | Use exceptions from `lib/design-tokens.ts` only |
| 5 | `style={{ fontSize: 10 }}` below 11px | `className="text-caption"` or `text-[11px]` minimum | Emergency readability requirement |
| 6 | `import { X } from "../../components/ui"` (relative) | `import { X } from "~/components/ui"` (alias) | Fragile paths, breaks on refactor |

---

## Quick Reference

- **Design tokens:** `lib/design-tokens.ts`
- **Tailwind config:** `tailwind.config.js`
- **Shared components:** `components/ui/` (import via `~/components/ui`)
- **Utility:** `cn()` from `~/lib/utils` (clsx + twMerge)
- **Variants:** CVA from `class-variance-authority`
