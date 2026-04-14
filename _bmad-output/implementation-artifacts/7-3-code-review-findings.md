# Story 7-3 Code Review — Adversarial Findings

**Status:** Review Complete  
**Date:** 2026-04-14  
**Reviewers:** Blind Hunter (code quality) | Edge Case Hunter (path tracing)

---

## LAYER 1: Blind Hunter — General Code Quality Issues

### Critical Findings

**1. AreaStationChips does NOT use shared Pill component (AC#3 VIOLATION)**
- **Location:** `features/map/components/areas/cards/AreaStationChips.tsx:26-51`
- **Evidence:** Chips are hand-rolled with custom View + inline styling instead of importing `Pill` component
- **Spec requires:** "AreaStationChips uses shared `Pill` component where applicable"
- **Impact:** Cross-feature component duplication, inconsistent styling with design system
- **Fix:** Import `Pill` from `~/components/ui` and map `styles.chip` to Pill variant

**2. SelectedSensorCard missing React.memo wrapper (AC#8 VIOLATION)**
- **Location:** `features/map/components/stations/cards/SelectedSensorCard.tsx:23-191`
- **Export missing:** No `export default React.memo(...)` 
- **Spec requires:** "React.memo wrappers preserved"
- **Impact:** Re-renders on every parent change even when props unchanged
- **Fix:** Wrap export with `React.memo` at bottom of file

**3. AreaCard memo comparator is too loose (AC#8 QUALITY)**
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:418`
- **Code:** `export default React.memo(AreaCard, (p, n) => p.area?.id === n.area?.id);`
- **Issue:** Shallow comparison only checks `area.id`, ignores `onClose`, `onEdit`, `onDelete`, `onViewDetails` callbacks
- **Impact:** Stale callback references can cause handler race conditions
- **Fix:** Compare all props: `(p, n) => p.area?.id === n.area?.id && p.onClose === n.onClose && ...`

**4. Inconsistent testID prop distribution (AC#7 QUALITY)**
- **Location:** Multiple files (AreaCard, AreaActionBar, etc)
- **Pattern Issue:** 
  - `AreaCard.tsx:250,266,281` → 3x `testID="map-area-action-btn"` (duplicate key for 3 different buttons)
  - `AreaActionBar.tsx:20` → `testID="map-area-action-btn"` used for both Edit and Delete
- **Expected:** Unique testIDs per button: `map-area-action-edit-btn`, `map-area-action-delete-btn`
- **Impact:** Test E2E selectors ambiguous; can't reliably target specific action button

**5. FloodStationCard — hardcoded gradient colors bypass design tokens (AC#4 VIOLATION)**
- **Location:** `features/map/components/stations/cards/FloodStationCard.tsx:48-52`
- **Code:** `colors={[severityColor, `${severityColor}C0`]}` (gradient uses dynamic severity hex + alpha manipulation)
- **Issue:** `severityColor` comes from `SEVERITY_COLORS` map but alpha is added inline with string concatenation
- **Expected:** Use design token severity vars directly, or provide token gradient definitions
- **Impact:** Opacity values not controlled by design system; inconsistent transparency across dark/light modes

**6. AreaCard waterColor function returns hardcoded FLOOD_COLORS without theme awareness (AC#5 QUALITY)**
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:42-47`
- **Code:** `waterColor()` returns `FLOOD_COLORS.*` but FLOOD_COLORS may not have dark/light variants
- **Issue:** Water level colors don't adapt to dark mode contrast needs
- **Expected:** Verify FLOOD_COLORS palette has dark/light variants; check contrast ratios
- **Impact:** Potential WCAG AA failure in dark mode

---

### Medium Severity Findings

**7. SensorMarker uses arrow function inline styles (AC#6 VIOLATION)**
- **Location:** `features/map/components/stations/markers/SensorMarker.tsx:31-89`
- **Code:** All marker bubble styles are inline objects, no constants or StyleSheet
- **Issue:** Object recreation on every render; no reuse across instances
- **Expected:** Extract inline objects to StyleSheet constants or use useMemo
- **Fix:** Move inline styles to `StyleSheet.create()` at bottom of file

**8. AreaCard StationChip (inner function) receives inline color calculation (AC#6 QUALITY)**
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:216-225`
- **Code:** `<StationChip ... color={waterColor(s.waterLevel)} ...>` called per-render
- **Issue:** `waterColor()` function runs 4+ times per render (slicing first 4 stations)
- **Expected:** Memoize chip calculations or move to useMemo hook
- **Fix:** `const chipColors = useMemo(() => area.contributingStations.slice(0,4).map(s => waterColor(...)), [...])`

**9. No null/undefined guards on optional props in area/station cards (AC#6 EDGE CASE)**
- **Location:** `AreaCard.tsx:122-132, 272-286`, `FloodStationCard.tsx:69-82`
- **Code:** `area.addressText && (...)` is guarded, but `area.contributingStations` accessed without length check
- **Line:** AreaCard:196 → `area.contributingStations.length` accessed before optional check
- **Expected:** Guard with `?.length ?? 0` for optional arrays
- **Impact:** Runtime error if contributing stations becomes undefined due to data mutation

---

### Low Severity Findings

**10. AreaActionBar `borderColor` not mapped to FLOOD_COLORS (AC#1 CONSISTENCY)**
- **Location:** `features/map/components/areas/cards/AreaActionBar.tsx:22`
- **Code:** `borderColor: colors.border` (uses map theme color for outline buttons)
- **Expected:** Should be `borderColor: FLOOD_COLORS.warning` or token-based severity color
- **Impact:** Non-urgent but breaks design token consistency for action buttons

**11. FloodSeverityMarkers does NOT preserve isDarkColorScheme for map props (AC#2 QUALITY)**
- **Location:** `features/map/components/stations/markers/FloodSeverityMarkers.tsx:73-97`
- **Code:** No `isDarkColorScheme` usage; marker `pinColor` is hardcoded severity hex
- **Expected per spec:** "SensorMarker and FloodSeverityMarkers preserve `isDarkColorScheme` only for react-native-maps color props"
- **Observation:** Current code doesn't use `isDarkColorScheme` at all — this is acceptable ONLY if `pinColor` from SEVERITY_COLORS is already theme-aware
- **Verify:** Check if `SEVERITY_COLORS` has dark/light variants; if not, add isDarkColorScheme ternary

**12. AreaCard header backgroundColor directly references severity color (AC#1 PATTERN)**
- **Location:** `features/map/components/areas/cards/AreaCard.tsx:109`
- **Code:** `backgroundColor: color` (color from `severityColor()` → AREA_STATUS_COLORS map)
- **Issue:** Not using Badge variant + token; breaking consistency with Badge/Pill components
- **Expected:** Header should use consistent severity token mapping like Badge component
- **Spec note:** "identical to Badge component colors"

---

## LAYER 2: Edge Case Hunter — Path Tracing

```json
[
  {
    "location": "AreaCard.tsx:90-94",
    "trigger_condition": "area.contributingStations is undefined or null",
    "guard_snippet": "const maxLevel = area.contributingStations?.reduce((m, s) => (s.waterLevel > m ? s.waterLevel : m), 0) ?? 0;",
    "potential_consequence": "maxLevel undefined → progress bar width calculation fails"
  },
  {
    "location": "AreaCard.tsx:216-225",
    "trigger_condition": "area.contributingStations.slice(0, 4) returns empty array",
    "guard_snippet": "if (area.contributingStations.length === 0) return null; before chipsRow render",
    "potential_consequence": "Empty chipsRow div renders with no content — visual gap"
  },
  {
    "location": "AdminAreaConfirmModal.tsx:26",
    "trigger_condition": "visible=true but adminArea=null after visible state update",
    "guard_snippet": "Add explicit null check before accessing adminArea.name:93",
    "potential_consequence": "TypeError when accessing adminArea.name during render"
  },
  {
    "location": "AreaStationChips.tsx:33",
    "trigger_condition": "stations[i] missing waterLevel or severity during map iteration",
    "guard_snippet": "Add optional chaining: s?.waterLevel, s?.severity",
    "potential_consequence": "severityColor() returns undefined → chip color renders as black"
  },
  {
    "location": "FloodStationCard.tsx:38-40",
    "trigger_condition": "properties.severity not in SEVERITY_COLORS map",
    "guard_snippet": "fallback already present: || SEVERITY_COLORS.unknown",
    "potential_consequence": "Uses .unknown fallback safely — but verify .unknown key exists"
  },
  {
    "location": "SensorMarker.tsx:17",
    "trigger_condition": "sensor.status not valid enum value for getStatusColor()",
    "guard_snippet": "Verify getStatusColor() has default/unknown case for invalid status",
    "potential_consequence": "color.main undefined — marker renders white dot without color"
  },
  {
    "location": "AreaCard.tsx:144-176",
    "trigger_condition": "maxLevel === 0 (water level below minimum)",
    "guard_snippet": "Guarded with maxLevel > 0 — correct",
    "potential_consequence": "Water row hidden — acceptable for 0 level"
  },
  {
    "location": "AreaGauge.tsx:23",
    "trigger_condition": "maxWaterLevel exceeds 60cm (fillPercent calc)",
    "guard_snippet": "Math.min((maxWaterLevel / 60) * 100, 100) — correctly clamped to 100%",
    "potential_consequence": "Gauge correctly maxes out at 100% — no overflow"
  }
]
```

---

## AC Compliance Matrix

| AC | Requirement | Status | Finding |
|----|----|--------|---------|
| 1  | Severity tokens = `flood-safe/warning/danger/critical` | ⚠️ PARTIAL | AreaActionBar border doesn't use severity token; gradient color bypass |
| 2  | `isDarkColorScheme` only for react-native-maps | ⚠️ VERIFY | FloodSeverityMarkers doesn't use `isDarkColorScheme` — need to confirm SEVERITY_COLORS theme-aware |
| 3  | AreaStationChips uses Pill component | ❌ FAIL | Hand-rolled chips, no Pill import |
| 4  | Zero hardcoded hex in `style={{}}` | ❌ FAIL | FloodStationCard gradient uses hex + alpha manipulation |
| 5  | All inline shadows → SHADOW tokens | ✅ PASS | All shadows replaced with SHADOW.sm/md/lg |
| 6  | Text 11px min, 8-step scale | ✅ PASS | All fonts ≥11px verified |
| 7  | testID with `map-station-*` / `map-area-*` | ⚠️ PARTIAL | Duplicate keys on action buttons (3x same testID) |
| 8  | React.memo preserved | ❌ FAIL | SelectedSensorCard missing memo wrapper; AreaCard memo too shallow |
| 9  | `tsc --noEmit` = 0 errors | ❓ UNTESTED | Need manual verification |

---

## Summary of Issues by Severity

**Critical (Block Review):**
- AC#3: AreaStationChips must use Pill component
- AC#8: SelectedSensorCard must have React.memo; AreaCard memo too loose
- AC#4: FloodStationCard gradient hex manipulation

**High (Fix Before Merge):**
- AC#7: Deduplicate testID props on action buttons
- Edge case: adminArea null check in modal
- SelectedSensorCard missing memo

**Medium (Nice to Have):**
- SensorMarker inline styles → StyleSheet
- AreaCard StationChip color memoization
- FLOOD_COLORS variant verification for dark mode

**Low (Post-Review Cleanup):**
- AreaActionBar border color token mapping
- FloodSeverityMarkers `isDarkColorScheme` verification

---

## Recommendations

1. **Immediate Actions (Block Review):**
   - [ ] Replace `AreaStationChips` styles with `Pill` component
   - [ ] Add `React.memo` wrapper to `SelectedSensorCard`
   - [ ] Fix `AreaCard` memo comparator to include all props
   - [ ] Deduplicate testIDs on `AreaCard` and `AreaActionBar` action buttons

2. **Before Merge:**
   - [ ] Verify `SEVERITY_COLORS` and `FLOOD_COLORS` have dark/light variants
   - [ ] Run `tsc --noEmit` and fix any type errors
   - [ ] Add null guards for `area.contributingStations`
   - [ ] Extract SensorMarker inline styles to StyleSheet

3. **Post-Review:**
   - [ ] Verify `getStatusColor()` handles all enum values with safe fallback
   - [ ] Confirm `waterColor()` function colors meet WCAG AA in dark mode

