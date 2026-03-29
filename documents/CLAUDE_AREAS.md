# Areas Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Cần refactor (P1)

---

## 🗂️ Current Structure

```
features/areas/
├── components/     (21 files + charts/ subdir)
├── constants/       all-areas-data, area-detail-constants, areas-data
├── hooks/
│   ├── useControlArea.ts   ⚠️ 586 lines  ← GOD HOOK #1
│   ├── useFloodHistory.ts   ⚠️ 133 lines
│   ├── useFloodStatistics.ts ⚠️ 117 lines
│   └── useFloodTrends.ts    ⚠️ 142 lines
├── lib/             areas-utils (52 lines)
├── services/
│   └── area.service.ts     ⚠️ 513 lines  ← GOD SERVICE
└── types/          admin-area, areas-types, flood-history
```

**Thiếu:** `stores/`, `queries/` subdir, `mutations/` subdir

---

## 🔴 Priority Issues

### Issue #1: `useControlArea.ts` (586 lines) — GOD HOOK

**Đang làm quá nhiều thứ:**
- Area creation/editing form state
- Permission checks (admin vs user)
- Weather data fetching
- Map interaction handlers
- Sensor toggle logic
- API calls (CRUD)
- Side effects / useEffects

**Tách thành:**

```
hooks/
├── useControlArea.ts           → DELETE sau khi tách
├── useAreaFormState.ts        → form data, validation, dirty state
├── useAreaPermissions.ts      → isAdmin, canEdit, canDelete
├── useAreaWeather.ts          → weather data fetching
├── useAreaSensors.ts          → sensor list, toggle handlers
├── useAreaMutations.ts        → create, update, delete mutations
├── useAreaMapInteraction.ts   → map tap, polygon drawing
└── useAreaScreen.ts           → compose tất cả sub-hooks
```

### Issue #2: `area.service.ts` (513 lines) — GOD SERVICE

**10+ methods cho nhiều domain khác nhau:**

```typescript
// Tách thành:
services/
├── area.service.ts             → DELETE sau khi tách
├── area-crud.service.ts       → getAreas, getAreaById, create, update, delete
├── area-sensor.service.ts      → getSensors, toggleSensor
├── area-chart.service.ts       → getChartData, getWaterLevels
├── area-flood.service.ts       → getFloodHistory, getFloodStatistics, getFloodTrends
└── area-error.service.ts       → AreaServiceError class
```

### Issue #3: Flood hooks có thể share logic

`useFloodHistory.ts`, `useFloodStatistics.ts`, `useFloodTrends.ts` đều gọi `AreaService`. Extract common query key và params handling.

---

## 📋 Refactoring Checklist

- [ ] Tách `area.service.ts` → 4 services nhỏ + error class
- [ ] Tạo `hooks/queries/` với `useAreasQuery.ts`, `useAreaDetailQuery.ts`
- [ ] Tạo `hooks/mutations/` với `useCreateAreaMutation.ts`, `useUpdateAreaMutation.ts`
- [ ] Tách `useControlArea.ts` → 7 sub-hooks + screen hook
- [ ] Tạo Zustand store nếu cần shared area selection state
- [ ] Move flood derivation logic sang `lib/` (tương tự map feature)
- [ ] Fix TypeScript `any` types

---

## ✅ Target Structure

```
features/areas/
├── components/     (AreaCard, AreaDetailSheet, charts/, ...)
├── constants/      (giữ nguyên)
├── hooks/
│   ├── queries/    useAreasQuery, useAreaDetailQuery
│   ├── mutations/  useCreateAreaMutation, useUpdateAreaMutation
│   ├── useAreaData.ts       ← aggregation hook
│   ├── useAreaScreen.ts     ← screen-level handlers
│   └── useAreaForm.ts       ← form state
├── services/
│   ├── area-crud.service.ts
│   ├── area-sensor.service.ts
│   ├── area-chart.service.ts
│   └── area-error.service.ts
├── stores/         (nếu cần area selection state)
├── types/
│   ├── area.types.ts
│   ├── flood-history.types.ts
│   └── admin-area.types.ts
└── lib/
    ├── areas-utils.ts
    └── flood-data.utils.ts  ← extracted from hooks
```

---

## 🧪 Testing After Refactor

```bash
# 1. Area list load đúng
# 2. Bấm area → detail hiển thị
# 3. Admin tạo/edit/delete area
# 4. Sensor toggle hoạt động
# 5. Chart data hiển thị đúng
# 6. Flood history/statistics/trends fetch đúng
```

---

## 📚 Reference

- `features/map/hooks/flood/useFloodData.ts` — query + merge pattern
- `features/map/services/map.service.ts` — service + error class pattern
