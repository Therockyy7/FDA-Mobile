# Story 0.5: Create Barrel Export and Migration Checklist

Status: done

## Story

As a developer,
I want `components/ui/index.ts` barrel export for all 8 shared components and a documented migration checklist,
So that all features can import shared components from a single path and follow a consistent migration process.

## Acceptance Criteria

1. `components/ui/index.ts` exists with named re-exports for all 8 components: Badge, IconButton, Divider, SectionHeader, ListItem, Pill, ScreenHeader, Avatar
2. No default exports in `index.ts` — all named re-exports only (`export { Badge } from "./Badge"` style)
3. Developers can `import { Badge, ListItem } from "~/components/ui"` — single path import works
4. The per-story 7-step migration checklist is documented in `documents/MIGRATION_CHECKLIST.md` covering the mandatory order: ternaries → hex colors → shadows → fontSize → testID → typecheck → Maestro
5. The 6 banned anti-patterns are documented with correct alternatives in the same checklist document
6. `tsc --noEmit` passes with 0 errors introduced by the new `index.ts`

## Tasks / Subtasks

- [x] Task 1: Create `components/ui/index.ts` barrel export (AC: #1, #2, #3)
  - [x] 1.1: Create `components/ui/index.ts`
  - [x] 1.2: Add named re-export for each of the 8 components using `export { ComponentName } from "./ComponentName"` pattern
  - [x] 1.3: Verify no default exports — each line uses `export { ... }` not `export { default }`
  - [x] 1.4: Verify all 8 components are present: Badge, IconButton, Divider, SectionHeader, ListItem, Pill, ScreenHeader, Avatar

- [x] Task 2: Create `documents/MIGRATION_CHECKLIST.md` (AC: #4, #5)
  - [x] 2.1: Document the 7-step migration checklist in mandatory order
  - [x] 2.2: Document 6 banned anti-patterns with correct alternatives
  - [x] 2.3: Add example usage for `~/components/ui` barrel import

- [x] Task 3: Verify compilation (AC: #6)
  - [x] 3.1: Run `npm run typecheck` — must pass with 0 new errors from `index.ts`

## Dev Notes

### Current State (What Stories 0.1–0.4 Delivered)

All 8 shared components already exist in `components/ui/`:
- `components/ui/Badge.tsx` — severity variants (safe/warning/danger/critical) + sizes; named export
- `components/ui/IconButton.tsx` — style variants + sizes; extends Pressable props; named export
- `components/ui/Divider.tsx` — horizontal/vertical, token border colors; named export
- `components/ui/SectionHeader.tsx` — h2 title, optional subtitle, optional rightAction; named export
- `components/ui/ListItem.tsx` — 56px min height, leading/trailing slots, Container pattern; named export
- `components/ui/Pill.tsx` — filled/outline variants, optional leftIcon, optional onRemove; named export
- `components/ui/ScreenHeader.tsx` — h1 title, leftAction/rightAction, balanced w-10 spacers; named export
- `components/ui/Avatar.tsx` — 4 sizes (sm/md/lg/xl), image source + initials fallback; named export

**No `components/ui/index.ts` exists** — this story creates it.

### Task 1: Exact index.ts Content

```typescript
// components/ui/index.ts
export { Avatar } from "./Avatar";
export { Badge } from "./Badge";
export { Divider } from "./Divider";
export { IconButton } from "./IconButton";
export { ListItem } from "./ListItem";
export { Pill } from "./Pill";
export { ScreenHeader } from "./ScreenHeader";
export { SectionHeader } from "./SectionHeader";
```

**Rules:**
- Alphabetical order (conventional)
- `export { Name } from "./Name"` — NOT `export { default as Name }`
- Do NOT re-export `button.tsx`, `card.tsx`, `form.tsx`, `input.tsx`, `label.tsx`, `text.tsx`, `textarea.tsx`, `status-filter.tsx`, `TabLoadingScreen.tsx` — these are NOT part of our design system shared components
- This file should export ONLY the 8 design system components created in Epic 0

### Task 2: Migration Checklist Document

Create `documents/MIGRATION_CHECKLIST.md` with:

**7-step checklist (mandatory order):**

```markdown
## Per-Story Migration Checklist (Mandatory Order)

Apply to EVERY file in scope for the story. Complete ALL 7 steps before marking story as done.

- [ ] Step 1 — TERNARIES: Replace `isDarkColorScheme` ternaries → `dark:` NativeWind prefix
  - Exception: `MAP_COLORS` and `TAB_COLORS` usage in design-tokens.ts context stays
- [ ] Step 2 — HEX COLORS: Replace hardcoded hex in `style={{}}` → Tailwind token classes
  - e.g. `style={{ color: "#1E293B" }}` → `className="text-slate-800"`
- [ ] Step 3 — SHADOWS: Replace inline shadow props → `style={SHADOW.x}` from `~/lib/design-tokens`
  - e.g. `style={{ shadowColor: "#000", shadowOffset: ... }}` → `style={SHADOW.md}`
- [ ] Step 4 — FONTSIZE: Replace arbitrary fontSize → 8-step typography scale (11px minimum)
  - e.g. `style={{ fontSize: 10 }}` → `className="text-caption"` (11px)
- [ ] Step 5 — TESTID: Add `testID` to all interactive elements
  - Convention: `<feature>-<component>-<element>[-<qualifier>]`
  - e.g. `testID="home-search-button"`, `testID="alerts-card-0-badge"`
- [ ] Step 6 — TYPECHECK: Run `npm run typecheck` — verify 0 new errors from changed files
- [ ] Step 7 — MAESTRO: Write/update Maestro flow for the screen
```

**6 banned anti-patterns:**

```markdown
## 6 Banned Anti-Patterns

| ❌ BANNED | ✅ CORRECT | Reason |
|---|---|---|
| `export default MyComponent` | `export function MyComponent` (named) | Breaks tree-shaking, inconsistent import syntax |
| `cn(className, variants({...}))` | `cn(variants({...}), className)` | className must be LAST for override priority |
| `style={{ color: "#1E293B" }}` hardcoded hex | `className="text-slate-800 dark:text-slate-100"` | Breaks dark mode, not token-aligned |
| `isDarkColorScheme` ternary in JSX | `dark:` NativeWind prefix | Use exceptions from `lib/design-tokens.ts` only |
| `style={{ fontSize: 10 }}` below 11px | `className="text-caption"` or `text-[11px]` minimum | Emergency readability requirement |
| `import { X } from "../../components/ui"` (relative) | `import { X } from "~/components/ui"` (alias) | Fragile paths, breaks on refactor |
```

### Import Pattern After This Story

```typescript
// ✅ NEW: Single-path import from barrel (available after Story 0.5)
import { Badge, ListItem, ScreenHeader } from "~/components/ui";

// ✅ Still valid: direct file import (both work after barrel exists)
import { Badge } from "~/components/ui/Badge";

// ❌ Relative import (always banned):
import { Badge } from "../../components/ui/Badge";
import { Badge } from "../ui";
```

### Do NOT Re-export Pre-existing Components

The `components/ui/` folder contains legacy components NOT part of the Epic 0 design system:
- `button.tsx` — reference implementation only (do not re-export in index.ts)
- `card.tsx`, `form.tsx`, `form-control.tsx`, `input.tsx`, `label.tsx`, `text.tsx`, `textarea.tsx` — pre-existing, not design system
- `status-filter.tsx`, `TabLoadingScreen.tsx` — pre-existing, not design system

Only export the 8 new design system components created in Epic 0.

### File Locations (Exact)

```
components/ui/index.ts          ← CREATE (barrel export)
documents/MIGRATION_CHECKLIST.md ← CREATE (developer guide)
```

All other files in `components/ui/` — **DO NOT TOUCH**.

### Critical Rules — Anti-Patterns to Avoid

| ❌ BANNED | ✅ CORRECT |
|---|---|
| `export { default as Badge } from "./Badge"` | `export { Badge } from "./Badge"` |
| Re-exporting legacy components (button, form, etc.) | Export only 8 design system components |
| `import { Badge } from "~/components/ui/index"` | `import { Badge } from "~/components/ui"` (no /index) |

### TypeScript Note

Pre-existing TypeScript errors exist in project — NOT our problem. Run `npm run typecheck` and verify only that our new `index.ts` introduces 0 new type errors. A barrel file with `export { X } from "./X"` will never introduce errors if the source files are error-free (which they are — confirmed in Story 0.4).

### Verification

```bash
npm run typecheck    # tsc --noEmit — verify 0 new errors from our new index.ts
```

### Previous Story Learnings (0.1–0.4)

- `~/` path alias configured in `tsconfig.json` — always use, never relative `../../`
- `cva`, `class-variance-authority`, `tailwind-merge`, `cn` all installed and confirmed working
- Pre-existing TypeScript errors in project are unrelated to our changes — verify only new files
- All 8 components use named exports only — barrel can safely use `export { X } from "./X"` without `default` concerns
- `npm run typecheck` is the verification command (not `tsc` directly)
- NativeWind v4 does NOT support Android `elevation` — shadows must use `style={SHADOW.x}` pattern (document this in checklist)
- `isDarkColorScheme` exception registry lives in `lib/design-tokens.ts` as `MAP_COLORS` and `TAB_COLORS`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered. All tasks completed in a single pass.

### Completion Notes List

- Task 1: Created `components/ui/index.ts` with 8 named re-exports in alphabetical order. Verified all 8 component files exist and use named exports (`export function`). No default exports, no legacy components re-exported.
- Task 2: Created `documents/MIGRATION_CHECKLIST.md` with the 7-step migration checklist in mandatory order (ternaries → hex colors → shadows → fontSize → testID → typecheck → Maestro) and 6 banned anti-patterns table with correct alternatives and reasons. Included barrel import usage examples and quick reference section.
- Task 3: Ran `npm run typecheck` (tsc --noEmit) — passed with 0 errors. The new `index.ts` introduces no type errors.

### File List

- `components/ui/index.ts` — CREATED (barrel export for 8 design system components)
- `documents/MIGRATION_CHECKLIST.md` — CREATED (7-step migration checklist + 6 banned anti-patterns)

### Change Log

- 2026-04-14: Story 0-5 implemented — barrel export and migration checklist created. All ACs satisfied.

### Review Findings

- [x] [Review][Defer] Barrel does not re-export component types (Props, Variants) — consumers must use direct file imports for types [components/ui/index.ts] — deferred, not in scope for this story
