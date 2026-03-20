# Claude Checkpoint

## Status

Batch 1 is complete on `scanapp2`.
Batch 2 is implemented in code and pending runnable-environment validation.
Batch 3 is implemented in code and pending runnable-environment validation.
Batch 4 is implemented in code and pending runnable-environment validation.
Batch 5 is implemented in code on `scanapp2`, including backend payload typing, delete-consistency hardening, normalized auth response envelopes, and auth-store deduplication.
Batch 6 has started on `scanapp2` with a runnable manual regression checklist and a lightweight targeted node-test entrypoint for extracted helpers.
The first Batch 7 size-rule refactor is implemented on `scanapp2` for `packages/mobile/src/app/(tabs)/library.tsx`, extracting screen-local row helpers, empty states, and row-building pagination constants into the history feature.
A follow-up shared-UI cleanup checkpoint is now implemented on `scanapp2`, covering centralized tab-bar colors, centralized animation presets, and missing shared-component barrel exports.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/mobile/src/shared/components/Animated.tsx`, splitting the shared animation helpers into focused component files behind a compatibility barrel.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/mobile/src/features/market/services/ebay/search.ts`, keeping the marketplace search orchestration in place while moving listing parsing and price-stat calculation into focused helper files with targeted Node coverage.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/mobile/src/features/history/store/historyStore.ts`, moving store transitions, selectors, and types into focused siblings while keeping the Zustand API stable.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`, keeping the public hook API stable while extracting vision orchestration, product-image loading, and platform-link composition into focused siblings.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/backend/src/routes/items.ts`, keeping the public `/api/items` router stable while moving create/read/delete/update handlers and shared validation helpers into focused sibling files.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/mobile/src/app/history/[id].tsx`, keeping the route screen focused on store/routing wiring while moving header actions, market/quicklink rendering, not-found UI, and detail-state helpers into focused siblings.
The next Batch 7 size-rule refactor is now implemented on `scanapp2` for `packages/backend/src/services/itemService.ts`, keeping the public service API stable while moving create/update payload normalization into focused helper builders.
The next backend architecture cleanup is now implemented on `scanapp2` for `packages/backend/src/services/itemService.ts`, replacing direct Prisma construction in the service logic with an injectable `createItemService(prisma)` factory while preserving the existing route-facing API.
The next mobile architecture cleanup is now implemented on `scanapp2` for `packages/mobile/src/features/history/store/historyStore.ts`, replacing hardcoded cache/sync side effects with an injectable `createHistoryStoreState(...)` seam while preserving the public persisted Zustand hook.
The next backend schema architecture cleanup is now implemented on `scanapp2` for `packages/backend/prisma/schema.prisma`, adding the missing `ScannedItem` compound index on `userId + scannedAt` together with a lightweight schema regression test and Prisma migration.
The next backend architecture cleanup is now implemented on `scanapp2` for request logging, adding a central Express middleware that logs method, path, status, timing, and optional JWT-derived user IDs with lightweight Node coverage.
The next backend architecture cleanup is now implemented on `scanapp2` for `packages/backend/src/routes/health.ts`, expanding `/api/health` from a server-only ping into DB, upload-directory, and disk-space dependency checks with a lightweight Node-tested response builder.
The next backend compose architecture cleanup is now implemented on `scanapp2`, moving hardcoded Docker Compose Postgres credentials into env files with a lightweight regression test that rejects literal DB secrets in both compose manifests.
The next backend architecture cleanup is now implemented on `scanapp2` for API documentation, adding a maintained OpenAPI 3.1 document at `/api/docs/openapi.json` plus a lightweight Swagger UI shell at `/api/docs` with targeted Node coverage.
The next backend architecture cleanup is now implemented on `scanapp2` for request-ID tracing, adding a central middleware that preserves or generates `x-request-id`, echoes it in responses, and includes it in request logs with lightweight Node coverage.
The next minor shared-UI cleanup is now implemented on `scanapp2` for `packages/mobile/src/shared/components/CardSlider/CardSlider.tsx`, replacing the wrapper `index` key with child-derived stable keys backed by a lightweight Node-tested helper.
The next minor shared-hook cleanup is now implemented on `scanapp2` for `packages/mobile/src/shared/hooks/useAsync.ts`, introducing an explicit exported `UseAsyncResult<T, Args>` return contract backed by a lightweight Node signature guard.
The next minor market aggregation cleanup is now implemented on `scanapp2` for `packages/mobile/src/features/market/services/marketAggregator.ts`, replacing synthetic linear price interpolation with real platform-listing aggregation plus a controlled stats fallback backed by targeted Node coverage.
The next backend logging cleanup is now implemented on `scanapp2` for `packages/backend/src/middleware/errorHandler.ts`, replacing raw stack-trace logging with sanitized request-correlated error lines backed by lightweight Node coverage.
The next backend documentation cleanup is now implemented on `scanapp2` for `packages/backend/src/routes/apiDocs.ts`, splitting the oversized OpenAPI document builder and route-path definitions into focused metadata, path, component, and Swagger-HTML helpers while preserving the public docs route API.
The next runnable-backend validation cleanup is now implemented on `scanapp2` for `packages/backend/src/middleware/requestId.ts`, tightening `x-request-id` normalization to reject blank, control-character, and oversized header values while adding direct targeted Node coverage for request-id preservation and regeneration behavior.
The next runnable-environment validation cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, expanding workspace bootstrap failures with explicit affected-package remediation so missing offline cache/toolchain packages are actionable instead of opaque.
The next runnable-environment toolchain cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, adding best-effort cached-package restoration plus lockfile-driven offline cache-miss detection so hollow workspace installs now report every missing tarball instead of stopping at the first npm failure.
The next runnable-environment bootstrap cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, surfacing missing or malformed root `package-lock.json` files as actionable workspace-setup diagnostics instead of raw fs/JSON exceptions.
The next runnable-environment bootstrap cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, expanding missing-package detection to hollow installed `@types/*` directories so backend/mobile typecheck blockers are reported and cache-restored alongside the existing Expo/nativewind toolchain requirements.
The next runnable-environment validation cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, exporting the bootstrap orchestration behind a testable runner and adding direct Node coverage for package-lock diagnostics, cache-restore short-circuiting, and offline-install failure reporting while preserving the CLI entrypoint behavior.
The next runnable-environment bootstrap cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, expanding missing-package detection from the curated toolchain set to all direct root/mobile/backend workspace dependencies so hollow runtime packages are cache-restored or reported before typecheck stalls on hidden missing-module errors.
The next runnable-environment diagnostics cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, grouping missing packages by direct workspace owners versus additional hollow installed packages so setup failures now show what blocks backend, mobile, or only transitive/test dependencies at a glance.
The next runnable-environment diagnostics cleanup is now implemented on `scanapp2` for `scripts/workspace-toolchain-health.mjs`, summarizing oversized missing-package and offline-cache-miss reports so bootstrap failures stay actionable in dependency-limited environments instead of dumping thousand-line transitive package lists.
The next runnable-environment diagnostics cleanup is now implemented on `scanapp2` for `scripts/workspace-toolchain-health.mjs`, annotating direct `@types/*` workspace dependencies with the runtime packages they block so backend/mobile typecheck failures are easier to triage when offline cache restoration is still incomplete.
The next runnable-environment validation cleanup is now implemented on `scanapp2` for root typecheck entrypoints, routing `npm run typecheck:mobile` and `npm run typecheck:backend` through the existing workspace-setup guard so missing toolchain packages now fail with actionable setup diagnostics before raw TypeScript module errors.
The next runnable-environment bootstrap cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, retrying cache restoration after a failed offline install so newly hollow packages are healed before the final blocker report.
The next runnable-environment bootstrap cleanup is now implemented on `scanapp2` for `scripts/workspace-toolchain-health.mjs`, treating empty cached tarball reads as unresolved packages instead of crashing the workspace setup path.
The next runnable-environment validation cleanup is now implemented on `scanapp2` for the root backend build entrypoint, routing `npm run build:backend` through the existing workspace-setup guard so missing local TypeScript/toolchain packages now fail with actionable setup diagnostics before raw `Cannot find module .../tsc` errors.
The next runnable-environment bootstrap cleanup is now implemented on `scanapp2` for `scripts/setup-workspace-toolchain.mjs`, preflighting unresolved lockfile-backed cache misses so doomed offline installs stop before they expand `node_modules` into hundreds of additional hollow transitive package directories.
The next runnable-environment validation cleanup is now implemented on `scanapp2` for the root mobile lint entrypoint, routing `npm run lint:mobile` through the existing workspace-setup guard so missing local TypeScript/toolchain packages now fail with actionable setup diagnostics before raw `Cannot find module 'typescript'` errors.

## Analyzed

- Branch and worktree state on `scanapp2`
- Review backlog in `CODE_REVIEW_TODOS.md`
- Repo structure, tooling, and monorepo layout
- Product shape from docs and code
- Mobile feature areas: auth, scan, analyze, market, history
- Backend API/routes/services and Prisma schema
- Local persistence, image caching, and backend sync path
- Pricing/value pipeline via eBay and Perplexity
- Existing review TODOs and current verification surface
- Verification reality: no installed workspace dependencies are currently available for lint/typecheck runs
- Batch 1 bug targets in history store, library pricing UI, and final-price parsing
- Batch 2 resilience targets in `useAnalysis.ts`, `visionService.ts`, and `apiClient.ts`
- Batch 4 trust-boundary targets in backend upload/auth routes, JWT request typing, backend HTTPS enforcement, and mobile API URL/upload validation
- Batch 5 contract/consistency targets in backend types, auth envelopes, delete flow, and auth-store duplication
- Remaining small P2 cleanup targets in shared UI constants, animation presets, barrel exports, and size-rule candidates
- Batch 7 first size-rule target in `library.tsx`, including row rendering, empty states, and row-building extraction boundaries
- Batch 7 next size-rule target in `Animated.tsx`, including extraction boundaries for shared animation helpers and keeping import compatibility stable
- Batch 7 next size-rule target in `search.ts`, including extraction boundaries between eBay marketplace orchestration, listing parsing, and price-stat helpers
- Batch 7 next size-rule target in `historyStore.ts`, including extraction boundaries between Zustand wiring, pure item transitions, selector lookup, and store type definitions
- Batch 7 next size-rule target in `useAnalysis.ts`, including extraction boundaries between vision execution, product-image enrichment, quicklink generation, and manual-search helper logic
- Batch 7 next size-rule target in `items.ts`, including extraction boundaries between router wiring, shared auth/validation helpers, multipart create handling, and update/delete handlers
- Batch 7 next size-rule target in `history/[id].tsx`, including extraction boundaries between route wiring, header actions, market/quicklink section rendering, and detail-state bootstrap helpers
- Batch 7 next size-rule target in `itemService.ts`, including extraction boundaries between Prisma CRUD orchestration and payload normalization for create/price update flows
- ARCH-01 backend dependency-injection target in `itemService.ts`, including the smallest seam for replacing direct `PrismaClient` construction with an injectable service factory
- ARCH-02 mobile dependency-injection target in `historyStore.ts`, including the smallest seam for replacing hardcoded cache/sync services with injected dependencies while keeping the app-facing Zustand API stable
- ARCH-03 database indexing target in `packages/backend/prisma/schema.prisma`, including the missing `ScannedItem` compound index for user-filtered timeline reads and the smallest lightweight guard that can run without a live database
- ARCH-04 backend request-logging target in `packages/backend/src/app.ts`, including the smallest central middleware that records method, path, status, duration, and optional authenticated user context without introducing request-ID scope yet
- ARCH-05 backend health-check target in `packages/backend/src/routes/health.ts`, including the smallest injectable seam for DB, upload-directory, and disk-space probes that stays runnable in the dependency-limited workspace
- ARCH-06 docker-compose credential target in `docker-compose.yml` and `packages/backend/docker-compose.yml`, including the smallest env-file wiring that removes literal Postgres credentials from checked-in compose manifests while keeping lightweight local startup documentation
- ARCH-07 backend API documentation target in `packages/backend/src/routes`, including the smallest maintained OpenAPI document and Swagger UI exposure that can ship without adding heavy runtime dependencies
- ARCH-08 backend request-correlation target in `packages/backend/src/middleware`, including the smallest app-level seam for preserving or generating `x-request-id` and carrying it through the existing request logger without adding heavy tracing infrastructure
- Follow-up request-id hardening target in `packages/backend/src/middleware/requestId.ts`, narrowing accepted inbound `x-request-id` values so log correlation stays safe without depending on a full backend runtime
- MINOR-04 market aggregation target in `packages/mobile/src/features/market/services/marketAggregator.ts`, including replacing synthetic min/max interpolation with a helper that prefers real listing-price distributions and only falls back to platform-level stats when listings are unavailable
- Follow-up workspace toolchain target in `scripts/setup-workspace-toolchain.mjs`, including the smallest best-effort cached-package restoration step and lockfile-driven offline cache validation that can run without network access

## Created

- `CLAUDE_PROJECT_ANALYSIS.md`
- `docs/plans/2026-03-17-implementation-batches.md`
- `.project-skills/SKILLS_INDEX.md`
- `.project-skills/scanventory-app-map/SKILL.md`
- `.project-skills/scanventory-recognition-flow/SKILL.md`
- `.project-skills/scanventory-pricing-pipeline/SKILL.md`
- `.project-skills/scanventory-history-sync/SKILL.md`
- `.project-skills/scanventory-manual-regression/SKILL.md`
- `packages/mobile/src/features/history/utils/historyPricing.ts`
- `packages/mobile/src/features/history/utils/historyPricing.test.ts`
- `packages/mobile/src/features/analyze/utils/productImageLoading.ts`
- `packages/mobile/src/features/analyze/utils/productImageLoading.test.ts`
- `docs/manual-regression-checklist.md`
- shared `TAB_BAR_COLORS` and `ANIMATION_PRESETS` in `packages/mobile/src/shared/constants/index.ts`
- `packages/mobile/src/features/history/utils/libraryRows.ts`
- `packages/mobile/src/features/history/components/LibraryListItem.tsx`
- `packages/mobile/src/features/history/components/LibraryGridItem.tsx`
- `packages/mobile/src/features/history/components/LibraryEmptyStates.tsx`
- `packages/mobile/src/shared/components/Animated/AnimatedButton.tsx`
- `packages/mobile/src/shared/components/Animated/FadeInView.tsx`
- `packages/mobile/src/shared/components/Animated/StaggeredItem.tsx`
- `packages/mobile/src/shared/components/Animated/PulseView.tsx`
- `packages/mobile/src/shared/components/Animated/BounceInView.tsx`
- `packages/mobile/src/shared/components/Animated/SlideUpView.tsx`
- `packages/mobile/src/shared/components/Animated/AnimatedNumber.tsx`
- `packages/mobile/src/shared/components/Animated/shared.ts`
- `packages/mobile/src/shared/components/Animated.test.ts`
- `packages/mobile/src/features/market/services/ebay/parseListings.ts`
- `packages/mobile/src/features/market/services/ebay/calculateStats.ts`
- `packages/mobile/src/features/market/services/ebay/search.test.ts`
- `packages/mobile/src/features/market/services/marketAggregatorStats.ts`
- `packages/mobile/src/features/market/services/marketAggregator.test.ts`
- `packages/mobile/src/features/history/store/actions.ts`
- `packages/mobile/src/features/history/store/selectors.ts`
- `packages/mobile/src/features/history/store/types.ts`
- `packages/mobile/src/features/history/store/historyStore.test.ts`
- `packages/mobile/src/features/analyze/hooks/analysisHelpers.ts`
- `packages/mobile/src/features/analyze/hooks/analysisHelpers.test.ts`
- `packages/mobile/src/features/analyze/hooks/useVisionAnalysis.ts`
- `packages/mobile/src/features/analyze/hooks/useProductImages.ts`
- `packages/mobile/src/features/analyze/hooks/usePlatformLinks.ts`
- `packages/backend/src/routes/items/create.ts`
- `packages/backend/src/routes/items/delete.ts`
- `packages/backend/src/routes/items/read.ts`
- `packages/backend/src/routes/items/shared.ts`
- `packages/backend/src/routes/items/shared.test.ts`
- `packages/backend/src/routes/items/update.ts`
- `packages/backend/src/services/itemPayloads.ts`
- `packages/backend/src/services/itemPayloads.test.ts`
- `packages/mobile/src/features/history/store/state.ts`
- `packages/backend/src/middleware/requestLogging.ts`
- `packages/backend/src/middleware/requestId.ts`
- `packages/backend/dockerComposeConfig.test.ts`
- `packages/backend/src/middleware/requestLogging.test.ts`
- `packages/backend/src/services/itemServiceFactory.ts`
- `packages/backend/src/services/itemServiceFactory.test.ts`
- `packages/mobile/src/shared/components/CardSlider/cardSliderKeys.ts`
- `packages/mobile/src/shared/components/CardSlider/cardSliderKeys.test.ts`
- `packages/backend/prisma/schema.test.ts`
- `packages/mobile/src/features/history/utils/historyDetail.ts`
- `packages/mobile/src/features/history/utils/historyDetail.test.ts`
- `packages/mobile/src/features/history/components/HistoryDetailHeaderActions.tsx`
- `packages/mobile/src/features/history/components/HistoryDetailMarketSection.tsx`
- `packages/mobile/src/features/history/components/HistoryDetailNotFound.tsx`

## Implemented

### Batch 1
- Fixed history deletion cache cleanup to pass `cachedImageUri` into `removeCachedImage()` and delete that concrete cached path
- Fixed library price presence handling so valid `0` values render instead of falling back to "Kein Preis"
- Reused shared library price selection logic in list/grid cards and price sorting to keep `0` handling consistent
- Added localized price parsing helper and wired it into `FinalPriceCard`
- Applied the same localized parsing helper to `PriceEditSheet`, which is the currently active detail-screen save surface
- Fixed `FinalPriceCard` comparison-row visibility so `0` comparison values are still treated as present
- Cleaned up manual-search confidence semantics and removed the forced `FlashList` remount on library view-mode toggle

### Batch 2
- Added timeout-bounded per-match product-image loading so slow eBay image lookups no longer stall the entire analysis result set
- Extracted image-loading resilience into `productImageLoading.ts` with focused node tests
- Added explicit image file-read error handling in `visionService.ts` with a user-facing unreadable-image message
- Kept GTIN lookup resilient by falling back to text-only identifier lookup when the optional image read fails
- Stopped silently swallowing `SecureStore` token-read failures in `apiClient.ts` and now emit actionable warnings without exposing secrets

### Batch 3
- Hardened `POST /api/items` cleanup so invalid multipart JSON and image-save failures do not leave temp upload files behind
- Kept image cleanup on `createItem` failure, but now log cleanup failures explicitly instead of letting them hide the original error path
- Updated `DELETE /api/items/:id` to return `imageDeleted` so the API no longer implies file cleanup definitely succeeded when only the DB delete did
- Strengthened `GET /api/images/:filename` sendFile callback logging and explicit fallback JSON error response

### Batch 4
- Added backend upload filtering for allowed MIME types/extensions and mapped upload validation errors to explicit 400 responses
- Added request-side UUID validation for item IDs and auth-derived user IDs before backend item service calls
- Strengthened auth route validation with email checks and higher password requirements (8+ chars, upper/lowercase, number)
- Replaced the loose `AuthRequest<P = any>` default with `Record<string, string>`
- Added backend production HTTPS enforcement with proxy-aware redirect/426 handling plus HSTS on secure requests
- Added mobile API base URL hard-fail behavior for non-dev builds without a valid absolute HTTPS URL
- Added client-side upload validation for local URI scheme, file existence, file size, and supported image types before multipart upload
- Narrowed mobile upload payload typing from `Record<string, unknown>` to an explicit `UploadItemPayload`

### Batch 5
- Replaced loose backend JSON boundary types with explicit `SearchQueries`, `PriceStats`, `MarketListing`, and `MarketValueResult` interfaces
- Updated backend item-service signatures to use the explicit pricing/listing/value contracts instead of generic records
- Tightened delete consistency by moving backend item deletion into a Prisma transaction with `P2025` fallback handling for concurrent deletes
- Normalized auth success/error envelopes in `packages/backend/src/routes/auth.ts` and `packages/backend/src/middleware/jwtAuth.ts` to consistent `ApiResponse` shapes
- Updated the mobile auth store to unwrap the normalized auth envelopes
- Extracted a shared `authenticate()` helper to remove login/register duplication in the mobile auth store

### Batch 6
- Added `docs/manual-regression-checklist.md` as the minimum repeatable auth/scan/analyze/save/upload/sync/delete verification pass before the larger size refactors
- Added root script `npm run test:targeted` to run the extracted helper tests directly via Node's built-in test runner with TypeScript strip mode

### Shared UI cleanup checkpoint
- Centralized duplicate tab-bar inactive colors into shared `TAB_BAR_COLORS` constants and updated both tab-bar implementations to consume them
- Centralized repeated animation spring/timing/offset values into shared `ANIMATION_PRESETS` and updated `Animated.tsx` to use the named presets instead of scattered magic numbers
- Expanded `packages/mobile/src/shared/components/index.ts` so Animated helpers, Skeleton variants, Icons, Global/Custom tab bars, and ThemeSelector are exported through the shared barrel

### Batch 7 first size-rule refactor
- Reduced `packages/mobile/src/app/(tabs)/library.tsx` from 198 lines to 136 lines by moving row-shaping into `packages/mobile/src/features/history/utils/libraryRows.ts`
- Extracted list-row and grid-row wrappers into `packages/mobile/src/features/history/components/LibraryListItem.tsx` and `packages/mobile/src/features/history/components/LibraryGridItem.tsx`
- Extracted the empty-state and filtered-empty-state UI into `packages/mobile/src/features/history/components/LibraryEmptyStates.tsx`
- Kept the tab screen responsible only for store access, filter state, view-mode toggle, pagination state, and list wiring

### Batch 7 second size-rule refactor
- Reduced `packages/mobile/src/shared/components/Animated.tsx` from 232 lines to a 7-line compatibility barrel that preserves existing import paths
- Extracted each shared animation helper into focused files under `packages/mobile/src/shared/components/Animated/`
- Centralized the shared animation prop types and animated Pressable creation in `packages/mobile/src/shared/components/Animated/shared.ts`
- Added a lightweight Node test that guards the split-file structure and compatibility barrel exports without depending on the mobile runtime

### Batch 7 third size-rule refactor
- Reduced `packages/mobile/src/features/market/services/ebay/search.ts` from 215 lines to 141 lines by keeping only the eBay query and marketplace orchestration in that file
- Extracted listing parsing into `packages/mobile/src/features/market/services/ebay/parseListings.ts`
- Extracted price-stat calculation and selection-based stat recomputation into `packages/mobile/src/features/market/services/ebay/calculateStats.ts`
- Added `packages/mobile/src/features/market/services/ebay/search.test.ts` and kept the helper modules Node-testable via type-only imports so the extracted structure can be validated without the Expo runtime

### Batch 7 fourth size-rule refactor
- Reduced `packages/mobile/src/features/history/store/historyStore.ts` from 205 lines to 117 lines by keeping only Zustand persistence and side-effect wiring in that file
- Extracted pure item-creation, item-update, removal, and sync-payload helpers into `packages/mobile/src/features/history/store/actions.ts`
- Extracted item lookup into `packages/mobile/src/features/history/store/selectors.ts` and shared store types into `packages/mobile/src/features/history/store/types.ts`
- Added `packages/mobile/src/features/history/store/historyStore.test.ts` and extended the targeted Node test entrypoint so the split structure and core helper behavior stay covered without the Expo runtime

### Batch 7 fifth size-rule refactor
- Reduced `packages/mobile/src/features/analyze/hooks/useAnalysis.ts` from 204 lines to 141 lines by keeping only the composed analysis state machine and callback wiring in that file
- Extracted the vision analysis and image-enrichment path into `packages/mobile/src/features/analyze/hooks/useVisionAnalysis.ts`
- Extracted product-image loading into `packages/mobile/src/features/analyze/hooks/useProductImages.ts`
- Extracted platform-link composition into `packages/mobile/src/features/analyze/hooks/usePlatformLinks.ts`
- Extracted manual-match creation, auto-select evaluation, and platform-query fallback logic into `packages/mobile/src/features/analyze/hooks/analysisHelpers.ts`
- Added `packages/mobile/src/features/analyze/hooks/analysisHelpers.test.ts` and extended the targeted Node test entrypoint so the split stays covered without requiring the Expo runtime

### Batch 7 sixth size-rule refactor
- Reduced `packages/backend/src/routes/items.ts` from 362 lines to 27 lines by keeping only route registration in that file
- Extracted multipart create handling and upload validation into `packages/backend/src/routes/items/create.ts`
- Extracted read handlers into `packages/backend/src/routes/items/read.ts`
- Extracted delete flow into `packages/backend/src/routes/items/delete.ts`
- Extracted PUT/PATCH handlers into `packages/backend/src/routes/items/update.ts`
- Extracted shared auth, UUID, pagination, temp-file cleanup, and create-payload parsing helpers into `packages/backend/src/routes/items/shared.ts`
- Added `packages/backend/src/routes/items/shared.test.ts` and extended the targeted Node test entrypoint so the backend route split has runnable coverage in this dependency-limited workspace

### Batch 7 seventh size-rule refactor
- Reduced `packages/mobile/src/app/history/[id].tsx` from 193 lines to 143 lines by keeping only route/store wiring, refresh/delete handlers, and sheet visibility in that file
- Extracted header delete actions into `packages/mobile/src/features/history/components/HistoryDetailHeaderActions.tsx`
- Extracted the market slider plus platform quicklinks block into `packages/mobile/src/features/history/components/HistoryDetailMarketSection.tsx`
- Extracted the missing-item fallback into `packages/mobile/src/features/history/components/HistoryDetailNotFound.tsx`
- Extracted detail bootstrap helpers for platform-query fallback and auto-load decisions into `packages/mobile/src/features/history/utils/historyDetail.ts`
- Added `packages/mobile/src/features/history/utils/historyDetail.test.ts` and extended the targeted Node test entrypoint so the split stays covered without requiring the Expo runtime

### Batch 7 eighth size-rule refactor
- Reduced `packages/backend/src/services/itemService.ts` from 163 lines to 138 lines by keeping Prisma CRUD orchestration in that file and moving create/update payload shaping out of it
- Extracted create-item normalization plus price-, Kleinanzeigen-, and market-value update builders into `packages/backend/src/services/itemPayloads.ts`
- Added `packages/backend/src/services/itemPayloads.test.ts` and extended the targeted Node test entrypoint so the backend service split has runnable coverage without requiring Prisma or installed workspace dependencies

### ARCH-01 backend dependency injection
- Extracted injectable backend item-service orchestration into `packages/backend/src/services/itemServiceFactory.ts`
- Updated `packages/backend/src/services/itemService.ts` to keep exporting the existing route-facing functions while delegating through a default Prisma-backed factory instance
- Added `packages/backend/src/services/itemServiceFactory.test.ts` so the service logic can be exercised with injected stubs instead of a live Prisma client

### ARCH-02 mobile dependency injection
- Extracted injectable history-store behavior into `packages/mobile/src/features/history/store/state.ts`
- Updated `packages/mobile/src/features/history/store/historyStore.ts` to keep exporting the existing persisted Zustand hook while supplying the default cache/sync dependency bundle
- Extended `packages/mobile/src/features/history/store/historyStore.test.ts` so add/update/remove flows prove the store uses injected cache and sync collaborators instead of hardcoded services

### ARCH-03 backend compound index
- Added `@@index([userId, scannedAt])` to `ScannedItem` in `packages/backend/prisma/schema.prisma` so the existing `where: { userId }` plus `orderBy: { scannedAt: 'desc' }` read path has a matching compound index
- Added `packages/backend/prisma/migrations/20260320000000_add_scanned_item_user_scanned_at_index/migration.sql` to create `ScannedItem_userId_scannedAt_idx`
- Added `packages/backend/prisma/schema.test.ts` and included it in `npm run test:targeted` so the schema and latest migration keep asserting the compound index without depending on Prisma CLI or a live Postgres instance

### ARCH-04 backend request logging
- Added `packages/backend/src/middleware/requestLogging.ts` with a central Express middleware that logs each completed request as method, path, HTTP status, duration in milliseconds, and either the authenticated `userId` or `anonymous`

### Runnable-environment toolchain cleanup
- Extended `scripts/workspace-toolchain-health.mjs` with a best-effort cache-restore path for hollow package directories, scoped-package tarball parsing, and lockfile-driven checks for whether required tarball bodies actually exist in the local npm cache
- Updated `scripts/setup-workspace-toolchain.mjs` to attempt cached restoration before `npm install --offline` and to report all unresolved offline cache misses from `package-lock.json` even when npm aborts on the first missing tarball
- Expanded `scripts/workspace-toolchain-health.test.ts` with coverage for scoped-package cache-miss detection and restore-or-report behavior so the new setup diagnostics stay runnable in this dependency-limited workspace
- Updated `packages/backend/src/app.ts` to register the request logger once at app level so it covers both public and JWT-protected `/api` routes while preserving the existing HTTPS and error-handler flow
- Added `packages/backend/src/middleware/requestLogging.test.ts` and included it in `npm run test:targeted` so the log-line contract and middleware registration stay guarded without requiring installed backend dependencies

### ARCH-05 backend health checks
- Added `packages/backend/src/routes/healthResponse.ts` with an injectable health-response builder that aggregates server, database, upload-directory, and disk-space checks into a stable API envelope
- Updated `packages/backend/src/routes/health.ts` so `/api/health` now verifies Prisma connectivity, ensures the upload directory is writable via a temp-file probe, inspects free disk space via `statfs`, and returns HTTP 503 when any dependency is degraded
- Added `packages/backend/src/routes/health.test.ts` and included it in `npm run test:targeted` so the health aggregation contract stays covered without requiring Express, Prisma, or a live database during targeted validation

### ARCH-06 docker compose credentials
- Updated root `docker-compose.yml` so both the `db` and `backend` services read their database-related variables from `.env.docker` instead of embedding Postgres credentials or a literal `DATABASE_URL`
- Updated `packages/backend/docker-compose.yml` so both services read their database-related variables from `packages/backend/.env`, with the Postgres healthcheck now using container environment variables instead of a hardcoded username
- Expanded `.env.docker.example` and `packages/backend/.env.example` to document the required Postgres and `DATABASE_URL` variables, and updated the README compose setup notes accordingly
- Added `packages/backend/dockerComposeConfig.test.ts` and included it in `npm run test:targeted` so future changes cannot reintroduce literal DB credentials into the checked-in compose files

### ARCH-07 backend API documentation
- Added `packages/backend/src/routes/apiDocs.ts` with a maintained OpenAPI 3.1 document builder that covers the current health, auth, image, and item endpoints plus shared request schemas and bearer auth metadata
- Added `packages/backend/src/routes/docs.ts` and updated `packages/backend/src/routes/index.ts` so `/api/docs/openapi.json` serves the OpenAPI JSON and `/api/docs` serves a lightweight Swagger UI shell without introducing a new backend runtime dependency
- Added `packages/backend/src/routes/docs.test.ts`, included it in `npm run test:targeted`, and documented the new local URLs in `README.md`

### ARCH-08 backend request-id tracing
- Added `packages/backend/src/middleware/requestId.ts` with a central middleware that reuses an incoming `x-request-id` when present and otherwise generates a UUID via Node's built-in `crypto.randomUUID()`
- Updated `packages/backend/src/app.ts` so request IDs are assigned before request logging and all `/api` routes, and the response now echoes `x-request-id` for client-side correlation
- Updated `packages/backend/src/middleware/requestLogging.ts` so each completed request log line now includes `req=<requestId>` alongside method, path, status, duration, and optional authenticated user context
- Extended `packages/backend/src/middleware/requestLogging.test.ts` and kept it in `npm run test:targeted` so the log-line contract and middleware registration order stay guarded without requiring installed backend dependencies

### Backend OpenAPI size-rule cleanup
- Reduced `packages/backend/src/routes/apiDocs.ts` from 568 lines to a thin orchestration module that keeps exporting the same `buildOpenApiDocument()` and `buildSwaggerHtml()` API
- Extracted OpenAPI metadata, path definitions, component schemas, Swagger HTML, and shared types into focused files under `packages/backend/src/routes/apiDocs/`, then further split the path definitions by route domain and item sub-domain under `packages/backend/src/routes/apiDocs/paths/`
- Extended `packages/backend/src/routes/docs.test.ts` with structure guards for both the top-level docs builder and the extracted path modules so the OpenAPI surface stays reviewable while preserving the existing behavior checks

### MINOR-01 CardSlider stable keys
- Updated `packages/mobile/src/shared/components/CardSlider/CardSlider.tsx` so slide wrapper views use child-derived keys instead of `index`, removing the dynamic-list anti-pattern without changing the public component API
- Added `packages/mobile/src/shared/components/CardSlider/cardSliderKeys.ts` as a small pure helper that prefers existing child keys and falls back to deterministic value-based keys for primitive nodes
- Added `packages/mobile/src/shared/components/CardSlider/cardSliderKeys.test.ts` and included it in `npm run test:targeted` so the key-selection behavior stays covered in the dependency-limited workspace

### MINOR-04 market aggregation distribution
- Added `packages/mobile/src/features/market/services/marketAggregatorStats.ts` as a small pure helper that aggregates cross-platform price stats from real listing prices instead of synthesizing a linear min/max spread
- Updated `packages/mobile/src/features/market/services/marketAggregator.ts` to delegate combined stat calculation to the helper, keeping the existing `searchAllMarkets(...)` API stable
- Added `packages/mobile/src/features/market/services/marketAggregator.test.ts` and included it in `npm run test:targeted` so non-linear listing distributions and the no-listings fallback stay covered in this dependency-limited workspace

### MINOR-05 backend sanitized error logging
- Added `packages/backend/src/middleware/errorLogging.ts` as a small pure helper that builds request-correlated backend error log lines without emitting raw stack traces
- Updated `packages/backend/src/middleware/errorHandler.ts` so the central Express error handler now logs `requestId`, error name, and a redacted message instead of `err.stack`
- Added `packages/backend/src/middleware/errorLogging.test.ts` and included it in `npm run test:targeted` so stack-trace omission and credential redaction stay covered without requiring installed backend dependencies

### Toolchain bootstrap and runnable mobile lint
- Added `scripts/setup-workspace-toolchain.mjs` as a lightweight workspace bootstrap that checks for the locally available TypeScript runtime and only attempts an offline npm install when it is actually missing
- Added `scripts/lint-mobile.mjs` and retargeted `packages/mobile/package.json` so `npm run lint:mobile` now runs a repo-local TypeScript-powered source guard instead of depending on a missing ESLint binary in this sandbox
- Updated the mobile/backend typecheck scripts to invoke the checked-in TypeScript entrypoint directly, and fixed a pre-existing TSX syntax break in `packages/mobile/src/features/history/components/EditableProductCard/EditableProductCard.tsx` that the new lint command surfaced
- Added `packages/mobile/toolchain.test.ts`, included it in `npm run test:targeted`, and documented `npm run setup:workspace` in `README.md` and `QUICKSTART.md`

### Workspace package restoration diagnostics
- Added `scripts/workspace-toolchain-health.mjs` plus `scripts/workspace-toolchain-health.test.ts` so the repo now has a focused, tested check for hollow cached installs where the module directory exists but the required package files do not
- Updated `scripts/setup-workspace-toolchain.mjs` to treat missing `expo`, `nativewind`, and critical backend `@types/*` files as a broken workspace, attempt the existing offline reinstall once, and then print the exact missing package/file list if the cache cannot restore them
- Added the new toolchain-health regression to `npm run test:targeted` and tightened the README command description so future driver passes can see the concrete blocker immediately

### Workspace bootstrap remediation follow-up
- Extended `scripts/workspace-toolchain-health.mjs` with offline-cache-miss parsing plus stable remediation messaging so workspace bootstrap failures enumerate the likely affected packages and next restore steps
- Updated `scripts/setup-workspace-toolchain.mjs` to capture npm output in-process while preserving the one-shot offline reinstall attempt, then print the actionable toolchain-health summary on failure
- Updated `README.md` so the setup command description and node-modules troubleshooting section match the improved runnable-environment diagnostics

### Workspace lockfile bootstrap diagnostics
- Extended `scripts/workspace-toolchain-health.mjs` with a safe `loadPackageLock(...)` helper so missing or malformed root `package-lock.json` files are reported as stable actionable setup issues instead of bubbling raw fs/JSON exceptions
- Updated `scripts/setup-workspace-toolchain.mjs` to stop early on lockfile issues when toolchain packages are missing, while still reusing the parsed lockfile for cache-restore and offline-cache-miss reporting when it is valid
- Expanded `scripts/workspace-toolchain-health.test.ts` and updated `README.md` so the new lockfile remediation path is covered by the runnable targeted test surface and documented for future driver passes

### Workspace diagnostic output cleanup
- Updated `scripts/workspace-toolchain-health.mjs` so oversized setup failures now cap the rendered missing-package entries, transitive-package list, offline-cache-miss list, and affected-package summary with explicit counts and omission lines
- Kept the previous fully detailed output for smaller failure sets so existing targeted tests and local diagnostics remain stable when the workspace breakage is narrow
- Expanded `scripts/workspace-toolchain-health.test.ts` with a formatter regression that proves large transitive/offline-miss sets are summarized deterministically

### Workspace cache-restore follow-up
- Updated `scripts/setup-workspace-toolchain.mjs` to re-scan the workspace after a failed offline install, retry cache restoration for newly hollow packages, and report only the still-unresolved blockers in the final diagnostic
- Hardened `scripts/workspace-toolchain-health.mjs` so cache entries that resolve without tarball bytes are treated like cache misses instead of crashing extraction
- Expanded `scripts/setup-workspace-toolchain.test.ts` and `scripts/workspace-toolchain-health.test.ts` with targeted regressions for the post-install restore pass and empty-cache-read handling

## Validated

- `git diff --check`
  - Passed
- `node --test --experimental-strip-types packages/backend/dockerComposeConfig.test.ts`
  - Passed
- `npm run test:targeted`
  - Passed
- `node ./scripts/setup-workspace-toolchain.mjs`
  - Failed as expected in this sandbox, but now reports a summarized actionable blocker instead of a thousand-line transitive dump
  - No longer crashes when a cached tarball read resolves without data; it now falls through to the unresolved-package report
  - After a failed offline install it now retries cache restoration for newly hollow packages before rendering the final blocker list
- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyPricing.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/analyze/utils/productImageLoading.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/shared/components/Animated.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/shared/components/CardSlider/cardSliderKeys.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/market/services/ebay/search.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/market/services/marketAggregator.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/history/store/historyStore.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/analyze/hooks/analysisHelpers.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/routes/items/shared.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/services/itemPayloads.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/services/itemServiceFactory.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/prisma/schema.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/middleware/requestLogging.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/middleware/errorLogging.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyDetail.test.ts`
  - Passed
- `npm run typecheck:mobile`
  - Still fails in this sandbox because uncached direct workspace packages remain unresolved
  - Now stops with the concise direct-blocker list from `setup:workspace` instead of ballooning into hundreds of hollow transitive package reports when rerun sequentially
- `npm run lint:mobile`
  - Passed via the new repo-local mobile lint runner
- `npm run typecheck:backend`
  - Still fails in this sandbox because uncached direct workspace packages remain unresolved
  - Now stops with the same concise direct-blocker list from `setup:workspace`
- `node ./scripts/setup-workspace-toolchain.mjs`
  - Still fails in this sandbox because the workspace cache is incomplete, but now reports the affected packages and concrete recovery steps directly
  - Now fails fast with an explicit hollow-package report after the offline reinstall attempt; current missing files now include the broader direct workspace dependency surface such as `@prisma/client`, `react`, `react-native`, Expo/mobile runtime packages, `bcryptjs`, `multer`, `uuid`, plus the hollow backend/test `@types/*` packages
  - The installed-package health scan now also catches hollow top-level non-`@types` packages that already exist on disk from partial installs, while still ignoring nested package-owned `node_modules` entries to avoid false-positive noise
  - The failure output now separates direct workspace dependency owners (for example `@scanapp/mobile` vs `@scanapp/backend`) from additional hollow installed packages, making the remaining restore work easier to triage without a runnable install
  - The new preinstall cache-miss short-circuit now skips doomed offline reinstalls when every unresolved direct blocker is already known uncached from `package-lock.json`, keeping the remaining blocker report bounded to the real direct workspace packages
- `node --test --experimental-strip-types scripts/setup-workspace-toolchain.test.ts`
  - Passed
- `node --test --experimental-strip-types scripts/setup-workspace-toolchain.test.ts scripts/workspace-toolchain-health.test.ts scripts/run-workspace-typecheck.test.ts packages/mobile/toolchain.test.ts`
  - Passed
- `node --test --experimental-strip-types scripts/workspace-toolchain-health.test.ts`
  - Passed
- `npm run test:targeted`
  - Passed

## What Remains

- Run the Batch 6 manual regression checklist in a runnable device/backend environment
- Restore Trello sync once local board credentials/instructions are available in the workspace or environment
- Finish restoring the remaining cached/npm-installable workspace packages so mobile/backend typecheck can complete without missing-module errors
- Restore the uncached tarballs or repopulate the hollow package directories that `npm run setup:workspace` now reports explicitly, including the mobile `expo` / `nativewind` toolchain packages and backend-blocking direct `@types/*` packages now annotated with their runtime owners, before retrying mobile/backend typecheck
- Continue with the next highest-value cleanup or runnable-environment validation now that ARCH-01 is complete and the remaining backend architecture backlog has narrowed

## Exact Next Step

Restore the remaining missing workspace packages so `npm run typecheck:mobile` and `npm run typecheck:backend` can finish cleanly, prioritizing the uncached mobile `expo` / `nativewind` toolchain tarballs plus the backend `@types/*` packages called out by `npm run setup:workspace`, then run the Batch 6 manual regression checklist in a runnable device/backend environment.
