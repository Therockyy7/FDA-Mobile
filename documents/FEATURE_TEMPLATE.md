# FDA-Mobile Feature Template

## Mục đích

Document này định nghĩa **kiến trúc chuẩn** cho mọi feature trong FDA-Mobile. Dựa trên:
- Thực tế đã implement ở `features/map/` (React Query + Zustand + Services)
- Tham khảo từ `SpeakPing-Mobile` (subscription feature)

---

## 1. Cấu trúc Feature

```
features/<feature-name>/
├── components/
│   ├── index.ts                    # barrel: export * from "./<name>"
│   ├── <ComponentName>.tsx         # UI component — chỉ nhận props, không gọi hooks trực tiếp
│   └── <SubFolder>/
│       └── ...
├── constants/
│   ├── index.ts
│   ├── <name>.constants.ts        # data constants, config values
│   └── ...
├── hooks/
│   ├── index.ts                   # barrel: export all hooks
│   ├── queries/                   # React Query hooks
│   │   ├── index.ts               # barrel
│   │   └── use<Name>Query.ts
│   ├── mutations/                  # React Query mutation hooks
│   │   ├── index.ts               # barrel
│   │   └── use<Name>Mutation.ts
│   └── navigation/                # navigation sub-hooks (optional, for complex nav)
│       ├── index.ts
│       └── use<Name>NavState.ts
│   ├── use<FeatureName>Data.ts    # aggregation hook — gom data từ query hooks
│   ├── use<FeatureName>Screen.ts  # screen-level handlers (optional, cho màn hình phức tạp)
│   └── use<SubFeature>.ts
├── services/
│   ├── index.ts                   # barrel: export * as ServiceName
│   ├── <name>.service.ts          # API calls — static class hoặc singleton instance
│   └── <name>.service.ts
├── stores/                         # Zustand stores (optional — chỉ khi cần cross-component state)
│   ├── index.ts
│   └── use<Name>Store.ts
├── types/
│   ├── index.ts                   # barrel: export * from "./<name>.types"
│   └── <name>.types.ts
└── lib/                           # Pure utility functions (optional)
    ├── index.ts
    └── <name>.utils.ts
```

**Nguyên tắc:**
- Mỗi subdirectory có `index.ts` barrel file
- Không có `index.ts` ở root feature (để tránh circular dependency)
- Import từ barrel files: `import { useXxx } from "~/features/<feature>/hooks"`

---

## 2. Quy tắc Đặt Tên

| Thứ | Quy tắc | Ví dụ |
|------|---------|--------|
| **Hook** | `use` + PascalCase + HookSuffix | `useFloodSeverityQuery`, `useMapScreen` |
| **Query hook** | `use` + Noun + `Query` | `useFloodSeverityQuery`, `useAreasQuery` |
| **Mutation hook** | `use` + Verb + `Mutation` | `useUpdateSettingsMutation`, `useCreateAreaMutation` |
| **Refresh helper** | `useRefresh` + Noun | `useRefreshAreas` — return `() => queryClient.invalidateQueries(...)` |
| **Service** | `<Name>Service` (PascalCase) | `MapService`, `PlaceSearchService`, `SpeechHapticsService` |
| **Service method** | camelCase | `MapService.getFloodSeverity(...)`, `LocationService.requestPermission()` |
| **Store** | `use` + Noun + `Store` | `useMapSettingsStore` |
| **Store selector** | `use` + Noun | `useMapSettings()`, `useIsAuthenticated()` |
| **Type/Interface** | PascalCase, có suffix rõ ràng | `FloodSeverityFeature`, `MapLayerSettings`, `AreaStatus` |
| **Error class** | `<Domain>ServiceError` hoặc `<Domain>Error` | `MapServiceError`, `SafeRouteError` |
| **Query key** | String literal constant | `FLOOD_SEVERITY_QUERY_KEY = "floodSeverity"` |
| **Component** | PascalCase | `FloodSeverityMarkers`, `AreaCard` |

---

## 3. Services Layer

### 3.1 Static Service Class (Khuyến nghị cho API calls)

```typescript
// features/<feature>/services/<name>.service.ts

import { apiClient } from "~/lib/api-client";
import { <Domain>Error } from "./<name>-error.service";

export const <Name>Service = {
  async getList(params: ListParams): Promise<ListResponse> {
    try {
      const res = await apiClient.get<ListResponse>("/api/v1/...", { params });
      return res.data;
    } catch (error: any) {
      throw new <Domain>Error(
        error?.response?.data?.message || error?.message || "Failed to fetch list",
        error?.response?.status,
      );
    }
  },

  async create(data: CreateDto): Promise<CreateResponse> {
    try {
      const res = await apiClient.post<CreateResponse>("/api/v1/...", data);
      return res.data;
    } catch (error: any) {
      throw new <Domain>Error(
        error?.response?.data?.message || error?.message || "Failed to create",
        error?.response?.status,
      );
    }
  },
};
```

### 3.2 Error Class

```typescript
// features/<feature>/services/<name>-error.service.ts

export class <Domain>Error extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "<Domain>Error";
  }
}
```

### 3.3 Service cho Device APIs (Expo)

```typescript
// features/<feature>/services/<name>.service.ts

import * as ExpoModule from "expo-module";
import type { LatLng } from "../types/<name>.types";

export const <Name>Service = {
  async requestPermission(): Promise<boolean> {
    // ... implementation
  },

  async getCurrentPosition(): Promise<LatLng> {
    // ... implementation
  },

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // ... implementation
  },
};
```

**Nguyên tắc:**
- Hooks **KHÔNG BAO GIỜ** gọi Expo/fetch trực tiếp — luôn qua Service
- Tất cả catch blocks throw typed Error (hoặc custom Error class)
- KHÔNG có console.log/console.error trong service production code
- KHÔNG có mock data trong production service — mock đặt ở `services/__mocks__/`

---

## 4. State Management: 3 Layers

### Layer 1: React Query — Server State (Async Data)

**Dùng cho:** API calls, server data fetching

```typescript
// features/<feature>/hooks/queries/use<Xxx>Query.ts

import { useQuery } from "@tanstack/react-query";
import { <Name>Service } from "../../services/<name>.service";

export const <FEATURE>_<QUERY>_KEY = "<feature>/<query>";

export function use<Name>Query(params: Params | null, enabled: boolean) {
  return useQuery({
    queryKey: [<FEATURE>_<QUERY>_KEY, params],
    queryFn: () => <Name>Service.getList(params!),
    enabled: enabled && params !== null,
    staleTime: 30_000, // 30s — điều chỉnh theo data nature
    gcTime: 5 * 60_000, // 5min
  });
}
```

### Layer 2: Zustand — Client/Persistent State

**Dùng cho:** Settings persistence, realtime data, cross-component shared UI state

```typescript
// features/<feature>/stores/use<Name>Store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface <Name>Store {
  // State
  value: SomeType;
  isLoaded: boolean;
  // Actions
  setValue: (v: SomeType) => void;
  reset: () => void;
}

export const use<Name>Store = create<<Name>Store>()(
  persist(
    (set) => ({
      value: DEFAULT_VALUE,
      isLoaded: false,
      setValue: (v) => set({ value: v, isLoaded: true }),
      reset: () => set({ value: DEFAULT_VALUE, isLoaded: false }),
    }),
    {
      name: "<feature>-store-v1", // version suffix để tránh đọc stale data
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ value: state.value }), // chỉ persist những gì cần
    },
  ),
);

// Granular selectors để tránh over-render
export const use<Name>Value = () => use<Name>Store((s) => s.value);
export const useIs<Name>Loaded = () => use<Name>Store((s) => s.isLoaded);
```

### Layer 3: React useState — Component Local State

**Dùng cho:** UI transient state (modal visibility, form inputs, animation values)

---

## 5. Hooks Pattern

### 5.1 Query Hook (< 50 lines)

```typescript
// features/<feature>/hooks/queries/use<Xxx>Query.ts

import { useQuery } from "@tanstack/react-query";
import { <Name>Service } from "../../services/<name>.service";

export const <FEATURE>_<QUERY>_KEY = "<feature>/<query>";

export function use<Name>Query(params: Params | null, enabled: boolean) {
  return useQuery({
    queryKey: [<FEATURE>_<QUERY>_KEY, params],
    queryFn: () => <Name>Service.getList(params!),
    enabled: enabled && params !== null,
    staleTime: 30_000,
  });
}
```

### 5.2 Mutation Hook (< 50 lines)

```typescript
// features/<feature>/hooks/mutations/use<Xxx>Mutation.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { <Name>Service } from "../../services/<name>.service";
import { <FEATURE>_<QUERY>_KEY } from "../queries/use<Xxx>Query";

export function use<Name>Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDto) => <Name>Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [<FEATURE>_<QUERY>_KEY] });
    },
  });
}
```

### 5.3 Aggregation Hook (< 100 lines)

```typescript
// features/<feature>/hooks/use<FeatureName>Data.ts

import { use<Query1>Query } from "./queries/use<Query1>Query";
import { use<Query2>Query } from "./queries/use<Query2>Query";
import { use<Store> } from "../stores/use<Store>Store";

export function use<FeatureName>Data() {
  const query1 = use<Query1>Query(params1, enabled1);
  const query2 = use<Query2>Query(params2, enabled2);
  const settings = use<Store>Settings();

  return {
    data1: query1.data ?? [],
    data2: query2.data ?? [],
    isLoading: query1.isLoading || query2.isLoading,
    settings,
  };
}
```

### 5.4 Screen Handler Hook (> 100 lines, cho màn hình phức tạp)

```typescript
// features/<feature>/hooks/use<FeatureName>Screen.ts

interface ScreenCtx {
  // Tất cả hook instances + state setters được truyền vào
}

export function use<FeatureName>Screen(ctx: ScreenCtx) {
  // ── Viewport refs ──────────────────────────────────────────
  const loadedBoundsRef = useRef<ViewportBounds | null>(null);

  // ── Handlers ──────────────────────────────────────────────
  const handleAction = useCallback(() => {
    // ...
  }, [deps]);

  // ── Effects ────────────────────────────────────────────────
  useEffect(() => {
    // ...
  }, []);

  return {
    handleAction,
    // ...
  };
}
```

---

## 6. Types Organization

### 6.1 Đặt trong `features/<feature>/types/`

```
features/<feature>/types/
├── index.ts                    # barrel
└── <name>.types.ts             # gom các types liên quan
```

### 6.2 Nguyên tắc đặt tên type

| Type | Pattern | Ví dụ |
|------|---------|-------|
| Feature-wide config | `<Feature><Aspect>` | `MapLayerSettings`, `RoutingPreferences` |
| API response | `<Entity>Response` hoặc `<Entity>Dto` | `AreaStatusResponse`, `FloodStatusDto` |
| API request | `<Entity>Request` | `CreateAreaRequest`, `SafeRouteRequest` |
| GeoJSON | `<Entity>GeoJSON` | `FloodSeverityGeoJSON` |
| GeoJSON Feature | `<Entity>Feature` | `FloodSeverityFeature`, `FloodZoneFeature` |
| Enum-like union | `<Noun><State>` | `AreaStatus`, `TransportMode`, `RouteSafetyStatus` |
| Store state | `<Feature>Store` | `MapSettingsStore`, `FloodRealtimeStore` |
| Query params | `<Entity>Params` | `FloodStatusParams`, `NearbyReportsParams` |

### 6.3 Inline vs Export

- **Export** nếu type được dùng ở file khác trong feature hoặc ở feature khác
- **Inline** (không export) nếu chỉ dùng làm building block cho exported type trong cùng file
- **Ví dụ:**

```typescript
// Export vì dùng ở nhiều nơi
export interface FloodSeverityFeature {
  type: "Feature";
  geometry: GeoJSON.Geometry;
  properties: FloodSeverityProperties;
}

// Inline vì chỉ dùng trong FloodSeverityFeature
interface FloodSeverityProperties {
  stationId: string;
  waterLevel: number;
}
```

---

## 7. Components Pattern

### 7.1 Đặt tên

```
features/<feature>/components/
├── index.ts                    # barrel
├── <Name>.tsx                 # default export
├── <Name>.types.ts            # props interface (nếu > 5 props)
├── <SubName>/
│   ├── index.ts
│   └── <Name>.tsx
```

### 7.2 Props Interface

```typescript
// features/<feature>/components/<Name>.tsx

import type { SomeEntity } from "../../types/<name>.types";

interface <Name>Props {
  entity: SomeEntity;
  onAction: (id: string) => void;
  variant?: "compact" | "expanded";
}
```

Nếu component có **> 5 props** → tách interface ra file riêng `<Name>.types.ts`.

### 7.3 Component nhận data qua props

Components **KHÔNG** gọi data hooks trực tiếp. Nhận data qua props từ screen/parent.

```tsx
// ✅ Đúng
export function AreaCard({ area, onDelete }: AreaCardProps) {
  return <View>...</View>;
}

// ❌ Sai
export function AreaCard() {
  const { area } = useArea(); // KHÔNG làm thế này
}
```

---

## 8. Realtime / SignalR Pattern

```typescript
// features/<feature>/stores/use<Name>RealtimeStore.ts

import { create } from "zustand";

interface <Name>RealtimeStore {
  updates: Record<string, RealtimeData>; // keyed by entityId
  applyUpdate: (data: RealtimeData) => void;
  clear: () => void;
}

export const use<Name>RealtimeStore = create<<Name>RealtimeStore>()((set) => ({
  updates: {},
  applyUpdate: (data) =>
    set((state) => ({
      updates: { ...state.updates, [data.id]: data },
    })),
  clear: () => set({ updates: {} }),
}));
```

```typescript
// features/<feature>/hooks/use<Name>SignalR.ts

export function use<Name>SignalR(enabled: boolean) {
  const applyUpdate = use<Name>RealtimeStore((s) => s.applyUpdate);

  useEffect(() => {
    if (!enabled) return;
    // connect to SignalR hub, call applyUpdate on messages
  }, [enabled]);

  return { ... };
}
```

Merge realtime + REST trong hook tổng hợp:

```typescript
// features/<feature>/hooks/use<Name>Data.ts

export function use<Name>Data(params) {
  const { data: restData } = use<Name>Query(params, enabled);
  const realtimeUpdates = use<Name>RealtimeStore((s) => s.updates);

  const merged = useMemo(
    () => mergeRestAndRealtime(restData, realtimeUpdates),
    [restData, realtimeUpdates],
  );

  return { data: merged, isLoading };
}
```

---

## 9. React Query Keys Convention

```typescript
// Query key = [domain, entity, ...params]
export const FLOOD_SEVERITY_QUERY_KEY = "floodSeverity";
export const AREAS_QUERY_KEY = "userAreas";
export const ADMIN_AREAS_QUERY_KEY = "adminAreas";
export const COMMUNITY_REPORTS_QUERY_KEY = "communityReports";

// Dùng trong invalidate:
queryClient.invalidateQueries({ queryKey: [FLOOD_SEVERITY_QUERY_KEY] });
queryClient.invalidateQueries({ queryKey: [FLOOD_SEVERITY_QUERY_KEY, params] });

// Dùng trong prefetch:
queryClient.prefetchQuery({
  queryKey: [FLOOD_SEVERITY_QUERY_KEY, params],
  queryFn: () => MapService.getFloodSeverity(params),
  staleTime: 30_000,
});
```

---

## 10. File Checklist

Mỗi feature mới cần có:

- [ ] `services/<name>.service.ts` — API calls, dùng Error class
- [ ] `services/<name>-error.service.ts` — custom Error class
- [ ] `hooks/queries/use<Name>Query.ts` — React Query hook (hoặc import từ service nếu đơn giản)
- [ ] `hooks/mutations/use<Name>Mutation.ts` — React Mutation hook (nếu có mutation)
- [ ] `hooks/use<FeatureName>Data.ts` — aggregation hook gom data
- [ ] `stores/use<FeatureName>Store.ts` — Zustand store (nếu cần persistent state)
- [ ] `types/<name>.types.ts` — TypeScript types
- [ ] `constants/<name>.constants.ts` — data constants
- [ ] `components/` — UI components (nhận props, KHÔNG gọi hooks trực tiếp)
- [ ] `hooks/index.ts` — barrel export
- [ ] `hooks/queries/index.ts` — barrel export
- [ ] `hooks/mutations/index.ts` — barrel export
- [ ] `services/index.ts` — barrel export
- [ ] `types/index.ts` — barrel export
- [ ] `components/index.ts` — barrel export

---

## 11. Anti-patterns Cần Tránh

| Anti-pattern | Tại sao | Thay thế |
|---|---|---|
| Hook gọi Expo/fetch trực tiếp | Khó test, violate separation of concerns | Service class → Hook gọi Service |
| Mock data trong production service | Debug khó, production sai behavior | Mock trong `__mocks__/` hoặc MSW |
| State rải ở nhiều chỗ | Sync khó, bug dễ | Zustand cho cross-component state |
| Component gọi data hook | Tight coupling, reuse khó | Component nhận props |
| Import barrel lớn | Circular dependency dễ xảy ra | Import trực tiếp từ file cụ thể |
| Type đặt trong component file | Reuse khó | `types/` directory |
| `any` type không có lý do | Mất type safety | Định nghĩa interface đúng |
| `console.log` trong production code | Log spam, performance | Xóa hoặc dùng analytics |
| `as` casting không kiểm tra | Runtime crash tiềm ẩn | Dùng type guard hoặc check đúng |

---

## 12. Tham chiếu Implementation Mẫu

| Aspect | Xem trong |
|--------|-----------|
| Service class | `features/map/services/map.service.ts` |
| Service error | `features/map/services/map-error.service.ts` |
| Zustand persist store | `features/map/stores/useMapSettingsStore.ts` |
| Zustand realtime store | `features/map/stores/useFloodRealtimeStore.ts` |
| Query hook | `features/map/hooks/queries/useFloodSeverityQuery.ts` |
| Aggregation hook | `features/map/hooks/useFloodData.ts` |
| Screen handler hook | `features/map/hooks/useMapScreen.ts` |
| SignalR + React Query merge | `features/map/hooks/useFloodData.ts` |
| Navigation sub-hooks | `features/map/hooks/navigation/useNavigationVoice.ts` |
| SpeakPing subscription feature | `D:/cap/SpeakPing-Mobile/features/subscription/` |
