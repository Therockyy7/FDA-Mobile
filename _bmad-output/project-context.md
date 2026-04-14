---
project_name: 'FDA-Mobile'
user_name: 'Anh Tuan'
date: '2026-04-14'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'code_quality', 'workflow', 'anti_patterns']
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns AI agents must follow when implementing code in FDA-Mobile. Focuses on unobvious details agents might otherwise miss._

---

## Technology Stack & Versions

```
React Native 0.81.5 + Expo ~54.0.27
TypeScript ~5.9.2
React 19.1.0
Expo Router ~6.0.17         # file-system routing — screens live in app/
```

**State Management:**
```
@tanstack/react-query ^5.83.0   # server state (API data)
zustand ^5.0.6                  # client/persistent state
@reduxjs/toolkit ^2.11.2        # LEGACY — migrating away, use Zustand for new code
redux-persist ^6.0.0            # persists Redux state — being phased out
```

**UI/Styling:**
```
nativewind ^4.1.23              # Tailwind for React Native
tailwindcss ^3.4.17
class-variance-authority ^0.7.1 # CVA for component variants
tailwind-merge ^3.3.1           # twMerge for class merging
```

**Networking & Realtime:**
```
axios ^1.13.2
@microsoft/signalr ^10.0.0      # realtime flood data
```

**Forms & Validation:**
```
react-hook-form ^7.61.1
zod ^4.0.10
```

**Maps:**
```
react-native-maps 1.20.1        # Google Maps
expo-location ~19.0.8
```

**No unit test framework installed.** Testing is via Maestro E2E on Android emulator.

---

## Language-Specific Rules (TypeScript)

**Path Alias:**
- Always use `~/` alias (maps to project root). Never use relative `../../` paths.
- `import { cn } from "~/lib/utils"` ✅ — `import { cn } from "../../../lib/utils"` ❌

**Barrel Files:**
- Every subdirectory has `index.ts` barrel — import via barrel, not direct file paths
- No `index.ts` at feature root level (prevents circular dependencies)
- Cross-feature imports: only via `services/` or `types/` barrel. **Never** import into another feature's `components/`

**Type Safety:**
- No `any` without a comment explaining why
- No `as` casting without a runtime check — use type guards instead
- `catch (error: unknown)` not `catch (error: any)`
- Inline types if used in 1 file only; export types if used across files

**Error Handling — Service Layer:**
```typescript
// ✅ Correct: throw typed custom error
throw new AreaServiceError(
  error?.response?.data?.message || error?.message || "Failed",
  error?.response?.status
)

// ❌ Wrong: return null/undefined on failure
return null
```

---

## Framework Rules (React Native + Expo Router + Hooks)

**Expo Router:**
- Screens = files inside `app/` — file path = route
- `_layout.tsx` wraps providers (Redux, React Query, Theme) — do not re-wrap in child screens
- Protected screens show login modal overlay — do NOT navigate to a separate auth route

**Component Rules:**
- Components receive data via **props only** — never call data hooks inside a component
- Props interface > 5 props → extract to `<Name>.types.ts`
- Every `components/` subdirectory has a barrel `index.ts`

**Hook Size Rules:**
```
Query/Mutation hook:        < 50 lines
Aggregation hook (Data):    < 150 lines
Screen handler hook:        split further if > 150 lines
```
- Hooks NEVER call API/Expo/fetch directly — always go through a Service

**State Management Priority:**
```
1. React Query  → server state (API data)
2. Zustand      → client state (settings, realtime, cross-component)
3. useState     → UI transient state (modal, form inputs)
```
> Do NOT create new Redux slices. Use Zustand for all new state. Redux only exists in legacy `auth` and `map` slices.

**Zustand Store Rules:**
- Storage key must have version suffix: `"feature-store-v1"`
- Export granular selectors to prevent over-rendering:
  `export const useXxxValue = () => useXxxStore(s => s.value)`
- Use `partialize` to persist only necessary fields

**SignalR / Realtime:**
- Realtime data → Zustand store (not React Query)
- Merge REST + realtime in aggregation hook using `useMemo`

---

## Code Quality & Style Rules

**Styling — NativeWind First:**
- Use NativeWind `className` for all styling
- Inline `style={{}}` only when NativeWind doesn't support it: Android shadows (elevation), dynamic animation values
- Dark mode via `dark:` prefix in NativeWind — **never** `isDarkColorScheme ? x : y` ternary (exception: non-NativeWind contexts like maps, tab bar icons)
- Class merging via `cn()` from `~/lib/utils` (clsx + twMerge)
- Component variants via CVA — reference: `components/ui/button.tsx`

**Design Tokens — never hardcode colors:**
```
Brand:       primary (#0077BE), secondary (#00B4D8), accent (#FDB813)
Flood risk:  flood-safe, flood-warning, flood-danger, flood-critical
Background:  bg-light, bg-dark
Radius:      DEFAULT=8px, lg=12px, xl=16px, 2xl=20px, full
```

**Naming Conventions:**
```
Hook:           use + PascalCase           useFloodSeverityQuery
Query hook:     use + Noun + Query         useAreasQuery
Mutation hook:  use + Verb + Mutation      useCreateAreaMutation
Service:        PascalCase + Service       MapService, AreaService
Store:          use + Noun + Store         useMapSettingsStore
Error class:    Domain + ServiceError      AreaServiceError
Query key:      SCREAMING_SNAKE_CASE       AREAS_QUERY_KEY
Component file: PascalCase.tsx             AreaCard.tsx
Util file:      kebab-case.ts              map-ui-utils.ts
```

**Code Cleanliness:**
- No `console.log` / `console.error` in production code
- No mock data in production service files — mocks go in `__mocks__/`
- No commented-out code blocks committed to repo

---

## Critical Anti-patterns (Don't-Miss Rules)

**Architecture — Never Do This:**
```
Hook calls axios/fetch directly         → always go through Service
Component calls data hook               → receive data via props only
Feature A imports features/B/components → import via types/ or services/ barrel only
Creating new Redux slice                → use Zustand instead
Hook > 150 lines                        → split into sub-hooks
Service > 200 lines                     → split by domain
```

**Styling — Never Do This:**
```
style={{ color: "#0077BE" }}            → className="text-primary"
isDarkColorScheme ? "#fff" : "#000"     → className="text-white dark:text-black"
Inconsistent shadow inline everywhere  → use constants from lib/design-tokens.ts
fontSize: 13.5 arbitrary value          → use typography scale token
```

**TypeScript — Never Do This:**
```
const x = data as SomeType             → use type guard or runtime check
catch (e: any)                         → catch (e: unknown)
any without comment                    → define proper interface
Type defined in component file         → move to types/<name>.types.ts
```

**Performance Gotchas:**
- Zustand: use granular selector `useStore(s => s.field)` not `useStore()` — prevents unnecessary re-renders
- React Query: set `staleTime` per data nature (flood data: 30s, static: 5min+)
- Map overlays: memo components to avoid expensive re-renders on `react-native-maps`

**Security:**
- Tokens stored in `expo-secure-store` (not AsyncStorage) — already handled in `lib/api-client.ts`
- Never log tokens or user PII to console
- API base URL always via `lib/api-client.ts` — never hardcode in components

---

## Development Workflow Rules

**Key Scripts:**
```bash
npm run typecheck   # tsc --noEmit — run after every change
npm run check       # tsc --noEmit && expo lint — run before commit
npm run android     # expo run:android — auto-starts emulator
```

**Refactor Protocol:**
1. Read `documents/CLAUDE_<FEATURE>.md` before touching any feature
2. Compare vs baseline: `git diff 933bd44f -- features/<feature>/`
3. Commit current state before starting (backup)
4. Make small changes, run app to verify behavior unchanged
5. `tsc --noEmit` must pass before committing

**Baseline commit for comparison:**
```
933bd44f316f9dac4fba3c461c3ea93bfac46e5e
```

**Reference Implementation:** `features/map/` is the canonical pattern. Check it first.

**UI Refactor Constraint:**
- Visual/styling changes ONLY — never touch business logic, API calls, navigation, or state management
- After each epic: run Maestro smoke tests to verify no regressions

---

## Usage Guidelines

**For AI Agents:** Read this file before implementing any code. Follow ALL rules exactly. When in doubt, check `features/map/` as the canonical reference implementation.

**For Humans:** Update this file when tech stack or patterns change. Keep it lean — remove rules that become obvious over time.

_Last Updated: 2026-04-14_
