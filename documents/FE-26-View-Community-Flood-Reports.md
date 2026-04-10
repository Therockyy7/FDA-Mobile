# FE-26 - View Community Flood Reports

> Feature: Public Community Reports Feed
> Updated: 2026-03-19
> Status: Re-defined (Lean model)

---

## 1) Goal

Provide a clean public feed for map/list UI by filtering out low-trust or hidden community reports.

---

## 2) Endpoints

### 2.1 Community Feed
- Method: `GET /api/v1/flood-reports/community`
- Auth: required (authenticated user only)

### 2.2 Nearby Reports (FeatG84)
- Method: `POST /api/v1/flood-reports/nearby`
- Auth: required (authenticated user only)
- Body (JSON):
  ```json
  {
    "latitude": 16.059754,
    "longitude": 108.216495,
    "radiusMeters": 5000,
    "hours": 24
  }
  ```
- **Important notes:**
  - `hours`: Lọc theo thời gian. Ví dụ `hours: 24` = chỉ lấy reports trong 24 giờ gần nhất. Nếu muốn lấy **tất cả**, truyền `hours: 0`.
  - Coordinates phải là **tọa độ thực từ device** (GPS). Test với `(1, 1)` sẽ trả 0 kết quả vì đó là giữa Ấn Độ Dương.
  - Sử dụng Haversine formula để tính khoảng cách.
  - Logic filter: `Status = Published`, `TrustScore >= 0`, `CreatedAt >= cutoff` (nếu `hours > 0`).
- Default values: `radiusMeters = 500`, `hours = 2` (nếu không truyền hoặc <= 0).
- Consensus level trong response:
  - `none`: 0 báo cáo
  - `low`: 1 báo cáo
  - `moderate`: 2-3 báo cáo
  - `strong`: 4+ báo cáo

---

## 3) Visibility Rules

Hard rules:
- Only `Status = Published`
- Only reports with `Score >= visibilityThreshold`

Recommended defaults:
- `visibilityThreshold = 0` for user map view
- Sort by newest first (`CreatedAt DESC`)

Note:
- FE-25/FE-27 can mark reports as `Hidden`; hidden reports must never be returned.

---

## 4) Query Parameters (Lean)

- `bounds`: `minLat,minLng,maxLat,maxLng` (optional, strongly recommended for map)
- `fromHours`: default `24` (optional)
- `minScore`: optional override, default from system config (`0`)
- `page`, `pageSize`: optional (for large areas)

---

## 5) Response Contract (Minimum)

Each item should contain:
- `id`
- `latitude`, `longitude`
- `description`
- `score`
- `createdAt`
- `mediaPreview` (optional)
- `votes`: `{ up, down }` (optional but recommended)

---

## 6) SQL/Query Intent

```sql
SELECT *
FROM flood_reports
WHERE status = 'Published'
  AND score >= @minScore
  AND created_at >= @fromTime
  AND latitude BETWEEN @minLat AND @maxLat
  AND longitude BETWEEN @minLng AND @maxLng
ORDER BY created_at DESC
LIMIT @pageSize OFFSET @offset;
```

---

## 7) Relationship to AI Feed

FE-26 is user-facing filtering.

AI feed should be stricter than FE-26:
- `Status = Published`
- `Score >= 0`
- Time window `24h` to `48h`
- Bound by active viewport or target area

This avoids low-quality context entering AI summarization.

---

## 8) Non-goals

- No moderation/authority data in response.
- No `flag` fields in new design.
- No complex trust/confidence badges required at backend level.