# Profile Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Monitor + Cleanup (P3)

---

## 🗂️ Current Structure

```
features/profile/
├── components/
│   ├── ActivityCard.tsx
│   ├── AppSettingsSection.tsx
│   ├── NotificationSettingsSection.tsx
│   ├── OtherSettingsSection.tsx
│   ├── ProfileHeader.tsx
│   ├── ProfileInfoSection.tsx
│   └── SaveButton.tsx
├── data/
│   └── settingsOptions.ts       (26 lines)
├── hooks/
│   ├── useActivitiesQuery.ts   ⚠️ EMPTY (1 line) ← DELETE
│   └── useUserStatsQuery.ts    ⚠️ EMPTY (1 line) ← DELETE
├── services/
│   └── profile.service.ts       (39 lines) ✅
├── types/
│   ├── dtos.ts
│   ├── entities.ts
│   ├── enums.ts
│   └── index.ts                ✅ Barrel file
└── index.ts                     ✅ Feature barrel
```

**Thiếu:** `stores/` (settings state), `lib/`, `queries/` subdir, `mutations/`

---

## ✅ Điểm tốt

- `types/` được split tốt: `dtos.ts`, `entities.ts`, `enums.ts`
- Có barrel files: `types/index.ts`, `index.ts`
- `profile.service.ts` — nhỏ (39L), đúng pattern
- `components/` có nhiều UI components

---

## 🔴 Priority Issues

### Issue #1: 2 hook files rỗng — XÓA hoặc IMPLEMENT

```bash
hooks/
├── useActivitiesQuery.ts   ⚠️ EMPTY → DELETE
└── useUserStatsQuery.ts    ⚠️ EMPTY → DELETE
```

**Nếu cần implement:**

```typescript
hooks/
├── queries/
│   ├── useActivitiesQuery.ts    ← React Query cho activities
│   └── useUserStatsQuery.ts     ← React Query cho user stats
└── mutations/
    └── useUpdateProfileMutation.ts  ← update profile
```

### Issue #2: No settings persistence store

Profile settings (notification preferences, app settings) không có local state.

**Tạo:**

```typescript
stores/
├── useProfileSettingsStore.ts   ← notification settings
└── useAppSettingsStore.ts       ← app-level settings (units, language)
```

### Issue #3: `SaveButton.tsx` — Có thể là mutation trigger

Kiểm tra xem `SaveButton` có gọi mutation không. Nếu có → nên tách logic ra hook.

---

## 📋 Refactoring Checklist

- [ ] **XÓA** `hooks/useActivitiesQuery.ts` (empty file)
- [ ] **XÓA** `hooks/useUserStatsQuery.ts` (empty file)
- [ ] Implement hooks nếu cần, theo React Query pattern
- [ ] Tạo `hooks/queries/` với barrel file
- [ ] Tạo `hooks/mutations/` cho update operations
- [ ] Tạo Zustand stores cho settings
- [ ] Thêm `components/index.ts` barrel
- [ ] Thêm `lib/` nếu cần formatters

---

## ✅ Target Structure

```
features/profile/
├── components/
│   ├── ActivityCard.tsx
│   ├── AppSettingsSection.tsx
│   ├── NotificationSettingsSection.tsx
│   ├── OtherSettingsSection.tsx
│   ├── ProfileHeader.tsx
│   ├── ProfileInfoSection.tsx
│   ├── SaveButton.tsx           ← REVIEW: tách mutation logic?
│   └── index.ts                 ← ADD
├── data/
│   └── settingsOptions.ts       ✅
├── hooks/
│   ├── queries/                  ← ADD (hoặc DELETE nếu không cần)
│   │   ├── useActivitiesQuery.ts
│   │   └── useUserStatsQuery.ts
│   ├── mutations/                ← ADD nếu có update operations
│   │   └── useUpdateProfileMutation.ts
│   ├── useProfileSettings.ts     ← settings state
│   └── useActivityStats.ts      ← aggregation
├── services/
│   └── profile.service.ts       ✅
├── stores/
│   └── useProfileSettingsStore.ts ← ADD (notification settings)
├── types/
│   ├── dtos.ts                  ✅
│   ├── entities.ts              ✅
│   ├── enums.ts                ✅
│   └── index.ts                ✅
├── lib/                         ← ADD nếu cần
│   └── profile-formatters.ts
└── index.ts                     ✅
```

---

## 🧪 Testing After Refactor

```bash
# 1. Profile info hiển thị đúng
# 2. Activity stats hiển thị (nếu implement)
# 3. Settings sections hoạt động
# 4. Save button hoạt động (nếu có mutation)
# 5. Notifications preferences được save
```

---

## 📚 Reference

- `features/map/stores/useMapSettingsStore.ts` — Zustand store pattern
- `features/profile/types/` — type organization
