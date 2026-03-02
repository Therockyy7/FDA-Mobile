# Tổng quan dự án FDA-Mobile

**FDA-Mobile** là ứng dụng di động theo dõi và cảnh báo lũ lụt, xây dựng bằng **React Native + Expo**, hỗ trợ cả iOS và Android.

---

## Tech Stack chính

| Lớp | Công nghệ |
|---|---|
| Framework | React Native 0.81 + Expo ~54 |
| Ngôn ngữ | TypeScript ~5.9 |
| Navigation | Expo Router (file-system based) |
| State Management | Redux Toolkit + Redux Persist |
| Data Fetching | React Query + Axios |
| UI/Styling | NativeWind (Tailwind CSS) |
| Forms | React Hook Form + Zod |
| Maps | react-native-maps (Google Maps) |
| Auth | Google Sign-In, Email/Phone + OTP |

---

## Kiến trúc: Feature-Sliced Design

```
app/                        # Expo Router - định nghĩa routes/screens
├── _layout.tsx             # Root layout (Redux Provider, React Query, Theme)
├── store.ts                # Redux store configuration
├── (tabs)/                 # Tab navigation (5 tabs)
│   ├── index.tsx           # Home (Trang chủ)
│   ├── map/                # Bản đồ
│   ├── areas/              # Khu vực
│   ├── notifications/      # Thông báo
│   └── profile/            # Hồ sơ
├── (auth)/                 # Auth routes (Sign In, Sign Up, OTP)
└── community/              # Cộng đồng

features/                   # Tách theo tính năng (Feature Modules)
├── auth/                   # Xác thực
│   ├── components/         # Login forms, OTP modal
│   ├── stores/             # auth.slice.ts (Redux)
│   ├── services/           # auth.service.ts (API calls)
│   └── utils/              # Helpers
├── map/                    # Bản đồ lũ lụt
│   ├── components/         # MapDisplay, Controls, Overlays, Stations
│   ├── stores/             # map.slice.ts
│   ├── services/           # map.service.ts
│   └── types/              # TypeScript interfaces
├── areas/                  # Quản lý khu vực
├── home/                   # Trang chủ
├── profile/                # Hồ sơ người dùng
├── notifications/          # Thông báo
└── community/              # Cộng đồng

components/ui/              # Shared UI components (Button, Input, Card...)
lib/                        # Core utilities
├── api-client.ts           # Axios instance + token interceptor
├── constants.ts            # Theme colors
└── utils.ts                # Helpers
```

---

## 5 Màn hình chính (Bottom Tabs)

1. **Trang chủ** - Thống kê tổng quan thành phố, cảnh báo lũ
2. **Bản đồ** - Google Maps với overlay GeoJSON mức lũ, trạm quan trắc
3. **Khu vực** - Danh sách khu vực theo dõi, biểu đồ mực nước, dự báo thời tiết *(yêu cầu đăng nhập)*
4. **Thông báo** - Cảnh báo lũ theo khu vực *(yêu cầu đăng nhập)*
5. **Hồ sơ** - Quản lý tài khoản, cài đặt *(yêu cầu đăng nhập)*

---

## Luồng xác thực

- **3 phương thức**: Email/Phone + Password, OTP, Google OAuth
- Token tự động refresh khi nhận 401
- Các tab protected hiển thị modal yêu cầu đăng nhập
- Backend API: `https://fda.id.vn`

---

## State Management

- **Redux Toolkit**: 2 slices chính - `auth` (user, session, status) và `map` (settings, flood data, areas)
- **Redux Persist**: Lưu `user`, `session`, `map settings` vào AsyncStorage
- **React Query**: Dùng cho data fetching phụ (profile, posts)
- **Custom hooks**: Mỗi feature có hooks riêng wrap dispatch/selector

---

## Điểm nổi bật kiến trúc

- **Feature-Sliced Design** - tách biệt rõ ràng từng tính năng
- **Type-safe** toàn bộ với TypeScript strict mode
- **Auto token refresh** với request queue
- **Dark/Light mode** qua CSS variables + Tailwind
- **GeoJSON flood overlays** trên bản đồ với nhiều lớp (lũ, thời tiết, giao thông)
