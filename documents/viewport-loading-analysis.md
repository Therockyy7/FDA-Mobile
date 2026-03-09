# Phân tích: Viewport-based Loading + Zoom-level Strategy

**Ngày:** 2026-03-06
**Dự án:** FDA-Mobile
**Phạm vi:** Load hàng nghìn Station (trạm đo) hiệu quả trên bản đồ

---

## 1. Kiến trúc (Cấu trúc hệ thống) hiện tại

### Flow (Luồng xử lý) tổng thể

```
[User pan/zoom] (người dùng di chuyển/thu phóng bản đồ)
    → onRegionChangeComplete
    → debounce(400ms) (trì hoãn 400ms để gom nhiều sự kiện thành 1)
    → fetchMarkersInViewPort()
        → isViewportOutsideBuffer? hoặc zoomModeChanged?
            NO  → bỏ qua (dùng data đã load)
            YES → getBufferedBounds() → REST API → Redux → FloodSeverityMarkers
                                           ↑
                               SignalR ReceiveSensorUpdate (nhận cập nhật thời gian thực)
                                → applyRealtimeUpdate() → Redux → re-render (vẽ lại giao diện)
```

### Các file liên quan

| File | Vai trò |
|------|---------|
| `app/(tabs)/map/index.tsx` | MapScreen - màn hình bản đồ chính |
| `features/map/lib/map-utils.ts` | Các hàm tính vùng buffer (đệm) và zoom level (mức thu phóng) |
| `features/map/hooks/useMapLayerSettings.ts` | Redux selectors (bộ chọn dữ liệu) + thunks (hàm bất đồng bộ) |
| `features/map/hooks/useFloodSignalR.ts` | Quản lý vòng đời kết nối SignalR |
| `features/map/stores/map.slice.ts` | Redux state (trạng thái): floodSeverity (mức độ ngập) |
| `features/map/components/stations/FloodSeverityMarkers.tsx` | Render (vẽ) các markers (điểm đánh dấu) |
| `lib/signalr-client.ts` | SignalR singleton connection (kết nối đơn thể dùng chung) |

---

## 2. Hướng A: Viewport-based Loading (Tải dữ liệu theo vùng nhìn thấy)

### Nguyên tắc

Frontend (giao diện) gửi bounding box (hộp giới hạn - tọa độ 4 góc) của màn hình hiện tại cộng thêm 20% buffer (vùng đệm). Backend (máy chủ) chỉ trả về các stations (trạm) trong vùng đó.

```
[Map viewport] (vùng nhìn thấy trên bản đồ)
+-------------------------------------+
|  buffer zone (vùng đệm - 20% thêm mỗi cạnh) |
|  +-------------------------------+  |
|  |   actual screen view          |  |
|  |   (vùng màn hình thực tế)     |  |
|  +-------------------------------+  |
+-------------------------------------+
```

**Chỉ re-fetch (gọi lại API) khi viewport (vùng nhìn) vượt ra ngoài buffer zone (vùng đệm)** - không phải mỗi lần pan (kéo bản đồ).

### Implementation (Triển khai) hiện tại

**`features/map/lib/map-utils.ts`**

```typescript
const BUFFER_RATIO = 0.2; // 20% thêm mỗi cạnh

// Tính bounds (giới hạn) với buffer (vùng đệm)
export function getBufferedBounds(region: MapRegion): ViewportBounds {
  const latBuffer = region.latitudeDelta * BUFFER_RATIO;
  const lngBuffer = region.longitudeDelta * BUFFER_RATIO;
  return {
    minLat: region.latitude - region.latitudeDelta / 2 - latBuffer,
    maxLat: region.latitude + region.latitudeDelta / 2 + latBuffer,
    minLng: region.longitude - region.longitudeDelta / 2 - lngBuffer,
    maxLng: region.longitude + region.longitudeDelta / 2 + lngBuffer,
  };
}

// Kiểm tra viewport (vùng nhìn) có vượt ra ngoài buffer (vùng đệm) đã load chưa
export function isViewportOutsideBuffer(
  currentRegion: MapRegion,
  loadedBounds: ViewportBounds | null
): boolean {
  if (!loadedBounds) return true;
  const viewMinLat = currentRegion.latitude - currentRegion.latitudeDelta / 2;
  const viewMaxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2;
  const viewMinLng = currentRegion.longitude - currentRegion.longitudeDelta / 2;
  const viewMaxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2;
  return (
    viewMinLat < loadedBounds.minLat ||
    viewMaxLat > loadedBounds.maxLat ||
    viewMinLng < loadedBounds.minLng ||
    viewMaxLng > loadedBounds.maxLng
  );
}
```

**`app/(tabs)/map/index.tsx` - fetchMarkersInViewPort**

```typescript
const fetchMarkersInViewPort = useMemo(
  () =>
    debounce((newRegion: Region) => {  // debounce: trì hoãn để gom sự kiện
      if (!settings.overlays.flood) return;

      const currentZoomMode = getZoomMode(newRegion.latitudeDelta);
      const zoomModeChanged = currentZoomMode !== lastZoomModeRef.current;

      // Bỏ qua nếu vẫn trong buffer (vùng đệm) VÀ zoom mode (chế độ thu phóng) không đổi
      if (
        !zoomModeChanged &&
        !isViewportOutsideBuffer(newRegion, loadedBoundsRef.current)
      ) {
        return;
      }

      const bufferedBounds = getBufferedBounds(newRegion);
      loadedBoundsRef.current = bufferedBounds;
      lastZoomModeRef.current = currentZoomMode;

      refreshFloodSeverity(bufferedBounds); // REST API với bounding box (hộp giới hạn)
    }, 400),
  [refreshFloodSeverity, settings.overlays.flood],
);
```

### API endpoint (Điểm cuối API)

```
GET /api/map/current-status?minLat=...&maxLat=...&minLng=...&maxLng=...
```

Endpoint (điểm cuối) đã có sẵn, Backend đã handle (xử lý) filter (lọc) theo bounding box (hộp giới hạn tọa độ).

### Kết quả thực tế

- Trước: API gọi sau mỗi lần pan (kéo) nhỏ
- Sau: API chỉ gọi khi pan ra ngoài vùng đã load (~20% viewport)
- Giảm khoảng 60-70% số lần API call (gọi API) khi pan bình thường

---

## 3. Hướng B: Zoom-level based Clustering (Gom nhóm điểm theo mức thu phóng)

### Nguyên tắc

Zoom Level (Mức thu phóng) | Hành vi
--------------------------|--------
< 10 (cluster - gom cụm) | Load (tải) tóm tắt, ít chi tiết - tiết kiệm bandwidth (băng thông mạng)
10-13 (individual - riêng lẻ) | Load stations (trạm) trong viewport (vùng nhìn), SignalR cập nhật
> 13 (detailed - chi tiết) | Load đầy đủ + flood road lines (đường ngập nước), SignalR real-time (thời gian thực)

### Implementation (Triển khai) hiện tại

**`features/map/lib/map-utils.ts`**

```typescript
export type MapZoomMode = "cluster" | "individual" | "detailed";
// MapZoomMode (chế độ thu phóng): cluster (gom cụm) | individual (riêng lẻ) | detailed (chi tiết)

// Tính zoom level (mức thu phóng) từ latitudeDelta (độ thay đổi vĩ độ)
export function getZoomLevel(latitudeDelta: number): number {
  return Math.round(Math.log2(360 / latitudeDelta));
}

// Xác định mode (chế độ) hiển thị
export function getZoomMode(latitudeDelta: number): MapZoomMode {
  const zoom = getZoomLevel(latitudeDelta);
  if (zoom < 10) return "cluster";    // zoom ra: gom cụm
  if (zoom <= 13) return "individual"; // zoom vừa: riêng lẻ
  return "detailed";                   // zoom vào sâu: chi tiết
}
```

**Trigger (kích hoạt) fetch khi zoom mode (chế độ thu phóng) thay đổi:**

```typescript
const zoomModeChanged = currentZoomMode !== lastZoomModeRef.current;
if (!zoomModeChanged && !isViewportOutsideBuffer(...)) return; // bỏ qua
```

### Trạng thái hiện tại

Zoom mode detection (phát hiện chế độ thu phóng) đã implement nhưng **clustering UI (giao diện gom cụm) chưa implement**. Hiện tại tất cả zoom levels đều hiển thị individual markers (điểm đánh dấu riêng lẻ).

Để implement clustering (gom cụm) đầy đủ cần:
1. Khi `zoomMode === "cluster"`: render (vẽ) `ClusterMarker` thay vì individual (riêng lẻ) `<Marker>`
2. Grouping logic (logic nhóm điểm) hoặc dùng thư viện như `react-native-map-clustering`
3. Backend có thể cần endpoint (điểm cuối) riêng cho cluster summary (tóm tắt cụm)

---

## 4. Kết hợp cả 2 (Chiến lược tối ưu)

```
User (người dùng) mở map (bản đồ)
    ↓
Load (tải) initial bounds (giới hạn ban đầu) - DANANG_CENTER + 20% buffer (vùng đệm)
REST API → Redux state (trạng thái Redux)
    ↓
SignalR connect (kết nối) → listen (lắng nghe) ReceiveSensorUpdate
    ↓
User pan/zoom (kéo/thu phóng bản đồ)
    ↓
isViewportOutsideBuffer? (vùng nhìn vượt ra ngoài vùng đệm?) OR zoomModeChanged? (chế độ thu phóng thay đổi?)
    NO → dùng data (dữ liệu) hiện tại + SignalR vẫn update (cập nhật) real-time (thời gian thực)
    YES → REST API mới (buffer bounds) → merge (gộp) vào Redux
               ↑
         SignalR tiếp tục update (cập nhật) trong khi API đang load (tải)
```

**Ưu điểm của merge strategy (chiến lược gộp dữ liệu) trong `fetchFloodSeverity.fulfilled`:**

```typescript
// map.slice.ts - đã implement
.addCase(fetchFloodSeverity.fulfilled, (state, action) => {
  if (!state.floodSeverity) {
    state.floodSeverity = action.payload; // lần đầu: replace (thay thế toàn bộ)
  } else {
    // Merge (gộp): update existing (cập nhật trạm đã có), append new (thêm trạm mới)
    action.payload.features.forEach((incoming) => {
      const idx = state.floodSeverity!.features.findIndex(
        (f) => f.properties.stationId === incoming.properties.stationId
      );
      if (idx >= 0) {
        state.floodSeverity!.features[idx] = incoming; // cập nhật
      } else {
        state.floodSeverity!.features.push(incoming); // thêm mới
      }
    });
  }
})
```

**Lưu ý quan trọng:** Merge strategy (chiến lược gộp) có thể gây marker accumulation (tích lũy điểm đánh dấu - markers cũ không bị xóa khi pan đến vùng mới). Cần monitor (theo dõi) và có thể cần cleanup logic (logic dọn dẹp) nếu tổng số markers vượt ngưỡng.

---

## 5. SignalR Real-time Updates (Cập nhật thời gian thực qua SignalR)

### Flow (Luồng xử lý)

```
Server (máy chủ) → SignalR Hub (trung tâm kết nối) /hubs/flood-data
    → event (sự kiện): "ReceiveSensorUpdate" | "ReceiveStationUpdate"
    → payload (dữ liệu gửi kèm): SensorUpdatePayload | SensorUpdateData (flat - phẳng)
    ↓
useFloodSignalR.handleSensorUpdate()
    → dispatch(applyRealtimeUpdate(data))  (gửi action cập nhật vào Redux)
    ↓
map.slice.ts - applyRealtimeUpdate reducer (bộ xử lý - Immer)
    → find feature (tìm điểm dữ liệu) by stationId (theo mã trạm)
    → update properties (cập nhật thuộc tính) in-place (tại chỗ, không tạo bản sao)
    ↓
FloodSeverityMarkers re-render (vẽ lại)
    (useMemo - ghi nhớ tính toán, keyed on - phụ thuộc vào floodSeverity?.features)
```

### Payload formats (Định dạng dữ liệu) được hỗ trợ

```typescript
// Format 1: Wrapped (bọc trong object cha)
{ type: "sensor_update", timestamp: "...", data: { stationId, waterLevel, ... } }

// Format 2: Flat (phẳng - trực tiếp)
{ stationId, waterLevel, severity, ... }
```

### Vấn đề đã biết

**504 Gateway Timeout với LongPolling (kỹ thuật polling dài):**
- LongPolling (giữ kết nối HTTP dài) bị nginx (web server) timeout (hết thời gian) sau 60 giây
- SignalR auto-reconnect (tự kết nối lại) với intervals (khoảng cách thời gian): [0, 2000, 5000, 10000, 30000]ms
- Fix phía server: tăng nginx `proxy_read_timeout` (thời gian chờ proxy đọc)
- Fix phía Frontend: không throw error (ném lỗi) khi connect fail (kết nối thất bại) - graceful degradation (xuống cấp ưu nhã)

**Connection lifecycle (vòng đời kết nối):**
- Shared singleton pattern (mẫu đơn thể dùng chung - `activeConnectionCount`)
- `stopFloodHub()` set `connection = null` để destroy singleton (hủy đối tượng dùng chung), tránh stale handlers (trình xử lý cũ/lỗi thời)
- AppState (trạng thái ứng dụng): disconnect (ngắt kết nối) khi background (chạy nền), reconnect (kết nối lại) khi foreground (chạy tiền cảnh)

---

## 6. Render Pipeline (Chuỗi xử lý vẽ giao diện)

### FloodSeverityMarkers (Component vẽ markers ngập lụt)

```typescript
// Dependency (phụ thuộc): floodSeverity?.features (mảng dữ liệu ngập)
// Immer tạo new reference (tham chiếu mới) khi có mutation (thay đổi) -> useMemo sẽ re-evaluate (tính lại)
const markers = useMemo(() => {
  if (!settings.overlays.flood || !floodSeverity?.features?.length) return [];
  return floodSeverity.features.filter(/* validate coordinates - kiểm tra tọa độ hợp lệ */);
}, [settings.overlays.flood, floodSeverity?.features]);
```

**Performance note (Lưu ý hiệu suất):** `tracksViewChanges={false}` trên `<Marker>` là quan trọng - tránh crash (sập ứng dụng) và tăng performance (hiệu suất) đáng kể khi có nhiều markers.

### Vấn đề useMemo với Immer

Khi `applyRealtimeUpdate` dùng Immer mutation in-place (thay đổi tại chỗ):
- Immer tạo NEW reference (tham chiếu mới) cho `state.floodSeverity.features` (mảng mới)
- Redux selector (bộ chọn dữ liệu) `state.map?.floodSeverity ?? null` trả về new reference cho `floodSeverity`
- `floodSeverity?.features` là reference (tham chiếu) mới → `useMemo` sẽ re-evaluate (tính lại) → re-render (vẽ lại)

Đây là behavior (hành vi) đúng. Nếu markers không update (cập nhật) có thể do:
1. SignalR không nhận được events (sự kiện) - server không gửi hoặc bị 504 errors (lỗi hết thời gian)
2. `stationId` (mã trạm) không match (khớp) giữa REST data và SignalR payload

---

## 7. Thống kê hiệu suất (ước tính)

| Scenario (Tình huống) | Không buffer | Buffer 20% (Vùng đệm 20%) |
|----------------------|-------------|------------|
| Pan (kéo) nhỏ (< 20% viewport) | 1 API call (gọi API) | 0 API call |
| Pan lớn (> 20% viewport) | 1 API call | 1 API call |
| Zoom in/out (thu phóng) cùng mode (chế độ) | 1 API call | 0 API call |
| Zoom mode (chế độ thu phóng) thay đổi | 1 API call | 1 API call |
| SignalR update (cập nhật qua SignalR) | 0 API call | 0 API call |

**Kết luận:** Buffer zone (vùng đệm) giảm ~60-70% API calls (lần gọi API) trong usage pattern (mẫu sử dụng) thông thường (pan nhỏ, zoom trong cùng level).

---

## 8. Điểm cần cải thiện

### Ngắn hạn
1. **Cleanup markers (dọn dẹp điểm đánh dấu)** khi pan quá xa: giới hạn tổng số markers trong Redux (ví dụ max 200 stations - trạm)
2. **Debug SignalR events (gỡ lỗi sự kiện SignalR)**: bật lại logging trong `useFloodSignalR.ts` để verify (xác minh) server đang gửi events (sự kiện)

### Trung hạn
3. **Clustering UI (giao diện gom cụm)**: implement `ClusterMarker` component cho zoom < 10
4. **Detailed mode (chế độ chi tiết)**: render (vẽ) flood road lines (đường ngập nước) khi zoom > 13

### Dài hạn
5. **WebSocket transport (truyền tải WebSocket)**: thay LongPolling (polling dài) bằng WebSocket - cần server fix nginx config (cấu hình nginx)
6. **Offline cache (bộ nhớ đệm ngoại tuyến)**: cache (lưu tạm) last known state (trạng thái cuối cùng đã biết) vào AsyncStorage khi go background (chuyển sang chạy nền)
