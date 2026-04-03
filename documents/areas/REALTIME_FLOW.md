# Area Realtime Flow (FE-10A)

> Mô tả luồng dữ liệu từ khi mount map screen đến khi nhận SignalR update và render lên map.

---

## 1. Mount map screen

```
app/(tabs)/map/index.tsx
  └─ useMapScreenState()
       └─ useMapData()
            └─ useAreasQuery()          ← 1 request: GET /api/v1/areas/me/status
                                           trả về AreaWithStatus[]
```

**File:** `features/map/hooks/queries/useAreasQuery.ts`
**API:** `GET /api/v1/areas/me/status` — trả về toàn bộ area kèm status trong 1 call (thay thế N+1 cũ).

---

## 2. Sau khi areas load xong

```
useMapData()
  ├─ areasBase = areasQuery.data        ← [{ id: "abc", status: "Normal", ... }, ...]
  ├─ areaIds = ["abc", "def", ...]
  └─ useAreaSignalR(areaIds)            ← gọi hook với danh sách ID
```

**File:** `features/map/hooks/useMapData.ts`

---

## 3. Bên trong `useAreaSignalR`

```
useEffect([areaIds]) {
  connection = getFloodHubConnection()  ← lấy singleton SignalR connection

  connection.on("ReceiveAreaStatusUpdate", handleUpdate)  ← đăng ký listener

  startFloodHub().then(() => {
    for each areaId:
      connection.invoke("SubscribeToArea", areaId)        ← báo server theo dõi area này
  })

  cleanup: {
    connection.off("ReceiveAreaStatusUpdate")
    for each areaId:
      connection.invoke("UnsubscribeFromArea", areaId)    ← hủy khi unmount
  }
}
```

**File:** `features/map/hooks/areas/useAreaSignalR.ts`
**Hub URL:** `process.env.EXPO_PUBLIC_SIGNALR_HUB_URL` (mặc định `https://uat.fda.id.vn/hubs/flood-data`)

---

## 4. Khi server push update

```
Server → SignalR → "ReceiveAreaStatusUpdate" event
  payload: { data: { areaId: "abc", status: "Warning", severityLevel: 3, ... } }
    │
    ▼
handleUpdate() trong useAreaSignalR
    │
    ▼
useAreaRealtimeStore.applyUpdate({ areaId: "abc", status: "Warning", ... })
    │                              ← Zustand set: updates["abc"] = { ... }
    ▼
useAreaRealtimeStore.updates thay đổi → React re-render
```

**File:** `features/map/stores/useAreaRealtimeStore.ts`

### Payload shape

```typescript
interface AreaStatusPayload {
  data: {
    areaId: string;
    status: "Normal" | "Watch" | "Warning" | "Unknown";
    severityLevel: number;   // 0 | 2 | 3 | -1
    summary?: string;
    evaluatedAt?: string;
  };
}
```

---

## 5. Merge và render

```
useMapData()
  areaRealtimeUpdates = useAreaRealtimeStore(s => s.updates)
  areas = useMemo(() =>
    areasBase.map(a => {
      rt = areaRealtimeUpdates[a.id]
      return rt ? { ...a, ...rt } : a   ← realtime ghi đè base data
    })
  )
    │
    ▼
MapContent → AreaCircleOverlay(area)
  color = AREA_STATUS_COLORS[area.status]   ← đổi màu tự động
```

**Files:**
- `features/map/hooks/useMapData.ts` — merge logic
- `features/map/components/areas/overlays/AreaCircleOverlay.tsx` — render circle
- `features/map/types/map-layers.types.ts` — `AREA_STATUS_COLORS`

---

## 6. Khi tạo / xóa area

```
Tạo area (useControlArea):
  AreaService.createArea() → newArea
  onAreaSubscribe(newArea.id)             ← connection.invoke("SubscribeToArea", id)
  refreshAreas()                          ← React Query refetch → areaIds update
                                             → useAreaSignalR re-run với ID mới

Xóa area:
  onAreaUnsubscribe(areaId)               ← connection.invoke("UnsubscribeFromArea", id)
  AreaService.deleteArea(areaId)
  refreshAreas()
```

**File:** `features/areas/hooks/useControlArea.ts`
Callbacks `onAreaSubscribe` / `onAreaUnsubscribe` được truyền từ `useMapScreenState` → `useControlArea`.

---

## Tóm tắt kiến trúc

```
REST (initial load)          SignalR (realtime)
        │                           │
   useAreasQuery              useAreaSignalR
   /areas/me/status            SubscribeToArea × N
        │                           │
   areasBase[]              useAreaRealtimeStore
                             updates: Record<areaId, AreaStatusUpdate>
        └──────── useMemo merge ────┘
                       │
                    areas[]
                       │
               AreaCircleOverlay
               (màu theo severityLevel)
```

**Nguyên tắc:** Hai nguồn data độc lập, merge tại `useMapData`.
Realtime update **không trigger refetch API** — chỉ patch đúng area bị ảnh hưởng trong Zustand store.

---

## File liên quan

| File | Vai trò |
|------|---------|
| `features/areas/services/area.service.ts` | `getAreasWithStatus()` — batch API call |
| `features/map/hooks/queries/useAreasQuery.ts` | React Query wrapper |
| `features/map/hooks/areas/useAreaSignalR.ts` | SignalR subscribe/unsubscribe + listener |
| `features/map/stores/useAreaRealtimeStore.ts` | Zustand store cho realtime updates |
| `features/map/hooks/useMapData.ts` | Orchestration + merge |
| `features/areas/hooks/useControlArea.ts` | Subscribe khi tạo, unsubscribe khi xóa |
| `features/map/hooks/useMapScreenState.ts` | Wiring callbacks → useControlArea |
| `features/map/components/areas/overlays/AreaCircleOverlay.tsx` | Render circle trên map |
