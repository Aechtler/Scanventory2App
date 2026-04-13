# ScanApp Custom Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create three project-specific Claude Code skills (`scanapp:security`, `scanapp:architecture`, `scanapp:ux-ui`) that form a hard-gate review pipeline before any implementation in the ScanApp project.

**Architecture:** Pipeline-Modell — Security → Architecture → UX/UI. Jeder Skill hat einen Relevanz-Check (Quick Pass für irrelevante Domänen) und ein Hard Gate, das die Implementierung blockiert bis der Review abgenommen ist. Skills sind proaktiv — sie triggern automatisch im Workflow nach writing-plans.

**Tech Stack:** Claude Code Skills (Markdown + YAML Frontmatter), gespeichert in `~/.claude/skills/`

---

## Task 1: Verzeichnisstruktur anlegen

**Files:**
- Create: `~/.claude/skills/scanapp-security/SKILL.md`
- Create: `~/.claude/skills/scanapp-architecture/SKILL.md`
- Create: `~/.claude/skills/scanapp-ux-ui/SKILL.md`

- [ ] **Step 1: Skills-Verzeichnis erstellen**

```bash
mkdir -p ~/.claude/skills/scanapp-security
mkdir -p ~/.claude/skills/scanapp-architecture
mkdir -p ~/.claude/skills/scanapp-ux-ui
```

Expected: drei neue Verzeichnisse unter `~/.claude/skills/`

- [ ] **Step 2: Existenz prüfen**

```bash
ls ~/.claude/skills/
```

Expected output enthält: `scanapp-security`, `scanapp-architecture`, `scanapp-ux-ui`

---

## Task 2: `scanapp:security` Skill erstellen

**Files:**
- Create: `~/.claude/skills/scanapp-security/SKILL.md`

- [ ] **Step 1: SKILL.md schreiben**

Erstelle `~/.claude/skills/scanapp-security/SKILL.md` mit folgendem Inhalt:

```markdown
---
name: scanapp-security
description: Use when starting any implementation task in ScanApp — always first in the pipeline, before architecture and UX review. Run on every new feature, API endpoint, auth change, data storage change, or external API call.
---

# ScanApp Security Review

## Overview

**HARD GATE — Implementation is blocked until this review is approved.**

Security is always the first stop in the ScanApp review pipeline. This skill knows the ScanApp stack: React Native + Expo (NativeWind), Zustand + AsyncStorage, Express 5 + Prisma, Supabase Storage, eBay OAuth.

## Relevance Check

Ask these questions first:

1. Is this a pure styling/layout change with zero data flow involved?
   - YES → Output "Security: Quick Pass ✓ — no data flow affected. Proceed to Architecture." and stop.
   - NO → Continue with full review below.

## Hard-Gate Checklist

Work through every item. If any item fails, list it explicitly and block implementation until fixed.

### API Keys & Secrets
- [ ] No secrets in mobile code except `EXPO_PUBLIC_*` prefixed variables
- [ ] eBay App ID in `EXPO_PUBLIC_EBAY_APP_ID` — acceptable
- [ ] Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) NEVER in mobile client — backend only
- [ ] `EXPO_PUBLIC_API_KEY` only used for internal backend auth, not for third-party services

### Auth & Token Handling
- [ ] JWT tokens only accessed via `useAuthStore` (`src/shared/store/` or `src/features/auth/`)
- [ ] No direct `AsyncStorage.getItem('token')` outside of `useAuthStore`
- [ ] 401 auto-logout is active — `apiClient.ts` intercepts 401 and calls `useAuthStore.logout()`
- [ ] eBay OAuth: access token stored only in memory or encrypted store, not in plain AsyncStorage

### Input Validation (Backend)
- [ ] All new Express routes use typed params: `Request<{ id: string }>` (not plain `Request`)
- [ ] `req.body` validated/typed before use — no `any` casts on incoming data
- [ ] Route IDs parsed as strings then validated (UUID format if applicable) before Prisma queries

### Image Upload
- [ ] File type validated server-side before Supabase Storage write (images only: jpeg, png, webp)
- [ ] File size limit enforced (mobile uploads via `expo-file-system/legacy` `uploadAsync`)
- [ ] No user-controlled file paths used directly in storage operations

### Supabase Storage
- [ ] Public buckets: only `avatars` and `item-images` — no other buckets made public
- [ ] Storage operations from mobile use the Supabase client with JWT auth, not Service Role Key
- [ ] Storage operations from backend use Service Role Key only from `packages/backend`

### eBay OAuth Flow
- [ ] Token refresh flow correctly handles expiry — no stale tokens used silently
- [ ] No eBay access token logged via `console.log` or sent to any analytics service
- [ ] OAuth callback URL validated against allowlist

### Backend Security
- [ ] Rate limiting present on new routes (existing middleware applies — verify it's not bypassed)
- [ ] CORS configured — no `origin: '*'` added
- [ ] No raw SQL queries — all DB access via Prisma ORM
- [ ] No `eval()`, `Function()`, or dynamic `require()` added

### Logging & PII
- [ ] No `console.log` with user data (email, name, tokens, item details) in production paths
- [ ] New backend routes do not log full `req.body` (may contain PII)

## Output

If all items pass:
> "Security approved ✓ — proceed to scanapp:architecture"

If any items fail:
> "Security BLOCKED — the following must be fixed before implementation:
> - [list each failing item]"

Do not proceed to architecture review until all items pass.
```

- [ ] **Step 2: Datei prüfen**

```bash
cat ~/.claude/skills/scanapp-security/SKILL.md | head -5
```

Expected: zeigt Frontmatter mit `name: scanapp-security`

- [ ] **Step 3: Commit (im ScanApp Repo)**

```bash
cd /Users/aechter/Projekte/ScanApp
git add -A
git commit -m "feat: add scanapp-security skill"
```

---

## Task 3: `scanapp:architecture` Skill erstellen

**Files:**
- Create: `~/.claude/skills/scanapp-architecture/SKILL.md`

- [ ] **Step 1: SKILL.md schreiben**

Erstelle `~/.claude/skills/scanapp-architecture/SKILL.md` mit folgendem Inhalt:

```markdown
---
name: scanapp-architecture
description: Use after scanapp:security approves, before any implementation in ScanApp. Reviews Clean Architecture compliance, feature structure, store patterns, TypeScript gotchas, and backend route conventions.
---

# ScanApp Architecture Review

## Overview

**HARD GATE — Implementation is blocked until this review is approved.**

Second stop in the ScanApp review pipeline (after Security). Enforces the Clean Architecture and project conventions for the ScanApp monorepo: `packages/mobile` (React Native + Expo) and `packages/backend` (Express 5 + Prisma).

## Architecture Reference

```
App Layer (src/app/)         ← Routing & screen composition only
        ↓
Feature Layer (src/features/) ← Isolated feature modules
        ↓
Shared Layer (src/shared/)   ← Reusable, cross-feature code
        ↓
External (APIs, Supabase, eBay, etc.)
```

**Hard rule:** Features MUST NOT import from other features. Only via `src/shared/`.

## Relevance Check

Ask these questions first:

1. Is this a bugfix in an existing file with no new files, no structural changes, and no new dependencies between modules?
   - YES → Output "Architecture: Quick Pass ✓ — bugfix with no structural impact. Proceed to UX/UI." and stop.
   - NO → Continue with full review below.

## Hard-Gate Checklist

### Layer Rules
- [ ] No cross-feature imports: e.g., `src/features/analyze` does NOT import from `src/features/history`
- [ ] Cross-feature data flows only via `src/shared/` utilities, hooks, or stores
- [ ] `src/app/` screens contain ONLY: route configuration, screen layout composition, and hook calls — no business logic, no direct API calls, no store mutations

### Feature Module Structure
- [ ] New feature lives under `src/features/<feature-name>/`
- [ ] Feature directory contains only these subdirectories: `components/`, `hooks/`, `services/`, `types/`, optionally `store/` and `utils/`
- [ ] Each subdirectory has a barrel `index.ts` that exports only the public API
- [ ] Feature does NOT have a direct `api.ts` or `fetch.ts` — all API calls go via `apiClient.ts`

### Shared Layer Usage
- [ ] Logic used by 2+ features lives in `src/shared/` (not duplicated inside each feature)
- [ ] `src/shared/services/apiClient.ts` is the ONLY place HTTP calls are made from mobile
- [ ] New reusable UI components go to `src/shared/components/`, not inside a feature

### State Management (Zustand)
- [ ] New stores follow the pattern in `src/features/history/store/historyStore.ts`: Zustand + AsyncStorage persistence
- [ ] Local mutations are optimistic (update store first, then sync to backend)
- [ ] Background sync goes via `src/features/history/services/syncService.ts` pattern (fire-and-forget)
- [ ] No direct `fetch()` inside a Zustand store action — use `apiClient.ts`

### TypeScript Correctness
- [ ] Express route handlers use typed params: `Request<{ id: string }>` not bare `Request`
- [ ] Prisma JSON fields use the `InputJsonValue` cast helper — typed interfaces never assigned directly to JSON fields
- [ ] `expo-file-system` imports use `expo-file-system/legacy` for `uploadAsync`, `FileSystemUploadType`
- [ ] No `any` introduced — if a type is unknown, use `unknown` and narrow it

### Backend Route Conventions
- [ ] New route file added under `packages/backend/src/routes/`
- [ ] Route registered in `packages/backend/src/routes/index.ts` under `/api/<resource>`
- [ ] Route file exports a single `router` (Express Router)
- [ ] Controller logic kept in route handler or dedicated controller file — no business logic in `index.ts`

### Offline-First Pattern
- [ ] New create/update/delete operations follow: local store update → fire-and-forget sync via syncService
- [ ] No blocking `await` on sync calls in UI-facing code
- [ ] `syncStatus` field added to store state if the feature needs to track sync state (see `useCampaignStore`)

## Output

If all items pass:
> "Architecture approved ✓ — proceed to scanapp:ux-ui"

If any items fail:
> "Architecture BLOCKED — the following must be fixed before implementation:
> - [list each failing item]"

Do not proceed to UX/UI review until all items pass.
```

- [ ] **Step 2: Datei prüfen**

```bash
cat ~/.claude/skills/scanapp-architecture/SKILL.md | head -5
```

Expected: zeigt Frontmatter mit `name: scanapp-architecture`

- [ ] **Step 3: Commit**

```bash
cd /Users/aechter/Projekte/ScanApp
git add -A
git commit -m "feat: add scanapp-architecture skill"
```

---

## Task 4: `scanapp:ux-ui` Skill erstellen

**Files:**
- Create: `~/.claude/skills/scanapp-ux-ui/SKILL.md`

- [ ] **Step 1: SKILL.md schreiben**

Erstelle `~/.claude/skills/scanapp-ux-ui/SKILL.md` mit folgendem Inhalt:

```markdown
---
name: scanapp-ux-ui
description: Use after scanapp:architecture approves, when implementation includes new screens, components, or UI changes in ScanApp. Enforces marketplace-style design, NativeWind dark mode, Expo Router conventions, and accessibility minimums.
---

# ScanApp UX/UI Review

## Overview

**HARD GATE — Implementation is blocked until this review is approved.**

Third and final stop in the ScanApp review pipeline (after Security and Architecture). Enforces the marketplace-oriented visual design language and React Native UX conventions for ScanApp.

**Design language:** Marketplace (eBay/Vinted style) — product cards with prominent pricing, trust signals, fast scan-to-list flow, dark mode first.

## Relevance Check

Ask these questions first:

1. Is this a backend-only change with no new screens, no new components, and no modifications to existing UI?
   - YES → Output "UX/UI: Quick Pass ✓ — no UI changes. Implementation may begin." and stop.
   - NO → Continue with full review below.

## Hard-Gate Checklist

### Marketplace Visual Style
- [ ] Product prices displayed prominently: minimum `text-xl font-bold` (prefer `text-2xl font-bold`)
- [ ] Product condition shown as a badge/chip near the price (Condition Badge pattern from `EditableProductCard`)
- [ ] Platform source icons visible where items come from eBay/Kleinanzeigen/Amazon (trust signal)
- [ ] Primary CTA button is clear, full-width or prominent, with a single action label (e.g. "Jetzt inserieren", "Scan starten")
- [ ] Secondary actions de-emphasized (smaller, outline, or text button style)

### Dark Mode (NativeWind)
- [ ] Every new component uses NativeWind dark mode classes alongside light mode classes
- [ ] Background: `bg-white dark:bg-zinc-900` (screens) or `bg-zinc-100 dark:bg-zinc-800` (cards)
- [ ] Text: `text-zinc-900 dark:text-white` (primary) / `text-zinc-500 dark:text-zinc-400` (secondary)
- [ ] Borders: `border-zinc-200 dark:border-zinc-700`
- [ ] No hardcoded color values (`#fff`, `rgb(...)`) — only NativeWind classes
- [ ] No `StyleSheet.create()` with color values for new UI — use NativeWind

### Scan-to-List Flow Efficiency
- [ ] Any screen in the core flow (Scan → Analyze → History → Listing) reaches its goal in max 2 taps from the previous screen
- [ ] No dead-end screens — every screen has a clear next action or back navigation
- [ ] Floating Action Button or prominent scan button visible on list screens

### Card & Component Consistency
- [ ] New product/item cards follow the structure of `LibraryListCard` or `LibraryGridCard` — not a custom layout
- [ ] Card images: consistent aspect ratio (use the existing card image pattern)
- [ ] New components don't re-implement patterns already in `src/shared/components/` (check CardSlider, StatusBanner first)

### Loading & Error States
- [ ] Every new screen that fetches async data has a loading skeleton or spinner
- [ ] Every async screen has an error state with a user-readable message and retry option
- [ ] No screen renders an empty white/black screen while data loads

### Navigation & Tab Bar
- [ ] `useUIStore` called to hide tab bar on modal screens and full-screen sheets
- [ ] Dynamic route files follow naming: `[id].tsx` (not `[itemId].tsx` or other variations)
- [ ] Modals presented as Stack screens (not Tab navigation)
- [ ] No `router.push('/tabs/...')` — programmatic tab navigation uses tab state, not push

### Platform Compatibility
- [ ] No iOS-specific or Android-specific hardcodes without `Platform.select({ ios: ..., android: ... })`
- [ ] Safe area insets handled via `useSafeAreaInsets()` or `SafeAreaView` on new screens
- [ ] Keyboard avoiding behavior on screens with text inputs (`KeyboardAvoidingView`)

### Accessibility (Minimum)
- [ ] All interactive elements have minimum touch target size of 44×44pt
- [ ] Icon-only buttons have an `accessibilityLabel` prop
- [ ] Images that convey meaning have `accessibilityLabel`; decorative images have `accessible={false}`

## Output

If all items pass:
> "UX/UI approved ✓ — implementation may begin."

If any items fail:
> "UX/UI BLOCKED — the following must be fixed before implementation:
> - [list each failing item]"

Implementation only begins after all three pipeline stages have been approved.
```

- [ ] **Step 2: Datei prüfen**

```bash
cat ~/.claude/skills/scanapp-ux-ui/SKILL.md | head -5
```

Expected: zeigt Frontmatter mit `name: scanapp-ux-ui`

- [ ] **Step 3: Commit**

```bash
cd /Users/aechter/Projekte/ScanApp
git add -A
git commit -m "feat: add scanapp-ux-ui skill"
```

---

## Task 5: Skills registrieren und testen

- [ ] **Step 1: Alle drei Skills auflisten**

```bash
ls ~/.claude/skills/
```

Expected output: `scanapp-security  scanapp-architecture  scanapp-ux-ui`

- [ ] **Step 2: Claude Code neu starten**

Claude Code muss neu gestartet werden damit neue Skills im Skill-Tool verfügbar sind.

Beende die aktuelle Session und starte sie neu mit:
```bash
claude
```

- [ ] **Step 3: Skills laden prüfen**

In der neuen Session einen Skill manuell aufrufen:
```
Use scanapp:security skill
```

Expected: Skill lädt und zeigt den Relevanz-Check + Checkliste.

- [ ] **Step 4: Pipeline-Ablauf manuell testen**

Gib folgende Anweisung:
```
We're going to add a new eBay listing endpoint to the backend. 
Start the review pipeline.
```

Expected: `scanapp:security` startet automatisch (kein Quick Pass da API-Änderung), nach Approval `scanapp:architecture`, dann UX/UI Quick Pass (Backend-only).

---

## Self-Review

**Spec coverage:**
- ✓ Security skill mit allen Bereichen aus der Spec (API Keys, Auth, Validation, Image Upload, Supabase, eBay, Backend, Logging)
- ✓ Architecture skill mit Layer-Regeln, Feature-Struktur, Store-Pattern, TypeScript-Gotchas, Backend-Konventionen, Offline-First
- ✓ UX/UI skill mit Marketplace-Stil, Dark Mode, Scan-Flow, Card-Konsistenz, Loading/Error States, Navigation, Platform, Accessibility
- ✓ Hard Gates in allen drei Skills
- ✓ Quick Pass / Relevanz-Check in allen drei Skills
- ✓ Pipeline-Übergabe: jeder Skill sagt explizit welcher als nächstes kommt
- ✓ Proaktive Trigger beschrieben in den `description` Feldern
- ✓ Projektspezifische Referenzen (konkrete Dateinamen, Stores, Komponenten)

**Placeholder scan:** Keine TBDs, keine TODOs, kein "implement later" — alle Checklist-Items sind konkret und handlungsfähig.

**Type consistency:** Keine Typ-Inkonsistenzen — Skills sind Markdown, keine Code-Typen betroffen.
