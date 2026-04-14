---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-14'
inputDocuments:
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/project-context.md"
  - "documents/UI_DESIGN_SYSTEM_PLAN.md"
workflowType: 'architecture'
project_name: 'FDA-Mobile'
user_name: 'Anh Tuan'
date: '2026-04-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- Unify 3 separate color systems into 1 source of truth in `tailwind.config.js` + `lib/design-tokens.ts`
- Create 8 new shared UI components (Badge, IconButton, SectionHeader, ListItem, Pill, ScreenHeader, Avatar, Divider)
- Migrate 116 files from `isDarkColorScheme` ternary pattern → NativeWind `dark:` prefix
- Standardize typography to 8-step scale (eliminate 14+ arbitrary font sizes)
- Standardize shadows to 3-tier system (sm/md/lg) in `lib/design-tokens.ts`
- Add testID support to all interactive elements (~200+ locations)
- Setup Maestro E2E testing infrastructure

**Non-Functional Requirements:**
- Emergency readability: minimum 11px font, 44pt touch targets
- Android shadow support: `elevation` values required alongside iOS shadow props
- Performance: no regressions on map overlays (memo), Zustand selectors stay granular
- Zero logic changes: behavior must be identical before/after each story
- TypeScript strict: no `any`, no `as` casting without runtime check

**Scale & Complexity:**

- Primary domain: React Native mobile (Android-first for testing)
- Complexity level: Medium-high migration (large file count, narrow scope)
- Estimated architectural components: 8 new UI components + 1 token file + tailwind extensions
- Migration scope: 116 ternary files, 60+ font size instances, 40+ hardcoded colors, 20+ inline shadows

### Technical Constraints & Dependencies

- NativeWind v4 does NOT support Android `elevation` → must use `style={SHADOW.x}` for shadows
- react-native-maps props don't accept className → `isDarkColorScheme` remains allowed for map colors
- Tab bar `activeTintColor`/`inactiveTintColor` → JS values only, no NativeWind
- CVA pattern already established: all new components follow `components/ui/button.tsx`
- Path alias `~/` must be used (never relative `../../`)
- Every new subdirectory needs `index.ts` barrel

### Cross-Cutting Concerns Identified

1. **Shadow system**: Platform split (Android elevation / iOS shadow props) affects every card/modal component
2. **Dark mode exceptions**: 3 documented exception categories where `isDarkColorScheme` stays
3. **testID convention**: `<feature>-<component>-<element>[-<qualifier>]` must be applied codebase-wide
4. **Color token migration**: `LIGHT_BG`/`DARK_BG` in map-ui-utils referenced widely — removal is a breaking change requiring careful coordination
5. **Typography minimum**: 11px floor affects ~10 files currently using 9-10px fonts

---

## Foundation Setup

### Project Type
Existing React Native + Expo mobile application — migration/refactoring project.
No new project initialization required.

### Existing Stack (Confirmed)
- **Runtime:** React Native 0.81.5 + Expo ~54.0.27
- **Language:** TypeScript ~5.9.2
- **Routing:** Expo Router ~6.0.17
- **Styling:** NativeWind v4 + Tailwind CSS v3.4.17
- **Component Variants:** class-variance-authority + tailwind-merge
- **State:** React Query v5 (server), Zustand v5 (client), Redux Toolkit (legacy only)
- **Testing:** Maestro E2E on Android emulator (no unit test framework)
- **Maps:** react-native-maps + expo-location
- **Realtime:** @microsoft/signalr

### Foundation Files to Create/Modify (Epic 0)

| File | Action | Purpose |
|------|--------|---------|
| `lib/design-tokens.ts` | **CREATE** | SHADOW, RADIUS, DARK_COLORS constants — RN style source |
| `tailwind.config.js` | **EXTEND** | Add `fontSize.caption` (11px/14px/600) |
| `global.css` | **UPDATE** | Align HSL vars with FDA brand colors |
| `components/ui/` | **ADD 8 files** | Badge, IconButton, SectionHeader, ListItem, Pill, ScreenHeader, Avatar, Divider |

### Verification Commands
```bash
npm run typecheck    # tsc --noEmit — after every change
npm run android      # expo run:android — visual verification
```

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Design token source of truth split: tailwind.config.js (NativeWind) + lib/design-tokens.ts (RN-only)
- Component export pattern: single-file + index.ts barrel
- Dark mode exception strategy: centralized JS color values in lib/design-tokens.ts

**Important Decisions (Shape Architecture):**
- Migration strategy: per-feature (aligned with Epic structure)
- testID convention: `<feature>-<component>-<element>[-<qualifier>]`
- Maestro test structure: `maestro/flows/<feature>/` hierarchy

**Deferred Decisions (Post-MVP):**
- Animation token standardization (ANIMATION constants) — after shadow/color done
- Storybook or visual regression testing — after Maestro baseline established

### Design Token Architecture

**Decision:** Split token sources by usage context
- `tailwind.config.js` — canonical source for all NativeWind/Tailwind tokens (colors, spacing, radius, typography). Already defined. Do not duplicate.
- `lib/design-tokens.ts` — RN-specific style objects that cannot be expressed as NativeWind classes:
  - `SHADOW.sm/md/lg` — Android elevation + iOS shadowColor/Offset/Opacity/Radius
  - `RADIUS.*` — numeric values for RN contexts (map markers, third-party libs)
  - `DARK_COLORS.*` — JS color values for documented dark mode exceptions only

**Rationale:** NativeWind v4 does not support Android `elevation`. Splitting avoids duplication and keeps each file focused.

**Migration:** `features/map/lib/map-ui-utils.ts` → remove LIGHT_BG, DARK_BG, RADIUS, CARD_SHADOW, OVERLAY_SHADOW, ALERT_SHADOW → import from `~/lib/design-tokens`

### Frontend (Component) Architecture

**Decision:** CVA + NativeWind single-file pattern
- All 8 new components in `components/ui/<ComponentName>.tsx`
- Exported via `components/ui/index.ts` barrel
- Each component: CVA variants + `testID` prop + `className` override prop
- Reference implementation: `components/ui/button.tsx`

**Component Interface Standard:**
```typescript
interface ComponentProps extends VariantProps<typeof componentVariants> {
  testID?: string;        // required for Maestro testing
  className?: string;     // NativeWind override — always last
  // ...feature-specific props
}
```

### Dark Mode Architecture

**Decision:** NativeWind-first with centralized JS exceptions

**Rule:** Use `dark:` NativeWind prefix everywhere. No `isDarkColorScheme` ternaries in JSX.

**Exception registry in `lib/design-tokens.ts`:**
```typescript
// Allowed isDarkColorScheme contexts — DO NOT migrate these
export const MAP_COLORS = { light: { ... }, dark: { ... } }  // react-native-maps
export const TAB_COLORS = { active: { light: ..., dark: ... }, inactive: ... }  // tab bar
```

**Audit target:** 116 files → 0 ternaries in JSX (exceptions stay in design-tokens.ts only)

### Migration Architecture

**Decision:** Per-feature migration aligned with Epic structure

**Sequence:**
1. Epic 0 (Foundation): Create lib/design-tokens.ts + 8 components + tailwind extensions
2. Epic 1–11: Per-feature, migrate ternaries → dark: classes + replace inline styles → tokens

**Per-story checklist:**
- [ ] Replace `isDarkColorScheme` ternaries → `dark:` classes (except registered exceptions)
- [ ] Replace hardcoded hex colors → Tailwind token classes
- [ ] Replace inline shadows → `style={SHADOW.x}`
- [ ] Replace arbitrary fontSize → typography scale
- [ ] Add `testID` props to interactive elements
- [ ] Run `npm run typecheck`
- [ ] Write Maestro flow for screen

### Testing Architecture

**Decision:** Maestro E2E, Android-first, per-feature flows

**Structure:**
```
maestro/
├── flows/
│   ├── smoke/          # app launch + tab navigation (run after every epic)
│   └── <feature>/      # per-feature flows (TC1-TCn)
└── _screenshots/       # <story>-TC<n>-<desc>.png
```

**appId:** `com.fda.mobile` (dev build) / `host.exp.Exponent` (Expo Go fallback)

### Infrastructure & Deployment

No changes — existing Expo build pipeline unchanged. Visual refactor only, no new dependencies required beyond what's already installed.

---

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified: 5 areas

### Naming Patterns

**Severity Variant Naming (CVA):**
```typescript
// ✅ Correct — short severity names (not flood-prefixed in variant prop):
<Badge variant="danger" />      // flood-danger color
<Badge variant="warning" />     // flood-warning color
<Badge variant="safe" />        // flood-safe color
<Badge variant="critical" />    // flood-critical color
<Badge variant="info" />        // primary color
<Badge variant="default" />     // neutral

// ❌ Wrong:
<Badge variant="flood-danger" />   // too verbose
<Badge variant="error" />          // not aligned with FDA domain language
```

**testID Naming — mandatory, not optional:**
```
// Pattern: <feature>-<component>-<element>[-<qualifier>]
// ✅ Correct:
testID="alerts-history-card-severity-badge"
testID="areas-create-btn"
testID="map-station-marker"

// ❌ Wrong — vague or missing:
testID="badge"
testID="button1"
// (no testID at all on interactive elements)
```

**File Naming:**
- Component files: `PascalCase.tsx` → `Badge.tsx`, `IconButton.tsx`
- Barrel: `index.ts` (not `index.tsx`)
- Token file: `design-tokens.ts` (kebab-case, no `.tsx`)

### Structure Patterns

**New Component File Structure:**
```typescript
// components/ui/Badge.tsx — exact pattern to follow
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "base classes here",           // base classes first
  {
    variants: { variant: {}, size: {} },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  testID?: string;               // always optional (Maestro uses it)
  className?: string;            // always last prop for overrides
  // feature-specific props here
}

export function Badge({ variant, size, testID, className, ...props }: BadgeProps) {
  return (
    <View
      testID={testID}
      className={cn(badgeVariants({ variant, size }), className)}  // className LAST (override wins)
      {...props}
    />
  );
}
```

**Barrel Export Pattern:**
```typescript
// components/ui/index.ts
export { Badge } from "./Badge";
export { IconButton } from "./IconButton";
// named exports only — no default exports from shared components
```

### Format Patterns

**className vs style={} Decision Rule:**
```
USE className (NativeWind):
  ✅ colors, spacing, typography, border-radius, flex, display
  ✅ dark mode variants (dark:)
  ✅ responsive states (active:, focus:, disabled:)

USE style={} (inline RN object):
  ✅ Android elevation / iOS shadow → always use SHADOW.sm/md/lg from design-tokens
  ✅ Dynamic values from JS (animation progress, calculated pixel values)
  ✅ Third-party lib props that require RN style objects

NEVER mix for the same property:
  ❌ style={{ borderRadius: 16 }} when className="rounded-xl" is available
```

**CVA className Override — order matters:**
```typescript
// ✅ Correct — user className overrides CVA variants:
cn(componentVariants({ variant, size }), className)

// ❌ Wrong — CVA variants would override user className:
cn(className, componentVariants({ variant, size }))
```

### Communication Patterns

**Import Path Rules:**
```typescript
// ✅ Always use ~/ alias:
import { SHADOW } from "~/lib/design-tokens";
import { Badge } from "~/components/ui";

// ❌ Never relative paths:
import { SHADOW } from "../../lib/design-tokens";
```

**Design Token Usage:**
```typescript
// ✅ Shadow — always from design-tokens:
import { SHADOW } from "~/lib/design-tokens";
style={SHADOW.md}

// ✅ Color — always Tailwind class:
className="bg-flood-danger text-white"

// ❌ Never hardcode:
style={{ shadowColor: "#000", elevation: 4 }}
style={{ backgroundColor: "#EF4444" }}
```

### Process Patterns

**Per-Story Migration Checklist (AI agents must follow in order):**
1. Search file for `isDarkColorScheme` → replace with `dark:` (except registered exceptions)
2. Search for `style={{ color: "#` or `style={{ backgroundColor: "#` → replace with Tailwind class
3. Search for `shadowColor` / `elevation` inline → replace with `style={SHADOW.x}`
4. Search for `fontSize:` arbitrary values → replace with typography scale
5. Add `testID` to: buttons, inputs, list items, navigation elements, modals
6. Run `npm run typecheck` — must pass with 0 errors
7. Write Maestro flow for screens modified

**When to Create a New Shared Component (decision rule):**
```
CREATE new shared component when:
  ✅ Same UI pattern appears in 3+ different features
  ✅ Pattern has variants (severity, size, state)
  ✅ Pattern needs consistent testID structure

DO NOT create when:
  ❌ Used in only 1 feature → keep it feature-local
  ❌ Too feature-specific to generalize
  ❌ Simple enough to be 1-2 NativeWind classes inline
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Import shadows from `~/lib/design-tokens` — never inline shadow styles
- Use `cn(variants, className)` order — className always last for override priority
- Add `testID` prop to every interactive element (Button, TouchableOpacity, TextInput, etc.)
- Use `~/` path alias — never relative imports
- Run `npm run typecheck` after every file change — 0 errors required

**Anti-Patterns (banned):**
```typescript
// ❌ Hardcoded color in style
style={{ color: "#0077BE" }}                  → className="text-primary"

// ❌ Inline shadow
style={{ elevation: 4, shadowColor: "#000" }} → style={SHADOW.md}

// ❌ isDarkColorScheme in JSX
isDarkColorScheme ? "#fff" : "#000"           → className="text-white dark:text-black"

// ❌ Arbitrary fontSize
style={{ fontSize: 13.5 }}                    → className="text-sm" (14px)

// ❌ Wrong CVA override order
cn(className, variants({ variant }))          → cn(variants({ variant }), className)

// ❌ Default export from shared component
export default Badge                          → export function Badge
```

---

## Project Structure & Boundaries

### Design System — Files to Create / Modify

#### New Files (Epic 0 — Foundation)

```
lib/
└── design-tokens.ts           # NEW — SHADOW, RADIUS, DARK_COLORS constants

components/ui/
├── index.ts                   # NEW — barrel export (currently missing)
├── Badge.tsx                  # NEW — severity badge (safe/warning/danger/critical/info/default)
├── IconButton.tsx             # NEW — icon-only button (sm/md/lg)
├── SectionHeader.tsx          # NEW — title row with optional subtitle + right action
├── ListItem.tsx               # NEW — standard list row (56px min height)
├── Pill.tsx                   # NEW — chip/pill with optional remove
├── ScreenHeader.tsx           # NEW — top navigation bar
├── Avatar.tsx                 # NEW — circular image/initials (sm/md/lg/xl)
└── Divider.tsx                # NEW — horizontal/vertical separator

maestro/
├── flows/
│   ├── smoke/
│   │   └── app-launch.yaml    # NEW — app launch + tab navigation
│   ├── home/
│   ├── alerts/
│   ├── areas/
│   ├── map/
│   ├── notifications/
│   └── profile/
└── _screenshots/              # auto-generated
```

#### Modified Files (Epic 0 — Foundation)

```
tailwind.config.js                        # EXTEND — add fontSize.caption
global.css                                # UPDATE — align HSL vars with FDA brand
lib/constants.ts                          # ANNOTATE — NAV_THEME marked as legacy
features/map/lib/map-ui-utils.ts          # SLIM DOWN — remove *_BG, RADIUS, *_SHADOW → import from ~/lib/design-tokens
```

### Existing Structure (Relevant to Design System)

```
components/
└── ui/
    ├── button.tsx             # ← reference CVA pattern
    ├── card.tsx
    ├── input.tsx
    ├── text.tsx
    ├── form.tsx
    ├── form-control.tsx
    ├── label.tsx
    ├── textarea.tsx
    ├── status-filter.tsx
    └── TabLoadingScreen.tsx

lib/
├── api-client.ts
├── constants.ts               # NAV_THEME — legacy, keep for React Navigation
├── signalr-client.ts
├── useColorScheme.ts
├── utils.ts                   # cn() helper
├── validations.ts
└── design-tokens.ts           # ← TO CREATE (Epic 0, Story 0.1)
```

### Architectural Boundaries

**Design Token Boundary:**
- `tailwind.config.js` + `global.css` → NativeWind/CSS values (strings, class names)
- `lib/design-tokens.ts` → RN style objects only (SHADOW, RADIUS, DARK_COLORS)
- Rule: Never import `lib/design-tokens.ts` just for a color hex — use Tailwind class instead

**Component Boundary:**
- `components/ui/` → generic, reusable, no feature-specific logic
- `features/<name>/components/` → feature-specific, may use shared `components/ui/`
- Rule: `features/A/components/` must NOT import from `features/B/components/`

**Dark Mode Exception Boundary:**
- All `isDarkColorScheme` usage must live in `lib/design-tokens.ts` exports OR in the 3 documented exception locations (map props, tab bar layout, third-party lib props)
- Rule: `isDarkColorScheme` in any other file = architecture violation

### Epic → Structure Mapping

| Epic | Feature | Primary Locations |
|------|---------|------------------|
| Epic 0 | Foundation | `lib/design-tokens.ts`, `components/ui/` (8 new), `tailwind.config.js`, `maestro/flows/smoke/` |
| Epic 1 | Tab Bar + Nav | `app/(tabs)/_layout.tsx` |
| Epic 2 | Home | `features/home/components/`, `app/(tabs)/index.tsx` |
| Epic 3 | Notifications | `features/notifications/components/` |
| Epic 4 | Profile | `features/profile/components/` |
| Epic 5 | Alerts | `features/alerts/components/` |
| Epic 6 | Areas | `features/areas/components/` |
| Epic 7 | Plans + Payment | `features/plans/components/` |
| Epic 8 | Prediction | `features/prediction/components/` |
| Epic 9 | Map | `features/map/components/`, `features/map/lib/map-ui-utils.ts` |
| Epic 10 | Auth + Onboarding | `features/auth/components/` |
| Epic 11 | Community + Complaints + News | `features/community/components/` |

### Data Flow (Design System Layer)

```
tailwind.config.js
    ↓ (NativeWind compile-time)
className="bg-flood-danger"  →  RN View (styled)

lib/design-tokens.ts
    ↓ (runtime import)
style={SHADOW.md}            →  RN View (shadow applied)

components/ui/Badge.tsx
    ↓ (used by features)
<Badge variant="danger" />   →  flood-danger bg + white text
```

### Integration Points

**Internal:** All shared components exported via `components/ui/index.ts` barrel — features import `{ Badge, IconButton } from "~/components/ui"`

**External (Maestro):** `testID` props on interactive elements → Maestro flows tap by testID → screenshots saved to `maestro/_screenshots/`

**Build:** No new build steps — NativeWind processes Tailwind at compile time, `lib/design-tokens.ts` is runtime TypeScript import, no additional tooling needed

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are already proven compatible in the existing codebase. NativeWind v4 + CVA + tailwind-merge is the established pattern. SHADOW/RADIUS constants are RN-native and don't conflict with NativeWind.

**Pattern Consistency:** CVA `cn(variants, className)` order is consistent across all 8 new components. Barrel export pattern (`index.ts`) is consistent with project-context.md rules.

**Structure Alignment:** `lib/design-tokens.ts` and `components/ui/` additions slot cleanly into existing structure with no reorganization needed.

### Requirements Coverage Validation ✅

All functional and non-functional requirements from UX spec are architecturally supported:
- Color unification: `tailwind.config.js` (canonical) + `lib/design-tokens.ts` (RN exceptions)
- Component system: 8 new components via CVA pattern, exported via `index.ts` barrel
- Dark mode migration: NativeWind `dark:` prefix + centralized exception registry
- Typography: `tailwind.config.js` `fontSize.caption` extension + 11px minimum rule
- Shadow: `SHADOW.sm/md/lg` constants cover Android elevation + iOS shadow
- Testing: Maestro structure + `testID` convention covers all 11 epics

### Implementation Readiness Validation ✅

- All decisions documented with rationale
- Anti-patterns explicitly listed (6 banned patterns)
- Per-story migration checklist in order (7 steps)
- "When to create shared component" decision rule defined
- Exception registry pattern for dark mode clearly specified

### Gap Analysis

**Critical Gaps:** None

**Important Notes:**
- `components/ui/index.ts` barrel does not exist yet — must be created in Epic 0 Story 0.2 alongside new components
- `features/map/lib/map-ui-utils.ts` refactor (Epic 9) is the highest-risk story due to wide usage — recommend doing it last within Epic 9

**Deferred (intentional):**
- `ANIMATION` constants — post-MVP after shadow/color migration complete
- Visual regression testing beyond Maestro — post-MVP

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (42 rules from project-context.md)
- [x] Scale and complexity assessed (116 ternary files, 11 epics, ~200 testIDs)
- [x] Technical constraints identified (Android elevation, map exceptions)
- [x] Cross-cutting concerns mapped (5 conflict points addressed)

**✅ Architectural Decisions**
- [x] Design token source split: tailwind.config.js vs lib/design-tokens.ts
- [x] Component export pattern: single-file + index.ts barrel
- [x] Dark mode exception strategy: centralized in design-tokens.ts
- [x] Migration strategy: per-feature aligned with Epic structure
- [x] Testing architecture: Maestro E2E, Android-first

**✅ Implementation Patterns**
- [x] CVA variant naming convention (severity: danger/warning/safe/critical)
- [x] className vs style={} decision rule
- [x] CVA override order: cn(variants, className)
- [x] Per-story migration checklist (7 steps, ordered)
- [x] When-to-create-component decision rule
- [x] 6 banned anti-patterns with correct alternatives

**✅ Project Structure**
- [x] 8 new component files listed
- [x] lib/design-tokens.ts creation specified
- [x] maestro/ directory structure defined
- [x] Epic → directory mapping for all 11 epics
- [x] Architectural boundaries defined (token, component, dark mode)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — existing stack is proven, scope is narrow (visual only), patterns follow established CVA/NativeWind conventions already in codebase.

**Key Strengths:**
- No new dependencies required — everything builds on installed stack
- CVA reference implementation (`button.tsx`) already exists
- Per-feature migration aligns perfectly with planned Epic structure
- Exception registry pattern prevents accidental regressions

**Areas for Future Enhancement:**
- ANIMATION token standardization (post Epic 5–6 when patterns emerge)
- Visual regression screenshot comparison (post Maestro baseline)
- `components/ui/` Storybook catalog (if team grows beyond 5 devs)

### Implementation Handoff

**AI Agent Guidelines:**
- Read this document + `_bmad-output/project-context.md` before any implementation
- Epic 0 must complete before Epic 1–11 (shared components must exist first)
- Per-story: always run migration checklist in order, `npm run typecheck` must pass before moving on
- Refer to `components/ui/button.tsx` as canonical CVA implementation reference

**First Implementation Priority:**
Epic 0, Story 0.1 — Create `lib/design-tokens.ts` with SHADOW, RADIUS, DARK_COLORS exports
