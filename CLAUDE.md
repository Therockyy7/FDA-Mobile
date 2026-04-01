# FDA Mobile - AI Coding Assistant

## 🚨 Baseline Commit (CRITICAL)

> **Dùng commit này làm so sánh khi refactor:**
> `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`

---

## 📁 Feature-Scoped Context

Claude Code tự động load context cho feature bạn đang làm. **Không cần copy-paste thủ công.**

### Cách dùng

Khi bắt đầu session, nói tên feature bạn cần làm việc:

```
"Tôi đang refactor feature areas"
"Tôi cần thêm feature community cho bản đồ"
"Refactor auth"
```

### Feature docs (Claude sẽ tự load)

| Feature | File docs | Priority | Key Issues |
|---------|-----------|----------|-------------|
| `map` | `documents/CLAUDE_MAP.md` | P1 | God hooks, duplicate colors, TypeScript `any` |
| `areas` | `documents/CLAUDE_AREAS.md` | P1 | God hook 586L, god service 513L |
| `community` | `documents/CLAUDE_COMMUNITY.md` | P1 | Service 360L cần tách nhiều domain |
| `auth` | `documents/CLAUDE_AUTH.md` | P2 | RTK slice 410L, tách thunks |
| `home` | `documents/CLAUDE_HOME.md` | P2 | Hook 225L, tách derivation logic |
| `alerts` | `documents/CLAUDE_ALERTS.md` | P2 | FCM handlers, tách notification state |
| `notifications` | `documents/CLAUDE_NOTIFICATIONS.md` | P3 | Hook đặt sai thư mục `lib/` |
| `prediction` | `documents/CLAUDE_PREDICTION.md` | P3 | Monitor size, tách parser |
| `profile` | `documents/CLAUDE_PROFILE.md` | P3 | 2 hook files rỗng cần xóa/implement |

**Hoặc đọc tất cả:** `documents/REFACTORING_GUIDE.md`

---

## 🏗️ Architecture Reference

### Feature Template (chuẩn cho tất cả features)

```
features/<feature>/
├── components/     # UI — nhận props, KHÔNG gọi hooks trực tiếp
├── constants/      # Data constants
├── hooks/          # React Query + screen handlers
│   ├── queries/    # useXxxQuery.ts
│   ├── mutations/  # useXxxMutation.ts
│   └── useXxxData.ts  # aggregation hook
├── services/       # API calls + Error class
├── stores/         # Zustand (nếu cần cross-component state)
├── types/          # TypeScript interfaces
└── lib/            # Pure utility functions
```

**Reference implementation mẫu:** `features/map/`

### Hook Rules

- Hook nhỏ: **< 50 lines** (query hook, mutation hook)
- Hook trung bình: **50–150 lines** (aggregation hook)
- Hook lớn: **> 150 lines** → cần tách
- **KHÔNG BAO GIỜ** gọi API/fetch trực tiếp trong hook → phải qua Service

### Service Rules

```typescript
// ✅ Đúng: throw custom Error
export const AreaService = {
  async getById(id: string): Promise<Area> {
    try {
      const res = await apiClient.get<Area>(`/areas/${id}`);
      return res.data;
    } catch (err) {
      throw new AreaServiceError(/* ... */);
    }
  },
};

// ❌ Sai: không throw error
export const AreaService = {
  async getById(id: string): Promise<Area | null> {
    const res = await apiClient.get<Area>(`/areas/${id}`);
    return res.data ?? null; // KHÔNG làm thế này
  },
};
```

### State Management Priority

1. **React Query** → server state (API data)
2. **Zustand** → client state (settings, realtime, cross-component)
3. **useState** → UI transient state (form inputs, modal visibility)

### Cross-Feature Import Rule

> **Cấm import từ feature khác vào `components/`** (tạo tight coupling).
> Chỉ import qua `services/` hoặc `types/` shared.

---

## 🎯 Refactoring Principles

1. **So sánh vs baseline** trước khi refactor: `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
2. **Backward compatibility** — không break existing code trừ khi có lý do rõ ràng
3. **Test sau refactor** — chạy app và verify behavior không đổi
4. **TypeScript strict** — không dùng `any` không có lý do
5. **Single responsibility** — mỗi hook/service làm một việc

---

## 📌 Tech Stack

- React Native 0.81 + Expo ~54
- TypeScript ~5.9
- Expo Router (file-system routing)
- Redux Toolkit + Redux Persist → **đang migrate sang Zustand** (xem `features/map` làm mẫu)
- React Query + Axios
- Zustand cho feature-local state
- NativeWind (Tailwind CSS)
- react-native-maps (Google Maps)
- SignalR Hub cho realtime

---

## ⚠️ Known Issues Across Codebase

| # | Issue | Feature |
|---|-------|---------|
| 1 | `any` types (15+ locations) | map |
| 2 | Duplicate `SEVERITY_COLORS` | map |
| 3 | Module-level `activeConnectionCount` | map |
| 4 | Cross-feature imports `features/areas` | map |
| 5 | Theme prop drilling | map |
| 6 | `formatDistance`/`formatDuration` duplicated | map |
