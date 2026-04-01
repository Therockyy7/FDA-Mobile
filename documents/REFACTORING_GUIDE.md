# FDA Mobile — Refactoring Guide

## Mục đích

Hướng dẫn toàn diện cho team để refactor từng feature theo đúng kiến trúc chuẩn. Đọc file này **TRƯỚC KHI** bắt đầu refactor bất kỳ feature nào.

---

## 🚀 Quick Start

### 1. Xác định feature cần refactor

```
"Tôi đang refactor feature areas" → Claude tự load CLAUDE_AREAS.md
```

### 2. Đọc checklist của feature đó

Mỗi file `CLAUDE_<FEATURE>.md` có:
- ✅ Điểm tốt (giữ nguyên)
- 🔴 Issues ưu tiên (fix trước)
- 📋 Checklist refactor
- ✅ Target structure
- 🧪 Testing checklist

### 3. Baseline commit

**TRƯỚC KHI** refactor bất kỳ feature nào:

```bash
git log --oneline | head -20
# Tìm commit: 933bd44f316f9dac4fba3c461c3ea93bfac46e5e

git diff 933bd44f -- features/<feature>/
# So sánh vs baseline để hiểu code hiện tại
```

---

## 📋 General Refactoring Checklist

### Trước khi bắt đầu

- [ ] Đọc `documents/CLAUDE_<FEATURE>.md`
- [ ] Chạy `git diff 933bd44f -- features/<feature>/`
- [ ] Tìm tất cả files liên quan (`grep` for imports)
- [ ] Hiểu data flow hiện tại
- [ ] Backup (commit hiện tại)

### Cấu trúc

- [ ] Tạo `hooks/queries/` + barrel `index.ts`
- [ ] Tạo `hooks/mutations/` + barrel `index.ts`
- [ ] Tạo `stores/` nếu cần Zustand
- [ ] Tạo `services/<feature>-error.service.ts`
- [ ] Đảm bảo barrel files cho tất cả subdirs

### Hooks

- [ ] Query hooks < 50 lines
- [ ] Aggregation hooks < 150 lines
- [ ] Screen hooks > 150 lines → tách tiếp
- [ ] KHÔNG gọi API trực tiếp trong hooks
- [ ] KHÔNG có `any` types

### Services

- [ ] Tách god service → nhiều domain-specific services
- [ ] Custom Error class cho mỗi service
- [ ] Catch blocks throw typed errors
- [ ] KHÔNG có mock data trong production

### State Management

- [ ] React Query → server state
- [ ] Zustand → client/persistent state
- [ ] useState → UI transient state

### Components

- [ ] Components nhận props, KHÔNG gọi data hooks
- [ ] Props interface > 5 props → tách file riêng
- [ ] Barrel `index.ts` ở mỗi subdir

### Testing

- [ ] Chạy app sau mỗi thay đổi nhỏ
- [ ] Verify behavior không đổi
- [ ] Test tất cả user flows
- [ ] TypeScript compile không lỗi

---

## 🔧 Common Patterns

### Tách God Hook

```typescript
// TRƯỚC: features/xxx/hooks/useControlArea.ts (586 lines)
export function useControlArea() {
  // Tất cả logic ở đây
}

// SAU: features/xxx/hooks/
// useAreaForm.ts (50L) — form state
// useAreaPermissions.ts (30L) — permission checks
// useAreaMutations.ts (40L) — CRUD mutations
// useAreaScreen.ts (100L) — compose sub-hooks
```

### Tách God Service

```typescript
// TRƯỚC: features/xxx/services/xxx.service.ts (513 lines)
export const XxxService = {
  getAreas: async () => { ... },
  getSensors: async () => { ... },
  getChartData: async () => { ... },
  // 10+ methods
};

// SAU:
export const XxxCrudService = { /* area CRUD only */ };
export const XxxSensorService = { /* sensor ops only */ };
export const XxxChartService = { /* chart data only */ };
```

### React Query Hook

```typescript
// features/xxx/hooks/queries/useXxxQuery.ts
export const FEATURE_XXX_QUERY_KEY = "feature/xxx";

export function useXxxQuery(params: Params | null, enabled: boolean) {
  return useQuery({
    queryKey: [FEATURE_XXX_QUERY_KEY, params],
    queryFn: () => XxxService.getXxx(params!),
    enabled: enabled && params !== null,
    staleTime: 30_000,
  });
}
```

### Zustand Store

```typescript
// features/xxx/stores/useXxxStore.ts
interface XxxStore {
  value: Type;
  setValue: (v: Type) => void;
  reset: () => void;
}

export const useXxxStore = create<XxxStore>()((set) => ({
  value: DEFAULT_VALUE,
  setValue: (v) => set({ value: v }),
  reset: () => set({ value: DEFAULT_VALUE }),
}));

// Granular selectors
export const useXxxValue = () => useXxxStore((s) => s.value);
```

---

## ⚠️ Anti-patterns to Fix

| Anti-pattern | Fix |
|---|---|
| `any` type | Define proper interface |
| Hook > 150 lines | Tách thành sub-hooks |
| Service > 200 lines | Tách theo domain |
| API call trong component | Hook gọi Service |
| Mock data trong production | Mock ở `__mocks__/` |
| Props drilling > 3 levels | Context hoặc Zustand |
| console.log trong code | Xóa hoặc dùng analytics |
| Type in component file | Move to `types/` |
| `as` casting không check | Type guard hoặc check |

---

## 📊 Priority Matrix

```
High Impact + Low Effort → Làm trước
High Impact + High Effort → Lên kế hoạch
Low Impact + Low Effort  → Làm nếu có thời gian
Low Impact + High Effort → Bỏ qua
```

| Feature | Issues | Impact | Effort | Priority |
|---------|--------|--------|--------|----------|
| map | 8 issues | Rất cao | Cao | P1 |
| areas | 3 issues | Cao | Cao | P1 |
| community | 4 issues | Cao | Cao | P1 |
| auth | 3 issues | Cao | Trung | P2 |
| home | 2 issues | Trung | Trung | P2 |
| alerts | 4 issues | Trung | Trung | P2 |
| notifications | 2 issues | Thấp | Thấp | P3 |
| prediction | 2 issues | Thấp | Thấp | P3 |
| profile | 2 issues | Thấp | Thấp | P3 |

---

## 📁 Feature Docs Reference

| Feature | File | Priority | Key Issues |
|---------|------|----------|------------|
| Map | `documents/CLAUDE_MAP.md` | P1 | God hooks, duplicate colors, TypeScript `any` |
| Areas | `documents/CLAUDE_AREAS.md` | P1 | God hook 586L, god service 513L |
| Community | `documents/CLAUDE_COMMUNITY.md` | P1 | Service 360L cần tách |
| Auth | `documents/CLAUDE_AUTH.md` | P2 | RTK slice 410L, tách thunks |
| Home | `documents/CLAUDE_HOME.md` | P2 | Hook 225L, derivation logic |
| Alerts | `documents/CLAUDE_ALERTS.md` | P2 | FCM handlers, tách notification |
| Notifications | `documents/CLAUDE_NOTIFICATIONS.md` | P3 | Hook sai thư mục |
| Prediction | `documents/CLAUDE_PREDICTION.md` | P3 | Monitor size |
| Profile | `documents/CLAUDE_PROFILE.md` | P3 | Empty hook files |

**Template chuẩn:** `documents/FEATURE_TEMPLATE.md`

---

## 🔗 Import Reference

### Import từ feature khác

```typescript
// ✅ Đúng: import từ barrel của feature đó
import { AreaStatus } from "~/features/areas/types";
import { useMapSettings } from "~/features/map/stores";

// ❌ Sai: import từ component file trực tiếp
import { AreaCard } from "~/features/areas/components/AreaCard";
```

### Feature internal imports

```typescript
// ✅ Đúng: import từ barrel
import { useAreasQuery } from "~/features/areas/hooks";

// ✅ Cũng đúng: import trực tiếp nếu cần tree-shaking
import { useAreasQuery } from "~/features/areas/hooks/queries/useAreasQuery";
```

---

## 🧪 Troubleshooting

### Map features stop working after refactor

1. `git diff 933bd44f -- features/map/hooks/`
2. Check state shape in `useMapScreenState`
3. Verify `SEVERITY_COLORS` import
4. Check `MapSheets.tsx` cross-feature imports

### Areas feature broken

1. `git diff 933bd44f -- features/areas/`
2. Check service method signatures
3. Verify Zustand store shape
4. Check React Query keys

### Auth broken

1. Check Redux store state shape
2. Verify thunks are properly exported
3. Check selector hooks still work
4. Test session restore on app restart

---

## 📞 Khi cần help

1. Đọc `documents/CLAUDE_<FEATURE>.md` của feature đó
2. Check `documents/FEATURE_TEMPLATE.md` cho pattern
3. Xem reference implementation ở `features/map/`
4. Hỏi Claude Code với context đầy đủ
