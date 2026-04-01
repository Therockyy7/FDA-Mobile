# FE-40: Handle Subscription Disputes (Simple Complaint) - Frontend Implementation Guide

## 1. Tong quan
**Muc tieu:** Cho phep user gui complaint ve van de subscription/payment, va admin co the xem va xu ly (resolve/reject) cac complaint do.
**Nghiep vu:** User tao complaint voi subject va description (co the lien ket voi 1 payment). Admin xem tat ca complaints, loc theo status, va resolve hoac reject tung complaint. Status chuyen tu open -> resolved hoac open -> rejected (mot chieu, khong quay lai).

---

## 2. Business Flow

```
=== USER FLOW ===

+-------------------+
| User truy cap     |
| trang Complaints  |
+--------+----------+
         |
    +----+----+
    |         |
    v         v
+--------+ +-------------------+
| Xem    | | Tao Complaint moi |
| danh   | +--------+----------+
| sach   |          |
| cua    |          v
| minh   | +-------------------+
|        | | POST /api/v1/     |
| GET    | | complaints        |
| /api/  | | (subject, desc,   |
| v1/    | |  paymentId?)      |
| comp-  | +--------+----------+
| laints |          |
| /my    |          v
+--------+ +-------------------+
           | Hien thi thanh    |
           | cong, refresh list|
           +-------------------+

=== ADMIN FLOW ===

+-------------------+
| Admin truy cap    |
| trang Complaints  |
+--------+----------+
         |
         v
+-------------------+       +---------------------------+
| GET /api/v1/admin | ----> | Bang tat ca complaints    |
| /complaints       |       | (loc theo status)         |
| ?page=1&pageSize  |       +-------------+-------------+
| =10&status=open   |                     |
+-------------------+                     v
                            +---------------------------+
                            | Click "Resolve" tren 1    |
                            | complaint                 |
                            +-------------+-------------+
                                          |
                                          v
                            +---------------------------+
                            | Mo modal: nhap response,  |
                            | chon resolved/rejected    |
                            +-------------+-------------+
                                          |
                                          v
                            +---------------------------+
                            | PUT /api/v1/admin/        |
                            | complaints/{id}/resolve   |
                            +-------------+-------------+
                                          |
                                          v
                            +---------------------------+
                            | Refresh danh sach         |
                            +---------------------------+
```

---

## 3. API Integration

### 3.1. Create Complaint (User)
- **Method:** POST
- **URL:** `/api/v1/complaints`
- **Auth:** Bearer Token (User role)
- **Request Body:**
  - `paymentId` (string | null, optional) - GUID cua payment lien quan
  - `subject` (string, required) - Tieu de complaint
  - `description` (string, required) - Mo ta chi tiet
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data` (object):
    - `id` (string - GUID)
    - `subject` (string)
    - `description` (string)
    - `status` (string - "open")
    - `createdAt` (ISO 8601 date)

### 3.2. Get My Complaints (User)
- **Method:** GET
- **URL:** `/api/v1/complaints/my`
- **Auth:** Bearer Token (User role)
- **Request Body:** Khong co
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data` (array):
    - `id` (string - GUID)
    - `subject` (string)
    - `description` (string)
    - `status` (string - "open" | "resolved" | "rejected")
    - `adminResponse` (string | null)
    - `resolvedAt` (ISO 8601 date | null)
    - `createdAt` (ISO 8601 date)

### 3.3. Get All Complaints (Admin)
- **Method:** GET
- **URL:** `/api/v1/admin/complaints`
- **Auth:** Bearer Token (Admin role)
- **Query Params:**
  - `page` (number, default: 1)
  - `pageSize` (number, default: 10)
  - `status` (string, optional - "open", "resolved", "rejected")
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `totalCount` (number)
  - `data` (array):
    - `id` (string - GUID)
    - `userId` (string - GUID)
    - `userEmail` (string)
    - `userFullName` (string)
    - `subject` (string)
    - `description` (string)
    - `status` (string)
    - `adminResponse` (string | null)
    - `resolvedAt` (ISO 8601 date | null)
    - `createdAt` (ISO 8601 date)

### 3.4. Resolve Complaint (Admin)
- **Method:** PUT
- **URL:** `/api/v1/admin/complaints/{id}/resolve`
- **Auth:** Bearer Token (Admin role)
- **Request Body:**
  - `adminResponse` (string, required) - Phan hoi cua admin
  - `newStatus` (string, required) - "resolved" hoac "rejected"
- **Response:**
  - `success` (boolean)
  - `message` (string)
  - `statusCode` (number)
  - `data` (object):
    - `id` (string - GUID)
    - `status` (string)
    - `adminResponse` (string)
    - `resolvedAt` (ISO 8601 date)

---

## 4. UI Components

### 4.1. User - Complaint Submission Form

- **Vi tri:** Trang Complaints cua user hoac modal
- **Fields:**
  - Subject (text input, required, max 200 ky tu)
  - Description (textarea, required, max 2000 ky tu)
  - Related Payment (dropdown, optional) - Danh sach payments cua user de lien ket
- **Buttons:** "Submit Complaint", "Cancel"
- **Sau khi submit thanh cong:** Hien thi toast "Complaint submitted successfully", refresh danh sach

### 4.2. User - My Complaints List

- **Layout:** Danh sach cards hoac table
- **Moi item hien thi:**
  - Subject (bold)
  - Description (truncated, expand on click)
  - Status badge:
    - `open` - Mau vang (#EAB308) - "Open"
    - `resolved` - Mau xanh la (#22C55E) - "Resolved"
    - `rejected` - Mau do (#EF4444) - "Rejected"
  - Created date
  - Admin response (hien thi neu co, voi label "Admin Response:")
  - Resolved date (neu co)

### 4.3. Admin - All Complaints Table

- **Cot:**
  | # | Column | Field | Mota |
  |---|--------|-------|------|
  | 1 | User | `userFullName` + `userEmail` | Thong tin user |
  | 2 | Subject | `subject` | Tieu de complaint |
  | 3 | Status | `status` | Badge mau |
  | 4 | Created | `createdAt` | Ngay tao |
  | 5 | Actions | - | Nut "Resolve" (chi cho status = open) |

- **Filter:** Dropdown status (All / Open / Resolved / Rejected)
- **Pagination:** Page navigation o cuoi bang
- **Click row:** Expand de xem chi tiet description va admin response

### 4.4. Admin - Resolve Modal

- **Hien thi khi:** Admin click "Resolve" tren 1 complaint
- **Noi dung modal:**
  - Thong tin complaint (subject, description, user info) - readonly
  - Admin Response (textarea, required)
  - Status selection: 2 radio buttons
    - "Resolve" (mark as resolved)
    - "Reject" (mark as rejected)
  - Buttons: "Submit", "Cancel"

---

## 5. State Management

### 5.1. User - Complaints State
```
myComplaints: Complaint[]
isLoadingComplaints: boolean
complaintsError: string | null
```

### 5.2. User - Form State
```
complaintForm: {
  paymentId: string | null
  subject: string
  description: string
}
isSubmitting: boolean
formErrors: Record<string, string[]>
```

### 5.3. Admin - Complaints State
```
allComplaints: AdminComplaint[]
totalCount: number
currentPage: number
pageSize: number
statusFilter: 'all' | 'open' | 'resolved' | 'rejected'
isLoadingComplaints: boolean
complaintsError: string | null
```

### 5.4. Admin - Resolve State
```
selectedComplaint: AdminComplaint | null
resolveForm: {
  adminResponse: string
  newStatus: 'resolved' | 'rejected'
}
isResolving: boolean
resolveError: string | null
```

### 5.5. Data Flow (User)
1. Component mount -> goi `GET /api/v1/complaints/my`
2. Render danh sach complaints
3. User click "New Complaint" -> hien thi form
4. Submit -> goi `POST /api/v1/complaints` -> refresh list

### 5.6. Data Flow (Admin)
1. Component mount -> goi `GET /api/v1/admin/complaints?page=1&pageSize=10`
2. Render table
3. Admin thay doi filter -> goi lai API voi `status` param
4. Admin click "Resolve" -> mo modal -> submit -> goi `PUT /api/v1/admin/complaints/{id}/resolve` -> refresh list

---

## 6. Error Handling

| Loi | HTTP Code | Xu ly |
|-----|-----------|-------|
| Tao complaint - validation error | 400 | Hien thi loi duoi tung field |
| Tao complaint - unauthorized | 401 | Redirect ve login |
| Load complaints that bai | 500 | Hien thi error message voi nut "Retry" |
| Resolve complaint - not found | 404 | Toast "Complaint not found", refresh list |
| Resolve complaint - invalid status | 400 | Hien thi validation error trong modal |
| Admin - forbidden | 403 | Redirect ve trang chinh, "Access denied" |
| Token het han | 401 | Refresh token hoac redirect ve login |
| Network error | - | Toast "Network error. Please try again." |
