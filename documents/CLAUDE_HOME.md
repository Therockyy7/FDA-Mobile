# Home Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Cần refactor (P2)

---

## 🗂️ Current Structure

```
features/home/
├── components/
│   ├── CityOverviewStats.tsx
│   ├── CommunityBanner.tsx
│   ├── EmergencyAlertBanner.tsx
│   ├── HomeHeader.tsx
│   ├── MonitoredAreaCard.tsx
│   ├── MonitoredAreasSection.tsx
│   ├── QuickActionsGrid.tsx
│   └── WeatherInsightsSection.tsx
├── constants/
│   └── home-data.ts
├── hooks/
│   └── useHomeWeatherData.ts  ⚠️ 225 lines ← LARGE
├── lib/
│   └── home-utils.ts             (33 lines)
├── services/
│   └── weather.service.ts        (40 lines) ✅ Good
└── types/
    ├── home-types.ts
    └── open-meteo.types.ts
```

**Thiếu:** `stores/`, `queries/` subdir, `mutations/` subdir, `lib/` derivation functions

---

## ✅ Điểm tốt

- `weather.service.ts` — nhỏ (40L), đúng pattern
- `home-utils.ts` — có utils nhỏ
- Components rõ ràng, mỗi file 1 component
- Types được tách ra

---

## 🔴 Priority Issues

### Issue #1: `useHomeWeatherData.ts` (225 lines) — Nên tách

**Đang làm:**
- Gọi 3 services: `AreaService`, `PredictionService`, `WeatherService`
- Derivation functions: `deriveRainfallForecast`, `getEmptyForecast`

**Tách thành:**

```typescript
hooks/
├── useHomeWeatherData.ts       → DELETE sau khi tách
├── useHomeWeatherQuery.ts      → gọi WeatherService
├── useHomeAreasQuery.ts        → gọi AreaService (monitored areas)
├── useHomePredictionQuery.ts   → gọi PredictionService
└── useHomeData.ts              → aggregation + derivation logic
```

### Issue #2: Derivation logic nên ở `lib/`

```typescript
lib/
├── home-utils.ts              → giữ nguyên
├── rainfall-forecast.utils.ts ← EXTRACT từ hook
│   ├── deriveRainfallForecast()
│   └── getEmptyForecast()
└── home-formatters.ts         ← EXTRACT format functions
    ├── formatRainfall()
    └── formatTemperature()
```

### Issue #3: Nên có React Query hooks

**Tạo:**

```
hooks/queries/
├── useWeatherQuery.ts
├── useMonitoredAreasQuery.ts
└── useForecastQuery.ts
```

---

## 📋 Refactoring Checklist

- [ ] Extract derivation functions sang `lib/`
- [ ] Tách `useHomeWeatherData.ts` → 4 hooks nhỏ hơn
- [ ] Tạo `hooks/queries/` với React Query pattern
- [ ] Tạo `hooks/mutations/` nếu có mutation (ví dụ: dismiss alert)
- [ ] Kiểm tra xem có cần Zustand store không (có thể cho EmergencyAlertBanner)
- [ ] Thêm `components/index.ts` barrel file

---

## ✅ Target Structure

```
features/home/
├── components/
│   ├── CityOverviewStats.tsx
│   ├── CommunityBanner.tsx
│   ├── EmergencyAlertBanner.tsx
│   ├── HomeHeader.tsx
│   ├── MonitoredAreaCard.tsx
│   ├── MonitoredAreasSection.tsx
│   ├── QuickActionsGrid.tsx
│   ├── WeatherInsightsSection.tsx
│   └── index.ts
├── constants/
│   └── home-data.ts
├── hooks/
│   ├── queries/
│   │   ├── useWeatherQuery.ts
│   │   ├── useMonitoredAreasQuery.ts
│   │   └── useForecastQuery.ts
│   ├── mutations/
│   │   └── useDismissAlertMutation.ts  (nếu cần)
│   ├── useHomeData.ts       ← aggregation
│   └── useHomeScreen.ts     ← screen handlers
├── services/
│   └── weather.service.ts   ✅
├── stores/                   (nếu cần: emergency alerts)
│   └── useHomeAlertStore.ts
├── types/
│   ├── home-types.ts
│   └── open-meteo.types.ts
└── lib/
    ├── home-utils.ts
    ├── rainfall-forecast.utils.ts  ← extracted
    └── home-formatters.ts          ← extracted
```

---

## 🧪 Testing After Refactor

```bash
# 1. Home screen load nhanh
# 2. Weather hiển thị đúng
# 3. Monitored areas list đúng
# 4. Emergency alert banner hiển thị khi có cảnh báo
# 5. Quick actions navigate đúng
```

---

## 📚 Reference

- `features/map/hooks/queries/useFloodSeverityQuery.ts` — query hook pattern
- `features/map/hooks/useFloodData.ts` — aggregation hook pattern
- `features/map/lib/` — lib organization
