# Community Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Cần refactor (P1) — Under-developed

---

## 🗂️ Current Structure (rất thiếu)

```
features/community/
├── components/    PostCard.tsx  ← chỉ 1 file!
├── services/
│   └── community.service.ts  ⚠️ 360 lines ← QUÁ LỚN
└── types/
    └── post-types.ts
```

**Chỉ có 3 files!** Feature này cần nhiều component hơn và phải tách service.

---

## 🔴 Priority Issues

### Issue #1: `community.service.ts` (360 lines) — Quá lớn cho 1 file

**Đang làm quá nhiều thứ:**
- Flood report CRUD
- Media upload (expo-file-system)
- User trust scoring
- Nearby reports
- Post/feed management
- File system operations

**Tách thành:**

```typescript
services/
├── community.service.ts           → DELETE sau khi tách
├── report.service.ts              → createReport, getNearbyReports, getReports
├── media.service.ts               → uploadMedia, deleteMedia (dùng expo-file-system)
├── trust.service.ts               → getTrustScore, updateTrustScore
├── post.service.ts                → getPosts, createPost, deletePost
└── community-error.service.ts     → CommunityServiceError
```

### Issue #2: Thiếu hooks

**Tạo:**

```
hooks/
├── queries/
│   ├── useReportsQuery.ts        → useQuery cho nearby reports
│   └── usePostsQuery.ts          → useQuery cho community posts
├── mutations/
│   ├── useCreateReportMutation.ts
│   ├── useUploadMediaMutation.ts
│   └── useCreatePostMutation.ts
└── useCommunityData.ts           → aggregation hook
```

### Issue #3: Thiếu components

**Cần thêm:**

```
components/
├── ReportCard.tsx
├── ReportSheet.tsx
├── ReportFilters.tsx
├── PostCard.tsx          ← đã có (giữ nguyên)
├── PostSheet.tsx
├── TrustBadge.tsx
├── MediaGallery.tsx
└── index.ts
```

### Issue #4: No stores

Nếu cần track:
- Bộ lọc reports (đang active trên bản đồ)
- Upload progress
- Draft posts

→ Tạo `stores/useCommunityStore.ts`

---

## 📋 Refactoring Checklist

- [ ] Tách `community.service.ts` → 4 services + error class
- [ ] Tạo `hooks/queries/` với React Query pattern
- [ ] Tạo `hooks/mutations/` cho CRUD operations
- [ ] Thêm Report components (ReportCard, ReportSheet, ReportFilters)
- [ ] Thêm Post components (PostSheet, TrustBadge)
- [ ] Tạo aggregation hook `useCommunityData.ts`
- [ ] Thêm Zustand store nếu cần
- [ ] Thêm types đầy đủ (ReportDto, PostDto, MediaDto, TrustScore)

---

## ✅ Target Structure

```
features/community/
├── components/
│   ├── PostCard.tsx
│   ├── ReportCard.tsx
│   ├── ReportSheet.tsx
│   ├── ReportFilters.tsx
│   ├── PostSheet.tsx
│   ├── TrustBadge.tsx
│   ├── MediaGallery.tsx
│   └── index.ts
├── hooks/
│   ├── queries/
│   │   ├── useReportsQuery.ts
│   │   └── usePostsQuery.ts
│   ├── mutations/
│   │   ├── useCreateReportMutation.ts
│   │   ├── useUploadMediaMutation.ts
│   │   └── useCreatePostMutation.ts
│   └── useCommunityData.ts     ← aggregation
├── services/
│   ├── report.service.ts
│   ├── media.service.ts
│   ├── trust.service.ts
│   ├── post.service.ts
│   └── community-error.service.ts
├── stores/
│   └── useCommunityFiltersStore.ts  (nếu cần)
├── types/
│   ├── report.types.ts
│   ├── post.types.ts
│   ├── media.types.ts
│   └── trust.types.ts
└── lib/
    └── community-utils.ts
```

---

## 🧪 Testing After Refactor

```bash
# 1. Report list load đúng
# 2. Tạo report mới với ảnh
# 3. Upload media hoạt động
# 4. Nearby reports hiển thị đúng
# 5. Trust score badge hiển thị
# 6. Posts load trong feed
```

---

## 📚 Reference

- `features/map/services/map.service.ts` — service + error pattern
- `features/map/hooks/queries/useFloodSeverityQuery.ts` — query hook pattern
- `features/map/hooks/mutations/useMapSettingsMutation.ts` — mutation hook pattern
