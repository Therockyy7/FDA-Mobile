# Map Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Đang refactor (P1)

---

## 📊 Changes Since Baseline (6 commits)

| Commit | Thay đổi chính |
|--------|----------------|
| `2896aff` | Thêm MapContent, MapSheets, MapFloatingUI, MapHeaderSwitch |
| `d3d9dec` | VietMap place search + detail services |
| `b7434b4` | PickOnMapOverlay, StreetViewHint |
| `e91010a` | Fix dark mode background colors |
| `14cbcd8` | Tab redirect to map sau auth |
| `d2fccf8` | current-status (flood layer settings, useMapData) |

---

## 🗂️ Current Structure

```
features/map/
├── components/     (~70 files, 10 nested subdirs)
│   ├── areas/          cards/, overlays/, polygons/, sheets/
│   ├── common/         MapBottomSheet
│   ├── controls/       layers/, selectors/, timeline/, MapControls, Legend...
│   ├── overlays/       loading/, navigation/, PickOnMapOverlay, WaterLevelViz
│   ├── reports/        CommunityReportMarker, CommunityReportSheet
│   ├── routes/         cards/, direction/, markers/, polylines/, sheets/
│   ├── stations/       cards/, markers/, overlays/
│   ├── MapContent.tsx         (174L) - MapView + children
│   ├── MapFloatingUI.tsx     (185L) - Floating controls + FAB
│   ├── MapHeaderSwitch.tsx    (155L) - Tab bar header
│   └── MapSheets.tsx          (262L) - All bottom sheets
├── hooks/         (~27 files)
│   ├── flood/           useFloodData, useFloodLayerSettings, useFloodSignalR
│   ├── navigation/      useGPSWatcher, useNavigationState, useNavigationVoice
│   ├── queries/         useFloodSeverityQuery, useAreasQuery, useAdminAreasQuery
│   ├── routing/         useRoutingLocations, useRoutingUI, useSafeRoute
│   ├── mutations/        useMapSettingsMutation
│   ├── useMapScreenState.ts   (260L) - ⚠️ God Hook
│   ├── useMapScreen.ts        (440L) - ⚠️ Largest
│   ├── useMapCamera.ts        (206L)
│   ├── useMapData.ts          (101L)
│   ├── useMapDisplay.ts       (~100L)
│   ├── useNavigation.ts       (202L)
│   └── useUserLocation.ts
├── services/      map, safe-route, speech-haptics, place-search, location
├── stores/        useFloodRealtimeStore, useMapSettingsStore
├── types/         9 files (tốt nhất codebase - full TypeScript)
├── lib/           formatters, geometry, map-utils, navigation-utils, polyline-utils
└── constants/     map-data (318L hardcoded), map-style
```

---

## 🔴 Priority Issues (cần fix trước)

### Issue #1: `useMapScreenState.ts` — God Hook (260 lines, 40+ props)

**Vấn đề:** Mix tất cả state vào một object → re-render toàn bộ khi bất kỳ state nào thay đổi.

**Đã có TypeScript types** (👍 improve), nhưng **cần tách thành domain-specific hooks:**

```
hooks/
├── useMapScreenState.ts         → DELETE sau khi tách xong
├── useMapSelectionState.ts       → selectedArea, selectedStation, selectedReport
├── useMapUIState.ts              → loading, errors, sheet visibility
├── useMapAreaCreationState.ts    → draftArea, isCreating, editingArea
└── useMapRoutingState.ts         → startCoord, endCoord, transportMode
```

### Issue #2: `useMapScreen.ts` — Largest File (440 lines)

**Vấn đề:** Chứa quá nhiều event handlers và effects.

**Cần tách thành:**
```
hooks/
├── useMapScreen.ts              → keep thin, compose sub-hooks
├── useMapRegionHandlers.ts      → onRegionChange, viewport debounce
├── useMapAreaCreation.ts        → onAreaCreate, onAreaEdit, permission checks
├── useMapRouteHandlers.ts        → onRouteSelect, draw polylines
└── useMapNavigationHandlers.ts   → start/stop navigation, GPS tracking
```

### Issue #3: Duplicate `SEVERITY_COLORS` — ⚠️ VẪN CÒN

**Legend.tsx hardcodes:**
```typescript
const SEVERITY_LEVELS = [
  { key: "safe", color: "#22C55E" },  // ❌ khác với SEVERITY_COLORS
  { key: "caution", color: "#EAB308" },
  ...
]
```

**SEVERITY_COLORS in map-layers.types.ts:**
```typescript
export const SEVERITY_COLORS = {
  safe: "#10B981",    // ✅ đúng
  caution: "#FBBF24",
  warning: "#F97316",
  critical: "#EF4444",
};
```

**Fix:** Update `Legend.tsx` dùng `SEVERITY_COLORS` + `SEVERITY_LABELS` từ types.

### Issue #4: `activeConnectionCount` module-level variable

**File:** `features/map/hooks/flood/useFloodSignalR.ts` (line 13)

```typescript
// ❌ Bug: module-level variable gây race condition
let activeConnectionCount = 0;

// ✅ Fix: dùng ref hoặc Zustand store
```

### Issue #5: Cross-feature imports in `MapSheets.tsx`

Đã cải thiện nhưng vẫn cần kiểm tra:
```typescript
import { AreaCreationErrorModal } from "~/features/areas/components/...";
import { PremiumLimitModal } from "~/features/areas/components/...";
```

**Nguyên tắc:** components/ không nên import từ feature khác. Chuyển thành props hoặc qua hooks.

### Issue #6: `any` types in `useMapScreenState.ts`

**Đã được cải thiện** với proper TypeScript types, nhưng một số vẫn còn:
```typescript
// Still `any`:
settings: any;        // → MapLayerSettings
areas: any[];         // → AreaWithStatus[]
floodSeverity: any;    // → FloodSeverityGeoJSON
communityReports: any[];
adminAreas: any[];
selectedAdminArea: any;
```

---

## 🟡 Known Issues (trung bình)

| # | Issue | File |
|---|-------|------|
| 7 | `formatDistance`/`formatDuration` tồn tại ở 2 chỗ | `lib/formatters.ts`, `lib/polyline-utils.ts` |
| 8 | `map-data.ts` 318 dòng hardcoded data | `FLOOD_ROUTES`, `FLOOD_ZONES` |
| 9 | Theme prop drilling trong `LayerToggleSheet` | `controls/layers/LayerToggleSheet.tsx` |
| 10 | `useSafeRoute` mix 2 concerns | routing + flood selection |

---

## ✅ Done (đã refactor xong)

- ✅ Zustand stores cho settings và realtime
- ✅ Query hooks với React Query pattern
- ✅ Services với custom Error class
- ✅ Types đầy đủ trong `types/`
- ✅ SignalR integration qua `useFloodSignalR`
- ✅ Components tách theo domain (areas, controls, overlays, reports, routes, stations)
- ✅ `useMapData` aggregation hook cho data sources
- ✅ `useFloodLayerSettings` cho map settings
- ✅ Navigation hooks (useGPSWatcher, useNavigationState, useNavigationVoice)

---

## 🔍 How Components Connect

```
app/(tabs)/map/index.tsx
     ↓
useMapScreenState()          ← 260L God Hook (cần tách)
     ↓
useMapScreen(ctx)            ← 440L (cần tách handlers)
     ↓
┌──────────────────────────────────────────────┐
│  MapContent (render MapView + children)       │
│  MapSheets (all bottom sheets)                │
│  MapFloatingUI (controls + FAB)               │
│  MapHeaderSwitch (tab bar header)             │
└──────────────────────────────────────────────┘
     ↓
Specialized Hooks → Services → Stores → External APIs
```

---

## 🧪 Testing After Refactor

```bash
# 1. Map hiển thị đúng overlay (flood, community reports)
# 2. Bấm vào station/area/report → sheet mở đúng
# 3. Tạo area mới → API được gọi, map update
# 4. Realtime updates → flood markers thay đổi (SignalR)
# 5. Navigation → route vẽ đúng, voice hướng dẫn
# 6. Zoom/pan → markers fetch đúng viewport
# 7. Dark mode → colors đúng (Legend vs StationCard)
```

---

## 📚 Reference Files

| File | Pattern |
|------|---------|
| `hooks/flood/useFloodData.ts` | Query + Realtime merge pattern |
| `hooks/queries/useFloodSeverityQuery.ts` | Query hook pattern |
| `hooks/flood/useFloodLayerSettings.ts` | Zustand + API sync pattern |
| `stores/useMapSettingsStore.ts` | Zustand persist pattern |
| `services/map.service.ts` | Service + Error class pattern |
| `types/map-layers.types.ts` | Type organization + SEVERITY_COLORS |
| `hooks/routing/useSafeRoute.ts` | State machine pattern cho routing |

---

## ⚠️ Troubleshooting

> Nếu map feature không hoạt động sau refactor:

1. **Compare vs baseline:** `git diff 933bd44 HEAD -- features/map/`
2. **State shape changed?** Kiểm tra `useMapScreenState` interface
3. **Colors sai?** Legend dùng hardcoded, không phải `SEVERITY_COLORS`
4. **SignalR not working?** Check `useFloodSignalR` - module-level counter có thể gây race
5. **Cross-feature errors?** MapSheets import từ `features/areas`
6. **Re-render performance?** `useMapScreenState` 260L + 40+ props
