# Story 6.2: Migrate Prediction Analysis and AI Cards

Status: review

## Story

As a developer,
I want AiConsultantCard, NewAiConsultantCard, AiFactorsCard, AnalysisReportCard (.tsx and .native.tsx), ConclusionCard, FactorsCard, EnsembleDetailsCard, HybridEnsembleCard, and SatelliteVerificationCard to use shared components and design tokens,
So that AI analysis and ensemble detail cards match the design system.

## Acceptance Criteria

1. All cards use `SHADOW.*` for elevation instead of inline shadows
2. Severity indicators within cards use flood-* color tokens
3. Zero `isDarkColorScheme` ternaries remain
4. Zero hardcoded hex colors in `style={{}}` remain
5. All text uses the 8-step typography scale with 11px minimum
6. `testID` props added following `prediction-<component>-<element>` convention
7. `tsc --noEmit` passes with 0 errors

## Tasks / Subtasks

- [x] Task 1: Audit all 9 components for migration targets (AC: #1-#5)
  - [x] 1.1: List ternaries, hex colors, shadows, fontSize per file
  - [x] 1.2: Identify severity indicator patterns
  - [x] 1.3: Note AnalysisReportCard has both .tsx and .native.tsx — both need migration
- [x] Task 2: Migrate AI consultant cards (AC: #1, #2, #3, #4, #5, #6)
  - [x] 2.1: Migrate AiConsultantCard.tsx
  - [x] 2.2: Migrate NewAiConsultantCard.tsx
  - [x] 2.3: Migrate AiFactorsCard.tsx
  - [x] 2.4: Replace inline shadows with `SHADOW.*` in all
  - [x] 2.5: Replace severity colors with flood-* tokens
  - [x] 2.6: Add testID props following `prediction-ai-<element>` convention
- [x] Task 3: Migrate analysis report cards (AC: #1, #3, #4, #5, #6)
  - [x] 3.1: Migrate AnalysisReportCard.tsx (web variant)
  - [x] 3.2: Migrate AnalysisReportCard.native.tsx (native variant)
  - [x] 3.3: Ensure both variants use same design token approach
  - [x] 3.4: Add testID props following `prediction-report-<element>` convention
- [x] Task 4: Migrate conclusion and factors cards (AC: #1, #3, #4, #5, #6)
  - [x] 4.1: Migrate ConclusionCard.tsx
  - [x] 4.2: Migrate FactorsCard.tsx
  - [x] 4.3: Apply 7-step migration checklist to both
  - [x] 4.4: Add testID props following `prediction-conclusion-<element>` / `prediction-factors-<element>` convention
- [x] Task 5: Migrate ensemble and verification cards (AC: #1, #2, #3, #4, #5, #6)
  - [x] 5.1: Migrate EnsembleDetailsCard.tsx
  - [x] 5.2: Migrate HybridEnsembleCard.tsx
  - [x] 5.3: Migrate SatelliteVerificationCard.tsx
  - [x] 5.4: Apply 7-step migration checklist to all
  - [x] 5.5: Add testID props
- [x] Task 6: Verify typecheck (AC: #7)
  - [x] 6.1: Run `tsc --noEmit` and fix any errors

## Dev Notes

- 7-step migration checklist: ternaries → hex colors → shadows → fontSize → testID → typecheck → Maestro
- AnalysisReportCard has platform-specific variants (.tsx + .native.tsx) — migrate both consistently
- All cards should use SHADOW.sm or SHADOW.md for subtle elevation
- AI cards may have complex content — focus on colors, shadows, and typography, don't restructure layout
- 9 files total — group by functional area (AI, analysis, ensemble) for organized migration
