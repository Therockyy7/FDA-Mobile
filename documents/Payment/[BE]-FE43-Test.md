# FE-43: View Newsfeed – Test Guide

## Giới thiệu

Tài liệu này hướng dẫn test backend cho FE-43 (Newsfeed) gồm 4 endpoint:
- `GET /api/v1/announcements` (feed)
- `GET /api/v1/announcements/{announcementId}` (detail)
- `POST /api/v1/announcements/{announcementId}/read` (mark one as read)
- `POST /api/v1/announcements/read-all` (mark all as read)

> Tham chiếu data từ FE-42 để tạo announcements test trước khi chạy FE-43.

---

## Base URL

```text
http://localhost:5000/api/v1
```

## Auth Header (cho endpoint mark-read)

```text
Authorization: Bearer {JWT_TOKEN}
```

---

## Test Data Setup (khuyến nghị)

Tạo tối thiểu các announcement sau (qua FE-42):

1. **A1**: published, `publishedAt` mới nhất, priority = `low`
2. **A2**: published, `publishedAt` cũ hơn A1, priority = `urgent`
3. **A3**: pending (chưa publish)
4. **A4**: draft
5. **A5**: published nhưng đã soft-delete (`is_deleted = true`)

Lưu lại các ID để dùng xuyên suốt test:
- `{A1_ID}`, `{A2_ID}`, `{A3_ID}`, `{A4_ID}`, `{A5_ID}`

---

## T1 – Get Feed: danh sách cơ bản (anonymous)

**Mục đích:** Endpoint public trả danh sách announcement đã publish.

**Request:**
```http
GET /api/v1/announcements?page=1&pageSize=20
```

**Expected (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "{A1_ID}",
      "title": "...",
      "priority": "low",
      "publishedAt": "2026-03-26T10:00:00Z"
    },
    {
      "id": "{A2_ID}",
      "title": "...",
      "priority": "urgent",
      "publishedAt": "2026-03-26T09:00:00Z"
    }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

**Verify:**
- [ ] Chỉ có announcement `published` và `is_deleted = false`
- [ ] Không thấy `{A3_ID}`, `{A4_ID}`, `{A5_ID}`
- [ ] Sắp xếp theo `publishedAt DESC` (A1 trước A2)

---

## T2 – Get Feed: filter theo priority

**Request:**
```http
GET /api/v1/announcements?priority=urgent&page=1&pageSize=20
```

**Expected (200):**
- `data` chỉ chứa announcement priority = `urgent` (ví dụ `{A2_ID}`)

**Verify:**
- [ ] Không trả về priority khác

---

## T3 – Get Feed: search theo title

**Request:**
```http
GET /api/v1/announcements?search=bao tri&page=1&pageSize=20
```

**Expected (200):**
- `data` chỉ chứa các announcement có `title` chứa từ khóa

**Verify:**
- [ ] Search hoạt động với title

---

## T4 – Get Feed: filter theo date range

**Request:**
```http
GET /api/v1/announcements?startDate=2026-03-26T00:00:00Z&endDate=2026-03-26T23:59:59Z&page=1&pageSize=20
```

**Expected (200):**
- Chỉ trả announcement có `publishedAt` trong range

---

## T5 – Get Feed: pagination

**Request:**
```http
GET /api/v1/announcements?page=1&pageSize=1
```

**Expected (200):**
- `data.length = 1`
- Có `totalCount`, `totalPages` đúng

**Verify:**
- [ ] Page 1 và page 2 trả item khác nhau (nếu dữ liệu đủ)

---

## T6 – Get Feed: validation lỗi page/pageSize

### T6a: page = 0
```http
GET /api/v1/announcements?page=0&pageSize=20
```
Expected: **400** (`Validation failed`)

### T6b: pageSize = 101
```http
GET /api/v1/announcements?page=1&pageSize=101
```
Expected: **400** (`Validation failed`)

### T6c: priority invalid
```http
GET /api/v1/announcements?priority=super_urgent&page=1&pageSize=20
```
Expected: **400** (`Validation failed`)

---

## T7 – Get Detail: announcement published hợp lệ

**Request:**
```http
GET /api/v1/announcements/{A1_ID}
```

**Expected (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "{A1_ID}",
    "title": "...",
    "content": "...",
    "priority": "low",
    "viewCount": 123
  }
}
```

**Verify:**
- [ ] Lấy được chi tiết đầy đủ
- [ ] `viewCount` tăng sau mỗi lần gọi (so DB trước/sau)

---

## T8 – Get Detail: announcement không tồn tại

**Request:**
```http
GET /api/v1/announcements/00000000-0000-0000-0000-000000000000
```

**Expected (404):**
```json
{
  "success": false,
  "message": "Announcement not found",
  "statusCode": 404,
  "data": null
}
```

---

## T9 – Get Detail: pending/draft/deleted không được xem

### T9a: pending
```http
GET /api/v1/announcements/{A3_ID}
```
Expected: **404**

### T9b: draft
```http
GET /api/v1/announcements/{A4_ID}
```
Expected: **404**

### T9c: soft-deleted
```http
GET /api/v1/announcements/{A5_ID}
```
Expected: **404**

---

## T10 – Mark as Read: thành công lần đầu

**Request:**
```http
POST /api/v1/announcements/{A1_ID}/read
Authorization: Bearer {userToken}
```

**Expected (200):**
```json
{
  "success": true,
  "message": "Announcement marked as read",
  "statusCode": 200
}
```

**Verify DB:**
- [ ] Có record trong `announcement_reads` với `{A1_ID}` + `{UserId}`
- [ ] `announcements.read_count` tăng +1

---

## T11 – Mark as Read: gọi lần 2 (idempotent)

**Request:**
```http
POST /api/v1/announcements/{A1_ID}/read
Authorization: Bearer {userToken}
```

**Expected (200):**
```json
{
  "success": true,
  "message": "Announcement already marked as read",
  "statusCode": 200
}
```

**Verify:**
- [ ] Không tạo record duplicate trong `announcement_reads`
- [ ] `read_count` không tăng thêm lần nữa

---

## T12 – Mark as Read: không có token

**Request:**
```http
POST /api/v1/announcements/{A1_ID}/read
```

**Expected:** **401 Unauthorized**

---

## T13 – Mark as Read: announcement không tồn tại

**Request:**
```http
POST /api/v1/announcements/00000000-0000-0000-0000-000000000000/read
Authorization: Bearer {userToken}
```

**Expected (404):**
```json
{
  "success": false,
  "message": "Announcement not found",
  "statusCode": 404
}
```

---

## T14 – Mark as Read: announcement không ở trạng thái hợp lệ

### T14a: pending
```http
POST /api/v1/announcements/{A3_ID}/read
Authorization: Bearer {userToken}
```
Expected: **400**

### T14b: draft
```http
POST /api/v1/announcements/{A4_ID}/read
Authorization: Bearer {userToken}
```
Expected: **400**

### T14c: soft-deleted
```http
POST /api/v1/announcements/{A5_ID}/read
Authorization: Bearer {userToken}
```
Expected: **400**

**Expected body (400):**
```json
{
  "success": false,
  "message": "Only published announcements can be marked as read",
  "statusCode": 400
}
```

---

## Checklist tổng hợp

- [ ] Feed chỉ trả published + not deleted
- [ ] Feed sort theo `publishedAt DESC`
- [ ] Filter/search/date/pagination hoạt động
- [ ] Detail tăng `viewCount`
- [ ] Mark-read idempotent (không duplicate)
- [ ] Mark-all-read idempotent (`markedCount=0` khi gọi lại)
- [ ] Mark-all-read không tạo record cho pending/draft/deleted
- [ ] Mark-all-read tăng `read_count` đúng số record mới insert
- [ ] Trạng thái lỗi chuẩn: 400/401/404 đúng ngữ cảnh

---

## T15 – Mark All as Read: thành công lần đầu (có unread)

**Mục đích:** Gọi API mark all với user có announcement chưa đọc.

**Request:**
```http
POST /api/v1/announcements/read-all
Authorization: Bearer {userToken}
```

**Expected (200):**
```json
{
  "success": true,
  "message": "All announcements marked as read",
  "statusCode": 200,
  "markedCount": 2
}
```

**Verify DB:**
- [ ] Có record trong `announcement_reads` cho mỗi `{A1_ID}`, `{A2_ID}` + `{UserId}`
- [ ] `announcements.read_count` tăng +1 cho mỗi announcement mới được insert
- [ ] Không có record cho `{A3_ID}`, `{A4_ID}`, `{A5_ID}` (pending/draft/deleted)

---

## T16 – Mark All as Read: gọi lần 2 (idempotent)

**Request:**
```http
POST /api/v1/announcements/read-all
Authorization: Bearer {userToken}
```

**Expected (200):**
```json
{
  "success": true,
  "message": "All announcements marked as read",
  "statusCode": 200,
  "markedCount": 0
}
```

**Verify:**
- [ ] `markedCount = 0` (không tạo thêm record nào)
- [ ] Không có duplicate `(announcement_id, user_id)` trong `announcement_reads`
- [ ] `read_count` của A1, A2 không tăng thêm

---

## T17 – Mark All as Read: không có token

**Request:**
```http
POST /api/v1/announcements/read-all
```

**Expected:** **401 Unauthorized**

---

## T18 – Mark All as Read: user chưa có announcement nào (all đã đọc)

**Request:**
```http
POST /api/v1/announcements/read-all
Authorization: Bearer {userToken}
```

**Expected (200):**
```json
{
  "success": true,
  "message": "All announcements marked as read",
  "statusCode": 200,
  "markedCount": 0
}
```

**Verify:**
- [ ] `markedCount = 0` nhưng vẫn trả 200 success

---

## Checklist tổng hợp

1. `priority` nên gửi lowercase (`low|normal|high|urgent`) để match dữ liệu DB ổn định.
2. Khi verify `viewCount/readCount`, nên check DB trước/sau để tránh nhiễu từ request test khác.
3. Nếu môi trường đang có nhiều job/instance, dữ liệu có thể thay đổi theo thời gian; nên test trên dataset cô lập.