# Deferred Work

## Deferred from: code review of story 7-2 (2026-04-14)

- **SHADOW token choice inconsistent across overlays** — WaterLevelVisualization uses SHADOW.md, MapLoadingOverlay uses SHADOW.lg, PickOnMapOverlay uses SHADOW.md. No spec guidance on which shadow tier for which overlay context. Decision needed: create shadow tier matrix in CLAUDE_MAP.md documenting when to use SHADOW.md vs .lg vs .sm for overlay/card elements.

- **OpacitySlider flexibility lost in refactoring** — Component signature tightened from `color/subtextColor/borderColor` props to `colorClass` only. Works for current LayerToggleSheet use case but limits future reuse if another UI context needs custom text colors. Only actionable if opacity slider is needed in unforeseen ways.

- **testID strings hardcoded across components** — testIDs like `"map-layer-areadisplay-selector"`, `"map-layer-basemap-selector"` hardcoded in JSX with no central registry. Hardcoding testIDs is accepted pattern in React Native. Defer unless team decides to centralize in constant/enum (would require design decision, not urgent fix).

- **WaterLevelVisualization columnBg color not in MAP_COLORS** — Uses hardcoded `#0B1A33` for dark column background with comment "not in MAP_COLORS — use muted dark token". Documented exception in implementation notes. Only actionable if design tokens are expanded to include this value.

- **SHADOW and MAP_COLORS imports unverified** — Multiple files import from design-tokens.ts but diff doesn't show that these tokens are exported. Must verify with `tsc --noEmit` that design-tokens.ts exports SHADOW and MAP_COLORS objects. Pre-condition for story acceptance.

## Deferred from: code review of story 4-2 (2026-04-14)

- **NotificationChannelsSection mixed style paradigm** — Component mixes inline styles and NativeWind classes inconsistently (flexDirection, alignItems, borderRadius inline; icon backgrounds via NativeWind). Deferred to future style audit for holistic refactor.

- **Pre-existing tsc errors in prediction feature** — AC#9 violation: tsc --noEmit fails with 12+ errors in features/prediction/SatelliteVerificationCard.tsx (isDark undefined). Predates this diff; deferred to prediction feature refactor.

- **ThresholdDivider/SectionTitle props contract deprecation** — Backward-compat wrappers accept `colors` props but ignore them. Decision needed: should add TypeScript deprecation warning to prevent future misuse, or document as internal-only. Deferred pending props contract strategy.
