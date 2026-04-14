---
stepsCompleted: [1, 2, '2b', '2c', 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
status: 'complete'
completedAt: '2026-04-14'
inputDocuments:
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/project-context.md"
  - "documents/UI_DESIGN_SYSTEM_PLAN.md"
workflowType: 'prd'
project_name: 'FDA-Mobile'
user_name: 'Anh Tuan'
date: '2026-04-14'
classification:
  projectType: mobile_app
  domain: civic_safety_flood_detection
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - FDA-Mobile

**Author:** Anh Tuan
**Date:** 2026-04-14

## Executive Summary

FDA-Mobile is an early flood detection and alert mobile application for Vietnamese residents in flood-prone areas. The app transforms real-time sensor data, community reports, and geographic flood zone information into actionable warnings and safe route recommendations — enabling immediate decisions during rain and flooding events.

**Project type:** Mobile App (React Native + Expo, Android-primary) | **Domain:** Civic Safety / Flood Detection | **Complexity:** Medium | **Context:** Brownfield visual refactor

This PRD governs a **UI Design System Unification** initiative: a brownfield visual refactor targeting capstone defense presentation quality. Business logic, API calls, navigation, and state management are out of scope — only the visual layer changes.

**Target users:** Residents in flood-prone zones, daily commuters (motorcycle/car), and local community members contributing flood reports.

**Deadline driver:** Capstone defense — evaluators judge perceived quality on first impression. A consistent, polished UI signals engineering maturity regardless of backend complexity.

### What Makes This Special

FDA-Mobile's competitive advantage is its **flood severity color language** — a four-tier system (safe → warning → danger → critical) that users internalize as muscle memory, enabling instant risk assessment without reading text. This system must appear identically across map markers, alert cards, notification badges, and area cards — zero deviation.

The core design insight: **users in emergency situations need decisions, not data.** Emergency readability under stress (high contrast, 44pt touch targets, one-handed operation) is a first-class requirement, not an afterthought.

The unification initiative addresses a root cause: 5 developers building UI independently with AI prompts produced functionally correct but visually inconsistent screens. The fix is a single design token source of truth enforced across 116 affected files.

## Success Criteria

### User Success

- Every screen feels visually consistent — same colors, spacing, shadows, typography across all features
- Flood severity levels (safe/warning/danger/critical) are instantly recognizable and identical on every screen
- Dark mode works correctly on all screens without visual glitches
- App looks professional when demoed live to capstone evaluators — no "built by 5 different people" impression

### Business Success

- Capstone defense passes with positive evaluator feedback on UI quality
- Team can confidently demo any screen without hiding or skipping due to visual issues

### Technical Success

- `tsc --noEmit` passes with 0 errors after every story
- 0 hardcoded hex colors in `style={{}}` — all colors via Tailwind tokens
- 0 `isDarkColorScheme` ternaries in JSX (except 3 registered exceptions: map props, tab bar, third-party libs)
- 100% shared component usage for Badge, IconButton, SectionHeader, ListItem, Pill, ScreenHeader, Avatar, Divider
- All shadows via `SHADOW.sm/md/lg` from `~/lib/design-tokens` — no inline shadow styles

### Measurable Outcomes

| Metric | Current | Target |
|---|---|---|
| Files with `isDarkColorScheme` ternaries | 116 | 0 (3 exceptions only) |
| Arbitrary `fontSize` values | 60+ | 0 — 8-step scale only |
| Hardcoded hex colors in `style={{}}` | 40+ | 0 |
| Inline shadow definitions | 20+ | 0 |
| Missing `testID` on interactive elements | ~200 | 0 |
| Shared components available | 0 | 8 |

## Product Scope

### MVP — Phase 1 (Capstone Defense)

**Execution order is sequential — Epic 0 must complete before any other:**

1. **Epic 0** — Foundation: `lib/design-tokens.ts`, 8 shared components, `tailwind.config.js` extensions
2. **Epic 1** — Tab Bar + Nav Shell *(highest visibility — first thing evaluators see)*
3. **Epic 2** — Home
4. **Epic 3** — Notifications
5. **Epic 5** — Alerts
6. **Epic 6** — Areas
7. **Epic 8** — Prediction
8. **Epic 9** — Map *(largest ~89 files — saved for last within MVP)*

**Resource:** 1 developer (solo refactor), Android physical device for testing.

### Growth — Phase 2 (If Time Allows)

- Epic 4: Profile
- Epic 7: Plans + Payment
- Maestro E2E test flows per feature

### Vision — Phase 3 (Post Capstone)

- Epic 10: Auth + Onboarding
- Epic 11: Community, Complaints, News
- Visual regression screenshot comparison
- Storybook component catalog

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Epic 9 (Map) scope creep | ~89 files — timebox strictly; `map-ui-utils.ts` refactor last within Epic 9 |
| `tsc` errors blocking progress | Run `tsc --noEmit` after every file change, not just end of story |
| APK broken after refactor | Build and install APK after every epic completion |
| Dark mode broken on device | Test light + dark mode on physical device after every epic |
| Logic accidentally changed | Per-story checklist explicitly forbids logic changes; styling files only |
| Solo developer fatigue | Follow per-story checklist mechanically — 7 steps, every story, no exceptions |

## User Journeys

### Journey 1: Developer Refactoring a Feature (Primary — Success Path)

**Meet Minh**, assigned Epic 5 (Alerts). Previously coded UI by intuition — hardcoded `#EF4444`, `isDarkColorScheme ? "#1E293B" : "#FFF"` everywhere, inline shadows. App functioned correctly but each teammate's screen looked different.

**Rising Action:** Minh reads the Epic 5 story, opens `lib/design-tokens.ts` and `components/ui/index.ts` already created in Epic 0. Replaces each hardcoded color → Tailwind class, each inline shadow → `SHADOW.md`, each ternary → `dark:` prefix. Runs `tsc --noEmit` — passes. Compares on real device against teammate's Home screen — same spacing, same shadows, same severity colors.

**Climax:** The "DANGER" badge on Alerts is identical to the badge on Map (built by someone else). For the first time the app looks built by one team.

**Resolution:** PR approved with no style comments — only logic comments. The design system did its job.

**Requirements revealed:** Design token source of truth, shared Badge/ListItem components, per-story migration checklist, `tsc` verification gate.

---

### Journey 2: Developer Hits a Dark Mode Edge Case (Primary — Edge Case)

**Meet Lan**, assigned Epic 9 (Map). `react-native-maps` doesn't accept `className` — many `isDarkColorScheme` ternaries exist for map marker colors.

**Rising Action:** Lan follows the migration checklist — replaces ternaries → `dark:` classes. Map markers still need JS color values. Lan checks `lib/design-tokens.ts` — finds the `MAP_COLORS` exception registry already documented. No guessing, no asking teammates.

**Climax:** Edge case handled without architecture violation — `isDarkColorScheme` only remains in the exception registry.

**Resolution:** `tsc --noEmit` passes. Map screen correct in both modes. Exception registry prevents future regressions.

**Requirements revealed:** Exception registry pattern, documented dark mode exception categories, clear per-story checklist with exception handling.

---

### Journey 3: Capstone Evaluator During Live Demo (Secondary — High Stakes)

**Meet Prof. Hùng**, capstone grader. He holds an APK on a Samsung Galaxy A-series. Five students demo five features on five different devices.

**Rising Action:** Dev 1 demos Home — clean cards, consistent spacing. Dev 2 demos Map — same severity colors. Dev 3 demos Alerts — red "DANGER" badge identical to the Map badge. Five screens look consistent.

**Climax:** "Does the app have dark mode?" — dev switches on the spot. All screens transition uniformly, no broken layouts.

**Resolution:** "This team has good process." Not because the app is complex, but because it looks like one unified product.

**Requirements revealed:** Cross-device visual consistency, dark mode on real Android, APK stability, severity color uniformity across all features.

---

### Journey 4: Team Lead Reviewing a Pull Request (Operations — Quality Gate)

**Meet An**, reviewing Minh's PR for Epic 5. Needs to quickly verify refactor didn't break logic and follows architecture.

**Rising Action:** PR diff shows `isDarkColorScheme` removed → `dark:` classes. `SHADOW.md` imported correctly. `Badge` used instead of inline View. No hardcoded hex anywhere.

**Climax:** `tsc --noEmit` — 0 errors. APK opened — Alerts screen visual exactly as expected.

**Resolution:** PR approved "LGTM." Design system made review faster — clear rules, no style debates.

**Requirements revealed:** Anti-pattern list for reviewers, `tsc` gate mandatory, architecture docs accessible to full team.

---

### Journey Requirements Summary

| Journey | Capabilities Required |
|---|---|
| Dev — Success Path | Design tokens, shared components, migration checklist, typecheck gate |
| Dev — Edge Case | Exception registry, documented dark mode exceptions, decision rules |
| Evaluator — Live Demo | Cross-device consistency, dark mode on Android, APK stability, severity uniformity |
| Team Lead — PR Review | Anti-pattern enforcement, typecheck gate, architecture documentation |

## Domain-Specific Requirements

### Technical Constraints

- **Android shadow:** NativeWind v4 does not support Android `elevation` — all shadows must use `style={SHADOW.sm/md/lg}` from `~/lib/design-tokens` with both `elevation` (Android) and `shadowColor/Offset/Opacity/Radius` (iOS)
- **Map library:** `react-native-maps` props do not accept `className` — `isDarkColorScheme` remains allowed exclusively for map marker colors, `mapType`, and `customMapStyle`
- **Tab bar:** `activeTintColor` / `inactiveTintColor` in `app/(tabs)/_layout.tsx` require JS color values — `isDarkColorScheme` remains allowed here
- **Real device required:** Android emulator insufficient for visual verification — all stories verified on physical device via APK build

### Safety-Critical UI Requirements

- **Minimum font size:** 11px floor — existing 9px, 10px, 10.5px values must be raised
- **Minimum touch target:** 44×44pt on all interactive elements — IconButton `lg` (48px) is the minimum for primary actions
- **Severity color uniformity:** `flood-safe` / `flood-warning` / `flood-danger` / `flood-critical` must render identically across all surfaces — zero deviation

### Dark Mode Exception Registry

`isDarkColorScheme` permitted only in these three locations:
1. `react-native-maps` props (map colors, map type)
2. Tab bar `activeTintColor` / `inactiveTintColor` in `_layout.tsx`
3. Third-party library props that do not accept NativeWind `className`

All other `isDarkColorScheme` usage = architecture violation.

## Mobile App Specific Requirements

### Platform Requirements

| Platform | Priority | Delivery | Testing |
|---|---|---|---|
| Android | **Primary** | APK sideload | Physical device |
| iOS | Secondary (if time allows) | N/A for capstone | N/A |

### Device Features & Integrations

- **Location:** `expo-location` — map and area features; no changes in scope
- **Push Notifications:** FCM already integrated — refactor is UI styling only (ListItem, Badge); no changes to handlers, channels, or permissions
- **Offline Mode:** Existing offline support must be preserved — design tokens introduce zero network dependency (compile-time NativeWind + static runtime import)
- **Store Compliance:** Out of scope — APK sideload only, no Play Store submission

### Implementation Constraints

- **NativeWind:** Tailwind classes processed at build time — no runtime overhead
- **`lib/design-tokens.ts`:** Static runtime import — tree-shaken, minimal bundle impact
- **CVA variants:** Resolved at render time — no performance regression vs inline styles
- **`testID` props:** Zero runtime cost — Maestro only, stripped in production

## Functional Requirements

### Design Token System

- **FR1:** Developer can import shadow constants (`SHADOW.sm/md/lg`) from a single shared file for use in React Native `style` props
- **FR2:** Developer can import radius constants (`RADIUS.*`) from a single shared file for third-party library props
- **FR3:** Developer can import dark mode exception color values (`MAP_COLORS`, `TAB_COLORS`) from a single shared file
- **FR4:** Developer can apply brand and severity colors via NativeWind Tailwind token classes (`bg-flood-danger`, `text-flood-safe`, etc.)
- **FR5:** Developer can style all text using an 8-step typography scale (`text-caption`, `text-display`, standard Tailwind sizes) with 11px minimum

### Shared Component Library

- **FR6:** Developer can use `Badge` with severity variants (safe/warning/danger/critical/info/default) and size variants (sm/md)
- **FR7:** Developer can use `IconButton` with style variants (primary/ghost/outline/destructive) and size variants (sm/md/lg)
- **FR8:** Developer can use `SectionHeader` with optional subtitle and right action slot
- **FR9:** Developer can use `ListItem` with optional leading element, title, subtitle, trailing element, and press handler
- **FR10:** Developer can use `Pill` with filled/outline variants and optional remove action
- **FR11:** Developer can use `ScreenHeader` with optional left action, right action, and subtitle
- **FR12:** Developer can use `Avatar` with size variants (sm/md/lg/xl) and image/initials fallback
- **FR13:** Developer can use `Divider` with horizontal/vertical orientation
- **FR14:** Developer can override any shared component's appearance via `className` prop
- **FR15:** Developer can target any shared component in Maestro tests via `testID` prop

### Dark Mode

- **FR16:** App renders all screens correctly in light mode on Android physical device
- **FR17:** App renders all screens correctly in dark mode on Android physical device
- **FR18:** App switches between light and dark mode without layout breakage on any screen
- **FR19:** Developer can apply dark mode variants using NativeWind `dark:` prefix without JavaScript conditionals

### Feature UI Refactor

- **FR20:** Tab Bar displays consistent colors using design token values (no hardcoded hex)
- **FR21:** Home screen displays all UI elements using shared components and token classes
- **FR22:** Notifications screen displays items using shared `ListItem` and `Badge` components
- **FR23:** Alerts screen displays severity using shared `Badge` with flood severity variants
- **FR24:** Areas screen displays list and cards using shared components and token classes
- **FR25:** Prediction screen displays cards using shared components and token classes
- **FR26:** Map screen displays severity indicators using flood severity token classes consistent with all other features
- **FR27:** All screens display text using the 8-step typography scale with 11px minimum

### Visual Consistency Enforcement

- **FR28:** Developer can verify zero TypeScript errors via `tsc --noEmit` after any file change
- **FR29:** Developer can identify all banned anti-patterns via documented architecture rules
- **FR30:** Developer can follow a per-story migration checklist covering all 7 required steps in order

### Testing Infrastructure

- **FR31:** Developer can add `testID` props to interactive elements following the `<feature>-<component>-<element>` naming convention
- **FR32:** Developer can run Maestro smoke tests to verify app launch and tab navigation after each epic
- **FR33:** Developer can run Maestro feature flows to verify each refactored screen

## Non-Functional Requirements

### Performance

- **NFR1:** Map screen renders with no perceptible frame drop after refactor — `React.memo` on map overlay components must be preserved
- **NFR2:** Shared component render time must not exceed inline equivalent — CVA class resolution adds zero measurable overhead
- **NFR3:** App cold start time must not regress — `lib/design-tokens.ts` is a static import, no async loading

### Accessibility

- **NFR4:** All text elements use minimum 11px font size — below this floor is inaccessible under stress conditions
- **NFR5:** All interactive elements have minimum 44×44pt touch target
- **NFR6:** Flood severity colors meet WCAG AA contrast ratio (4.5:1) against their background — critical for outdoor sunlight use
- **NFR7:** All interactive elements have a `testID` prop for automated testing and accessibility tooling

### Integration

- **NFR8:** NativeWind `dark:` prefix functions correctly on Android physical device (not just emulator)
- **NFR9:** `react-native-maps` visual behavior is identical before and after refactor — JS color values preserved in exception registry
- **NFR10:** SignalR realtime connection is unaffected by styling changes — no imports or side effects in realtime hooks

### Reliability

- **NFR11:** APK launches without crash on Android physical device after every epic completion
- **NFR12:** Offline mode behavior is unchanged — design tokens introduce no network dependency
- **NFR13:** `tsc --noEmit` reports 0 errors after every story — TypeScript compilation is the primary quality gate
