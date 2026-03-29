# Alerts Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Cần refactor (P2)

---

## 🗂️ Current Structure

```
features/alerts/
├── components/
│   ├── AlertChannelsStatus.tsx
│   ├── AlertSettings.tsx
│   ├── alert-history/         (8 files)
│   ├── alert-settings/        (6 files)
│   └── alert-thresholds/      (7 files)
├── fcm/                        ← Non-standard subdir ⚠️
│   ├── getFCMToken.ts
│   ├── initFCM.ts
│   ├── InAppNotificationBanner.tsx
│   ├── notificationHandler.ts ⚠️ 159 lines
│   └── useInAppNotification.ts ⚠️ 134 lines
├── hooks/
│   └── useAlertHistoryData.ts  ⚠️ 96 lines
├── services/
│   ├── alert-history.service.ts    (37 lines) ✅
│   └── alert-settings.service.ts   (75 lines) ✅
└── types/
    ├── alert-history.types.ts
    └── alert-settings.types.ts
```

**Thiếu:** `stores/`, `lib/`, `queries/` subdir

---

## ✅ Điểm tốt

- `alert-history.service.ts` và `alert-settings.service.ts` — size nhỏ, đúng pattern
- Types được tách ra files riêng
- Components có subdirs (`alert-history/`, `alert-settings/`)

---

## 🔴 Priority Issues

### Issue #1: `fcm/` subdir không chuẩn — nên tách

FCM (Firebase Cloud Messaging) logic đang ở `fcm/`. Theo feature template, nên ở `hooks/` hoặc `services/`.

**Di chuyển và tách:**

```typescript
// ── Option A: Trong services/ ──────────────────────────────
services/
├── alert-history.service.ts    ✅ (giữ)
├── alert-settings.service.ts   ✅ (giữ)
├── fcm.service.ts               ← gộp getFCMToken + initFCM
└── fcm-error.service.ts

// ── Option B: Tách hooks/ cho FCM ──────────────────────────
hooks/
├── useAlertHistoryData.ts       ⚠️ cần tách thêm
├── useAlertHistoryQuery.ts      ← React Query cho history
├── useAlertSettingsQuery.ts     ← React Query cho settings
├── useAlertSettingsMutation.ts  ← update settings mutation
├── useInAppNotification.ts     ← di chuyển từ fcm/
├── useFCMToken.ts               ← lấy + refresh token
└── useNotificationHandler.ts   ← notification tap handler
```

### Issue #2: `notificationHandler.ts` (159 lines) — Nên tách

**Đang làm 3 thứ:**
- Foreground handler
- Background handler
- Killed-state handler
- Data parsing logic (duplicated)

**Tách thành:**

```typescript
hooks/useNotificationHandler.ts
├── registerForegroundHandler()
├── registerBackgroundHandler()  (AppState listener)
├── handleNotificationTap()
└── parseNotificationData()      ← extract, tránh duplicate
```

### Issue #3: `useInAppNotification.ts` (134 lines) — Cần tách

**Đang làm:**
- Banner visibility state
- FCM registration
- Auto-dismiss timer

**Tách thành:**

```typescript
hooks/
├── useInAppNotification.ts       → DELETE
├── useNotificationBanner.ts      → banner visibility, auto-dismiss
└── useNotificationSubscription.ts → FCM registration/unregistration
```

### Issue #4: `useAlertHistoryData.ts` (96 lines) — Cần React Query

```typescript
hooks/
├── useAlertHistoryData.ts        → DELETE
├── queries/
│   ├── useAlertHistoryQuery.ts   ← React Query
│   └── useAlertSettingsQuery.ts
└── mutations/
    └── useUpdateAlertSettingsMutation.ts
```

---

## 📋 Refactoring Checklist

- [ ] Di chuyển FCM logic từ `fcm/` → `hooks/` hoặc `services/`
- [ ] Tách `notificationHandler.ts` → 3 handler functions + parse logic
- [ ] Tách `useInAppNotification.ts` → 2 hooks nhỏ hơn
- [ ] Tạo `hooks/queries/` với React Query pattern
- [ ] Tạo `hooks/mutations/` cho update settings
- [ ] Tạo Zustand store cho notification state (nếu cần)
- [ ] Xóa `fcm/` directory sau khi di chuyển xong
- [ ] Thêm `lib/` nếu cần notification formatters/parsers

---

## ✅ Target Structure

```
features/alerts/
├── components/
│   ├── AlertChannelsStatus.tsx
│   ├── AlertSettings.tsx
│   ├── alert-history/
│   ├── alert-settings/
│   ├── alert-thresholds/
│   └── index.ts
├── hooks/
│   ├── queries/
│   │   ├── useAlertHistoryQuery.ts
│   │   └── useAlertSettingsQuery.ts
│   ├── mutations/
│   │   └── useUpdateAlertSettingsMutation.ts
│   ├── useInAppNotificationBanner.ts  ← tách từ fcm/
│   ├── useNotificationHandler.ts      ← tách từ fcm/
│   ├── useFCMToken.ts                 ← tách từ fcm/
│   └── useAlertHistoryData.ts         ← DELETE sau khi tách
├── services/
│   ├── alert-history.service.ts    ✅
│   ├── alert-settings.service.ts   ✅
│   ├── fcm.service.ts              ← gộp từ fcm/
│   └── fcm-error.service.ts
├── stores/
│   └── useNotificationStore.ts     (banner visibility, dismissed)
├── types/
│   ├── alert-history.types.ts      ✅
│   ├── alert-settings.types.ts     ✅
│   └── fcm.types.ts                ← notification types
└── lib/
    └── notification-parser.ts      ← extracted parse logic
```

---

## 🧪 Testing After Refactor

```bash
# 1. In-app notification banner hiển thị khi app foreground
# 2. Notification tap → navigate đúng
# 3. Alert history load đúng
# 4. Alert settings update hoạt động
# 5. Channel status hiển thị đúng
# 6. Thresholds edit hoạt động
# 7. FCM token refresh hoạt động khi expire
```

---

## 📚 Reference

- `features/map/hooks/flood/useFloodSignalR.ts` — realtime pattern (tương tự FCM)
- `features/map/services/map.service.ts` — service + error pattern
- Firebase FCM docs — for Expo notification setup
