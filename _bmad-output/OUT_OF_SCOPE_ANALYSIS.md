# 📋 Story 4-1 Code Review: Out-of-Scope Files Analysis

**Generated:** 2026-04-14  
**Review Context:** Story 4-1 (Migrate Alert History Components)  
**Total Files in Diff:** 103  
**Story Scope:** 13 files (11 alert history + 2 syntax fixes)  
**Out-of-Scope:** 90 files  

---

## 📊 Breakdown by Category

### ✅ STORY 4-1 SCOPE (IN-SCOPE - 13 Files)

#### Alert History Components (11 files)
```
features/alerts/components/alert-history/
├── AlertHistoryCard.tsx                  ✅
├── AlertHistoryChannelsRow.tsx           ✅
├── AlertHistoryChips.tsx                 ✅
├── AlertHistoryFooter.tsx                ✅
├── AlertHistoryHeader.tsx                ✅
├── AlertHistoryPagination.tsx            ✅
├── AlertHistorySearchBar.tsx             ✅
├── AlertHistorySectionTitle.tsx          ✅
└── AlertHistoryValueCard.tsx             ✅

app/alerts/history/
├── index.tsx                             ✅
└── [alertId].tsx                         ✅
```

#### Syntax Fixes (2 files - mentioned in story notes)
```
features/areas/components/charts/
├── ChartPeriodSelector.tsx               ✅ (syntax fix only)
└── FloodHistoryChart.tsx                 ✅ (syntax fix only)
```

---

### ❌ CATEGORY A: Story 6-3 (Prediction Feature) - 27 Files

**Status:** This is a SEPARATE story in Epic 6, currently `review` status  
**Impact:** Should be reviewed separately after 4-1

#### Prediction Components (24 files)
```
features/prediction/components/
├── ActionPlanCard.tsx
├── AiConsultantCard.tsx
├── AiFactorsCard.tsx
├── AnalysisReportCard.native.tsx
├── AnalysisReportCard.tsx
├── CommunityReportsCard.tsx
├── ConclusionCard.tsx
├── DistrictsForecastCard.tsx
├── EnsembleDetailsCard.tsx
├── FactorsCard.tsx
├── ForecastWindowsCard.tsx
├── HybridEnsembleCard.tsx
├── ImpactAssessmentCard.tsx
├── ImpactCard.tsx
├── NewAiConsultantCard.tsx
├── PredictionHeroHeader.tsx
├── RecommendationsCard.tsx
├── RiskLevelGauge.tsx
├── RiskOverviewCard.tsx
├── SatelliteLoadingPill.tsx
├── StationsCard.tsx
└── ValidPeriodBadge.tsx
```

#### Prediction Hooks & Lib (3 files)
```
features/prediction/
├── hooks/useLocalForecast.ts
├── lib/districts-forecast-helpers.ts

app/
└── prediction/[id].tsx
```

**Story Doc:** `_bmad-output/implementation-artifacts/6-3-migrate-prediction-forecast-impact-screens.md`

---

### ❌ CATEGORY B: Story 4-2/4-3 (Alert Settings & Thresholds) - 13 Files

**Status:** Different stories in same Epic 4  
**Impact:** Related to alerts but separate from history

#### Alert Settings Components (8 files)
```
features/alerts/components/alert-settings/
├── AlertSettingsHeader.tsx
├── MinimumSeveritySection.tsx
├── NotificationChannelsSection.tsx
├── QuietHoursSection.tsx
├── SaveSettingsBar.tsx
└── TimePickerModal.tsx

features/alerts/components/
├── AlertSettings.tsx
└── AlertChannelsStatus.tsx
```

#### Alert Thresholds Components (5 files)
```
features/alerts/components/alert-thresholds/
├── AlertThresholdsFooter.tsx
├── AlertThresholdsHeader.tsx
├── GlobalThresholdCard.tsx
├── ThresholdCard.tsx
├── ThresholdDivider.tsx
├── ThresholdRow.tsx
└── ThresholdSectionTitle.tsx
```

#### Alert Root & FCM (2 files)
```
app/alerts/
└── _layout.tsx

features/alerts/fcm/
└── InAppNotificationBanner.tsx
```

---

### ❌ CATEGORY C: Story 3-1/3-2 (Notifications Feature) - 11 Files

**Status:** Epic 3, different from alerts  
**Impact:** Notifications refactoring

#### Notifications Components (7 files)
```
features/notifications/components/
├── EmptyNotificationsState.tsx
├── NotificationCard.tsx
├── NotificationFilters.tsx
├── NotificationMetadata.tsx
├── NotificationPaginationInfo.tsx
├── NotificationTabToggle.tsx
└── NotificationsHeader.tsx
```

#### Notifications Screens (4 files)
```
app/(tabs)/notifications/
├── [id].tsx
├── _layout.tsx
├── index.tsx
└── news/[id].tsx
```

---

### ❌ CATEGORY D: Story 2-1/2-2 (Home Feature) - 9 Files

**Status:** Epic 2, different from alerts  
**Impact:** Home screen refactoring

#### Home Components (8 files)
```
features/home/components/
├── CityOverviewStats.tsx
├── CommunityBanner.tsx
├── EmergencyAlertBanner.tsx
├── HomeHeader.tsx
├── MonitoredAreaCard.tsx
├── MonitoredAreasSection.tsx
├── QuickActionsGrid.tsx
└── WeatherInsightsSection.tsx
```

#### Home Screen (1 file)
```
app/(tabs)/
└── home/index.tsx
```

---

### ❌ CATEGORY E: Story 5-1/5-2/5-3 (Areas Feature) - 33 Files

**Status:** Epic 5, largest out-of-scope category  
**Impact:** Areas/monitoring feature refactoring

#### Areas Components (15 files)
```
features/areas/components/
├── AddAreaModal.tsx
├── AdminAreaCard.tsx
├── ApiAreaCard.tsx
├── AreaCard.tsx
├── AreaCreationErrorModal.tsx
├── AreaCreationLoadingOverlay.tsx
├── AreaMenuModal.tsx
├── AreaStatusCard.tsx
├── AreasHeader.tsx
├── ConfirmDeleteModal.tsx
├── EditAreaSheet.tsx
├── EmptyAreasState.tsx
├── ErrorModal.tsx
└── PremiumLimitModal.tsx
```

#### Areas Chart Components (7 files)
```
features/areas/components/charts/
├── DateRangePicker.tsx
├── FloodHistorySection.tsx
├── FloodStatisticsCard.tsx
├── FloodTrendChart.tsx
└── LoadingChart.tsx
```

**Note:** ChartPeriodSelector.tsx & FloodHistoryChart.tsx are IN scope (syntax fixes)

#### Areas Screens (3 files)
```
app/(tabs)/areas/
├── [id].tsx
├── _layout.tsx
└── index.tsx
```

---

### ❌ CATEGORY F: Cross-App/Infrastructure - 4 Files

#### Settings & Configuration
```
.vscode/
└── settings.json  (editor.codeActionsOnSave changed from "explicit" to "never")
```

#### Root Navigation
```
app/(tabs)/
└── _layout.tsx  (theme colors, tab bar styling changes)
```

---

## 📈 Summary Table

| Category | Story ID | Epic | Feature | Files | Type | Action |
|----------|----------|------|---------|-------|------|--------|
| ✅ In-Scope | 4-1 | 4 | Alert History | 13 | REVIEW NOW | Code Review |
| ❌ A | 6-3 | 6 | Prediction | 27 | SEPARATE | Future PR |
| ❌ B | 4-2/4-3 | 4 | Alert Settings/Thresholds | 13 | SEPARATE | Future PR |
| ❌ C | 3-1/3-2 | 3 | Notifications | 11 | SEPARATE | Future PR |
| ❌ D | 2-1/2-2 | 2 | Home | 9 | SEPARATE | Future PR |
| ❌ E | 5-1/5-2/5-3 | 5 | Areas | 33 | SEPARATE | Future PR |
| ❌ F | - | - | Infrastructure | 4 | SEPARATE | Future PR |
| | | | **TOTAL** | **103** | | |

---

## 🎯 Recommendations

### Immediate Actions

1. **Create 7 separate PRs** from this monolithic commit:
   ```
   PR #1: Story 4-1 (13 files - alert history + syntax fixes)
   PR #2: Story 6-3 (27 files - prediction)
   PR #3: Story 4-2/4-3 (13 files - alert settings/thresholds)
   PR #4: Story 3-1/3-2 (11 files - notifications)
   PR #5: Story 2-1/2-2 (9 files - home)
   PR #6: Story 5-1/5-2/5-3 (33 files - areas)
   PR #7: Infrastructure (4 files - settings, root layout)
   ```

2. **For each PR:**
   - Run separate `tsc --noEmit` checks
   - Run feature-specific tests
   - Link to corresponding story in sprint status
   - Require story-scoped approval before merge

3. **Commit hygiene:**
   - Use `git reset HEAD~1` (or equivalent) to unstage everything
   - Re-stage by story: `git add features/alerts/components/alert-history/`
   - Create individual commits per story
   - Push feature branches for separate PRs

---

## 📝 Developer Notes

**Why this happened:**
- Likely: Developer worked on multiple stories in sequence without committing between each
- Result: All changes bundled into single commit spanning 6 epics
- Impact: Code review becomes unfocused, merge becomes risky, rollback is impossible

**Prevention:**
- Commit after completing each story
- Use branch naming convention: `feat/4-1-alert-history-migration`
- Push to feature branch immediately after commit
- Create PR before moving to next story

---

## ✅ Verification Checklist

Before splitting commits, verify:

- [ ] `git log --oneline -5` shows correct parent commit
- [ ] `git status` shows no uncommitted changes (after splitting)
- [ ] Each split commit contains ONLY files from one story
- [ ] `tsc --noEmit` passes for each story's scope
- [ ] No cross-story imports introduced
- [ ] Story doc references updated in each commit message

---

**Generated by:** BMAD Code Review Workflow  
**Story:** 4-1-migrate-alert-history-components  
**Status:** Ready for scope-aligned review after PR split
