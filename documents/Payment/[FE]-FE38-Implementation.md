# FE-38: View Subscription Status & Billing History - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Cho phep user xem trang thai subscription hien tai va lich su thanh toan cua minh, bao gom thong tin plan, ngay bat dau/ket thuc, va danh sach cac giao dich da thuc hien.
**Nghiep vu:** User dang nhap co the xem subscription hien tai (plan name, status, thoi han) va lich su billing voi phan trang. Trang thai thanh toan duoc hien thi bang badge mau (paid/pending/cancelled).

---

## 2. Business Flow

```
+------------------+
| User truy cap    |
| trang Billing    |
+--------+---------+
         |
         v
+-------------------+       +------------------------+
| GET /api/v1/plan  | ----> | Hien thi Subscription  |
| /subscription     |       | Status Card            |
| /current          |       +------------------------+
+-------------------+
         |
         v (dong thoi)
+-------------------+       +------------------------+
| GET /api/v1/      | ----> | Hien thi Billing       |
| payment/history   |       | History Table          |
| ?page=1&pageSize  |       +----------+-------------+
| =10               |                  |
+-------------------+                  v
                            +------------------------+
                            | User chuyen trang      |
                            | (pagination)           |
                            +----------+-------------+
                                       |
                                       v
                            +------------------------+
                            | GET /api/v1/payment/   |
                            | history?page=N         |
                            +------------------------+
```

---

## 3. API Integration

### 3.1. Get Current Subscription
- **Method:** GET
- **URL:** `/api/v1/plan/subscription/current`
- **Auth:** Bearer Token (User role)
- **Request Body:** Khong co
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `subscription` (object):
    - `tier` (string - "Free", "Premium", "Monitor")
    - `tierCode` (string - "FREE", "PREMIUM", "MONITOR")
    - `planName` (string)
    - `description` (string)
    - `priceMonth` (number - VND)
    - `priceYear` (number - VND)
    - `startDate` (ISO 8601 date)
    - `endDate` (ISO 8601 date | null)
    - `status` (string - "active", "cancelled", "expired")
    - `availableChannels` (string[])
    - `dispatchDelay` (object: `highPrioritySeconds`, `lowPrioritySeconds`)
    - `maxRetries` (number)

### 3.2. Get Billing History
- **Method:** GET
- **URL:** `/api/v1/payment/history`
- **Auth:** Bearer Token (User role)
- **Query Params:**
  - `page` (number, default: 1)
  - `pageSize` (number, default: 10)
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `totalCount` (number)
  - `data` (array):
    - `id` (string - GUID)
    - `orderCode` (number)
    - `planName` (string)
    - `planCode` (string)
    - `amount` (number - VND)
    - `currency` (string - "VND")
    - `paymentMethod` (string - "PAYOS")
    - `status` (string - "paid", "pending", "cancelled")
    - `durationMonths` (number)
    - `description` (string)
    - `paidAt` (ISO 8601 date | null)
    - `createdAt` (ISO 8601 date)

---

## 4. UI Components

### 4.1. Subscription Status Card

- **Vi tri:** Phan tren cung cua trang Billing / Subscription
- **Noi dung:**
  - Ten plan hien tai (vd: "Premium Plan")
  - Status badge: `active` (xanh la), `cancelled` (do), `expired` (xam)
  - Ngay bat dau (`startDate`) va ngay ket thuc (`endDate`)
  - Gia thang / nam
  - Danh sach kenh thong bao kha dung (`availableChannels`)
  - Nut "Manage Subscription" dan den trang upgrade/downgrade (FE-36)

### 4.2. Billing History Table

- **Cot:**
  | # | Column | Field | Mota |
  |---|--------|-------|------|
  | 1 | Order Code | `orderCode` | Ma don hang |
  | 2 | Plan | `planName` | Ten goi |
  | 3 | Amount | `amount` + `currency` | So tien (format: 99.000 VND) |
  | 4 | Duration | `durationMonths` | Thoi han (vd: "1 thang") |
  | 5 | Status | `status` | Badge: paid (xanh), pending (vang), cancelled (do) |
  | 6 | Payment Date | `paidAt` or `createdAt` | Ngay thanh toan |

- **Pagination:** Hien thi o cuoi bang, cho phep chuyen trang

### 4.3. Status Badges

- `paid` - Mau xanh la (#22C55E) - "Paid"
- `pending` - Mau vang (#EAB308) - "Pending"
- `cancelled` - Mau do (#EF4444) - "Cancelled"

### 4.4. Empty State

- Khi khong co giao dich: Hien thi icon va text "No billing history yet"
- Nut "Subscribe Now" dan den trang plans (FE-35)

---

## 5. State Management

### 5.1. Subscription State
```
currentSubscription: UserSubscription | null
isLoadingSubscription: boolean
subscriptionError: string | null
```

### 5.2. Billing History State
```
billingHistory: PaymentRecord[]
totalCount: number
currentPage: number
pageSize: number
isLoadingHistory: boolean
historyError: string | null
```

### 5.3. Data Flow
1. Component mount -> dong thoi goi 2 API:
   - `GET /api/v1/plan/subscription/current`
   - `GET /api/v1/payment/history?page=1&pageSize=10`
2. Render Subscription Status Card voi data subscription
3. Render Billing History Table voi data payments
4. Khi user click pagination -> goi lai `GET /api/v1/payment/history?page=N&pageSize=10`
5. Update `billingHistory` va `currentPage`

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Khong load duoc subscription | 401 | Redirect ve trang login |
| Khong load duoc subscription | 500 | Hien thi error card voi nut "Retry" |
| Khong load duoc billing history | 401 | Redirect ve trang login |
| Khong load duoc billing history | 500 | Hien thi error message trong table voi nut "Retry" |
| Billing history rong | 200 (empty) | Hien thi empty state "No billing history yet" |
| Token het han | 401 | Refresh token hoac redirect ve login |
| Network error | - | Hien thi toast "Network error. Please try again." |
