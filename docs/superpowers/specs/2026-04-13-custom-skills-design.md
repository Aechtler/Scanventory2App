# Custom Skills Design — ScanApp

**Date:** 2026-04-13  
**Status:** Approved  
**Scope:** Three project-specific proactive skills with hard gates, forming a review pipeline before any implementation

---

## Overview

Three separate, project-specific skills that form an ordered pipeline. Each has a hard gate that blocks the next step until approved. They trigger proactively within existing workflows (brainstorming → writing-plans → pipeline → executing-plans).

```
brainstorming / writing-plans
        │
        ▼
scanapp:security        ← Hard Gate #1
        │
        ▼
scanapp:architecture    ← Hard Gate #2
        │
        ▼
scanapp:ux-ui           ← Hard Gate #3 (only for UI changes)
        │
        ▼
executing-plans / code
```

Each skill contains:
- **Relevance check** — determines in 2–3 questions if a full review is needed (quick pass if irrelevant)
- **Project-specific checklist** with hard-gate items
- **Handoff trigger** to the next skill

---

## Skill 1: `scanapp:security`

**Trigger:** Always first — on every new feature, API endpoint, auth change, data storage, or external API call.

**Relevance Check:**
- Pure styling/layout change with no data flow? → Green light, proceed to Architecture
- Otherwise: full review

**Hard-Gate Checklist:**

| Area | What is checked |
|---|---|
| API Keys | No secrets in mobile code except `EXPO_PUBLIC_*` — eBay App ID ok, Service Role Keys never in client |
| Auth/Token | JWT only via `useAuthStore`, no direct AsyncStorage for tokens, 401 auto-logout active |
| Input Validation | All Express routes validate `req.body` and `req.params` (typed `Request<{id: string}>`) |
| Image Upload | File type + size validated before Supabase Storage, `uploadAsync` via `expo-file-system/legacy` |
| Supabase Storage | Policies checked: public buckets only for avatars/item images, no Service Role Key in client |
| eBay OAuth | Token refresh flow correct, no access token in logs or unencrypted AsyncStorage |
| Backend Routes | Rate limiting present, CORS configured, no raw SQL outside Prisma |
| Logging | No `console.log` with user data, tokens, or PII in production |

**Output:** Either "Security approved — proceed to Architecture" or a list of issues that must be fixed first.

---

## Skill 2: `scanapp:architecture`

**Trigger:** After Security approval, before any implementation.

**Relevance Check:**
- Bugfix in existing file with no structural changes? → Green light, proceed to UX/UI
- Otherwise: full review

**Hard-Gate Checklist:**

| Area | What is checked |
|---|---|
| Layer Rules | No cross-feature imports (`analyze` does not import from `history`), only via `shared/` |
| Feature Structure | New feature under `src/features/<name>/` with `components/`, `hooks/`, `services/`, `types/` |
| Screen Layer | `src/app/` contains only routing & composition — no business logic, no direct API calls |
| Shared Layer | Reusable logic in `src/shared/` — not duplicated inside a feature |
| API Calls | All HTTP calls via `apiClient.ts` — no direct `fetch()` |
| Store Pattern | Zustand + AsyncStorage persistence, optimistic updates, `syncService.ts` for backend sync |
| TypeScript | `Request<{id: string}>` in Express routes, `InputJsonValue` cast for Prisma JSON fields, `expo-file-system/legacy` |
| Backend Routes | New route registered under `/api/`, `index.ts` barrel export updated |
| Offline-First | Mutations happen locally first, then fire-and-forget via `syncService` |

**Output:** "Architecture approved — proceed to UX/UI" or concrete structural issues that must be fixed.

---

## Skill 3: `scanapp:ux-ui`

**Trigger:** After Architecture approval, only when new screens, components, or UI changes are involved.

**Relevance Check:**
- Backend-only change with no UI touch? → Skip skill, proceed directly to implementation
- Otherwise: full review

**Hard-Gate Checklist:**

| Area | What is checked |
|---|---|
| Marketplace Style | Product cards with prominent price (`text-2xl font-bold`), trust signals (Condition Badge, Platform Icons), clear CTAs |
| Dark Mode | All new components with NativeWind dark mode classes (`dark:bg-zinc-900`, `dark:text-white`, etc.) |
| Scan-to-List Flow | New screens in the core flow (Scan → Analyze → History → Listing) require max. 2 taps to goal |
| Card Consistency | Same card structure as `LibraryListCard`/`LibraryGridCard` — no structural divergence |
| Loading & Error States | Every async screen has a loading skeleton and error state — no empty UI |
| Tab Bar | `useUIStore` correctly used to hide tab bar on modals/sheets |
| Navigation | Expo Router conventions: dynamic routes `[id].tsx`, modals as Stack, no programmatic `navigate` to tabs |
| iOS/Android | No platform-specific hardcodes without `Platform.select()` |
| Touch Targets | Minimum 44×44pt for interactive elements |

**Output:** "UX/UI approved — implementation may begin" or design issues that must be resolved first.

---

## Skill File Locations

Skills will be created as markdown files in the Claude plugins skills directory:

```
~/.claude/plugins/skills/
  scanapp-security.md
  scanapp-architecture.md
  scanapp-ux-ui.md
```

Each skill file follows the superpowers skill format with frontmatter metadata and structured content.

---

## Integration into Existing Workflows

- After `superpowers:brainstorming` completes and `superpowers:writing-plans` produces a plan, the pipeline starts automatically
- `scanapp:security` is always first
- `scanapp:architecture` follows after security approval
- `scanapp:ux-ui` follows after architecture approval, but only if UI is involved
- Implementation (`superpowers:executing-plans`) only begins after all applicable hard gates are cleared
