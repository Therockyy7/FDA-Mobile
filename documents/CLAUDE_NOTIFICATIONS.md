# Notifications Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Cần refactor (P3)

---

## 🗂️ Current Structure

```
features/notifications/
├── components/
│   ├── EmptyNotificationsState.tsx
│   ├── NotificationCard.tsx
│   ├── NotificationFilters.tsx
│   ├── NotificationMetadata.tsx
│   └── NotificationsHeader.tsx
├── constants/
│   └── notifications-data.ts
├── lib/
│   ├── notifications-utils.ts
│   └── useNotificationNavigation.ts ⚠️ `use` prefix → nên ở hooks/
└── types/
    └── notifications-types.ts
```

**Thiếu:** `hooks/` (cần tạo), `services/`, `stores/`, `queries/`, `mutations/`

---

## ✅ Điểm tốt

- Components rõ ràng, có barrel potential
- Types được tách ra
- `notifications-utils.ts` — pure utils, đúng chỗ

---

## 🔴 Priority Issues

### Issue #1: `useNotificationNavigation.ts` trong `lib/` — sai vị trí

File có prefix `use` nhưng lại ở `lib/`. Theo convention, hooks phải ở `hooks/`.

```bash
# Trước
features/notifications/lib/useNotificationNavigation.ts

# Sau
features/notifications/hooks/useNotificationNavigation.ts
```

### Issue #2: Thiếu hoàn toàn `hooks/`, `services/`, `stores/`

Notification data flow hiện không rõ — có thể dùng Redux hoặc được import từ `alerts`.

**Kiểm tra trước khi refactor:**
- Notifications có API riêng hay dùng chung với `alerts`?
- Read/dismiss state có cần persistent không?

**Sau đó tạo:**

```typescript
hooks/
├── queries/
│   └── useNotificationsQuery.ts   ← React Query
├── mutations/
│   └── useDismissNotificationMutation.ts
├── useNotificationNavigation.ts   ← MOVE từ lib/
└── useNotificationsData.ts        ← aggregation
```

### Issue #3: No services

```typescript
services/
├── notification.service.ts         ← API calls
└── notification-error.service.ts   ← Error class
```

### Issue #4: No stores

```typescript
stores/
└── useNotificationReadStore.ts    ← track read/unread state (nếu cần)
```

---

## 📋 Refactoring Checklist

- [ ] Di chuyển `lib/useNotificationNavigation.ts` → `hooks/`
- [ ] Tạo `services/notification.service.ts`
- [ ] Tạo `hooks/queries/useNotificationsQuery.ts`
- [ ] Tạo `hooks/mutations/useDismissNotificationMutation.ts`
- [ ] Tạo `hooks/useNotificationsData.ts` aggregation
- [ ] Tạo Zustand store nếu cần read state
- [ ] Thêm `components/index.ts`
- [ ] Xóa `lib/` sau khi move hết

---

## ✅ Target Structure

```
features/notifications/
├── components/
│   ├── EmptyNotificationsState.tsx
│   ├── NotificationCard.tsx
│   ├── NotificationFilters.tsx
│   ├── NotificationMetadata.tsx
│   ├── NotificationsHeader.tsx
│   └── index.ts
├── hooks/
│   ├── queries/
│   │   └── useNotificationsQuery.ts
│   ├── mutations/
│   │   └── useDismissNotificationMutation.ts
│   ├── useNotificationNavigation.ts  ← MOVE từ lib/
│   └── useNotificationsData.ts       ← aggregation
├── services/
│   ├── notification.service.ts
│   └── notification-error.service.ts
├── stores/
│   └── useNotificationReadStore.ts   (nếu cần)
├── types/
│   └── notifications-types.ts
├── constants/
│   └── notifications-data.ts
└── lib/                               (xóa sau khi move xong)
    ├── notifications-utils.ts          ← MOVE hoặc giữ nếu vẫn dùng
    └── useNotificationNavigation.ts    ← MOVE → DELETE sau khi move
```

---

## 🧪 Testing After Refactor

```bash
# 1. Notification list load đúng
# 2. Filter hoạt động
# 3. Mark as read/unread hoạt động
# 4. Tap notification → navigate đúng
# 5. Empty state hiển thị khi không có notifications
```

---

## 📚 Reference

- `features/alerts/hooks/useAlertHistoryQuery.ts` — query pattern
- `features/map/hooks/queries/useFloodSeverityQuery.ts` — React Query pattern
