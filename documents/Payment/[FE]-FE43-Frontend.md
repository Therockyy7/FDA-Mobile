# FE-43: View Newsfeed – Frontend Guide

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Business Flow](#2-business-flow)
3. [API Endpoints](#3-api-endpoints)
4. [Request/Response Details](#4-requestresponse-details)
5. [Pagination](#5-pagination)
6. [Error Handling](#6-error-handuring)
7. [UI Implementation Guide](#7-ui-implementation-guide)
8. [State Management](#8-state-management)
9. [Performance Tips](#9-performance-tips)

---

## 1. Tổng quan

### FE-43 là gì?

FE-43 cho phép **mọi user** (kể cả anonymous) xem danh sách thông báo (Announcements) đã publish. User đã đăng nhập có thêm khả năng:

- Biết được thông báo nào **đã đọc** / **chưa đọc**
- **Đánh dấu đã đọc** từng thông báo
- **Đánh dấu đã đọc tất cả** chỉ trong 1 lần gọi

### Phân biệt Announcements vs Notifications

| | Announcements (FE-43) | Notifications (FE-98) |
|---|---|---|
| **Tab trên UI** | Tab "Thông báo" | Tab "Cảnh báo" |
| **Nguồn** | Admin tạo thủ công | Hệ thống tạo tự động |
| **Mục đích** | Tin tức, thông báo chung | Cảnh báo lũ lụt |
| **Read tracking** | Có (`isRead`) | Không |

---

## 2. Business Flow

### Luồng xem Newsfeed

```
[User mở tab Thông báo]
         │
         ├── Anonymous user
         │       └── Gọi GET /announcements
         │               └── isRead = null (frontend treat as "chưa đọc")
         │
         └── Authenticated user
                 └── Gọi GET /announcements (JWT)
                         └── isRead = true/false (biết rõ trạng thái)
                                 │
                                 ├── isRead = false
                                 │       └── Hiển thị badge "Chưa đọc"
                                 │
                                 └── User nhấn "Đánh dấu tất cả đã đọc"
                                         └── POST /announcements/read-all
                                                 └── Tất cả isRead → true
```

### Luồng đánh dấu đã đọc

```
[User vào detail hoặc nhấn đánh dấu]
         │
         ├── Đánh dấu 1 thông báo
         │       └── POST /announcements/{id}/read
         │               └── isRead → true
         │
         └── Đánh dấu tất cả (recommended)
                 └── POST /announcements/read-all
                         └── Tất cả isRead → true
```

### Lưu ý quan trọng về Read Status

- **`isRead = null`** → Anonymous user hoặc gọi API không có JWT
  - Frontend nên **treat as "chưa đọc"** (hiển thị indicator)
- **`isRead = false`** → Authenticated và chưa đọc → hiện badge "Chưa đọc"
- **`isRead = true`** → Authenticated và đã đọc → không hiện badge

---

## 3. API Endpoints

### Tổng kết

| Method | Endpoint | Auth | Mục đích |
|--------|----------|------|----------|
| `GET` | `/api/v1/announcements` | **Không cần** | Lấy danh sách thông báo (feed) |
| `GET` | `/api/v1/announcements/{id}` | **Không cần** | Lấy chi tiết 1 thông báo |
| `POST` | `/api/v1/announcements/{id}/read` | **Cần JWT** | Đánh dấu 1 thông báo đã đọc |
| `POST` | `/api/v1/announcements/read-all` | **Cần JWT** | Đánh dấu **tất cả** đã đọc |

### Base URL

```
http://localhost:5000/api/v1
```

### Auth Header (cho endpoint mark-read)

```http
Authorization: Bearer {JWT_TOKEN}
```

---

## 4. Request/Response Details

### 4.1 Lấy danh sách – `GET /api/v1/announcements`

#### Query Parameters

| Parameter | Kiểu | Mặc định | Mô tả |
|-----------|------|-----------|--------|
| `priority` | string? | null | Filter: `"low"`, `"normal"`, `"high"`, `"urgent"` |
| `startDate` | DateTime? | null | Lọc từ ngày (ISO 8601) |
| `endDate` | DateTime? | null | Lọc đến ngày (ISO 8601) |
| `search` | string? | null | Tìm kiếm trong title |
| `page` | int | 1 | Số trang |
| `pageSize` | int | 20 | Số item mỗi trang (max: 100) |

#### Response mẫu (Anonymous)

```json
{
  "success": true,
  "message": "Announcements retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": "725157eb-51c5-48ff-bea8-b090984313b9",
      "title": "Canh bao lut Ba Don",
      "summary": "Canh bao lut cho khu vuc Q7, TP.HCM",
      "imageUrl": "https://storage.example.com/flood-alert-q7.jpg",
      "priority": "high",
      "publishedAt": "2026-03-26T16:19:32.792334Z",
      "viewCount": 0,
      "isRead": null
    },
    {
      "id": "250e6ca6-fc6e-4134-b651-cbb309a2e4f7",
      "title": "Cảnh báo ngập lụt Q7",
      "summary": "Cảnh báo ngập lụt cho khu vực Q7, TP.HCM",
      "imageUrl": "https://pokemon.fandom.com/wiki/Ash%27s_Pikachu",
      "priority": "normal",
      "publishedAt": "2026-03-26T14:06:07.269626Z",
      "viewCount": 1,
      "isRead": null
    }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

#### Response mẫu (Authenticated – có JWT)

```json
{
  "success": true,
  "message": "Announcements retrieved successfully",
  "statusCode": 200,
  "data": [
    {
      "id": "725157eb-51c5-48ff-bea8-b090984313b9",
      "title": "Canh bao lut Ba Don",
      "summary": "Canh bao lut cho khu vuc Q7, TP.HCM",
      "imageUrl": "https://storage.example.com/flood-alert-q7.jpg",
      "priority": "high",
      "publishedAt": "2026-03-26T16:19:32.792334Z",
      "viewCount": 0,
      "isRead": false
    },
    {
      "id": "250e6ca6-fc6e-4134-b651-cbb309a2e4f7",
      "title": "Cảnh báo ngập lụt Q7",
      "summary": "Cảnh báo ngập lụt cho khu vực Q7, TP.HCM",
      "imageUrl": "https://pokemon.fandom.com/wiki/Ash%27s_Pikachu",
      "priority": "normal",
      "publishedAt": "2026-03-26T14:06:07.269626Z",
      "viewCount": 1,
      "isRead": true
    }
  ],
  "totalCount": 2,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

#### Giải thích trường `isRead`

| Giá trị | Ý nghĩa | Khi nào xảy ra |
|----------|----------|----------------|
| `null` | Không xác định | Gọi API không có JWT (anonymous) |
| `false` | Chưa đọc | Authenticated user chưa mở thông báo này |
| `true` | Đã đọc | Authenticated user đã đọc (via mark-read hoặc vào detail) |

#### Giải thích trường `priority`

| Priority | Màu sắc gợi ý |
|----------|----------------|
| `"low"` | Xám (#9CA3AF) |
| `"normal"` | Xanh dương (#3B82F6) |
| `"high"` | Cam (#F97316) |
| `"urgent"` | Đỏ (#EF4444) |

---

### 4.2 Lấy chi tiết – `GET /api/v1/announcements/{id}`

**Side Effect:** Khi user vào trang detail → **`viewCount` tự động tăng +1**.

#### Request

```http
GET /api/v1/announcements/725157eb-51c5-48ff-bea8-b090984313b9
Authorization: Bearer {JWT_TOKEN}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Announcement retrieved successfully",
  "statusCode": 200,
  "data": {
    "id": "725157eb-51c5-48ff-bea8-b090984313b9",
    "title": "Canh bao lut Ba Don",
    "content": "<p>Muc nuoc song Saigon dang tang...</p>",
    "summary": "Canh bao lut cho khu vuc Q7, TP.HCM",
    "imageUrl": "https://storage.example.com/flood-alert-q7.jpg",
    "attachments": "[\"https://storage.example.com/evacuation-map.pdf\"]",
    "priority": "high",
    "publishedAt": "2026-03-26T16:19:32.792334Z",
    "createdAt": "2026-03-26T16:15:00.000000Z",
    "authorName": "admin@fda.vn",
    "viewCount": 1,
    "deliveryCount": 0,
    "readCount": 0
  }
}
```

#### Error Cases

| HTTP | Message |
|------|---------|
| 404 | `Announcement not found` |

---

### 4.3 Đánh dấu 1 thông báo đã đọc – `POST /api/v1/announcements/{id}/read`

**Quyền:** Cần JWT

**Lưu ý:** Không có request body. ID được lấy từ URL.

#### Request

```http
POST /api/v1/announcements/725157eb-51c5-48ff-bea8-b090984313b9/read
Authorization: Bearer {JWT_TOKEN}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Announcement marked as read",
  "statusCode": 200
}
```

#### Idempotent

Gọi 2 lần liên tiếp → Lần 2 trả `message: "Announcement already marked as read"`, không tạo duplicate.

#### Error Cases

| HTTP | Message |
|------|---------|
| 401 | Unauthorized – không có token |
| 404 | Announcement không tồn tại |
| 400 | Announcement chưa publish |

---

### 4.4 Đánh dấu tất cả đã đọc – `POST /api/v1/announcements/read-all`

**Quyền:** Cần JWT

**Khuyến nghị: Dùng endpoint này thay vì gọi mark-read từng cái**

#### Request

```http
POST /api/v1/announcements/read-all
Authorization: Bearer {JWT_TOKEN}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "All announcements marked as read",
  "statusCode": 200,
  "markedCount": 2
}
```

#### Giải thích `markedCount`

| Giá trị | Ý nghĩa |
|----------|----------|
| `> 0` | Số thông báo mới được đánh dấu đã đọc |
| `0` | Tất cả thông báo đã đọc trước đó rồi (idempotent – an toàn khi gọi lại) |

#### Idempotent

Gọi 2 lần liên tiếp → Lần 2 trả `markedCount = 0`, không có duplicate trong database.

#### Error Cases

| HTTP | Message |
|------|---------|
| 401 | Unauthorized – không có token |

---

## 5. Pagination

Tất cả endpoints trả về danh sách đều hỗ trợ pagination:

```json
{
  "data": [ ... ],
  "totalCount": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

#### Công thức

```
totalPages = ceil(totalCount / pageSize)
```

#### Ví dụ

- `totalCount = 25`, `pageSize = 10` → `totalPages = 3`
- Page 1: items 1-10
- Page 2: items 11-20
- Page 3: items 21-25

---

## 6. Error Handling

### HTTP Status Codes

| HTTP | Ý nghĩa |
|------|---------|
| 200 | Thành công |
| 400 | Bad Request – validation hoặc business rule |
| 401 | Unauthorized – không có token hoặc token hết hạn |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description here",
  "statusCode": 400,
  "data": null
}
```

---

## 7. UI Implementation Guide

### 7.1 Màn hình Newsfeed (UI Mockup)

```
┌─────────────────────────────────────────────────────────────┐
│  ≡  FDA App                              🔔  [Avatar ▼]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tab: Cảnh báo] [Tab: Thông báo ★] [Tab: Bản đồ]         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ★ THÔNG BÁO                               [⋯ More] │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  🔴 HIGH PRIORITY                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🔴 [CHƯA ĐỌC]                                        │  │
│  │                                                       │  │
│  │  Canh bao lut Ba Don ─────────────────── 10 phút trước│  │
│  │  Canh bao lut cho khu vuc Q7, TP.HCM                  │  │
│  │  👁 0 lượt xem                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  💬 NORMAL PRIORITY                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  💬 [ĐÃ ĐỌC]          ← opacity: 0.7 (mờ hơn)       │  │
│  │                                                       │  │
│  │  Cảnh báo ngập lụt Q7 ─────────────── 2 giờ trước  │  │
│  │  Cảnh báo ngập lụt cho khu vực Q7, TP.HCM            │  │
│  │  👁 1 lượt xem                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  [◀]              Trang 1 / 1                  [▶]         │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Chi tiết Announcement (UI Mockup)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Quay lại                    [⋯]                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 HIGH PRIORITY                                           │
│                                                             │
│  Canh bao lut Ba Don                                        │
│                                                             │
│  📅 26/03/2026 lúc 23:19  │  👤 admin@fda.vn             │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Muc nuoc song Saigon dang tang cao, du bao gap luc 1-2m   │
│  trong 6h toi. Du bao anh huong den cac quan 7, 8, 4.     │
│                                                             │
│  [Hình ảnh]                                                │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📎 File đính kèm:                                         │
│  - [evacuation-map.pdf]                                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  👁 1 lượt xem  │  📖 0 lượt đọc                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Badge "Chưa đọc" – Các trường hợp

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  isRead = null (Anonymous)  │  │  isRead = false (Chưa đọc)   │
│                              │  │                              │
│  🔵 Badge "MỚI"             │  │  🔴 Badge "CHƯA ĐỌC"         │
│    (FE tự quyết định)        │  │    (backend đã confirm)      │
└──────────────────────────────┘  └──────────────────────────────┘

┌──────────────────────────────┐  ┌──────────────────────────────┐
│  isRead = true (Đã đọc)     │  │                              │
│                              │  │                              │
│  Không badge                 │  │  → Hoặc badge xám mờ:       │
│  Hoặc icon check mờ          │  │    💬 Đã đọc (opacity 0.5)  │
└──────────────────────────────┘  └──────────────────────────────┘
```

### 7.4 Priority Colors

```
┌─────────────┬──────────────────────────────────┐
│ Priority    │ Màu sắc (HEX)                   │
├─────────────┼──────────────────────────────────┤
│ low         │ #9CA3AF (xám)                   │
│ normal      │ #3B82F6 (xanh dương)             │
│ high        │ #F97316 (cam)                    │
│ urgent      │ #EF4444 (đỏ)                    │
└─────────────┴──────────────────────────────────┘
```

### 7.5 Code mẫu: API Service

```javascript
// ===== Base Configuration =====
const API_BASE = 'http://localhost:5000/api/v1';

function getHeaders() {
  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ===== 1. Lấy danh sách thông báo =====
async function fetchAnnouncements({ page = 1, pageSize = 10, ...filters } = {}) {
  const params = new URLSearchParams({ page, pageSize, ...filters });
  const res = await fetch(`${API_BASE}/announcements?${params}`, {
    headers: getHeaders()
  });
  const body = await res.json();
  if (!body.success) throw new Error(body.message);
  return body; // { data, totalCount, page, pageSize, totalPages }
}

// ===== 2. Lấy chi tiết =====
async function fetchAnnouncementDetail(id) {
  const res = await fetch(`${API_BASE}/announcements/${id}`, {
    headers: getHeaders()
  });
  const body = await res.json();
  if (!body.success) throw new Error(body.message);
  return body.data;
}

// ===== 3. Đánh dấu 1 thông báo đã đọc =====
async function markAsRead(announcementId) {
  const res = await fetch(`${API_BASE}/announcements/${announcementId}/read`, {
    method: 'POST',
    headers: getHeaders()
  });
  const body = await res.json();
  return body; // { success, message, statusCode }
}

// ===== 4. Đánh dấu TẤT CẢ đã đọc (RECOMMENDED) =====
async function markAllAsRead() {
  const res = await fetch(`${API_BASE}/announcements/read-all`, {
    method: 'POST',
    headers: getHeaders()
  });
  const body = await res.json();
  if (!body.success) throw new Error(body.message);
  return body; // { success, message, statusCode, markedCount }
}
```

### 7.6 Code mẫu: React Component

```jsx
import { useState, useEffect, useCallback } from 'react';

// ====== Newsfeed Page ======
function NewsfeedPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasUnread, setHasUnread] = useState(false);
  const [marking, setMarking] = useState(false);

  const token = localStorage.getItem('accessToken');

  const loadFeed = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const result = await fetchAnnouncements({ page: pageNum, pageSize: 10 });
      setAnnouncements(result.data);
      setTotalPages(result.totalPages);
      // Chỉ check unread khi có token (authenticated)
      if (token) {
        setHasUnread(result.data.some(a => a.isRead === false));
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFeed(page);
  }, [page, loadFeed]);

  // ===== Khi user nhấn "Đánh dấu tất cả đã đọc" =====
  const handleMarkAllRead = async () => {
    if (!token) {
      alert('Vui lòng đăng nhập để đánh dấu đã đọc');
      return;
    }

    setMarking(true);
    try {
      const result = await markAllAsRead();

      // Cách 1: Refresh toàn bộ feed để cập nhật isRead
      await loadFeed(page);

      // Cách 2: Cập nhật local state (nhanh hơn, không cần re-fetch)
      // setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
      // setHasUnread(false);

      if (result.markedCount > 0) {
        alert(`Đã đánh dấu ${result.markedCount} thông báo là đã đọc`);
      } else {
        alert('Tất cả thông báo đã được đọc trước đó');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Thông báo</h1>
        {token && hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: marking ? 'not-allowed' : 'pointer',
              opacity: marking ? 0.6 : 1
            }}
          >
            {marking ? 'Đang xử lý...' : '✓ Đánh dấu tất cả đã đọc'}
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
          Chưa có thông báo nào
        </div>
      ) : (
        <>
          {/* Danh sách */}
          {announcements.map(item => (
            <AnnouncementCard
              key={item.id}
              data={item}
              onRead={(id) => {
                // Cập nhật local state khi đánh dấu 1 item đã đọc
                setAnnouncements(prev =>
                  prev.map(a => a.id === id ? { ...a, isRead: true } : a)
                );
                // Kiểm tra lại hasUnread
                setHasUnread(prev => {
                  const otherUnread = announcements.some(a => a.id !== id && a.isRead === false);
                  return otherUnread;
                });
              }}
            />
          ))}

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
              style={paginationBtnStyle(page <= 1)}
            >
              ◀
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              style={paginationBtnStyle(page >= totalPages)}
            >
              ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ====== Announcement Card ======
function AnnouncementCard({ data, onRead }) {
  // null → false (anonymous user → treat as unread)
  const isRead = data.isRead ?? false;

  const priorityConfig = {
    low:      { color: '#9CA3AF', label: 'LOW' },
    normal:   { color: '#3B82F6', label: 'NORMAL' },
    high:     { color: '#F97316', label: 'HIGH' },
    urgent:   { color: '#EF4444', label: 'URGENT' }
  };
  const priority = priorityConfig[data.priority] || priorityConfig.normal;

  const cardStyle = {
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    opacity: isRead ? 0.7 : 1,
    transition: 'opacity 0.2s',
    cursor: 'pointer'
  };

  return (
    <div style={cardStyle}>
      {/* Priority + Unread badge row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{
          backgroundColor: priority.color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {priority.label}
        </span>

        {!isRead && (
          <span style={{
            backgroundColor: '#EF4444',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            CHƯA ĐỌC
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}
        onClick={() => onRead(data.id)}
      >
        {data.title}
      </h3>

      {/* Summary */}
      <p style={{ color: '#6B7280', margin: '0 0 12px 0', fontSize: '14px', lineHeight: 1.5 }}>
        {data.summary}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '16px', color: '#9CA3AF', fontSize: '13px' }}>
        <span>👁 {data.viewCount} lượt xem</span>
        <span>🕐 {formatTimeAgo(data.publishedAt)}</span>
      </div>
    </div>
  );
}

// ====== Detail Page ======
function AnnouncementDetailPage({ id }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchAnnouncementDetail(id)
      .then(data => {
        setDetail(data);
        setLoading(false);
        // Tự động đánh dấu đã đọc khi vào detail
        if (token) {
          markAsRead(id);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ padding: '16px' }}>Đang tải...</div>;
  if (!detail) return <div style={{ padding: '16px' }}>Không tìm thấy thông báo</div>;

  const priorityConfig = {
    low:      { color: '#9CA3AF', label: 'LOW' },
    normal:   { color: '#3B82F6', label: 'NORMAL' },
    high:     { color: '#F97316', label: 'HIGH' },
    urgent:   { color: '#EF4444', label: 'URGENT' }
  };
  const priority = priorityConfig[detail.priority] || priorityConfig.normal;

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
        <span style={{
          backgroundColor: priority.color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          marginRight: '8px'
        }}>
          {priority.label}
        </span>
        {detail.title}
      </h1>

      {/* Meta */}
      <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
        📅 {formatDate(detail.publishedAt)} │ 👤 {detail.authorName}
      </div>

      {/* Image */}
      {detail.imageUrl && (
        <img
          src={detail.imageUrl}
          alt={detail.title}
          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px' }}
        />
      )}

      {/* Content */}
      <div
        dangerouslySetInnerHTML={{ __html: detail.content }}
        style={{ lineHeight: 1.8, marginBottom: '24px' }}
      />

      {/* Attachments */}
      {detail.attachments && (() => {
        let attachments = [];
        try { attachments = JSON.parse(detail.attachments); } catch { attachments = []; }
        if (attachments.length === 0) return null;
        return (
          <div style={{ marginBottom: '24px' }}>
            <strong>📎 File đính kèm:</strong>
            <ul>
              {attachments.map((url, i) => (
                <li key={i}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {/* Stats */}
      <div style={{ color: '#9CA3AF', fontSize: '14px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
        👁 {detail.viewCount} lượt xem │ 📖 {detail.readCount} lượt đọc
      </div>
    </div>
  );
}

// ====== Helpers ======
function paginationBtnStyle(disabled) {
  return {
    padding: '6px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    backgroundColor: disabled ? '#F3F4F6' : 'white',
    color: disabled ? '#9CA3AF' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer'
  };
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(dateStr);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
}
```

---

## 8. State Management

### Recommended State Structure (Redux / Zustand / Context)

```javascript
// ===== Newsfeed State =====
const newsfeedState = {
  announcements: [],     // Danh sách thông báo hiện tại
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  filters: {
    priority: null,     // 'low' | 'normal' | 'high' | 'urgent' | null
    startDate: null,
    endDate: null,
    search: ''
  },
  hasUnread: false,     // Có thông báo chưa đọc không?
  isLoading: false
};
```

### Cách cập nhật read status

```
Khi mark-all-read thành công (markedCount > 0):
  1. API trả về markedCount
  2. Refresh feed: GET /announcements → tất cả isRead sẽ là true
  3. setHasUnread(false)

Khi vào detail:
  1. Gọi markAsRead(id)
  2. Cập nhật local state:
     announcements.map(a => a.id === id ? { ...a, isRead: true } : a)
  3. Kiểm tra lại hasUnread: còn item nào isRead === false không?

Khi gọi mark-all-read lần 2 (markedCount = 0):
  → Không cần refresh (đã đọc hết rồi)
```

---

## 9. Performance Tips

### 9.1 Luôn dùng `POST /read-all` thay vì gọi từng cái

```
❌ SAI:  Gọi mark-read cho từng announcement
        → 10 requests, potential race condition, chậm

✅ ĐÚNG: Gọi mark-all-read 1 lần
        → 1 request, atomic, idempotent, nhanh
```

### 9.2 Debounce search

```javascript
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
  return () => clearTimeout(timer);
}, [searchQuery]);

useEffect(() => {
  if (debouncedQuery) {
    loadFeed(1, { search: debouncedQuery });
  }
}, [debouncedQuery]);
```

### 9.3 Cache feed data

```javascript
const CACHE_KEY = 'announcements_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

async function getCachedOrFetch(params) {
  const cacheKey = `${CACHE_KEY}_${JSON.stringify(params)}`;
  const raw = localStorage.getItem(cacheKey);

  if (raw) {
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data; // Trả cache nếu còn hạn
    }
  }

  const fresh = await fetchAnnouncements(params);
  localStorage.setItem(cacheKey, JSON.stringify({
    data: fresh,
    timestamp: Date.now()
  }));
  return fresh;
}
```

### 9.4 Pull-to-refresh trên mobile

```javascript
// React Native
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await loadFeed(1);
  setRefreshing(false);
}, [loadFeed]);

<FlatList
  refreshing={refreshing}
  onRefresh={onRefresh}
  data={announcements}
  // ...
/>
```

---

## Checklist cho Frontend Developer

- [ ] Gọi GET /announcements với Authorization header nếu có token
- [ ] Xử lý `isRead = null` cho anonymous user → treat as "chưa đọc"
- [ ] Hiển thị badge "CHƯA ĐỌC" cho item có `isRead === false`
- [ ] Làm mờ card (`opacity: 0.7`) cho item có `isRead === true`
- [ ] **Dùng `POST /read-all` thay vì gọi mark-read từng cái**
- [ ] Sau khi mark-all-read thành công, refresh hoặc cập nhật local state
- [ ] Gọi `markAsRead(id)` khi user vào trang detail
- [ ] Thêm loading state khi fetch API
- [ ] Xử lý error cases: 401 → redirect login, 404 → show not found, 500 → show error
- [ ] Pagination: disable button ở trang đầu/cuối
- [ ] Priority colors: low=xám, normal=xanh dương, high=cam, urgent=đỏ
- [ ] Format ngày giờ: convert UTC → Asia/Ho_Chi_Minh (UTC+7)
- [ ] Parse `attachments` (JSON string) → hiển thị danh sách links
- [ ] `content` trong detail page dùng `dangerouslySetInnerHTML` (backend trả HTML)
- [ ] Debounce search input (500ms)
- [ ] Pull-to-refresh trên mobile
- [ ] Infinite scroll thay pagination (optional, tùy UX)
