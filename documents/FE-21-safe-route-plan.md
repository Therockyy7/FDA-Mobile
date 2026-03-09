# FE-21: Safe Route Suggestions with GraphHopper (Frontend)

## Context

FDA-Mobile cần tính năng chỉ đường an toàn tránh vùng ngập lụt. Backend đang implement endpoint `POST /api/v1/routing/safe-route` sử dụng GraphHopper + real-time station data. Frontend cần:
- Kết nối RouteDirectionPanel (đã có UI) với API thực tế
- Hiển thị route trên bản đồ dưới dạng Polyline
- Hiển thị thông tin an toàn, flood warnings, alternative routes
- Cho phép user chọn điểm đến bằng cách tap trên map

**Hiện trạng**: `RouteDirectionPanel` đã có UI hoàn chỉnh nhưng `onFindRoute` là no-op. `routingService.ts` là stub rỗng. `@mapbox/polyline` đã cài nhưng chưa dùng.

---

## Danh sách files

| # | File | Action | Mục đích |
|---|---|---|---|
| 1 | `features/map/types/safe-route.types.ts` | CREATE | Types, enums, constants |
| 2 | `features/map/lib/polyline-utils.ts` | CREATE | Decode polyline, tính bounds, format distance/time |
| 3 | `features/map/services/safe-route.service.ts` | CREATE | API service + mock fallback |
| 4 | `features/map/services/routingService.ts` | DELETE | Xóa stub cũ (không ai import) |
| 5 | `features/map/hooks/useUserLocation.ts` | CREATE | Lấy GPS coordinates qua expo-location |
| 6 | `features/map/hooks/useSafeRoute.ts` | CREATE | Core hook quản lý route state |
| 7 | `features/map/hooks/useRoutingUI.ts` | MODIFY | Thêm coordinate state, pick-on-map mode |
| 8 | `features/map/components/routes/RouteDirectionPanel.tsx` | MODIFY | Thêm loading, error, pick-on-map props |
| 9 | `features/map/components/routes/SafeRoutePolylines.tsx` | CREATE | Render route polylines trên map |
| 10 | `features/map/components/routes/FloodWarningMarkers.tsx` | CREATE | Render flood warning markers trên map |
| 11 | `features/map/components/routes/SafeRouteResultCard.tsx` | CREATE | Bottom card hiển thị route info |
| 12 | `features/map/components/routes/SafeRouteAlternatives.tsx` | CREATE | Horizontal scroll chọn route |
| 13 | `features/map/components/routes/SafeRouteWarnings.tsx` | CREATE | Danh sách flood warnings (bottom sheet) |
| 14 | `app/(tabs)/map/index.tsx` | MODIFY | Wire tất cả hooks + components |

---

## Thứ tự implement

### Phase 1: Foundation (Types + Utils + Service)

**Step 1: Install expo-location**
```bash
npx expo install expo-location
```

**Step 2: `features/map/types/safe-route.types.ts`** (CREATE)

```typescript
// Types chính:
- RouteProfile = "car" | "bike" | "foot"
- RouteSafetyStatus = "Safe" | "Caution" | "Dangerous" | "Blocked"
- TRANSPORT_MODE_TO_PROFILE: { car→car, motorbike→car, walk→foot }
- SAFETY_STATUS_COLORS: { Safe→#10B981, Caution→#FBBF24, Dangerous→#EF4444, Blocked→#6B7280 }
- SAFETY_STATUS_LABELS: { Safe→"An toàn", ... }
- SafeRouteRequest { startLat, startLng, endLat, endLng, routeProfile, maxAlternatives, avoidFloodedAreas }
- RouteDto { geometry(encoded), distance(m), time(ms), safetyStatus, floodRiskScore, instructions[] }
- RouteInstruction { text, distance, time, sign, streetName }
- FloodWarningDto { stationId, stationName, lat, lng, waterLevel, severity, distanceFromRoute, avoidanceRadius }
- RouteMetadata { floodedStationsCount, avoidedZonesCount, calculatedAt }
- SafeRouteResponse { success, message, data: { safetyStatus, primaryRoute, alternativeRoutes[], floodWarnings[], metadata } }
- DecodedRoute { coordinates[], distance, time, safetyStatus, floodRiskScore, instructions[], isPrimary }
- LatLng { latitude, longitude }
```

**Step 3: `features/map/lib/polyline-utils.ts`** (CREATE)
- `decodePolyline(encoded) → LatLng[]` — dùng `@mapbox/polyline`
- `decodeRouteDto(route, isPrimary) → DecodedRoute`
- `getRouteBounds(coordinates, padding) → Region` — tính bounds để fit map
- `formatDistance(meters) → string` — "3.2 km" hoặc "450 m"
- `formatDuration(ms) → string` — "8 phút" hoặc "1 giờ 5 phút"

**Step 4: `features/map/services/safe-route.service.ts`** (CREATE)
- Pattern: `export const SafeRouteService = { getSafeRoute: async (params) => ... }`
- Dùng `apiClient.post("/api/v1/routing/safe-route", params)`
- Try-catch với mock fallback data (giống pattern map.service.ts)
- Mock data có encoded polyline thực tế cho Đà Nẵng

**Step 5: Delete `features/map/services/routingService.ts`**

---

### Phase 2: Hooks

**Step 6: `features/map/hooks/useUserLocation.ts`** (CREATE)
- Request foreground permissions via `expo-location`
- Return `{ location: LatLng | null, error, refresh() }`
- Fallback: nếu permission denied → dùng DANANG_CENTER

**Step 7: `features/map/hooks/useSafeRoute.ts`** (CREATE)

State quản lý (local useState, không Redux — data là transient):
```
- primaryRoute: DecodedRoute | null
- alternativeRoutes: DecodedRoute[]
- selectedRouteIndex: number (0 = primary)
- overallSafetyStatus: RouteSafetyStatus | null
- floodWarnings: FloodWarningDto[]
- metadata: RouteMetadata | null
- isLoading, error, hasResults
```

Actions:
```
- findRoute(start, end, transportMode, maxAlternatives?) → call service, decode polylines, set state
- selectRoute(index) → change selectedRouteIndex
- getSelectedRoute() → computed getter
- getAllRoutes() → [primary, ...alternatives]
- clearRoutes() → reset all state
```

Error handling:
- API Blocked → set error "Tất cả các tuyến đường đều bị ngập"
- Network error → "Lỗi kết nối. Vui lòng thử lại."
- No route → "Không tìm được tuyến đường"

**Step 8: `features/map/hooks/useRoutingUI.ts`** (MODIFY)

Thêm vào hook hiện tại (backwards compatible):
```typescript
+ startCoord: LatLng | null
+ endCoord: LatLng | null
+ isPickingDestination: boolean
+ setDestinationFromMap(coord, label) — set endCoord + destinationText
+ setOriginFromGPS(coord, label) — set startCoord + originLabel
```
Đổi default originLabel: "Đường Trần Phú, Đà Nẵng" → "Vị trí hiện tại"

---

### Phase 3: UI Components

**Step 9: `RouteDirectionPanel.tsx`** (MODIFY)

Thêm props mới (backwards compatible):
```typescript
+ isLoading?: boolean        → disable button, show ActivityIndicator
+ error?: string | null      → show red error text below button
+ onPickOnMap?: () => void   → map-pin icon button cạnh destination input
+ hasDestinationCoord?: bool → enable/disable find button
```

**Step 10: `SafeRoutePolylines.tsx`** (CREATE)
- Render bên trong `<MapView>` children
- Selected route: white border polyline (strokeWidth 6) + color polyline (strokeWidth 4) theo `SAFETY_STATUS_COLORS`
- Non-selected: gray semi-transparent (#9CA3AF, opacity 0.5), thinner
- Tất cả polylines `tappable={true}` → onPress gọi `onRoutePress(index)`

**Step 11: `FloodWarningMarkers.tsx`** (CREATE)
- Render `<Marker>` cho mỗi FloodWarningDto
- Icon: warning/critical với màu tương ứng
- Pattern giống `FloodSeverityMarkers.tsx`

**Step 12: `SafeRouteResultCard.tsx`** (CREATE)
- Animated.View slide-up (pattern giống FloodStationCard)
- Hiển thị: safety status badge, distance, time, flood risk score (progress bar 0-100), số warnings
- Buttons: Close, "Xem cảnh báo" (mở warnings list)

**Step 13: `SafeRouteAlternatives.tsx`** (CREATE)
- Horizontal ScrollView phía trên result card
- Mỗi card nhỏ: "Tuyến 1", "Tuyến 2", distance/time, safety color dot, risk score
- Selected state: highlighted border

**Step 14: `SafeRouteWarnings.tsx`** (CREATE)
- Bottom sheet Modal (pattern giống LayerToggleSheet)
- List flood warnings: station name, water level, severity icon, distance from route

---

### Phase 4: Integration (MapScreen)

**Step 15: `app/(tabs)/map/index.tsx`** (MODIFY)

Imports mới:
```typescript
+ useSafeRoute, useUserLocation
+ SafeRoutePolylines, FloodWarningMarkers
+ SafeRouteResultCard, SafeRouteAlternatives
+ getRouteBounds
```

Logic mới trong MapScreen:
```
1. const { location: userLocation } = useUserLocation()
2. const safeRoute = useSafeRoute()
3. const routeResultCardAnim = useRef(new Animated.Value(300)).current

4. handleFindRoute():
   - start = routingUI.startCoord ?? userLocation ?? DANANG_CENTER
   - end = routingUI.endCoord (required)
   - await safeRoute.findRoute(start, end, transportMode)
   - if success: fit map to route bounds, slide in result card, collapse direction panel

5. handleMapPress(event):
   - if routingUI.isPickingDestination → capture coord, reverse geocode, set destination

6. handleSelectRoute(index):
   - safeRoute.selectRoute(index)
   - fit map to selected route bounds

7. handleCloseRouteResults():
   - slide out result card → safeRoute.clearRoutes()
```

JSX changes:
```
- MapView: + onPress={handleMapPress}
- Inside MapView children:
  + {safeRoute.hasResults && <SafeRoutePolylines routes={...} selectedIndex={...} />}
  + {safeRoute.hasResults && <FloodWarningMarkers warnings={...} />}
- Below MapView (absolute positioned):
  + {safeRoute.hasResults && <SafeRouteAlternatives />}
  + {safeRoute.hasResults && <SafeRouteResultCard />}
- RouteDirectionPanel: update onFindRoute={handleFindRoute}, pass isLoading, error, onPickOnMap
```

---

## User Flow

```
1. Tap nút Navigate (blue circle) → RouteDirectionPanel mở
2. Origin = "Vị trí hiện tại" (GPS) hoặc user tap để đổi
3. User tap icon map-pin → chế độ "pick on map" → tap map → set destination coord
4. Chọn transport mode (car/motorbike/walk)
5. Tap "Tìm đường an toàn nhất" → loading spinner
6. API trả kết quả → polylines render, map fit bounds, result card slide up
7. User tap alternative route (polyline hoặc card) → switch selected
8. User tap "Xem cảnh báo" → bottom sheet warnings list
9. User tap Close → clear all, back to normal map
```

---

## Verification

1. **Type check**: `npx tsc --noEmit` — no type errors
2. **Build**: `npx expo start` — app starts without crashes
3. **UI Flow**: Mở map tab → tap Navigate → nhập destination (tap map) → tap "Tìm đường" → verify:
   - Loading spinner hiển thị
   - Polylines render trên map (mock data nếu API chưa sẵn)
   - Result card slide up với distance/time/safety
   - Tap alternative route → switch polyline highlight
   - Close → clear everything
4. **Error cases**: Test với destination quá xa, test không có GPS, test API error (mock)
5. **Lint**: `npm run lint` — no errors
