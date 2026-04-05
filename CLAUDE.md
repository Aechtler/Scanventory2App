# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

pnpm monorepo with two packages:
- `packages/mobile` — React Native + Expo app (`@scandirwas/mobile`)
- `packages/backend` — Express 5 + Prisma + PostgreSQL API (`@scandirwas/backend`)

## Commands

### Development
```bash
npm run dev:mobile       # Start Expo dev server
npm run dev:backend      # Start Express with tsx watch (hot reload)
npm run docker:up        # Start PostgreSQL + Backend in Docker
npm run docker:down
npm run docker:logs
```

### Lint & Typecheck
```bash
npm run lint:mobile
npm run typecheck:mobile
npm run typecheck:backend
npm run typecheck:all    # Runs mobile + backend sequentially
npm run lint:all
```

### Test
```bash
npm run test:mobile      # Jest
npm run test:targeted    # Specific test files
npm run test:all
```

### Build
```bash
npm run build:mobile     # EAS build (Android)
npm run build:backend    # tsc → dist/
```

### Database
```bash
npm run db:migrate       # Prisma migrations
npm run db:push          # Schema push without migration files
npm run db:seed
npm run db:studio        # Prisma Studio on port 5555
```

Within `packages/backend` directly:
```bash
pnpm db:migrate
pnpm db:push
```

## Architecture

### Mobile

**State Management (Zustand + AsyncStorage)**
All stores use Zustand with AsyncStorage persistence for offline-first behavior. Key stores:
- `useAuthStore` — Auth tokens, user profile, handles 401 auto-logout and token refresh
- `useHistoryStore` (`src/features/history/store/historyStore.ts`) — Scanned items with local-first mutations
- `useCampaignStore` — Campaigns with `syncStatus` field tracking offline queue state
- `useCategoryStore`, `useUIStore` — Categories and global UI state (tab bar visibility, menus)

**Offline Sync Pattern**
Mutations happen locally first (optimistic), then `syncService.ts` fires a background request. If sync fails, the item stays local. There is no retry queue — it's true fire-and-forget. The `syncStatus` field on campaigns is the only explicit offline state indicator.

**API Layer**
`src/shared/services/apiClient.ts` — all HTTP calls go through this client. It injects JWT auth headers, handles multipart image uploads, and uses the envelope format `{ success, data, error }`. Timeouts: 12s for auth, 30s default.

**Navigation (Expo Router)**
File-based routing under `src/app/`. The root `_layout.tsx` is the auth guard — it checks `isAuthenticated` and `isLoading` from `useAuthStore`. Tabs are at `(tabs)/`. Modal screens include the analyze flow. Nested dynamic routes: `history/[id]`, `history/edit/[id]`.

**Market Price Aggregation**
Multiple providers in `src/features/market/services/{provider}/`: eBay (Browse API), Amazon, idealo, Kleinanzeigen, and Perplexity (AI-based estimation). `marketAggregator.ts` combines results. Each provider has its own types file; the shared `PriceStats` type (with `minPrice`, `maxPrice`, `avgPrice`, `medianPrice`, `totalListings`, `soldListings`) lives in `ebay/types.ts`, and `MarketValueResult` in `perplexity/types.ts`.

**TypeScript Path Aliases (mobile)**
- `@/*` → `src/*`
- `@/features/*`, `@/shared/*`, `@/app/*`

### Backend

**Stack:** Express 5 + Prisma 7 + PostgreSQL 16

**Route structure** (all under `/api`):
`/auth`, `/items`, `/categories`, `/campaigns`, `/groups`, `/users`, `/follows`, `/sharing`, `/docs` (OpenAPI), `/health`

**Express 5 gotcha:** `req.params` values are `string | string[]` — always use typed params: `Request<{ id: string }>`.

**Prisma JSON fields:** Use the helper to cast `Record<string, unknown>` → `InputJsonValue | DbNull`. Typed interfaces are not directly assignable to `Record<string, unknown>` — spread `{ ...data }` to fix.

**Deployment:** Deployed via Coolify on VPS as a Docker container. Backend changes require a new deploy in Coolify after pushing — it does not auto-deploy.

**Database** (key models): `User`, `ScannedItem` (with image + price data), `Category` (hierarchical), `Campaign`, `Group` (invite codes), `Follow`, `SharedItem`, `Message`/`Conversation` (messaging, not yet in use).

### Known TypeScript Gotchas

- `expo-file-system` v19: import from `expo-file-system/legacy` for `uploadAsync`, `FileSystemUploadType`, etc.
- Express 5: `req.params` is `string | string[]` — always use `Request<{ id: string }>` generic.
- Prisma JSON fields require the `InputJsonValue` cast helper — don't pass typed interfaces directly.

## Environment Variables

**Mobile** (`.env` in `packages/mobile`):
```
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_API_KEY
EXPO_PUBLIC_VISION_API_KEY
EXPO_PUBLIC_EBAY_APP_ID
EXPO_PUBLIC_PERPLEXITY_API_KEY
```

**Backend** (`.env.docker` in root, `.env` in `packages/backend`):
```
DATABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
API_KEY
PORT
```

## Infrastructure

- **Database:** PostgreSQL on self-hosted VPS (72.62.49.60); also accessible via Supabase MCP
- **File Storage:** Supabase Storage (avatars, item images)
- **Backend deploy:** Coolify Docker container ("duoabase") on VPS
- **Reverse proxy:** Traefik (configured via Docker labels in `docker-compose.yaml`)
