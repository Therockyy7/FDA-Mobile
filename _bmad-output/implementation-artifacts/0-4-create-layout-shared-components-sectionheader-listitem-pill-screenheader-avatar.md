# Story 0.4: Create Layout Shared Components (SectionHeader, ListItem, Pill, ScreenHeader, Avatar)

Status: done

## Story

As a developer,
I want SectionHeader, ListItem, Pill, ScreenHeader, and Avatar components following the CVA pattern,
So that layout patterns are reusable and consistent across all feature screens.

## Acceptance Criteria

1. `components/ui/SectionHeader.tsx` exists with h2 title, optional subtitle, optional rightAction slot; named export only
2. `components/ui/ListItem.tsx` exists with 56px min height, optional leading/trailing elements, title, subtitle, onPress; named export only
3. `components/ui/Pill.tsx` exists with filled/outline variants, caption text, optional left icon, optional remove action; named export only
4. `components/ui/ScreenHeader.tsx` exists with h1 title, optional leftAction, rightAction, subtitle; named export only
5. `components/ui/Avatar.tsx` exists with 4 sizes (sm:24px/md:32px/lg:40px/xl:56px), image source, initials fallback; named export only
6. All 5 components accept `testID?: string` and `className?: string` props
7. All 5 components use `cn(variants({...}), className)` override order — `className` always last
8. No default exports — all named exports only: `export function SectionHeader`, etc.
9. `tsc --noEmit` passes with 0 errors introduced by these new files

## Tasks / Subtasks

- [x] Task 1: Create `components/ui/SectionHeader.tsx` (AC: #1, #6, #7, #8)
  - [x] 1.1: Import `cva`, `VariantProps` from `class-variance-authority`; `cn` from `~/lib/utils`; `View`, `Text` from `react-native`; `ReactNode` from react
  - [x] 1.2: Define `sectionHeaderVariants` CVA (base `"flex-row items-center justify-between"`)
  - [x] 1.3: Define `SectionHeaderProps`: `title: string`, `subtitle?: string`, `rightAction?: ReactNode`, `testID?: string`, `className?: string`
  - [x] 1.4: Export named `SectionHeader` — title `text-xl font-bold text-slate-800 dark:text-slate-100`, subtitle `text-xs text-slate-500 dark:text-slate-400`, rightAction in trailing slot
  - [x] 1.5: Verify no default export

- [x] Task 2: Create `components/ui/ListItem.tsx` (AC: #2, #6, #7, #8)
  - [x] 2.1: Import `cva`, `VariantProps`, `cn`, `View`, `Text`, `Pressable` from react-native, `ReactNode` from react
  - [x] 2.2: Define `listItemVariants` CVA with base `"flex-row items-center min-h-[56px] px-4 gap-3"`
  - [x] 2.3: Define `ListItemProps`: `leading?: ReactNode`, `title: string`, `subtitle?: string`, `trailing?: ReactNode`, `onPress?: () => void`, `testID?: string`, `className?: string`
  - [x] 2.4: Export named `ListItem` — wrap in Pressable if `onPress` provided, else View; `leading` left, center column (title + subtitle), `trailing` right
  - [x] 2.5: Title: `text-sm font-semibold text-slate-800 dark:text-slate-100`; Subtitle: `text-xs text-slate-500 dark:text-slate-400`
  - [x] 2.6: Verify no default export

- [x] Task 3: Create `components/ui/Pill.tsx` (AC: #3, #6, #7, #8)
  - [x] 3.1: Import `cva`, `VariantProps`, `cn`, `View`, `Text`, `Pressable` from react-native, `ReactNode` from react
  - [x] 3.2: Define `pillVariants` CVA with base `"rounded-full flex-row items-center justify-center"` and variants: `filled` (`"bg-primary"`) / `outline` (`"border border-border-light dark:border-border-dark"`); size: default `"px-3 py-1 gap-1"`
  - [x] 3.3: Define `PillProps`: `label: string`, `variant?: "filled" | "outline"`, `leftIcon?: ReactNode`, `onRemove?: () => void`, `testID?: string`, `className?: string`
  - [x] 3.4: Export named `Pill` — `<View>`: leftIcon (optional), `<Text className="text-caption font-semibold text-white/filled-or-text-slate-700">`, remove icon wrapped in Pressable if `onRemove` provided
  - [x] 3.5: For `outline` variant, text color: `text-slate-700 dark:text-slate-200`; for `filled` variant: `text-white`
  - [x] 3.6: Verify no default export

- [x] Task 4: Create `components/ui/ScreenHeader.tsx` (AC: #4, #6, #7, #8)
  - [x] 4.1: Import `cva`, `VariantProps`, `cn`, `View`, `Text` from react-native, `ReactNode` from react
  - [x] 4.2: Define `screenHeaderVariants` CVA with base `"flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900"`
  - [x] 4.3: Define `ScreenHeaderProps`: `title: string`, `subtitle?: string`, `leftAction?: ReactNode`, `rightAction?: ReactNode`, `testID?: string`, `className?: string`
  - [x] 4.4: Export named `ScreenHeader` — left slot: `leftAction`; center: title `text-2xl font-bold text-slate-800 dark:text-slate-100` + optional subtitle; right slot: `rightAction`
  - [x] 4.5: Center content in `flex-1` with `items-center` when both leftAction and rightAction exist; else `flex-start`
  - [x] 4.6: Verify no default export

- [x] Task 5: Create `components/ui/Avatar.tsx` (AC: #5, #6, #7, #8)
  - [x] 5.1: Import `cva`, `VariantProps`, `cn`, `View`, `Text`, `Image` from react-native; `ImageSourcePropType` from react-native; `useState` from react
  - [x] 5.2: Define `avatarVariants` CVA with base `"rounded-full items-center justify-center overflow-hidden bg-primary"` and size variants: `sm: "w-6 h-6"` (24px), `md: "w-8 h-8"` (32px), `lg: "w-10 h-10"` (40px), `xl: "w-14 h-14"` (56px)
  - [x] 5.3: Define `AvatarProps`: `source?: ImageSourcePropType`, `initials?: string`, `size?: "sm" | "md" | "lg" | "xl"`, `testID?: string`, `className?: string`
  - [x] 5.4: Export named `Avatar` — show `Image` if `source` provided and not error; fallback to `Text` with initials (or "?" if no initials) on image error or no source
  - [x] 5.5: Initials text size: sm=`text-[8px]`, md=`text-[10px]`, lg=`text-[12px]`, xl=`text-base`; always `text-white font-semibold`
  - [x] 5.6: Use `useState` for `imageError` — `onError={() => setImageError(true)}`; render initials fallback if `!source || imageError`
  - [x] 5.7: Verify no default export

- [x] Task 6: Verify compilation (AC: #9)
  - [x] 6.1: Run `npm run typecheck` — must pass with 0 new errors from our 5 new files

## Dev Notes

### Foundation Context (What Previous Stories Delivered)

- `lib/design-tokens.ts` — `SHADOW.sm/md/lg`, `RADIUS.*`, `MAP_COLORS`, `TAB_COLORS` — importable via `~/lib/design-tokens`
- `tailwind.config.js` — `fontSize.caption` (11px/14px/600) added; FDA brand HSL vars in `global.css` aligned
- `components/ui/button.tsx` — THE reference CVA implementation (read this before writing any component)
- `components/ui/Badge.tsx` — Live example of: `cva`, `cn`, `testID`, named export, no default export
- `components/ui/IconButton.tsx` — Live example: extending Pressable props + CVA + children prop
- `components/ui/Divider.tsx` — Simplest CVA component in the system — read before writing
- Pre-existing TypeScript errors exist in project — NOT our problem; only verify our NEW files introduce 0 new errors
- `~/` path alias configured in `tsconfig.json` — always use, never relative `../../`

### Reference Implementation: `components/ui/button.tsx` + `components/ui/Badge.tsx`

```typescript
// EXACT PATTERN — follow this in all 5 new components:
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const myVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "md" },
});

interface MyProps extends VariantProps<typeof myVariants> {
  testID?: string;    // always optional
  className?: string; // always last — override priority
  // component-specific props
}

export function MyComponent({ variant, size, testID, className, ...props }: MyProps) {
  return (
    <View testID={testID} className={cn(myVariants({ variant, size }), className)}>
      {/* content */}
    </View>
  );
}
// ❌ NO default export
```

### SectionHeader Implementation Spec

```typescript
// components/ui/SectionHeader.tsx
import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "~/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  testID?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, rightAction, testID, className }: SectionHeaderProps) {
  return (
    <View testID={testID} className={cn("flex-row items-center justify-between", className)}>
      <View className="flex-1">
        <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
```

**Note:** SectionHeader is a structural component — no CVA variants needed (no variant prop). Use `cn("base", className)` directly.

### ListItem Implementation Spec

```typescript
// components/ui/ListItem.tsx
import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "~/lib/utils";

interface ListItemProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
  className?: string;
}

export function ListItem({ leading, title, subtitle, trailing, onPress, testID, className }: ListItemProps) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      testID={testID}
      onPress={onPress}
      className={cn("flex-row items-center min-h-[56px] px-4 gap-3", className)}
    >
      {leading && <View>{leading}</View>}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {trailing && <View>{trailing}</View>}
    </Container>
  );
}
```

**Note:** `Container` pattern (Pressable vs View based on `onPress`) avoids wrapping a View in an unnecessary Pressable.

### Pill Implementation Spec

```typescript
// components/ui/Pill.tsx
import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const pillVariants = cva(
  "rounded-full flex-row items-center justify-center px-3 py-1 gap-1",
  {
    variants: {
      variant: {
        filled:  "bg-primary",
        outline: "border border-border-light dark:border-border-dark",
      },
    },
    defaultVariants: { variant: "filled" },
  }
);

interface PillProps extends VariantProps<typeof pillVariants> {
  label: string;
  leftIcon?: ReactNode;
  onRemove?: () => void;
  testID?: string;
  className?: string;
}

export function Pill({ variant, label, leftIcon, onRemove, testID, className }: PillProps) {
  const textClass = variant === "outline"
    ? "text-caption font-semibold text-slate-700 dark:text-slate-200"
    : "text-caption font-semibold text-white";
  return (
    <View testID={testID} className={cn(pillVariants({ variant }), className)}>
      {leftIcon && <View>{leftIcon}</View>}
      <Text className={textClass}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} className="ml-0.5">
          {/* render ✕ icon — caller provides or use a Text "×" */}
          <Text className={textClass}>×</Text>
        </Pressable>
      )}
    </View>
  );
}
```

**Text color rule for Pill:**
| variant | text class |
|---|---|
| `filled` | `text-white` |
| `outline` | `text-slate-700 dark:text-slate-200` |

### ScreenHeader Implementation Spec

```typescript
// components/ui/ScreenHeader.tsx
import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "~/lib/utils";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  testID?: string;
  className?: string;
}

export function ScreenHeader({ title, subtitle, leftAction, rightAction, testID, className }: ScreenHeaderProps) {
  return (
    <View
      testID={testID}
      className={cn("flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-900", className)}
    >
      {leftAction ? <View>{leftAction}</View> : <View className="w-10" />}
      <View className="flex-1 items-center">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightAction ? <View>{rightAction}</View> : <View className="w-10" />}
    </View>
  );
}
```

**Layout Rule:** `<View className="w-10" />` spacers keep title centered when one action slot is empty. Always balanced.

### Avatar Implementation Spec

```typescript
// components/ui/Avatar.tsx
import { useState } from "react";
import { Image, type ImageSourcePropType, Text, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const avatarVariants = cva(
  "rounded-full items-center justify-center overflow-hidden bg-primary",
  {
    variants: {
      size: {
        sm: "w-6 h-6",    // 24px
        md: "w-8 h-8",    // 32px
        lg: "w-10 h-10",  // 40px
        xl: "w-14 h-14",  // 56px
      },
    },
    defaultVariants: { size: "md" },
  }
);

const initialsTextClass: Record<string, string> = {
  sm: "text-[8px] font-semibold text-white",
  md: "text-[10px] font-semibold text-white",
  lg: "text-[12px] font-semibold text-white",
  xl: "text-base font-semibold text-white",
};

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  source?: ImageSourcePropType;
  initials?: string;
  testID?: string;
  className?: string;
}

export function Avatar({ size = "md", source, initials, testID, className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = !!source && !imageError;
  return (
    <View testID={testID} className={cn(avatarVariants({ size }), className)}>
      {showImage ? (
        <Image
          source={source}
          className="w-full h-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text className={initialsTextClass[size as string] ?? initialsTextClass.md}>
          {initials ? initials.slice(0, 2).toUpperCase() : "?"}
        </Text>
      )}
    </View>
  );
}
```

**Size spec:**
| Prop `size` | Width/Height | Initials text |
|---|---|---|
| `sm` | 24px (`w-6 h-6`) | `text-[8px]` |
| `md` | 32px (`w-8 h-8`) | `text-[10px]` |
| `lg` | 40px (`w-10 h-10`) | `text-[12px]` (minimum 11px floor ✓) |
| `xl` | 56px (`w-14 h-14`) | `text-base` (16px) |

**Image sizing in NativeWind:** Use `className="w-full h-full"` on `<Image>` inside the Avatar view — do NOT set explicit pixel dimensions.

### Critical Rules — Anti-Patterns to Avoid

| ❌ BANNED | ✅ CORRECT |
|---|---|
| `default export` from shared component | `export function SectionHeader` (named only) |
| `cn(className, variants(...))` (className first) | `cn(variants({...}), className)` (className last) |
| Hardcoded hex colors: `color: "#1E293B"` | `className="text-slate-800 dark:text-slate-100"` |
| `isDarkColorScheme` ternary | `dark:` NativeWind prefix |
| `import { SectionHeader } from "./SectionHeader"` (relative) | `import { SectionHeader } from "~/components/ui/SectionHeader"` |
| Font size below 11px | minimum `text-caption` or `text-[11px]` |
| `style={{ minHeight: 56 }}` when NativeWind available | `className="min-h-[56px]"` |
| `style={{ borderRadius: 9999 }}` | `className="rounded-full"` |

### File Locations (Exact)

```
components/ui/SectionHeader.tsx    ← CREATE
components/ui/ListItem.tsx         ← CREATE
components/ui/Pill.tsx             ← CREATE
components/ui/ScreenHeader.tsx     ← CREATE
components/ui/Avatar.tsx           ← CREATE
components/ui/button.tsx           ← DO NOT TOUCH (reference only)
components/ui/Badge.tsx            ← DO NOT TOUCH (reference only)
components/ui/IconButton.tsx       ← DO NOT TOUCH (reference only)
components/ui/Divider.tsx          ← DO NOT TOUCH (reference only)
lib/design-tokens.ts               ← DO NOT TOUCH (done in 0.1)
tailwind.config.js                 ← DO NOT TOUCH (done in 0.2)
```

**DO NOT create `components/ui/index.ts`** — barrel export is Story 0.5.

### Import Rules

```typescript
// ✅ Correct imports inside new component files:
import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { View, Text, Pressable, Image, type ImageSourcePropType } from "react-native";
import { type ReactNode, useState } from "react";

// ✅ How to import from these new files (direct import, no barrel yet):
import { SectionHeader } from "~/components/ui/SectionHeader";
import { ListItem } from "~/components/ui/ListItem";
import { Pill } from "~/components/ui/Pill";
import { ScreenHeader } from "~/components/ui/ScreenHeader";
import { Avatar } from "~/components/ui/Avatar";

// ❌ DO NOT use barrel yet (index.ts does not exist until Story 0.5):
// import { SectionHeader } from "~/components/ui";  // WRONG — Story 0.5 only
```

### Available Tailwind Tokens (confirmed in `tailwind.config.js`)

```
// Text (use for titles and subtitles):
text-slate-800 dark:text-slate-100    // primary text
text-slate-500 dark:text-slate-400   // secondary / subtitle text
text-slate-700 dark:text-slate-200   // outline pill text

// Backgrounds:
bg-white dark:bg-slate-900           // screen/header backgrounds
bg-primary                           // filled pill, avatar fallback

// Borders (use for outline pill):
border-border-light dark:border-border-dark

// Typography:
text-2xl font-bold                   // ScreenHeader title (h1)
text-xl font-bold                    // SectionHeader title (h2)
text-sm font-semibold                // ListItem title
text-xs                              // subtitles / timestamps
text-caption                         // 11px — pill labels, badge text (minimum floor)
text-[8px]                           // Avatar sm initials only (smallest allowed context)
text-[10px]                          // Avatar md initials
text-[11px]                          // minimum floor for all other text
text-[12px]                          // Avatar lg initials
```

### Previous Story Learnings (0.1, 0.2, 0.3)

- Pre-existing TypeScript errors in project are unrelated to our changes — run `npm run typecheck` and verify only that OUR new files introduce 0 new type errors
- `~/` path alias configured in `tsconfig.json` — always use, never relative `../../`
- `cva` and `class-variance-authority` are already installed (confirmed in badge.tsx)
- `cn` from `~/lib/utils` is already available (confirmed in badge.tsx)
- `tailwind-merge` is already installed (used by `cn`)
- **SectionHeader and ScreenHeader are structural-only** — no CVA variants needed unless adding variant props later; use `cn("base", className)` directly
- **NativeWind `min-h-[56px]`** is valid syntax for arbitrary values — use for ListItem min height
- **Image in RN** requires explicit `width`/`height` or `w-full h-full` via NativeWind — do not leave size unspecified

### Verification

```bash
npm run typecheck    # tsc --noEmit — verify 0 new errors from our 5 new files
# Visual check (optional):
npm run android      # ensure app still launches without crash
```

### Review Findings

- [x] [Review][Patch] ListItem: `onPress` prop passed to `View` when `onPress` is undefined causes RN warning [ListItem.tsx:20] — fixed: separate Pressable/View branches
- [x] [Review][Patch] Pill: `variant` can be `null` from `VariantProps`, text class ternary `variant === "outline"` misses null guard [Pill.tsx:28] — fixed: explicit `isOutline` variable
- [x] [Review][Patch] Avatar: `size` can be `null` from `VariantProps`, bypasses default param `size = "md"` — fixed: `sizeProp ?? "md"` handles null [Avatar.tsx:35]
- [x] [Review][Patch] Avatar: `imageError` state never resets when `source` prop changes — fixed: useEffect resets on source change [Avatar.tsx:36]
- [x] [Review][Defer] Pill: remove button lacks accessibilityLabel and minimum 44x44 hit target [Pill.tsx:36] — deferred, accessibility pass planned separately
- [x] [Review][Defer] All components: missing accessibilityRole/accessibilityLabel on interactive elements — deferred, pre-existing pattern across codebase

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- All 5 layout components created following CVA pattern from Badge.tsx reference
- SectionHeader: structural component (no CVA variants), uses `cn("base", className)` directly
- ListItem: Container pattern (Pressable vs View) based on `onPress` prop presence
- Pill: CVA with filled/outline variants, conditional text color, optional remove action
- ScreenHeader: balanced spacers (`w-10`) keep title centered when action slots empty
- Avatar: CVA size variants with `useState` image error fallback to initials
- All components: named exports only, `testID` + `className` props, `cn(variants, className)` order
- `npm run typecheck` passes with 0 new errors from our 5 files

### File List

- `components/ui/SectionHeader.tsx` (created)
- `components/ui/ListItem.tsx` (created)
- `components/ui/Pill.tsx` (created)
- `components/ui/ScreenHeader.tsx` (created)
- `components/ui/Avatar.tsx` (created)

### Change Log

- 2026-04-14: Created 5 layout shared components (SectionHeader, ListItem, Pill, ScreenHeader, Avatar) — all following CVA pattern, named exports only, `tsc --noEmit` passes with 0 new errors
