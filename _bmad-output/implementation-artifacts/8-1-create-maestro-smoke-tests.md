# Story 8.1: Create Maestro Smoke Tests

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want Maestro smoke test flows that verify app launch and tab navigation,
So that I can quickly validate the app is functional after each epic's refactor.

## Acceptance Criteria

1. `maestro/` directory and subdirectory structure exists: `maestro/flows/smoke/`, `maestro/_screenshots/`
2. `maestro/flows/smoke/app-launch.yaml` exists with a complete smoke test flow
3. The flow launches the app using `appId: com.fda.mobile` (confirmed in `app.json`)
4. The flow verifies the app launches without crash (asserts a root-level element is visible)
5. The flow navigates to each tab (home, areas, map, notifications, profile) and asserts navigation succeeds via `testID` selectors
6. The flow runs successfully on Android physical device or emulator
7. `maestro/_screenshots/` directory placeholder exists (`.gitkeep` or auto-created during run)

## Tasks / Subtasks

- [ ] Task 1: Create directory structure (AC: #1, #7)
  - [ ] 1.1: Create `maestro/flows/smoke/` directory
  - [ ] 1.2: Create `maestro/flows/home/` directory (placeholder for Story 8.2)
  - [ ] 1.3: Create `maestro/flows/notifications/` directory (placeholder for Story 8.2)
  - [ ] 1.4: Create `maestro/flows/alerts/` directory (placeholder for Story 8.2)
  - [ ] 1.5: Create `maestro/flows/areas/` directory (placeholder for Story 8.2)
  - [ ] 1.6: Create `maestro/flows/prediction/` directory (placeholder for Story 8.2)
  - [ ] 1.7: Create `maestro/flows/map/` directory (placeholder for Story 8.2)
  - [ ] 1.8: Create `maestro/_screenshots/.gitkeep` file

- [ ] Task 2: Create `maestro/flows/smoke/app-launch.yaml` (AC: #2, #3, #4, #5, #6)
  - [ ] 2.1: Set `appId: com.fda.mobile` at the top of the flow
  - [ ] 2.2: Add `launchApp` command to start the app fresh
  - [ ] 2.3: Assert app launched — assert initial screen element visible (map tab is default: `assertVisible: {id: "map-tab"}` or fall back to tab bar container)
  - [ ] 2.4: Tap home tab and assert home screen is visible via `testID="home-header-container"`
  - [ ] 2.5: Tap areas tab and assert areas screen is visible via `testID` (see Dev Notes for available IDs)
  - [ ] 2.6: Tap map tab and assert map screen is visible
  - [ ] 2.7: Tap notifications tab and assert notifications screen visible via `testID="notifications-header-container"`
  - [ ] 2.8: Tap profile tab and assert profile screen is visible
  - [ ] 2.9: Add screenshot capture after each tab assertion, saved to `maestro/_screenshots/`

## Dev Notes

### Architecture Context

**Testing strategy**: Maestro E2E, Android-first, no unit test framework in project.
**appId**: `com.fda.mobile` — confirmed in `app.json` (both iOS `bundleIdentifier` and Android `package`).
**Expo Go fallback**: Use `host.exp.Exponent` only if dev build (`com.fda.mobile`) is unavailable.
**Source**: [architecture.md — Testing Architecture section]

**Maestro structure** per architecture:
```
maestro/
├── flows/
│   ├── smoke/          ← this story
│   │   └── app-launch.yaml
│   ├── home/           ← Story 8.2
│   ├── alerts/
│   ├── areas/
│   ├── map/
│   ├── notifications/
│   └── prediction/
└── _screenshots/       ← auto-generated, create with .gitkeep
```

### Tab Navigation Context

Tab names in `app/(tabs)/_layout.tsx` (Expo Router `name=` props):
```
name="home/index"       → Home tab
name="areas"            → Areas tab
name="map/index"        → Map tab (default initial route)
name="notifications"    → Notifications tab
name="profile"          → Profile tab
```

**Initial route**: `map/index` is the default tab (`unstable_settings.initialRouteName = "map/index"`).
So on app launch the Map tab is shown first.

### Available testIDs for Smoke Tests

**Home screen** (confirmed in codebase):
- `testID="home-header-container"` — HomeHeader component root

**Notifications screen** (confirmed in codebase):
- `testID="notifications-header-container"` — NotificationsHeader root
- `testID="notifications-toggle-container"` — tab toggle (alerts/news)

**Areas screen**: No root container testID found in current refactor state. Use a stable element visible on screen load. Consider using the `AreaCard` or `AreasHeader` if testIDs exist, otherwise tap the tab and assert no crash.

**Alerts tab**: Alerts is accessed via a sub-navigation within the tab structure; the alerts tab appears as part of notifications. Check the actual tab structure.

**Map screen**: Map tab is the default — use a map element testID if available, or rely on tab bar presence.

**Profile screen**: No profile screen testIDs found yet — assert screen renders (no crash) rather than specific element.

> **IMPORTANT**: Where specific testIDs are missing, use `assertVisible` on a text string or use `takeScreenshot` to confirm visually rather than failing the flow. Smoke tests must be resilient — a missing testID should NOT prevent the flow from running.

### Maestro YAML Syntax Reference

```yaml
# Basic Maestro v1 syntax (used in this project)
appId: com.fda.mobile
---
- launchApp
- assertVisible:
    id: "element-testID"
- tapOn:
    id: "element-testID"
- takeScreenshot: "smoke-TC1-app-launch"
```

**Tap by testID**: `tapOn: {id: "testID-value"}`
**Assert by testID**: `assertVisible: {id: "testID-value"}`
**Assert by text**: `assertVisible: "Some Text"`
**Screenshot**: `takeScreenshot: "filename-without-extension"` → saved to `_screenshots/`

> Screenshots are saved relative to where Maestro is run. Running `maestro test maestro/flows/smoke/app-launch.yaml` from project root saves to `maestro/_screenshots/`.

### Resilience Pattern for Missing testIDs

When a screen lacks a reliable testID, use text assertion or skip assertion with a comment:
```yaml
# Areas screen — no root testID yet, assert tab bar still visible
- tapOn:
    text: "Areas"  # tap tab bar label if no testID available
- takeScreenshot: "smoke-TC4-areas-tab"
# assertVisible: {id: "areas-header"} — add after Story 5 testIDs are merged
```

### PR Context

This is the **first story in Epic 8** — the Maestro infrastructure does not exist yet. Create all files from scratch.

Story 8.2 (feature flows) depends on this story's directory structure being in place.

The `maestro/` folder is at the **project root** alongside `app/`, `features/`, `components/`.

### Verification

After creating the flow:
```bash
# Install Maestro if not installed: curl -Ls "https://get.maestro.mobile.dev" | bash
maestro test maestro/flows/smoke/app-launch.yaml
```
Run on a physical Android device or emulator with `com.fda.mobile` installed (via `npm run android`).

### References

- [Source: architecture.md — Testing Architecture]
- [Source: architecture.md — appId: `com.fda.mobile` (dev build)]
- [Source: app.json — `android.package: "com.fda.mobile"`]
- [Source: app/(tabs)/_layout.tsx — tab names and initial route]
- [Source: features/home/components/HomeHeader.tsx — `testID="home-header-container"`]
- [Source: features/notifications/components/NotificationsHeader.tsx — `testID="notifications-header-container"`]
- [Source: features/notifications/components/NotificationTabToggle.tsx — `testID="notifications-toggle-container"`]
- [Source: prd.md — FR32, NFR11]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
