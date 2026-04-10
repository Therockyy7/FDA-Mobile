# Yêu cầu BE: Cập nhật payload `ReceiveAreaStatusUpdate`

## Bối cảnh vấn đề

### Luồng hiện tại

```
BE emit ReceiveAreaStatusUpdate
        │
        ▼
FE (useAreaSignalR) nhận payload
        │
        ▼
Lưu vào Zustand store (useAreaRealtimeStore)
        │
        ▼
useMapData.ts merge store vào areasBase:
  { ...areaBase, ...realtimeUpdate }
        │
        ▼
AreaCard trên map tab ✅ (nhận areas đã merged)
```

### Vấn đề

Payload hiện tại **thiếu `contributingStations`**:

```json
// Payload hiện tại — THIẾU contributingStations
{
  "data": {
    "areaId": "abc-123",
    "status": "Warning",
    "severityLevel": 3,
    "summary": "2 trạm vượt ngưỡng",
    "evaluatedAt": "2026-04-10T08:30:00Z"
  }
}
```

Khi FE merge `{ ...areaBase, ...realtimeUpdate }`:
- `status`, `severityLevel`, `summary`, `evaluatedAt` → được cập nhật ✅
- `contributingStations` → **giữ nguyên data cũ từ lần fetch ban đầu** ❌

**Hậu quả:**
1. **AreaCard (tab phụ map)** — hiển thị danh sách trạm (`contributingStations`) và `maxWaterLevel` **stale**, không phản ánh thực tế sau khi status thay đổi
2. **AreaDetailScreen** — hiện fetch lại `GET /api/v1/area/areas/{id}/status` mỗi khi nhận SignalR event → **N users × M events = N×M API calls không cần thiết**

---

## Yêu cầu

### Thêm `contributingStations` vào payload `ReceiveAreaStatusUpdate`

```json
// Payload mới — ĐẦY ĐỦ
{
  "data": {
    "areaId": "abc-123",
    "status": "Warning",
    "severityLevel": 3,
    "summary": "2 trạm vượt ngưỡng cảnh báo",
    "evaluatedAt": "2026-04-10T08:30:00Z",
    "contributingStations": [
      {
        "stationId": "sta-001",
        "stationCode": "TĐ-01",
        "distance": 120.5,
        "waterLevel": 45.2,
        "severity": "warning",
        "weight": 0.8
      },
      {
        "stationId": "sta-002",
        "stationCode": "TĐ-02",
        "distance": 350.0,
        "waterLevel": 12.0,
        "severity": "safe",
        "weight": 0.2
      }
    ]
  }
}
```

### Schema `ContributingStation`

| Field | Type | Mô tả |
|-------|------|-------|
| `stationId` | `string` | ID trạm |
| `stationCode` | `string` | Mã trạm hiển thị (vd: "TĐ-01") |
| `distance` | `number` | Khoảng cách từ trạm đến tâm vùng (mét) |
| `waterLevel` | `number` | Mực nước hiện tại (cm) |
| `severity` | `string` | `"safe"` \| `"caution"` \| `"warning"` \| `"critical"` \| `"unknown"` |
| `weight` | `number` | Trọng số đóng góp vào đánh giá vùng (0–1) |

> Schema này **khớp với response của** `GET /api/v1/area/areas/{areaId}/status` hiện tại — BE chỉ cần include thêm array này vào event emit, không cần tính toán thêm.

---

## Lợi ích sau khi update

| | Trước | Sau |
|---|---|---|
| API calls khi có realtime event | +1 `GET /status` per user per event | 0 extra calls |
| `contributingStations` trong AreaCard | Stale (data cũ) | Realtime |
| `maxWaterLevel` hiển thị | Stale | Realtime |
| AreaDetailScreen | Cần refetch | Merge trực tiếp từ event |
| Độ trễ cập nhật UI | ~100–300ms (refetch) | Instant |

---

## Thay đổi FE sau khi BE update

FE sẽ cập nhật:

**1. `features/map/hooks/areas/useAreaSignalR.ts`** — Thêm `contributingStations` vào interface và `applyUpdate`:

```typescript
// Thêm vào AreaStatusPayload.data
interface AreaStatusPayload {
  data: {
    areaId: string;
    status: string;
    severityLevel: number;
    summary?: string;
    evaluatedAt?: string;
    contributingStations?: ContributingStation[]; // ← NEW
  };
}

// Thêm vào applyUpdateRef.current(...)
applyUpdateRef.current({
  areaId: d.areaId,
  status: d.status as AreaStatusUpdate["status"],
  severityLevel: d.severityLevel,
  summary: d.summary,
  evaluatedAt: d.evaluatedAt,
  contributingStations: d.contributingStations, // ← NEW
});
```

**2. `features/map/stores/useAreaRealtimeStore.ts`** — Thêm `contributingStations` vào `AreaStatusUpdate`:

```typescript
export interface AreaStatusUpdate {
  areaId: string;
  status: AreaStatus;
  severityLevel: number;
  summary?: string;
  evaluatedAt?: string;
  contributingStations?: ContributingStation[]; // ← NEW
}
```

Khi đó `useMapData.ts` merge `{ ...areaBase, ...rt }` sẽ tự động ghi đè `contributingStations` — **không cần thay đổi logic merge**.

**3. `app/(tabs)/areas/[id].tsx`** — Không cần refetch, chỉ merge từ store:

```typescript
useAreaSignalR(id ? [id] : []);
const realtimeUpdates = useAreaRealtimeStore((s) => s.updates);

const mergedStatus = useMemo(() => {
  if (!id || !status) return status;
  const rt = realtimeUpdates[id];
  if (!rt) return status;
  return {
    ...status,
    status: rt.status,
    severityLevel: rt.severityLevel,
    summary: rt.summary ?? status.summary,
    evaluatedAt: rt.evaluatedAt ?? status.evaluatedAt,
    contributingStations: rt.contributingStations ?? status.contributingStations,
  };
}, [status, realtimeUpdates, id]);
```

---

## SignalR Hub Method

Giả sử BE đang dùng:

```csharp
await Clients.Group($"area-{areaId}").SendAsync("ReceiveAreaStatusUpdate", payload);
```

Chỉ cần thêm `contributingStations` vào `payload` object trước khi emit. Data này đã có sẵn trong quá trình BE tính toán area status — **không cần query thêm**.
