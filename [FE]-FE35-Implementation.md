# FE-35: View Subscription Plans - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Hien thi danh sach cac goi subscription (Free, Premium, Monitor) de user co the xem va so sanh cac tinh nang, gia ca.
**Nghiep vu:** User (ke ca chua dang nhap) co the xem tat ca cac plan dang active. Neu da dang nhap, plan hien tai cua user se duoc highlight. Cac nut "Upgrade" / "Downgrade" hien thi tuy thuoc vao subscription hien tai.

---

## 2. Business Flow

```
+------------------+
| User truy cap    |
| trang Plans      |
+--------+---------+
         |
         v
+------------------+       +--------------------+
| GET /api/v1/plans| ----> | Hien thi danh sach |
| (AllowAnonymous) |       | pricing cards      |
+------------------+       +--------+-----------+
                                    |
                           +--------+---------+
                           | User da dang nhap?|
                           +--------+---------+
                             /             \
                           Yes              No
                           /                 \
              +------------+-----+     +------+--------+
              | GET /api/v1/plan |     | Chi hien thi  |
              | /subscription    |     | plans, khong   |
              | /current         |     | highlight      |
              +--------+---------+     +---------------+
                       |
                       v
              +------------------+
              | Highlight plan   |
              | hien tai, hien   |
              | thi Upgrade /    |
              | Downgrade buttons|
              +------------------+
```

---

## 3. API Integration

### 3.1. Get Pricing Plans
- **Method:** GET
- **URL:** `/api/v1/plans`
- **Auth:** AllowAnonymous (khong can token)
- **Request Body:** Khong co
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data` (array of plan objects):
    - `id` (string - GUID)
    - `code` (string - "FREE", "PREMIUM", "MONITOR")
    - `name` (string)
    - `description` (string)
    - `priceMonth` (number - VND)
    - `priceYear` (number - VND)
    - `tier` (string)
    - `isActive` (boolean)
    - `sortOrder` (number)
    - `features` (array):
      - `featureKey` (string)
      - `featureName` (string)
      - `featureValue` (string)
      - `description` (string | null)

### 3.2. Get User Subscription (Current Plan)
- **Method:** GET
- **URL:** `/api/v1/plan/subscription/current`
- **Auth:** Bearer Token (User role)
- **Request Body:** Khong co
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `subscription` (object | null):
    - `tier` (string - "Free", "Premium", "Monitor")
    - `tierCode` (string - "FREE", "PREMIUM", "MONITOR")
    - `planName` (string)
    - `description` (string)
    - `priceMonth` (number)
    - `priceYear` (number)
    - `startDate` (ISO 8601 date)
    - `endDate` (ISO 8601 date | null)
    - `status` (string - "active", "cancelled", "expired")
    - `availableChannels` (string[])
    - `dispatchDelay` (object: `highPrioritySeconds`, `lowPrioritySeconds`)
    - `maxRetries` (number)

---

## 4. UI Components

### 4.1. Pricing Plans Page (`/plans` or `/pricing`)

- **Layout:** 3 pricing cards ngang hang (responsive: stack tren mobile)
- **Moi card bao gom:**
  - Ten plan (Free / Premium / Monitor)
  - Mo ta ngan
  - Gia hang thang va hang nam (toggle Monthly / Yearly)
  - Danh sach features (check icon cho tinh nang co, dash cho khong co)
  - Badge "Current Plan" neu la plan hien tai cua user
  - Button:
    - "Current Plan" (disabled) - neu user dang dung plan nay
    - "Upgrade" - neu plan cao hon plan hien tai
    - "Downgrade" - neu plan thap hon plan hien tai
    - "Get Started" - neu user chua dang nhap

### 4.2. Feature Comparison Table (optional, below cards)

- Bang so sanh chi tiet tat ca features giua cac plan
- Cot: Feature Name | Free | Premium | Monitor
- Hang: max_areas, sms_alerts, email_alerts, dispatch_delay, max_retries, v.v.

### 4.3. Billing Toggle

- Switch / toggle giua "Monthly" va "Yearly" pricing
- Hien thi "Save X%" khi chon Yearly

---

## 5. State Management

### 5.1. Plans State
```
plans: PricingPlan[]        // danh sach plans tu API
isLoadingPlans: boolean     // trang thai loading khi fetch plans
plansError: string | null   // loi khi fetch plans
```

### 5.2. Current Subscription State
```
currentSubscription: UserSubscription | null  // subscription hien tai
isLoadingSubscription: boolean                // loading khi fetch subscription
subscriptionError: string | null              // loi khi fetch subscription
```

### 5.3. UI State
```
billingCycle: 'monthly' | 'yearly'  // toggle Monthly/Yearly
```

### 5.4. Data Flow
1. Component mount -> goi `GET /api/v1/plans`
2. Neu user da dang nhap -> dong thoi goi `GET /api/v1/plan/subscription/current`
3. Render cards voi data plans
4. Neu co subscription -> highlight card tuong ung, update button labels

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Khong load duoc plans | 500 / network error | Hien thi error message voi nut "Retry" |
| Khong load duoc subscription | 401 | Im lang (user chua dang nhap), khong highlight plan nao |
| Khong load duoc subscription | 500 | Hien thi warning nho, van hien thi plans binh thuong |
| Plans rong | 200 (empty array) | Hien thi "No plans available at this time" |
| Token het han | 401 | Redirect ve trang login hoac refresh token |
