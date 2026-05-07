# FE-36 – Payment (CreatePaymentLink) – API Update

> **Ngày cập nhật**: 2026-05-07
> **Thay đổi**: Thêm field `discountPercent` vào request tạo payment link
> **Endpoint bị ảnh hưởng**: `POST /api/v1/payment/create`

---

## 1. Thay đổi

Field `discountPercent` được thêm vào request body — **optional**, mặc định không giảm giá nếu bỏ trống.

---

## 2. Endpoint

### POST `/api/v1/payment/create`

- **Auth**: Bearer JWT (`User` policy)
- **Tags**: `Payment`, `FE-36`

---

### Request Body

```json
{
  "planCode": "PREMIUM",
  "durationMonths": 3,
  "returnUrl": "https://yourapp.com/payment/success",
  "cancelUrl": "https://yourapp.com/payment/cancel",
  "discountPercent": 20
}
```

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `planCode` | `string` | **Có** | Mã gói (vd: `"PREMIUM"`, `"MONITOR"`) |
| `durationMonths` | `integer` | **Có** | Số tháng (1–36) |
| `returnUrl` | `string` | Không | URL redirect khi thanh toán thành công |
| `cancelUrl` | `string` | Không | URL redirect khi huỷ thanh toán |
| `discountPercent` | `decimal` | **Không** | % giảm giá (0–100). Bỏ trống = không giảm |

> **Lưu ý**: `userId` được lấy tự động từ JWT claim — FE **không** cần gửi `userId` trong body.

---

### Công thức tính amount gửi PayOS

```
baseAmount  = plan.PriceMonth × durationMonths
finalAmount = baseAmount × (1 − discountPercent / 100)
```

**Ví dụ** — gói Premium `500,000 VND/tháng`, 3 tháng, discount 20%:

```
baseAmount  = 500,000 × 3 = 1,500,000 VND
finalAmount = 1,500,000 × (1 − 20/100) = 1,200,000 VND  ← số tiền PayOS charge
```

---

### Response 200 OK

```json
{
  "success": true,
  "message": "Payment link created successfully",
  "statusCode": 201,
  "data": {
    "paymentUrl": "https://pay.payos.vn/web/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "orderCode": 1746614400000
  }
}
```

| Field | Type | Mô tả |
|---|---|---|
| `data.paymentUrl` | `string` | URL checkout PayOS — redirect hoặc mở WebView |
| `data.orderCode` | `long` | Mã đơn hàng (timestamp ms) — dùng để query status sau |

---

### Response lỗi

| HTTP | `statusCode` | Tình huống |
|---|---|---|
| 400 | 400 | `planCode` trống / `durationMonths` ngoài 1–36 / `discountPercent` ngoài 0–100 |
| 400 | 400 | Plan là Free (không cần thanh toán) |
| 401 | 401 | JWT không hợp lệ hoặc thiếu |
| 404 | 404 | `planCode` không tồn tại |
| 500 | 500 | Lỗi server / PayOS |

---

### Ví dụ lỗi validation (discountPercent = 110)

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400
}
```

---

## 3. Luồng tích hợp FE

```
1. FE gọi POST /api/v1/payment/create
       → body: { planCode, durationMonths, discountPercent? }

2. BE tính amount (đã trừ discount) → tạo link PayOS

3. FE nhận paymentUrl → redirect user sang PayOS checkout

4. User hoàn tất / huỷ → PayOS redirect về returnUrl / cancelUrl

5. FE gọi GET /api/v1/payment/status/{orderCode}
       → kiểm tra trạng thái thanh toán
```

---

## 4. Không thay đổi

- Response shape giữ nguyên — FE không cần sửa phần parse response.
- Webhook PayOS (`POST /api/v1/payment/webhook`) không bị ảnh hưởng.
- Các endpoint khác trong Payment group (`/status`, `/billing-history`) không thay đổi.
