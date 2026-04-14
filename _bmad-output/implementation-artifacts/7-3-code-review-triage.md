---
review_id: "7-3-triage"
date: "2026-04-14"
story: "7-3-migrate-map-station-area-card-components"
total_findings: 19
---

# Story 7-3 — Triaged Findings

**Review Status:** Complete with blockers  
**Failed Layers:** None  
**Total Findings:** 19 | **Critical:** 4 | **High:** 4 | **Medium:** 7 | **Low:** 4

---

## CRITICAL BLOCKERS (Fixes Required Before Merge)

### F1: AreaStationChips does NOT use Pill component [PATCH]
- **AC Violation:** AC#3 (AreaStationChips uses shared Pill component)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaStationChips.tsx:26-51`
- **Severity:** CRITICAL
- **Fix:** Replace hand-rolled View chips with imported `Pill` component from `~/components/ui`
- **Evidence:** Chips manually styled with custom View/Text instead of Pill variant

---

### F2: SelectedSensorCard missing React.memo wrapper [PATCH]
- **AC Violation:** AC#8 (React.memo wrappers preserved)
- **Source:** blind
- **Location:** `features/map/components/stations/cards/SelectedSensorCard.tsx:191`
- **Severity:** CRITICAL
- **Fix:** Wrap export: `export default React.memo(SelectedSensorCard);`
- **Evidence:** Function exported without memo wrapper; will re-render on every parent change

---

### F3: AreaCard memo comparator too shallow [PATCH]
- **AC Violation:** AC#8 (React.memo wrappers preserved — quality)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:418`
- **Severity:** CRITICAL
- **Fix:** Compare all props in memo: `(p, n) => p.area?.id === n.area?.id && p.onClose === n.onClose && p.onEdit === n.onEdit && p.onDelete === n.onDelete && p.onViewDetails === n.onViewDetails`
- **Evidence:** Current comparator only checks `area.id`; ignores callback prop changes; can cause stale handler references

---

### F4: FloodStationCard gradient bypasses design tokens [PATCH]
- **AC Violation:** AC#4 (Zero hardcoded hex colors in style={{}})
- **Source:** blind
- **Location:** `features/map/components/stations/cards/FloodStationCard.tsx:48-52`
- **Severity:** CRITICAL
- **Fix:** Define gradient color array as token or use design system gradient helper instead of inline alpha concatenation: ``colors={[severityColor, `${severityColor}C0`]}``
- **Evidence:** Uses `severityColor` (from token map) but appends alpha suffix inline (hex string + "C0"), bypassing design token control

---

## HIGH PRIORITY (Fix Before Merge)

### F5: Inconsistent testID props on action buttons [PATCH]
- **AC Violation:** AC#7 (testID props with unique names per element)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:250,266,281` + `AreaActionBar.tsx:20`
- **Severity:** HIGH
- **Fix:** Deduplicate testIDs:
  - AreaCard edit btn: `map-area-action-edit-btn`
  - AreaCard delete btn: `map-area-action-delete-btn`
  - AreaCard details btn: `map-area-action-details-btn`
  - AreaActionBar edit btn: `map-area-action-edit-btn`
  - AreaActionBar delete btn: `map-area-action-delete-btn`
- **Evidence:** 3 different buttons in AreaCard share testID `map-area-action-btn`; test selectors ambiguous

---

### F6: AdminAreaConfirmModal null check missing [PATCH]
- **AC Violation:** AC#8 (implicit — edge case handling)
- **Source:** edge
- **Location:** `features/map/components/areas/components/AdminAreaConfirmModal.tsx:91-94`
- **Severity:** HIGH
- **Trigger:** `visible=true` but `adminArea=null` after state update
- **Fix:** Add explicit null check before line 93: `{adminArea?.name ?? 'Khu vực'}`
- **Evidence:** Accesses `adminArea.name` without null guard; can throw TypeError if data race occurs

---

### F7: AreaCard.contributingStations unsafe access [PATCH]
- **AC Violation:** AC#6 (implicit — runtime safety)
- **Source:** edge (merged with blind#9)
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:90-94, 196, 216-225`
- **Severity:** HIGH
- **Trigger:** `area.contributingStations` is undefined or null
- **Fix:** 
  - Line 90-94: Already uses optional chaining `area.contributingStations?.reduce(...) ?? 0` ✅
  - Line 196: Guard before using `.length`: `area.contributingStations?.length ?? 0`
  - Line 216: Add check before rendering chips: `if (!area.contributingStations?.length) return null;`
- **Evidence:** `.length` accessed on optional prop without guard; potential runtime error

---

### F8: AreaStationChips missing optional chaining [PATCH]
- **AC Violation:** AC#6 (implicit — runtime safety)
- **Source:** edge
- **Location:** `features/map/components/areas/cards/AreaStationChips.tsx:33-42`
- **Severity:** HIGH
- **Trigger:** Array element missing `waterLevel` or `severity`
- **Fix:** Add optional chaining: `s?.waterLevel`, `s?.severity`; verify `severityColor()` handles undefined
- **Evidence:** No guard on array iteration; undefined station props cause `severityColor()` to fail

---

## MEDIUM PRIORITY (Should Fix)

### F9: SensorMarker inline styles not memoized [PATCH]
- **AC Violation:** AC#6 (performance — not explicit but style recreation per render)
- **Source:** blind
- **Location:** `features/map/components/stations/markers/SensorMarker.tsx:31-89`
- **Severity:** MEDIUM
- **Fix:** Extract inline style objects to `StyleSheet.create()` or wrap in `useMemo`
- **Evidence:** All marker bubble styles inline; recreated per render; no reuse

---

### F10: AreaCard StationChip colors not memoized [PATCH]
- **AC Violation:** AC#6 (performance)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:216-225`
- **Severity:** MEDIUM
- **Fix:** Memoize chip color array: `const chipColors = useMemo(() => area.contributingStations?.slice(0, 4).map(s => ({ code: s.stationCode, waterLevel: s.waterLevel, color: waterColor(s.waterLevel) })) ?? [], [area.contributingStations])`
- **Evidence:** `waterColor()` called 4+ times per render; no memoization

---

### F11: FLOOD_COLORS dark/light variant verification [DECISION_NEEDED]
- **AC Violation:** AC#6 (WCAG accessibility — dark mode contrast)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:42-47`
- **Severity:** MEDIUM
- **Decision:** Do `FLOOD_COLORS` have dark/light variants? If not, add ternary with `useColorScheme()`
- **Evidence:** `waterColor()` function returns `FLOOD_COLORS.*` without dark/light check; may fail contrast in dark mode
- **Action:** Verify `FLOOD_COLORS` definition in `~/lib/design-tokens`; adjust if needed

---

### F12: SEVERITY_COLORS dark/light variant verification [DECISION_NEEDED]
- **AC Violation:** AC#2 (isDarkColorScheme only for react-native-maps)
- **Source:** blind
- **Location:** `features/map/components/stations/markers/FloodSeverityMarkers.tsx:77-82`
- **Severity:** MEDIUM
- **Decision:** Does `SEVERITY_COLORS` have dark/light variants? If not, add isDarkColorScheme ternary
- **Evidence:** Code doesn't use `isDarkColorScheme`; acceptable only if colors already theme-aware
- **Action:** Verify `SEVERITY_COLORS` definition; if not theme-aware, add: `const palette = isDarkColorScheme ? SEVERITY_COLORS_DARK : SEVERITY_COLORS_LIGHT`

---

### F13: AreaActionBar border color not severity-mapped [PATCH]
- **AC Violation:** AC#1 (flood severity tokens consistency)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaActionBar.tsx:22`
- **Severity:** MEDIUM
- **Fix:** Map border color to severity or use consistent design token: `borderColor: FLOOD_COLORS.warning` or `borderColor: colors.border` (if intentional)
- **Evidence:** Action buttons use `colors.border` instead of severity color; breaks consistency

---

### F14: AreaCard header color consistency check [PATCH]
- **AC Violation:** AC#1 (severity colors identical to Badge component)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:109`
- **Severity:** MEDIUM
- **Fix:** Verify `AREA_STATUS_COLORS` matches `Badge` variant colors; if not, unify
- **Evidence:** Header uses `AREA_STATUS_COLORS` directly; Badge uses `FLOOD_COLORS`; inconsistent enum mapping

---

### F15: SensorMarker getStatusColor fallback verification [PATCH]
- **AC Violation:** AC#4 (implicit — color must have valid fallback)
- **Source:** edge
- **Location:** `features/map/components/stations/markers/SensorMarker.tsx:17`
- **Severity:** MEDIUM
- **Trigger:** Invalid `sensor.status` enum value
- **Fix:** Verify `getStatusColor()` function in `map-utils.ts` has safe default case
- **Evidence:** No guard on return value; if status invalid, `color.main` undefined

---

## LOW PRIORITY (Nice to Have / Post-Review)

### F16: AreaCard metaItem color not verified [DEFER]
- **AC Violation:** AC#1 (implicit — token consistency)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:180-206`
- **Severity:** LOW
- **Note:** MetaItem uses `c.surface` (palette background) — acceptable design choice but verify contrast
- **Action:** Post-review visual audit for contrast ratios

---

### F17: StationChip index-based key [DEFER]
- **AC Violation:** None (React best practice, not spec)
- **Source:** blind
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:216 & AreaStationChips.tsx:36`
- **Severity:** LOW
- **Note:** Uses array index as key: `key={i}` — can cause list reordering bugs if stations array order changes
- **Action:** Post-review: change to `key={s.stationCode}` for stable identity

---

### F18: AreaCard waterRow conditional render [DISMISS]
- **AC Violation:** None
- **Source:** edge
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:144-176`
- **Severity:** N/A
- **Status:** HANDLED — water row correctly guarded with `maxLevel > 0`
- **Reason:** Dismiss — edge case properly handled

---

### F19: AreaGauge fillPercent clamping [DISMISS]
- **AC Violation:** None
- **Source:** edge
- **Location:** `features/map/components/areas/cards/AreaGauge.tsx:23`
- **Severity:** N/A
- **Status:** HANDLED — fillPercent correctly clamped to 100%
- **Reason:** Dismiss — no overflow possible

---

## Summary

| Category | Count | Details |
|----------|-------|---------|
| Critical Blockers | 4 | AC#3, AC#8 (x2), AC#4 — must fix before merge |
| High Priority | 4 | testID dedup, null checks, unsafe array access |
| Medium Priority | 7 | Memoization, design token variants, border color |
| Low Priority | 2 | Index keys, post-review audit |
| Dismissed | 2 | Already handled or non-blocking |
| **Actionable** | **17** | PATCH or DECISION_NEEDED |

**AC Compliance:**
- AC#1: ⚠️ Partial (border color consistency issue)
- AC#2: ⚠️ Verify (need token dark/light variant check)
- AC#3: ❌ FAIL (Pill component missing)
- AC#4: ❌ FAIL (gradient hex bypass)
- AC#5: ✅ PASS
- AC#6: ⚠️ Partial (memoization, variants)
- AC#7: ⚠️ Partial (testID dedup needed)
- AC#8: ❌ FAIL (memo issues)
- AC#9: ❓ UNTESTED (`tsc --noEmit` not run)

