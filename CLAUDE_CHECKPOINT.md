# Claude Checkpoint

## Status

Batch 1 is complete on `scanapp2`.
Batch 2 has started with the first resilience slice implemented on `scanapp2`.

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

## Validated

- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyPricing.test.ts packages/mobile/src/features/analyze/utils/productImageLoading.test.ts`
  - Passed
- `git diff --check`
  - Passed
- `npm run typecheck:mobile`
  - Could not run successfully in this workspace because `tsc` is not installed locally (`sh: 1: tsc: not found`)
- `npm run lint:mobile`
  - Could not run successfully in this workspace because `eslint` is not installed locally (`sh: 1: eslint: not found`)

## What Remains

- Run mobile typecheck/lint once workspace dev dependencies are available
- Run the Batch 1 and Batch 2 manual regression items on a device/simulator
- Continue Batch 2 with authenticated/unauthenticated startup-path checks and any remaining analyze/scan degradation edge cases
- Start Batch 3 backend upload/delete safety after Batch 2 acceptance is reached

## Exact Next Step

Continue Batch 2 by validating the new analyze/scan resilience changes in a runnable mobile environment, then inspect the remaining authenticated startup and API failure-path handling before moving to Batch 3 backend upload/delete safety.
