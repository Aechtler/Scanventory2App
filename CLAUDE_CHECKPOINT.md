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

## Validated

- `git diff --check`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyPricing.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/analyze/utils/productImageLoading.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/shared/components/Animated.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/market/services/ebay/search.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/history/store/historyStore.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/analyze/hooks/analysisHelpers.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/routes/items/shared.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/backend/src/services/itemPayloads.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyDetail.test.ts`
  - Passed
- `npm run typecheck:mobile`
  - Could not run successfully in this workspace because dependencies are not installed locally (`tsc` not found)
- `npm run lint:mobile`
  - Could not run successfully in this workspace because dependencies are not installed locally (`eslint` not found)
- `npm run typecheck:backend`
  - Could not run successfully in this workspace because dependencies are not installed locally (`tsc` not found)
- `npm run test:targeted`
  - Passed

## What Remains

- Install workspace dependencies or otherwise provide a runnable toolchain for lint/typecheck
- Run the Batch 6 manual regression checklist in a runnable device/backend environment
- Restore Trello sync once local board credentials/instructions are available in the workspace or environment
- Run mobile/backend typecheck or manual regression in a runnable dependency-installed environment
- Continue with the next highest-value cleanup or runnable-environment validation now that the remaining Batch 7 size-rule target is complete

## Exact Next Step

Run mobile/backend typecheck plus the manual regression checklist in a dependency-installed environment, or pick the next medium-priority cleanup from `CODE_REVIEW_TODOS.md` now that the Batch 7 size-rule queue is cleared.
