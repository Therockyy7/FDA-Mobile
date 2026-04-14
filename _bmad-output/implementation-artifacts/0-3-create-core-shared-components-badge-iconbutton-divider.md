# Story 0.3: Create Core Shared Components (Badge, IconButton, Divider)

Status: done

## Story

As a developer,
I want Badge, IconButton, and Divider components following the CVA pattern,
So that severity badges, icon actions, and separators are consistent across all features.

## Acceptance Criteria

1. `components/ui/Badge.tsx` exists with 6 severity variants (safe/warning/danger/critical/info/default) and 2 sizes (sm/md) using flood-* color tokens; white text on colored background; `rounded-full`
2. `components/ui/IconButton.tsx` exists with 4 style variants (primary/ghost/outline/destructive) and 3 sizes (sm:32px/md:40px/lg:48px); lg size meets 44pt minimum touch target
3. `components/ui/Divider.tsx` exists with horizontal/vertical orientation using `border-light dark:border-border-dark`
4. All 3 components accept `testID?: string` and `className?: string` props
5. All 3 components use `cn(variants({ variant, size }), className)` override order — `className` is always last
6. No default exports — all named exports only: `export function Badge`, `export function IconButton`, `export function Divider`
7. `tsc --noEmit` passes with 0 errors introduced by these new files

## Tasks / Subtasks

- [x] Task 1: Create `components/ui/Badge.tsx` (AC: #1, #4, #5, #6)
  - [x] 1.1: Import `cva`, `VariantProps` from `class-variance-authority` and `cn` from `~/lib/utils`; import `Text`, `View` from `react-native`
  - [x] 1.2: Define `badgeVariants` CVA with base `"rounded-full flex-row items-center justify-center"` and severity variants mapping to flood-* tokens + size variants
  - [x] 1.3: Define `BadgeProps` interface extending `VariantProps<typeof badgeVariants>` with `testID?: string`, `className?: string`, `label: string`
  - [x] 1.4: Export named function `Badge` that renders `<View testID={testID} className={cn(badgeVariants({variant,size}), className)}><Text ...>{label}</Text></View>`
  - [x] 1.5: Verify no default export

- [x] Task 2: Create `components/ui/IconButton.tsx` (AC: #2, #4, #5, #6)
  - [x] 2.1: Import `cva`, `VariantProps`, `cn`, `Pressable` from react-native, `ReactNode` from react
  - [x] 2.2: Define `iconButtonVariants` CVA with 4 style variants and 3 pixel-exact size variants
  - [x] 2.3: Define `IconButtonProps` interface (extends `Pressable` props + CVA variants + `testID?` + `className?` + `children: ReactNode`)
  - [x] 2.4: Export named function `IconButton` wrapping `Pressable` with `cn(iconButtonVariants({variant,size}), className)` and `testID`
  - [x] 2.5: Verify no default export

- [x] Task 3: Create `components/ui/Divider.tsx` (AC: #3, #4, #5, #6)
  - [x] 3.1: Import `cva`, `VariantProps`, `cn`, `View` from react-native
  - [x] 3.2: Define `dividerVariants` CVA with orientation variants (horizontal/vertical)
  - [x] 3.3: Define `DividerProps` interface with `testID?`, `className?`, `orientation?`
  - [x] 3.4: Export named function `Divider`
  - [x] 3.5: Verify no default export

- [x] Task 4: Verify compilation (AC: #7)
  - [x] 4.1: Run `npm run typecheck` — must pass with 0 new errors

### Review Findings (2026-04-14)

- [x] [Review][Decision] Badge `info`/`default` variants → resolved (Option A): added `flood-info: #0077BE` and `flood-default: #6B7280` to tailwind.config.js; Badge updated to use `bg-flood-info`/`bg-flood-default` [Badge.tsx:14-16, tailwind.config.js]
- [x] [Review][Patch] IconButton missing `disabled` visual state — fixed: added `disabled:opacity-50` to CVA base class [IconButton.tsx]
- [x] [Review][Patch] IconButton: `testID` duplicated in interface — fixed: removed explicit declaration, `testID` flows via `ComponentPropsWithoutRef<typeof Pressable>` [IconButton.tsx]
- [x] [Review][Patch] IconButton: redundant `import { type ReactNode }` — fixed: removed, now uses `React.ReactNode` [IconButton.tsx]
- [x] [Review][Patch] Divider `orientation="vertical"` with `h-full` silently collapses — fixed: added JSDoc warning [Divider.tsx]
- [x] [Review][Defer] `bg-muted`/`bg-destructive` are `hsl(var(--css-var))` tokens that may not resolve on Android NativeWind — pre-existing issue in `button.tsx`, project-wide concern [Badge.tsx, IconButton.tsx] — deferred, pre-existing
- [x] [Review][Defer] Badge/IconButton missing `accessibilityRole` and `accessibilityLabel` — project-wide accessibility gap, not in scope of this story [all files] — deferred, pre-existing
- [x] [Review][Defer] `text-caption` lineHeight string `'14px'` may be ignored on Android — defined in `tailwind.config.js`, scope of story 0.2 [tailwind.config.js] — deferred, pre-existing

## Dev Notes

### Foundation Context (What Stories 0.1 and 0.2 Delivered)

- `lib/design-tokens.ts` — SHADOW, RADIUS, MAP_COLORS, TAB_COLORS all created and importable via `~/lib/design-tokens`
- `tailwind.config.js` — `fontSize.caption` added; FDA brand HSL vars in `global.css` aligned
- `components/ui/button.tsx` — THE reference CVA implementation (read this before writing any component)
- Pre-existing TypeScript errors exist in project (type conflicts between `@types/react-native` and built-in RN types) — these are NOT our problem; only verify our new files introduce 0 new errors

### Reference Implementation: `components/ui/button.tsx`

```typescript
// Full pattern to follow — read the actual file at components/ui/button.tsx
import * as React from "react";
import { Pressable, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva("flex-row items-center justify-center rounded-lg", {
  variants: {
    variant: { default: "bg-primary", destructive: "bg-destructive", ... },
    size: { default: "h-14 px-6", sm: "h-9 px-3", ... },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<...>(({ className, variant, size, ...props }, ref) => (
  <Pressable className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));
export { Button, buttonVariants };
```

**Key pattern to follow:** `cn(variants({ variant, size }), className)` — `className` LAST for override priority.

### Badge Implementation Spec

```typescript
// components/ui/Badge.tsx
import { Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "rounded-full flex-row items-center justify-center",
  {
    variants: {
      variant: {
        safe:     "bg-flood-safe",
        warning:  "bg-flood-warning",
        danger:   "bg-flood-danger",
        critical: "bg-flood-critical",
        info:     "bg-primary",
        default:  "bg-muted",
      },
      size: {
        sm: "px-2 py-0.5",
        md: "px-3 py-1",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  label: string;
  testID?: string;
  className?: string;
}

export function Badge({ variant, size, label, testID, className }: BadgeProps) {
  return (
    <View testID={testID} className={cn(badgeVariants({ variant, size }), className)}>
      <Text className="text-white text-caption font-semibold">{label}</Text>
    </View>
  );
}
```

**Severity variant mapping (short names, NOT flood-prefixed in prop):**
| Prop `variant` | NativeWind class | Color |
|---|---|---|
| `safe` | `bg-flood-safe` | `#10B981` green |
| `warning` | `bg-flood-warning` | `#F59E0B` orange |
| `danger` | `bg-flood-danger` | `#EF4444` red |
| `critical` | `bg-flood-critical` | `#991B1B` dark red |
| `info` | `bg-primary` | `#0077BE` blue |
| `default` | `bg-muted` | neutral |

Text inside Badge: always `text-white` + `text-caption` (11px) or `text-xs` (12px) — never below 11px.

### IconButton Implementation Spec

```typescript
// components/ui/IconButton.tsx
import { Pressable } from "react-native";
import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const iconButtonVariants = cva(
  "items-center justify-center rounded-lg",
  {
    variants: {
      variant: {
        primary:     "bg-primary",
        ghost:       "bg-transparent",
        outline:     "border border-border-light dark:border-border-dark bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        sm: "w-8 h-8",    // 32px
        md: "w-10 h-10",  // 40px
        lg: "w-12 h-12",  // 48px — meets 44pt minimum touch target
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface IconButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof iconButtonVariants> {
  children: ReactNode;
  testID?: string;
  className?: string;
}

export function IconButton({ variant, size, children, testID, className, ...props }: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Pressable>
  );
}
```

**Size spec:**
| Prop `size` | Width/Height | Note |
|---|---|---|
| `sm` | 32px (`w-8 h-8`) | small actions |
| `md` | 40px (`w-10 h-10`) | default |
| `lg` | 48px (`w-12 h-12`) | meets 44pt minimum touch target |

`children` is the icon element (e.g., `<Ionicons name="close" />`). IconButton is icon-only — no text label.

### Divider Implementation Spec

```typescript
// components/ui/Divider.tsx
import { View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const dividerVariants = cva(
  "bg-border-light dark:bg-border-dark",
  {
    variants: {
      orientation: {
        horizontal: "w-full h-px",
        vertical:   "h-full w-px",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  }
);

interface DividerProps extends VariantProps<typeof dividerVariants> {
  testID?: string;
  className?: string;
}

export function Divider({ orientation, testID, className }: DividerProps) {
  return (
    <View
      testID={testID}
      className={cn(dividerVariants({ orientation }), className)}
    />
  );
}
```

**Color tokens:** `bg-border-light` (light mode: `#E2E8F0`) / `dark:bg-border-dark` (dark mode: `#334155`) — these tokens exist in `tailwind.config.js`.

**Note:** The spec says `border-light dark:border-border-dark` but since Divider is a `View` (not text/border element), use `bg-border-light dark:bg-border-dark` for the 1px fill. Both token names exist in `tailwind.config.js`.

### Critical Rules — Anti-Patterns to Avoid

| ❌ BANNED | ✅ CORRECT |
|---|---|
| `default export` from shared component | `export function Badge` (named only) |
| `cn(className, variants(...))` (className first) | `cn(variants({...}), className)` (className last) |
| `variant="flood-danger"` | `variant="danger"` (short names in CVA props) |
| Hardcoded hex colors: `color: "#EF4444"` | `className="bg-flood-danger"` |
| `import { Badge } from "./Badge"` (relative) | `import { Badge } from "~/components/ui"` |
| `isDarkColorScheme` ternary | `dark:` NativeWind prefix |
| Font size below 11px | `text-caption` (11px) minimum |
| `style={{ borderRadius: 20 }}` when className available | `className="rounded-full"` |

### File Locations (Exact)

```
components/ui/Badge.tsx          ← CREATE (do not create index.ts yet — that's Story 0.5)
components/ui/IconButton.tsx     ← CREATE
components/ui/Divider.tsx        ← CREATE
components/ui/button.tsx         ← DO NOT TOUCH (reference only)
lib/design-tokens.ts             ← DO NOT TOUCH (done in 0.1)
tailwind.config.js               ← DO NOT TOUCH (done in 0.2)
```

Story 0.4 will create: SectionHeader, ListItem, Pill, ScreenHeader, Avatar
Story 0.5 will create: `components/ui/index.ts` barrel export

**Do NOT create `components/ui/index.ts` in this story** — it belongs to Story 0.5.

### Import Rules

```typescript
// ✅ Correct imports inside new component files
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { View, Text, Pressable } from "react-native";
import type { ReactNode } from "react";

// ✅ How others will import these components (after 0.5 barrel exists):
// import { Badge } from "~/components/ui";
// For now (no barrel yet), direct import:
// import { Badge } from "~/components/ui/Badge";
```

### Available Tailwind Tokens (confirmed in `tailwind.config.js`)

```
// Flood severity (use for Badge variants):
bg-flood-safe, bg-flood-warning, bg-flood-danger, bg-flood-critical
text-flood-safe, text-flood-warning, text-flood-danger, text-flood-critical

// Brand:
bg-primary, text-primary
bg-secondary, text-secondary

// Borders (use for Divider + IconButton outline):
border-border-light, border-border-dark
bg-border-light, bg-border-dark

// Typography (use for text inside Badge):
text-caption   ← 11px (added in Story 0.2)
text-xs        ← 12px (Tailwind built-in)

// Destructive:
bg-destructive

// Muted:
bg-muted, text-muted-foreground
```

### Previous Story Learnings

From Story 0.1 and 0.2:
- Pre-existing TypeScript errors in the project are unrelated to our changes — run `npm run typecheck` and verify only that OUR new files introduce 0 new type errors
- The `~/` path alias is configured in `tsconfig.json` — always use it, never relative `../../`
- `cva` and `class-variance-authority` are already installed (used in `button.tsx`)
- `cn` from `~/lib/utils` is already available (used in `button.tsx`)
- `tailwind-merge` is already installed (used by `cn`)

### Verification

```bash
npm run typecheck    # tsc --noEmit — verify 0 new errors from our 3 new files
# Visual check (optional — covered in Story 0.4's Maestro flow):
npm run android      # ensure app still launches without crash
```

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes List

- Created `components/ui/Badge.tsx`: CVA with 6 severity variants (safe/warning/danger/critical/info/default) mapping to flood-* tokens + 2 sizes (sm/md). Named export only. `cn(badgeVariants({variant,size}), className)` override order correct.
- Created `components/ui/IconButton.tsx`: CVA with 4 variants (primary/ghost/outline/destructive) + 3 sizes (sm:32px/md:40px/lg:48px). Extends `Pressable` props. Named export only.
- Created `components/ui/Divider.tsx`: CVA with orientation variants (horizontal/vertical) using `bg-border-light dark:bg-border-dark`. Named export only.
- `npm run typecheck` (tsc --noEmit) passes with 0 errors introduced by these new files. Pre-existing project type errors unrelated to our changes.

### File List

- `components/ui/Badge.tsx` (created)
- `components/ui/IconButton.tsx` (created)
- `components/ui/Divider.tsx` (created)

### Change Log

- 2026-04-14: Created Badge.tsx, IconButton.tsx, Divider.tsx in components/ui/ following CVA + NativeWind pattern from button.tsx. All 3 use named exports, accept testID/className props, cn(variants, className) override order. tsc --noEmit passes.
