# Auth Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Cần refactor (P2)

---

## 🗂️ Current Structure

```
features/auth/
├── components/
│   ├── LoginRequiredOverlay.tsx
│   ├── ModalChangePassword.tsx
│   ├── ModalConfirmLogout.tsx
│   ├── ModalVerifyOTP.tsx
│   └── sign-out-button.tsx
├── services/
│   └── auth.service.ts        (112 lines) ✅ Good
├── stores/
│   ├── auth.slice.ts          ⚠️ 410 lines  ← RTK slice + all thunks inline
│   └── hooks.ts               ✅ Selector pattern tốt
└── utils/
    ├── auth-errors.ts
    └── email-validation.ts
```

**Thiếu:** `hooks/`, `types/` (types defined inline), `lib/`

---

## ✅ Điểm tốt

- `stores/hooks.ts` — selector pattern rõ ràng
- `auth.service.ts` — size ổn (112L), có error handling
- `utils/` — có error class và validation

---

## 🔴 Priority Issues

### Issue #1: `auth.slice.ts` (410 lines) — Tất cả thunks trong 1 file

**Bao gồm:**
- Login (email/phone + password)
- OTP verify
- Google OAuth
- Register
- Change password
- Logout
- FCM token registration
- Session restore (on app start)

**Tách thành:**

```typescript
stores/
├── auth.slice.ts              → Giữ slice definition, xóa thunks
├── thunks/
│   ├── index.ts
│   ├── login.thunk.ts          → loginWithCredentials, loginWithGoogle
│   ├── otp.thunk.ts            → sendOTP, verifyOTP
│   ├── register.thunk.ts       → register, resendOTP
│   ├── session.thunk.ts        → restoreSession, refreshToken
│   └── fcm.thunk.ts            → registerFCMToken
└── hooks.ts                    → Giữ nguyên selectors
```

### Issue #2: Thiếu `hooks/` directory

**Thêm:**

```
hooks/
├── useAuth.ts                  → wrapper around Redux selectors
├── useLogin.ts                 → login form state + handlers
├── useOTP.ts                   → OTP input state + verify
└── useAuthGuard.ts             → redirect if not authenticated
```

### Issue #3: Types defined inline

**Tách types ra `types/`:**

```typescript
types/
├── auth.types.ts               → User, Session, AuthState
├── login.types.ts              → LoginRequest, LoginResponse
├── otp.types.ts                → OTPRequest, OTPResponse
└── index.ts
```

---

## 📋 Refactoring Checklist

- [ ] Tạo `stores/thunks/` với 5 thunk files
- [ ] Giữ `auth.slice.ts` chỉ định nghĩa slice + reducers, không có thunks
- [ ] Tạo `hooks/` với auth form hooks
- [ ] Tạo `types/` cho tất cả auth-related types
- [ ] Update imports trong components (`LoginRequiredOverlay`, etc.)
- [ ] Đảm bảo session restore chạy đúng khi app start

---

## ✅ Target Structure

```
features/auth/
├── components/
│   ├── LoginRequiredOverlay.tsx
│   ├── ModalChangePassword.tsx
│   ├── ModalConfirmLogout.tsx
│   ├── ModalVerifyOTP.tsx
│   ├── sign-out-button.tsx
│   └── index.ts
├── hooks/
│   ├── useAuth.ts              → useUser, useIsAuthenticated
│   ├── useLogin.ts             → login form
│   ├── useOTP.ts               → OTP verify
│   └── useAuthGuard.ts         → protected route guard
├── services/
│   └── auth.service.ts         ✅ (giữ nguyên)
├── stores/
│   ├── auth.slice.ts           → slice + reducers
│   ├── thunks/                → all async thunks
│   │   ├── login.thunk.ts
│   │   ├── otp.thunk.ts
│   │   ├── register.thunk.ts
│   │   ├── session.thunk.ts
│   │   └── fcm.thunk.ts
│   └── hooks.ts                ✅ (giữ nguyên selectors)
├── types/
│   ├── auth.types.ts
│   ├── login.types.ts
│   └── index.ts
└── utils/
    ├── auth-errors.ts          ✅ (giữ nguyên)
    └── email-validation.ts     ✅ (giữ nguyên)
```

---

## 🧪 Testing After Refactor

```bash
# 1. Login với email/password
# 2. Login với Google OAuth
# 3. Register + OTP verify
# 4. Change password
# 5. Logout
# 6. App restart → session restored tự động
# 7. Token refresh khi 401
# 8. FCM token registered sau login
```

---

## ⚠️ Migration Note

Auth hiện dùng **Redux Toolkit** (chưa migrate sang Zustand). Có 2 lựa chọn:

**A) Giữ Redux cho auth** (auth cần sync với global store, middleware)
**B) Migrate sang Zustand** (như map feature)

**Recommendation:** Giữ Redux cho auth vì:
- Session state cần global access (nhiều screens)
- Token interceptor ở axios layer
- Middleware cần check auth state

→ Tập trung refactor **structure** (tách thunks), không migrate state management.

---

## 📚 Reference

- `features/map/stores/useMapSettingsStore.ts` — Zustand pattern (nếu muốn tham khảo)
- Redux Toolkit docs — `createSlice` + `createAsyncThunk` pattern
