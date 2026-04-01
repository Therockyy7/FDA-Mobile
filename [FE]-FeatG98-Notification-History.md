# FE-98: Xem lịch sử thông báo ngập lụt

> **API Endpoint**: `GET /api/v1/notifications/history`
> **Mô tả**: Lấy danh sách thông báo ngập lụt đã gửi thành công cho người dùng, có phân trang và lọc theo ngày.

---

## 1. Authentication

API yêu cầu JWT token hợp lệ trong header:

```
Authorization: Bearer <jwt_token>
```

Token được lấy từ API đăng nhập (`POST /api/v1/auth/login`).

---

## 2. Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | **Có** | Bearer JWT token |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `StartDate` | DateTime (ISO 8601) | Không | - | Lọc thông báo từ ngày này |
| `EndDate` | DateTime (ISO 8601) | Không | - | Lọc thông báo đến ngày này |
| `PageNumber` | int | Không | 1 | Số trang |
| `PageSize` | int | Không | 20 | Số thông báo mỗi trang (tối đa 100) |

### Ví dụ Request

```
GET /api/v1/notifications/history?PageNumber=1&PageSize=20
GET /api/v1/notifications/history?StartDate=2026-03-01T00:00:00Z&EndDate=2026-03-22T23:59:59Z
```

---

## 3. Response

### Success (HTTP 200)

```json
{
  "success": true,
  "message": "Retrieved 20 notifications",
  "notifications": [
    {
      "alertId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "stationId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "stationName": "Trạm Giám Sát Đường Trần Phú",
      "stationCode": "TP001",
      "severity": "critical",
      "severityName": "Nghiêm trọng",
      "waterLevel": 58.8,
      "alertMessage": "Mực nước vượt ngưỡng nghiêm trọng",
      "triggeredAt": "2026-03-22T10:00:00Z",
      "notificationId": "c3d4e5f6-a7b8-9012-cdef-345678901234",
      "title": "[FloodGuard] NGHIÊM TRỌNG: Ngập lụt tại khu vực Nhà",
      "content": "⚠️ Ngập lụt NGHIÊM TRỌNG tại khu vực Nhà\n\n🌊 Mực nước cao nhất: 58.8cm\n📊 Trạng thái: 2 nghiêm trọng, 0 cảnh báo\n\n📍 Các điểm ngập:\n  - Trạm Giám Sát Đường Trần Phú\n\nSẵn sàng sơ tán ngay.",
      "sentAt": "2026-03-22T10:15:00Z",
      "deliveredAt": "2026-03-22T10:15:05Z",
      "createdAt": "2026-03-22T10:15:00Z"
    }
  ],
  "totalCount": 150,
  "pageNumber": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

### Error (HTTP 401 - Unauthorized)

```json
{
  "success": false,
  "message": "Invalid user authentication"
}
```

---

## 4. Response Fields

### Root Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | bool | Trạng thái thành công |
| `message` | string | Thông điệp mô tả |
| `notifications` | array | Danh sách thông báo |
| `totalCount` | int | Tổng số thông báo |
| `pageNumber` | int | Trang hiện tại |
| `pageSize` | int | Số thông báo mỗi trang |
| `totalPages` | int | Tổng số trang |

### Notification Item Fields

| Field | Type | Description |
|-------|------|-------------|
| `alertId` | Guid | ID của alert |
| `stationId` | Guid | ID của trạm |
| `stationName` | string | Tên trạm giám sát |
| `stationCode` | string | Mã trạm |
| `severity` | string | Mức độ nghiêm trọng (critical, warning, caution, info) |
| `severityName` | string | Tên mức độ bằng tiếng Việt |
| `waterLevel` | decimal | Mực nước (cm) |
| `alertMessage` | string | Nội dung cảnh báo |
| `triggeredAt` | DateTime | Thời gian alert được kích hoạt |
| `notificationId` | Guid | ID của notification đã gửi |
| `title` | string | Tiêu đề thông báo |
| `content` | string | Nội dung thông báo đầy đủ |
| `sentAt` | DateTime | Thời gian gửi thành công |
| `deliveredAt` | DateTime | Thời gian được nhận (nếu có) |
| `createdAt` | DateTime | Thời gian tạo notification log |

### Severity Values

| severity | severityName | Màu gợi ý |
|----------|-------------|------------|
| `critical` | Nghiêm trọng | Đỏ |
| `warning` | Cảnh báo | Cam |
| `caution` | Cảnh báo nhẹ | Vàng |
| `info` | Thông tin | Xanh dương |

---

## 5. Ví dụ sử dụng

### JavaScript / TypeScript

```typescript
interface NotificationHistoryRequest {
  StartDate?: string; // ISO 8601
  EndDate?: string;   // ISO 8601
  PageNumber?: number;
  PageSize?: number;
}

interface NotificationItem {
  alertId: string;
  stationId: string;
  stationName: string;
  stationCode: string;
  severity: string;
  severityName: string;
  waterLevel: number;
  alertMessage: string;
  triggeredAt: string;
  notificationId: string;
  title: string;
  content: string;
  sentAt: string;
  deliveredAt: string | null;
  createdAt: string;
}

interface NotificationHistoryResponse {
  success: boolean;
  message: string;
  notifications: NotificationItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

async function getNotificationHistory(params: NotificationHistoryRequest): Promise<NotificationHistoryResponse> {
  const token = localStorage.getItem('accessToken'); // Hoặc nơi lưu token của bạn

  const queryParams = new URLSearchParams();
  if (params.StartDate) queryParams.set('StartDate', params.StartDate);
  if (params.EndDate) queryParams.set('EndDate', params.EndDate);
  if (params.PageNumber) queryParams.set('PageNumber', params.PageNumber.toString());
  if (params.PageSize) queryParams.set('PageSize', params.PageSize.toString());

  const response = await fetch(`/api/v1/notifications/history?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification history');
  }

  return response.json();
}

// Lấy trang đầu tiên
const result = await getNotificationHistory({ PageNumber: 1, PageSize: 20 });
console.log(`Tổng: ${result.totalCount} thông báo, ${result.totalPages} trang`);
```

### React Example

```tsx
const NotificationHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async (pageNumber: number) => {
    setLoading(true);
    try {
      const result = await getNotificationHistory({ PageNumber: pageNumber, PageSize: 20 });
      setNotifications(result.notifications);
      setTotalPages(result.totalPages);
      setPage(result.pageNumber);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'caution': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          {notifications.map((notification) => (
            <div key={notification.notificationId} className="notification-card">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-white rounded ${getSeverityColor(notification.severity)}`}>
                  {notification.severityName}
                </span>
                <span className="font-bold">{notification.stationName}</span>
              </div>
              <h3>{notification.title}</h3>
              <p>{notification.content}</p>
              <p>Mực nước: {notification.waterLevel}cm</p>
              <p>Gửi lúc: {new Date(notification.sentAt).toLocaleString('vi-VN')}</p>
            </div>
          ))}

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => fetchNotifications(page - 1)}>
              Trang trước
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => fetchNotifications(page + 1)}>
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## 6. Lưu ý quan trọng

1. **Không trùng lặp**: Mỗi alert chỉ hiển thị **1 thông báo duy nhất**, even khi alert đó được gửi qua nhiều kênh (Push, InApp, Email). Kênh ưu tiên: Push > InApp > Email > SMS.

2. **Chỉ thông báo thành công**: API chỉ trả về các thông báo đã gửi thành công (`sent` hoặc `delivered`). Các thông báo đang chờ, thất bại hoặc đang retry sẽ không hiển thị.

3. **Phân trang**: Mặc định 20 thông báo mỗi trang, tối đa 100.

4. **Thứ tự**: Thông báo được sắp xếp theo thời gian gần nhất trước (`createdAt DESC`).

5. **Filter theo ngày**: Sử dụng định dạng ISO 8601 (ví dụ: `2026-03-22T00:00:00Z`).

6. **Token hết hạn**: Nếu nhận HTTP 401, cần refresh token hoặc đăng nhập lại.
