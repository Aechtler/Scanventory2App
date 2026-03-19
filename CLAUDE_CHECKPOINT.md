# Claude Checkpoint

## Status

Batch 1 is complete on `scanapp2`.
Batch 2 is implemented in code and pending runnable-environment validation.
Batch 3 is implemented in code and pending runnable-environment validation.
Batch 4 is implemented in code and pending runnable-environment validation.
Batch 5 has started with backend payload-typing and delete-consistency hardening on `scanapp2`.

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
- Verification reality: no existing test files found in `packages/mobile` or `packages/backend` before targeted helpers were added
- Batch 1 bug targets in history store, library pricing UI, and final-price parsing
- Batch 2 resilience targets in `useAnalysis.ts`, `visionService.ts`, and `apiClient.ts`
- Batch 4 trust-boundary targets in backend upload/auth routes, JWT request typing, backend HTTPS enforcement, and mobile API URL/upload validation

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

## Implemented

### Batch 1
- Fixed history deletion cache cleanup to pass `cachedImageUri` into `removeCachedImage()` and delete that concrete cached path
- Fixed library price presence handling so valid `0` values render instead of falling back to "Kein Preis"
- Reused shared library price selection logic in list/grid cards and price sorting to keep `0` handling consistent
- Added localized price parsing helper and wired it into `FinalPriceCard`
- Applied the same localized parsing helper to `PriceEditSheet`, which is the currently active detail-screen save surface
- Fixed `FinalPriceCard` comparison-row visibility so `0` comparison values are still treated as present
- Cleaned up manual-search confidence semantics and removed the forced `FlashList` remount on library view-mode toggle

### Batch 2 (current slice)
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

### Batch 4 (current slice)
- Added backend upload filtering for allowed MIME types/extensions and mapped upload validation errors to explicit 400 responses
- Added request-side UUID validation for item IDs and auth-derived user IDs before backend item service calls
- Strengthened auth route validation with email checks and higher password requirements (8+ chars, upper/lowercase, number)
- Replaced the loose `AuthRequest<P = any>` default with `Record<string, string>`
- Added backend production HTTPS enforcement with proxy-aware redirect/426 handling plus HSTS on secure requests
- Added mobile API base URL hard-fail behavior for non-dev builds without a valid absolute HTTPS URL
- Added client-side upload validation for local URI scheme, file existence, file size, and supported image types before multipart upload
- Narrowed mobile upload payload typing from `Record<string, unknown>` to an explicit `UploadItemPayload`

### Batch 5 (current slice)
- Replaced loose backend JSON boundary types with explicit `SearchQueries`, `PriceStats`, `MarketListing`, and `MarketValueResult` interfaces
- Updated backend item-service signatures to use the explicit pricing/listing/value contracts instead of generic records
- Tightened delete consistency by moving backend item deletion into a Prisma transaction with `P2025` fallback handling for concurrent deletes

## Validated

- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyPricing.test.ts packages/mobile/src/features/analyze/utils/productImageLoading.test.ts`
  - Passed
- `git diff --check`
  - Passed
- `npm run typecheck:mobile`
  - Could not run successfully in this workspace because `tsc` is not installed locally (`sh: 1: tsc: not found`)
- `npm run lint:mobile`
  - Could not run successfully in this workspace because `eslint` is not installed locally (`sh: 1: eslint: not found`)
- `npm run typecheck:backend`
  - Could not run successfully in this workspace because `tsc` is not installed locally (`sh: 1: tsc: not found`)

## What Remains

- Normalize backend success/error response envelopes where practical without broad endpoint churn
- Run mobile/backend typecheck and mobile lint once workspace dev dependencies are available
- Run the Batch 1, Batch 2, Batch 3, Batch 4, and current Batch 5 manual regression items in a runnable device/backend environment
- Restore Trello sync once local board credentials/instructions are available in the workspace or environment

## Exact Next Step

Continue Batch 5 by normalizing backend response envelopes without broad endpoint churn, then re-run verification once dependencies are available.