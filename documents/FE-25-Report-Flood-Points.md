# FE-25 - Report Flood Points

> Feature: Community Flood Report Submission  
> Updated: 2026-03-15  
> Status: Re-defined (Lean model)

---

## 1) Goal

Allow users to submit flood reports quickly while blocking low-quality spam data before it enters the map and AI context.

---

## 2) Endpoint

- Method: `POST /api/v1/flood-reports`
- Auth: required (authenticated user only)
- Content-Type: `multipart/form-data` (if media upload is enabled)

---

## 3) Required Behavior

### 3.1 Create report

- Save location (`lat`, `lng`), description, media references, created time.
- New report defaults:
  - `Score = 1`
  - `Status = Published`

### 3.2 Anti-spam check A: cooldown

Before insert, check latest report from same user:
- If last report time < 3 minutes, reject request.
- Response:
  - HTTP `429 Too Many Requests`
  - Message example: "Ban dang dang bai qua nhanh, vui long thu lai sau X phut"

### 3.3 Anti-spam check B: coordinate burst

Before insert, query reports in:
- Radius: 50 meters
- Time window: 10 minutes

If existing count > 3:
- Create new report with `Status = Hidden`
- Keep data for audit/training if needed, but do not expose to FE-26 public feed.

---

## 4) Request Contract (Minimum)

Required:
- `latitude`
- `longitude`

Optional:
- `description`
- `photos[]`
- `videos[]`

Validation:
- Latitude range: [-90, 90]
- Longitude range: [-180, 180]
- Description length limit based on existing project standard

---

## 5) Response Contract (Minimum)

Success (`201`):
- `id`
- `score`
- `status`
- `createdAt`

Cooldown reject (`429`):
- `message`
- `retryAfterSeconds` (recommended)

### 5.1 Media Upload Limits (Updated: 2026-03-21)

Response bao gồm thông tin giới hạn upload để FE hiển thị cho user:

```json
{
  "success": true,
  "id": "...",
  "status": "published",
  "mediaLimits": {
    "maxPhotoCount": 5,
    "maxVideoCount": 5,
    "maxPhotoSizeBytes": 20971520,
    "maxVideoSizeBytes": 209715200,
    "allowedPhotoExtensions": [".jpg", ".jpeg", ".png", ".webp"],
    "allowedVideoExtensions": [".mp4", ".mov", ".avi"]
  }
}
```

**Configuration** (appsettings.json):
```json
{
  "MediaUpload": {
    "MaxPhotoCount": 5,
    "MaxVideoCount": 5,
    "MaxPhotoSizeBytes": 20971520,
    "MaxVideoSizeBytes": 209715200,
    "AllowedPhotoExtensions": [".jpg", ".jpeg", ".png", ".webp"],
    "AllowedVideoExtensions": [".mp4", ".mov", ".avi"]
  }
}
```

### 5.2 Backend Server Configuration for Video Upload (Updated: 2026-03-19)

Để cho phép upload video kích thước lớn (lên đến 300MB), cần cấu hình Kestrel `MaxRequestBodySize` trong `Program.cs`:

```csharp
// Program.cs - Kestrel configuration (MUST be before Build())
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 300 * 1024 * 1024; // 300MB
});
```

**Lưu ý quan trọng:**
- Nếu deploy trên server có **Nginx reverse proxy** phía trước, cũng cần thêm vào `nginx.conf`:
  ```nginx
  client_max_body_size 300M;
  ```
- Nếu dùng **Cloudflare**, kiểm tra Firewall rules — gói Free có giới hạn upload mặc định 100MB.
- Giới hạn ở tầng ứng dụng (`appsettings.json` `MaxVideoSizeBytes`) vẫn được enforce riêng, không bị ảnh hưởng bởi cấu hình này.

---

## 6) Data Model Notes

`flood_reports` must include:
- `Score INT NOT NULL DEFAULT 1`
- `Status` enum: `Published`, `Hidden`

Indexes recommended:
- `(CreatedAt)` for cooldown checks
- `(Latitude, Longitude, CreatedAt)` for coordinate burst checks

---

## 7) Pseudocode

```csharp
if (HasRecentPostSameUser(withinMinutes: 3))
    return TooManyRequests();

var nearbyRecentCount = CountReportsInRadius(
    lat, lng, radiusMeters: 50, withinMinutes: 10);

var status = nearbyRecentCount > 3 ? Hidden : Published;

var report = new FloodReport
{
    Latitude = lat,
    Longitude = lng,
    Description = description,
    Score = 1,
    Status = status,
    CreatedAt = UtcNow
};

Save(report);
return Created(report);
```

---

## 8) Non-goals

- No moderator queue.
- No authority escalation.
- No complex trust-score weighting logic in this iteration.