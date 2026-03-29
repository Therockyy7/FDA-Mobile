# Prediction Feature — Refactoring Guide

> **Baseline commit:** `933bd44f316f9dac4fba3c461c3ea93bfac46e5e`
> **Trạng thái:** Monitor (P3)

---

## 🗂️ Current Structure

```
features/prediction/
├── components/
│   ├── ActionPlanCard.tsx
│   ├── AiConsultantCard.tsx
│   ├── AnalysisReportCard.tsx
│   ├── AnalysisReportCard.native.tsx ← platform-specific
│   ├── ConclusionCard.tsx
│   ├── DistrictsForecastCard.tsx
│   ├── EnsembleDetailsCard.tsx
│   ├── FactorsCard.tsx
│   ├── ImpactAssessmentCard.tsx
│   ├── RecommendationsCard.tsx
│   ├── RiskLevelGauge.tsx
│   ├── RiskOverviewCard.tsx
│   └── ValidPeriodBadge.tsx
├── hooks/
│   └── useDistrictsForecast.ts   ⚠️ 120 lines — approaching threshold
├── services/
│   └── prediction.service.ts     (70 lines) ✅ Good
├── types/
│   ├── districts-forecast.types.ts
│   └── prediction.types.ts
└── utils/
    └── adviceParser.ts           ⚠️ 187 lines — large utility
```

**Thiếu:** `stores/`, `lib/`, `queries/` subdir, barrel files

---

## ✅ Điểm tốt

- `prediction.service.ts` — size nhỏ (70L), đúng pattern
- Components có platform-specific file (`AnalysisReportCard.native.tsx`)
- Types được tách hợp lý

---

## 🔴 Priority Issues

### Issue #1: `adviceParser.ts` (187 lines) — Nên theo dõi

Utility parse AI-generated advice string. Kiểm tra xem:
- Có đang làm quá nhiều trong một function không?
- Có nên tách thành nhiều parser functions không?

**Có thể tách:**

```typescript
utils/
├── adviceParser.ts              → giữ nếu đã clean
├── advice-parser/
│   ├── index.ts
│   ├── parseRecommendation.ts
│   ├── parseActionPlan.ts
│   └── parseConclusion.ts
└── advice-formatters.ts         ← format functions
```

### Issue #2: `useDistrictsForecast.ts` (120 lines) — Gần ngưỡng

Cân nhắc tách nếu file tiếp tục tăng.

**Nếu tách:**

```typescript
hooks/
├── useDistrictsForecast.ts      → DELETE hoặc giữ làm wrapper
├── queries/
│   └── useDistrictsForecastQuery.ts  ← React Query
└── useDistrictsForecastData.ts       ← aggregation + parsing
```

### Issue #3: Thiếu barrel files

**Thêm:**

```typescript
components/index.ts
hooks/index.ts
```

### Issue #4: No stores

Nếu cần track:
- Selected district (để hiển thị chi tiết)
- Forecast refresh state

→ Tạo `stores/usePredictionStore.ts`

---

## 📋 Refactoring Checklist

- [ ] Review `adviceParser.ts` — tách nếu cần
- [ ] Tạo `hooks/queries/useDistrictsForecastQuery.ts`
- [ ] Thêm barrel files: `components/index.ts`, `hooks/index.ts`
- [ ] Thêm Zustand store nếu cần selection state
- [ ] Thêm `lib/` nếu có derivation/formatting logic
- [ ] Kiểm tra `services/prediction.service.ts` — vẫn ổn không?

---

## ✅ Target Structure

```
features/prediction/
├── components/
│   ├── ActionPlanCard.tsx
│   ├── AiConsultantCard.tsx
│   ├── AnalysisReportCard.tsx
│   ├── AnalysisReportCard.native.tsx
│   ├── ConclusionCard.tsx
│   ├── DistrictsForecastCard.tsx
│   ├── EnsembleDetailsCard.tsx
│   ├── FactorsCard.tsx
│   ├── ImpactAssessmentCard.tsx
│   ├── RecommendationsCard.tsx
│   ├── RiskLevelGauge.tsx
│   ├── RiskOverviewCard.tsx
│   ├── ValidPeriodBadge.tsx
│   └── index.ts               ← ADD
├── hooks/
│   ├── queries/
│   │   └── useDistrictsForecastQuery.ts  ← ADD
│   ├── useDistrictsForecast.ts           ← REVIEW
│   └── useDistrictsForecastData.ts       ← ADD hoặc merge
├── services/
│   └── prediction.service.ts   ✅
├── stores/
│   └── usePredictionStore.ts    (nếu cần)
├── types/
│   ├── districts-forecast.types.ts  ✅
│   └── prediction.types.ts          ✅
└── utils/
    └── adviceParser.ts         ⚠️ REVIEW
```

---

## 🧪 Testing After Refactor

```bash
# 1. Districts forecast hiển thị đúng
# 2. AI consultant advice được parse đúng
# 3. Risk level gauge hoạt động
# 4. Ensemble details hiển thị
# 5. Action plan cards hiển thị
# 6. Valid period badge đúng
```

---

## 📚 Reference

- `features/home/hooks/useHomeWeatherData.ts` — tương tự data aggregation
- `features/map/hooks/queries/` — React Query pattern
