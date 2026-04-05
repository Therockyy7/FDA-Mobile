# FE-37: Cancel Subscription - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Cho phep user huy subscription tra phi hien tai va tro ve Free tier.
**Nghiep vu:** User co subscription tra phi (Premium/Monitor) co the huy bat ky luc nao. Sau khi huy, user se tro ve Free plan ngay lap tuc va mat cac tinh nang cua plan tra phi. User dang o Free plan khong the huy (khong co gi de huy).

---

## 2. Business Flow

```
+---------------------+
| User vao trang      |
| Subscription /      |
| Account Settings    |
+--------+------------+
         |
         v
+---------------------+
| GET /api/v1/plan/   |
| subscription/current|
+--------+------------+
         |
    +----+----+
    |         |
  Free     Paid
  Plan     Plan
    |         |
    v         v
+--------+ +-------------------+
| Khong  | | Hien thi nut      |
| hien   | | "Cancel            |
| thi    | | Subscription"     |
| nut    | +--------+----------+
| cancel | |        |
+--------+         v
           +-------------------+
           | Hien thi confirm  |
           | dialog voi:       |
           | - Warning message |
           | - Features se mat |
           | - Input ly do huy |
           +--------+----------+
                    |
               +----+----+
               |         |
            Confirm    Cancel
               |         |
               v         v
     +---------+--+ +--------+
     | DELETE      | | Dong   |
     | /api/v1/    | | dialog |
     | plan/sub-   | +--------+
     | scription/  |
     | cancel      |
     +------+------+
            |
       +----+----+
       |         |
    Success    Error
       |         |
       v         v
  +---------+ +----------+
  | Toast:  | | Hien thi |
  | "Da huy | | error    |
  | thanh   | | message  |
  | cong"   | +----------+
  | Redirect|
  | -> Plans|
  +---------+
```

---

## 3. API Integration

### 3.1. Cancel Subscription
- **Method:** DELETE
- **URL:** `/api/v1/plan/subscription/cancel`
- **Auth:** Bearer Token (User role)
- **Request Body:**
  ```json
  {
    "cancelReason": "Too expensive"
  }
  ```
  - `cancelReason` (string, optional) - Ly do huy subscription
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `cancelledSubscription` (object | null):
    - `subscriptionId` (GUID)
    - `planName` (string)
    - `previousTier` (string - "Premium", "Monitor")
    - `cancelledAt` (ISO 8601 date)
    - `cancelReason` (string | null)

### 3.2. Get User Subscription (Verify after cancel)
- **Method:** GET
- **URL:** `/api/v1/plan/subscription/current`
- **Auth:** Bearer Token (User role)
- **Response:** (xem chi tiet tai FE-35 Implementation Guide)
  - `subscription.tier` se la `"Free"` sau khi huy thanh cong

---

## 4. UI Components

### 4.1. Cancel Subscription Button
- Vi tri: Trang Account Settings hoac Subscription Management
- Chi hien thi khi user dang co paid subscription (tierCode != "FREE")
- Style: Danger/destructive button (do hoac outline do)
- Text: "Cancel Subscription" hoac "Huy goi dang ky"

### 4.2. Cancel Confirmation Dialog (Modal)
- **Header:** "Huy goi dang ky?"
- **Warning message:** "Ban co chac chan muon huy goi {planName}? Thao tac nay se co hieu luc ngay lap tuc."
- **Features se mat (danh sach):**
  - "SMS alerts" (neu dang o Premium/Monitor)
  - "Email alerts"
  - "Unlimited monitored areas" (neu dang o Monitor)
  - "Priority dispatch (0s delay)"
  - "Max retries: 3" -> "Max retries: 1"
- **Cancel reason input:**
  - Textarea (optional)
  - Placeholder: "Cho chung toi biet ly do ban huy (khong bat buoc)"
- **Buttons:**
  - "Xac nhan huy" (danger button)
  - "Giu lai goi cua toi" (secondary/outline button)

### 4.3. Success State
- Toast notification: "Goi {planName} da duoc huy. Ban da chuyen ve Free plan."
- Hoac success page ngan voi thong tin:
  - Plan da huy
  - Thoi gian huy
  - Link quay ve trang Plans

### 4.4. Post-Cancel View
- Subscription info cap nhat thanh Free plan
- Cac tinh nang Premium/Monitor bi vo hieu hoa tren UI
- Hien thi banner/prompt "Upgrade lai de su dung day du tinh nang"

---

## 5. State Management

### 5.1. Cancel State
```
isCancelling: boolean              // loading khi dang goi API cancel
cancelError: string | null         // loi tu API
showCancelDialog: boolean          // hien thi confirm dialog
cancelReason: string               // ly do huy (input cua user)
cancelledSubscription: object|null // thong tin subscription da huy (tu response)
```

### 5.2. Data Flow
1. User click "Cancel Subscription" -> `showCancelDialog = true`
2. User nhap ly do (optional) -> `cancelReason = "..."`
3. User click "Xac nhan huy" -> `isCancelling = true`
4. Goi `DELETE /api/v1/plan/subscription/cancel`
5. Thanh cong:
   - `cancelledSubscription = response.cancelledSubscription`
   - Hien thi toast success
   - Goi lai `GET /api/v1/plan/subscription/current` de cap nhat state
   - Redirect ve trang Plans sau 2-3 giay
6. That bai:
   - `cancelError = response.message`
   - Giu dialog mo, hien thi error

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Da o Free plan | 400 | Hien thi "Ban dang o Free plan, khong co gi de huy" |
| Unauthorized | 401 | Redirect ve Login |
| Token het han | 401 | Refresh token va retry, hoac redirect Login |
| Server error | 500 | Hien thi "Co loi xay ra, vui long thu lai" voi nut Retry |
| Network error | - | Hien thi toast "Loi ket noi", nut Retry trong dialog |
