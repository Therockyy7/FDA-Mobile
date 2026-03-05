# State Management Architecture — Redux + TanStack Query

## Phân chia vai trò

| Cái gì | Dùng gì | Lý do |
|--------|---------|-------|
| `auth` (user, token) | Redux + persist | Cần persist, cần share toàn app |
| `mapSettings` (overlay toggles) | Redux + persist | Persist qua session, SignalR cần đọc |
| `floodSeverity` | Redux (giữ nguyên) | SignalR `applyRealtimeUpdate` cần dispatch |
| `fetchFloodSeverity` thunk | Redux (giữ nguyên) | Trigger từ viewport change, không phải component lifecycle |
| `fetchAreas` thunk | TanStack Query | Thuần fetch, không có realtime |
| `getMapLayerPreferences` | TanStack Query | Thuần fetch |
| `saveMapSettings` | TanStack Query mutation | Thuần mutation |
| Profile, Alerts, Charts... | TanStack Query | Mọi API call thuần CRUD |

## Lợi ích thực tế

**TanStack Query thay các thunk CRUD:**
- `fetchAreas` → `useQuery` — tự refetch khi focus lại tab, tự cache, không cần `areasLoading` state trong Redux
- `getMapLayerPreferences` → `useQuery` — bỏ được `loading`, `error`, `settingsLoaded` trong map slice

**Redux giữ nguyên cho:**
- Auth state (persist)
- Map settings (persist)
- `floodSeverity` + `applyRealtimeUpdate` (SignalR)

**Kết quả:**
- `map.slice.ts` 410 lines → ~150 lines (chỉ còn settings + floodSeverity)
- `area.slice.ts` hiện empty → không cần tạo, dùng TanStack Query trực tiếp
- Không migration lớn, không breaking change — chỉ thay từng thunk một bằng `useQuery`/`useMutation`

---

## Đánh giá `features/map`

### Vấn đề hiện tại

**1. Components quá lớn**
- `AreaCard.tsx` ~520 lines
- `FloodStationCard.tsx` ~518 lines
- `LayerToggleSheet.tsx` ~540 lines
- `CreateAreaSheet.tsx` ~437 lines
- Mỗi file đang làm cả UI lẫn logic — nên tách UI components ra khỏi container logic

**2. Mock data lẫn vào service**
- `map.service.ts` fallback về `MOCK_FLOOD_SEVERITY_DATA`
- Production code không nên có mock fallback — dễ quên bỏ

**3. Constants lẫn với mock data**
- `map-data.ts` mix `FLOOD_ROUTES` thật với mock sensors

### Phân chia Redux vs TanStack Query cho map

```
Redux giữ:                    TanStack Query thay:
─────────────────────         ─────────────────────────────
auth state                    fetchAreas (trong map.slice)
mapSettings (persist)         getMapLayerPreferences
floodSeverity (SignalR)       saveMapSettings mutation
                              Area CRUD (AreaCard actions)
                              Routing service calls
```

**Kết quả:** `map.slice.ts` 410 lines → ~130 lines (chỉ còn settings + floodSeverity)

---

## Ưu tiên thực hiện

### Làm ngay — ROI cao
1. Tách `fetchAreas` ra `useAreas` hook dùng TanStack Query
2. Tách `getMapLayerPreferences` / `saveMapSettings` ra TanStack Query
3. Bỏ mock fallback khỏi `map.service.ts`

### Làm sau — không urgent
4. Tách component lớn (AreaCard, FloodStationCard...) — pure UI refactor
5. Tách `map-data.ts` constants vs mock data

### Không cần đụng
- `useFloodSignalR`, `floodSeverity` slice — đang hoạt động đúng
- Hook structure (`useMapCamera`, `useMapDisplay`...) — đã tách tốt
