# FDA-Mobile: UI Design System Unification + Maestro Testing

## Context

FDA-Mobile do 5 developers build, mỗi người dùng AI prompt riêng để code UI -> kết quả: chức năng OK nhưng UI thiếu nhất quán (khác màu, khác shadow, khác spacing, khác pattern). Project cần một **Design System thống nhất** và refactor lại UI theo system đó, kèm **Maestro testing trên Android** để verify sau mỗi lần refactor.

> **QUAN TRỌNG: KHÔNG thay đổi logic/behavior.** Logic app đang đúng với requirements của team. Chỉ refactor phần visual/styling (colors, spacing, shadows, typography, component patterns). Giữ nguyên toàn bộ business logic, API calls, navigation, state management.

---

## Phase 0: BMad Planning Workflow (Tuần 1)

### Step 1: Generate Project Context
- Skill: `bmad-generate-project-context` (GPC)
- Output: `_bmad-output/planning-artifacts/project-context.md`

### Step 2: Create UX Design Document
- Skill: `bmad-create-ux-design` (CU)
- Nội dung cần define:
  - **Color tokens**: Consolidate 3 hệ thống màu hiện tại (global.css CSS vars, lib/constants.ts NAV_THEME, map-ui-utils.ts LIGHT_BG/DARK_BG) thành 1 nguồn duy nhất
  - **Typography scale**: h1-h4, body, body-sm, caption (hiện tại dùng fontSize tùy ý: 9, 10, 11, 12, 13, 14, 18...)
  - **Shadow scale**: 3 tiers (sm, md, lg) - cả Tailwind boxShadow lẫn RN style objects (Android cần elevation)
  - **Spacing/radius**: Chuẩn hóa theo Tailwind 4px grid
  - **Component patterns**: Badge, IconButton, SectionHeader, ListItem, Pill, ScreenHeader, Avatar, Divider
  - **Dark mode strategy**: Dùng NativeWind `dark:` classes, loại bỏ `isDarkColorScheme ? x : y` ternaries
  - **testID convention**: `<feature>-<component>-<element>` pattern
- Output: `_bmad-output/planning-artifacts/ux-design.md`

### Step 3: Create Architecture
- Skill: `bmad-create-architecture` (CA)
- Focus: Design token source of truth, theme consolidation, shared component architecture
- Output: `_bmad-output/planning-artifacts/architecture.md`

### Step 4: Create PRD
- Skill: `bmad-create-prd` (CP)
- Goal: Visual consistency, 0 hardcoded hex colors, 100% shared component usage
- Output: `_bmad-output/planning-artifacts/prd.md`

### Step 5: Create Epics & Stories
- Skill: `bmad-create-epics-and-stories` (CE)
- Output: `_bmad-output/planning-artifacts/epics-and-stories.md`

### Step 6: Sprint Planning
- Skill: `bmad-sprint-planning` (SP)

---

## Phase 1: Foundation (Epic 0)

### Story 0.1: Design Tokens
- Tạo `lib/design-tokens.ts` - shadow constants, consolidated theme hook
- Extend `tailwind.config.js` với typography scale tokens
- Consolidate `features/map/lib/map-ui-utils.ts` shadows/colors vào shared file

### Story 0.2: Shared Components mới
- Tạo trong `components/ui/`: Badge, IconButton, SectionHeader, ListItem, Pill, ScreenHeader, Avatar, Divider
- Pattern: CVA + NativeWind (theo mẫu `components/ui/button.tsx`)
- Mọi component phải accept `testID` prop + `className` cho overrides

### Story 0.3: testID cho components/ui/ hiện có
- Thêm `testID` support vào 10 shared components hiện tại

### Story 0.4: Maestro Setup
- Tạo `maestro/` directory structure
- appId: `com.fda.mobile` (dev build) hoặc `host.exp.Exponent` (Expo Go)
- Viết smoke test: app launch + tab navigation
- Chi tiết setup xem Maestro Section bên dưới

---

## Phase 2: Feature-by-Feature Refactor (Epic 1-11)

Thứ tự ưu tiên theo visibility + complexity:

| Sprint | Epic | Feature | Files | Mô tả |
|--------|------|---------|-------|--------|
| 1 | Epic 1 | Tab Bar + Nav Shell | ~3 | Highest visibility, refactor inline colors |
| 2 | Epic 2 | Home | ~8 | High-traffic, replace inline styles |
| 2 | Epic 3 | Notifications | ~7 | Dùng shared ListItem, Badge |
| 2 | Epic 4 | Profile | ~9 | Dùng shared components |
| 3 | Epic 5 | Alerts | ~25 | History + Settings cards |
| 3 | Epic 6 | Areas | ~27 | List, creation, chart components |
| 4 | Epic 7 | Plans + Payment | ~12 | Pricing cards, billing |
| 4 | Epic 8 | Prediction | ~23 | Prediction cards |
| 5 | Epic 9 | Map | ~89 | Largest - chia 5+ sub-stories |
| 6 | Epic 10 | Auth + Onboarding | ~7 | Login/signup screens |
| 6 | Epic 11 | Community, Complaints, News | ~4 | Small features, cleanup |

### Per-Story Workflow (BMad Dev Story)
1. `bmad-create-story` (CS) - tạo story detail
2. `bmad-dev-story` (DS) - implement:
   - Thêm testIDs vào components đang refactor
   - Replace inline styles -> NativeWind classes + shared components
   - Replace hardcoded hex colors -> Tailwind tokens
   - Loại bỏ `isDarkColorScheme` ternaries -> `dark:` classes
3. Chạy `tsc --noEmit` verify types
4. Mở Android emulator, verify visual
5. Viết + chạy Maestro flow cho screen đó
6. `bmad-code-review` (CR) - review

---

## Maestro Setup cho Windows/Android

### Cài đặt: Maestro MCP Server (Recommended cho Windows)

Dùng **Maestro MCP server** thay vì cài CLI trực tiếp - chạy qua Node.js, không cần WSL, tích hợp thẳng vào Claude Code.

**Bước 1: Add Maestro MCP**
```bash
npx -y @anthropic-ai/claude-code mcp add maestro -- npx -y maestro-mcp
```

**Bước 2: Thêm config vào `.mcp.json` (project root - commit cho cả team)**
```json
{
  "mcpServers": {
    "maestro": {
      "command": "npx",
      "args": ["-y", "maestro-mcp"]
    }
  }
}
```

**Bước 3: Start app trên emulator**
```bash
npx expo run:android   # Tự start emulator + build + install app
```

**Bước 4: Dùng trong Claude Code**
- Agent tự gọi Maestro MCP tools: `tap`, `swipe`, `assertVisible`, `takeScreenshot`, `inspect_view_hierarchy`...
- 47+ tools available, không cần viết yaml flow thủ công

**Fallback: WSL2** (nếu MCP không hoạt động)
```powershell
wsl --install -d Ubuntu
# Trong Ubuntu: curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Android-Specific Notes
- **Back button**: Dùng `- pressKey: back` (Android hardware back)
- **appId**: `com.fda.mobile` cho dev build, `host.exp.Exponent` cho Expo Go
- **Permissions**: Handle với `tapOn: "Allow"` khi dialog xuất hiện
- **Screenshots**: Lưu tại `maestro/_screenshots/{story}-TC{n}-{desc}.png`

### testID Convention
```
<feature>-<component>-<element>[-<qualifier>]

Ví dụ:
  tabs-home-tab, tabs-map-tab
  home-header, home-header-notification-btn
  alerts-history-card-{id}
  areas-create-btn
```

---

## Critical Files

| File | Action |
|------|--------|
| `tailwind.config.js` | Extend: typography scale, consolidate shadows |
| `components/ui/button.tsx` | Reference CVA pattern cho new components |
| `features/map/lib/map-ui-utils.ts` | Consolidate vào shared `lib/design-tokens.ts` |
| `global.css` | Align CSS vars với tailwind.config.js |
| `lib/constants.ts` | Consolidate NAV_THEME vào design tokens |
| `app/(tabs)/_layout.tsx` | First refactor target - tab bar |

---

## Verification

Sau mỗi epic:
1. `tsc --noEmit` - no type errors
2. `npx expo start` - app launches OK
3. Visual check trên Android emulator
4. `maestro test maestro/flows/smoke/` - smoke tests pass
5. `maestro test maestro/flows/<feature>/` - feature flows pass
6. So sánh screenshots trước/sau refactor

---

## Cách bắt đầu

Chạy từng BMad skill trong **context window riêng** (recommended):

1. `/bmad-generate-project-context` - tạo project context
2. `/bmad-create-ux-design` - design UX/Design System
3. `/bmad-create-architecture` - architecture decisions
4. `/bmad-create-prd` - PRD cho UI unification
5. `/bmad-create-epics-and-stories` - break into stories
6. `/bmad-sprint-planning` - sprint plan
7. `/bmad-dev-story` - implement từng story (loop)
