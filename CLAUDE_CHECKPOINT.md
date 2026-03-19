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

## Validated

- `git diff --check`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyPricing.test.ts`
  - Passed
- `node --test --experimental-strip-types packages/mobile/src/features/analyze/utils/productImageLoading.test.ts`
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
- Continue the remaining Batch 7 size-rule refactors (`Animated.tsx`, `search.ts`, `historyStore.ts`, `useAnalysis.ts`, `items.ts`, `history/[id].tsx`, `itemService.ts`) once the next slice is chosen

## Exact Next Step

Pick the next Batch 7 size-rule target (`Animated.tsx` is the next obvious slice) or, if a runnable environment becomes available first, run mobile typecheck/lint plus the manual regression checklist against the refactored library screen.
