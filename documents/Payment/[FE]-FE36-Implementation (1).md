# FE-36: Upgrade / Downgrade Subscription - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Cho phep user nang cap (upgrade) len plan tra phi thong qua PayOS hoac ha cap (downgrade) ve Free plan.
**Nghiep vu:**
- Upgrade (PREMIUM/MONITOR): Tao payment link qua PayOS -> redirect user den trang thanh toan -> user thanh toan qua VietQR -> he thong nhan webhook -> kich hoat subscription.
- Downgrade (FREE): Goi truc tiep endpoint subscribe voi planCode="FREE", khong can thanh toan.

---

## 2. Business Flow

### 2.1. Upgrade Flow (Paid Plans)

```
+-------------------+
| User click        |
| "Upgrade" button  |
+--------+----------+
         |
         v
+-------------------+
| POST /api/v1/     |
| payment/create    |
| (planCode,        |
|  durationMonths,  |
|  returnUrl,       |
|  cancelUrl)       |
+--------+----------+
         |
         v
+-------------------+
| Nhan paymentUrl   |
| + orderCode       |
+--------+----------+
         |
         v
+-------------------+
| window.location = |
| paymentUrl        |
| (redirect to      |
|  PayOS checkout)  |
+--------+----------+
         |
    +----+----+
    |         |
  Paid     Cancel
    |         |
    v         v
+--------+ +----------+
| Return | | Cancel   |
| URL    | | URL      |
| /pay-  | | /pay-    |
| ment/  | | ment/    |
| success| | cancel   |
+---+----+ +----+-----+
    |            |
    v            v
+--------+  +----------+
| Poll   |  | Hien thi |
| GET    |  | "Payment |
| status |  | cancelled"|
| until  |  +----------+
| "paid" |
+---+----+
    |
    v
+-------------------+
| Hien thi          |
| "Upgrade success!"|
| Redirect to Plans |
+-------------------+
```

### 2.2. Downgrade Flow (Free Plan)

```
+---------------------+
| User click          |
| "Downgrade to Free" |
+---------+-----------+
          |
          v
+---------------------+
| Hien thi confirm    |
| dialog: "Ban se mat |
| cac tinh nang..."   |
+---------+-----------+
          |
     +----+----+
     |         |
   Confirm   Cancel
     |         |
     v         v
+---------+ +--------+
| POST    | | Dong   |
| /sub-   | | dialog |
| scribe  | +--------+
| FREE    |
+----+----+
     |
     v
+---------+----------+
| Subscription       |
| updated to Free    |
| Redirect to Plans  |
+--------------------+
```

---

## 3. API Integration

### 3.1. Create Payment Link (Upgrade)
- **Method:** POST
- **URL:** `/api/v1/payment/create`
- **Auth:** Bearer Token (User role)
- **Request Body:**
  ```json
  {
    "planCode": "PREMIUM",
    "durationMonths": 1,
    "returnUrl": "http://localhost:3000/payment/success",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }
  ```
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data.paymentUrl` (string) - URL PayOS checkout
  - `data.orderCode` (number - long) - Ma don hang de truy van trang thai

### 3.2. Get Payment Status (Polling)
- **Method:** GET
- **URL:** `/api/v1/payment/status/{orderCode}`
- **Auth:** Bearer Token (User role)
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data` (SubscriptionPaymentDto):
    - `id` (GUID)
    - `orderCode` (long)
    - `planName` (string)
    - `planCode` (string)
    - `amount` (number)
    - `currency` (string - "VND")
    - `paymentMethod` (string)
    - `status` (string - "pending", "paid", "cancelled", "failed")
    - `durationMonths` (number)
    - `description` (string | null)
    - `paidAt` (ISO date | null)
    - `createdAt` (ISO date)

### 3.3. Subscribe to Free Plan (Downgrade)
- **Method:** POST
- **URL:** `/api/v1/plan/subscription/subscribe`
- **Auth:** Bearer Token (User role)
- **Request Body:**
  ```json
  {
    "planCode": "FREE",
    "durationMonths": 0
  }
  ```
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `subscription` (object):
    - `subscriptionId` (GUID)
    - `planCode` (string)
    - `planName` (string)
    - `tier` (string)
    - `startDate` (ISO date)
    - `endDate` (ISO date | null)
    - `status` (string)

### 3.4. PayOS Webhook (Backend Only)
- **Method:** POST
- **URL:** `/api/v1/payment/webhook/payos`
- **Auth:** AllowAnonymous (PayOS server-to-server)
- **Note:** Frontend KHONG goi endpoint nay. Day la callback tu PayOS server den backend khi thanh toan hoan tat hoac that bai.

---

## 4. UI Components

### 4.1. Plan Selection (on Plans Page)
- Button "Upgrade" tren moi pricing card (tu FE-35)
- Khi click -> chon duration (1 thang / 3 thang / 6 thang / 12 thang)
- Hien thi tong gia dua tren duration

### 4.2. Duration Selection Modal
- Radio buttons hoac dropdown: 1 / 3 / 6 / 12 thang
- Hien thi gia tung ky han
- Button "Proceed to Payment"

### 4.3. Payment Processing Page (`/payment/processing`)
- Loading spinner voi message "Dang chuyen huong den cong thanh toan..."
- Timeout: neu khong redirect trong 5s, hien thi loi

### 4.4. Payment Success Page (`/payment/success`)
- Nhan `orderCode` tu query params (returnUrl)
- Polling `GET /api/v1/payment/status/{orderCode}` moi 2-3 giay
- Hien thi trang thai:
  - Spinner + "Dang xac nhan thanh toan..." khi status = "pending"
  - Check icon + "Thanh toan thanh cong! Subscription da duoc kich hoat." khi status = "paid"
  - Button "Xem plan cua toi" -> redirect ve `/plans`

### 4.5. Payment Cancel Page (`/payment/cancel`)
- Message "Thanh toan da bi huy"
- Button "Quay lai chon plan" -> redirect ve `/plans`

### 4.6. Downgrade Confirmation Dialog
- Warning icon
- Message: "Ban co chac muon ha cap ve Free? Ban se mat cac tinh nang sau: ..."
- Danh sach features se mat
- Button "Xac nhan ha cap" (danger style) va "Huy"

---

## 5. State Management

### 5.1. Payment State
```
paymentUrl: string | null       // URL redirect PayOS
orderCode: number | null        // Ma don hang
paymentStatus: string | null    // "pending" | "paid" | "cancelled" | "failed"
isCreatingPayment: boolean      // loading khi tao payment link
isPollingStatus: boolean        // dang poll trang thai
paymentError: string | null     // loi
```

### 5.2. Downgrade State
```
isDowngrading: boolean          // loading khi downgrade
downgradeError: string | null   // loi
showConfirmDialog: boolean      // hien thi confirm dialog
```

### 5.3. Polling Logic
```
- Bat dau poll khi user quay ve returnUrl
- Interval: 3 giay
- Max attempts: 60 (timeout sau 3 phut)
- Dung poll khi status != "pending"
- Cleanup interval khi component unmount
```

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Free plan rejected | 400 | Hien thi message, huong dan dung Downgrade |
| Plan khong ton tai | 404 | Hien thi "Plan khong ton tai", redirect ve Plans |
| Duration khong hop le | 400 | Hien thi validation error tren form |
| Unauthorized | 401 | Redirect ve Login |
| Payment not found | 404 | Hien thi "Khong tim thay thanh toan" |
| PayOS redirect fail | - | Timeout 5s, hien thi "Khong the ket noi PayOS", nut Retry |
| Polling timeout | - | Sau 3 phut, hien thi "Xac nhan dang xu ly, vui long kiem tra lai sau" |
| Network error | - | Hien thi toast "Loi ket noi", nut Retry |
| Downgrade fail | 400/500 | Hien thi error message trong dialog |
