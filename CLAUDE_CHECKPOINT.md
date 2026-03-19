# Claude Checkpoint

## Status

Batch 1 partial implementation completed on `scanapp2`.

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
- Verification reality: no existing test files found in `packages/mobile` or `packages/backend`
- Batch 1 bug targets in history store, library pricing UI, and final-price parsing

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

## Implemented

- Fixed history deletion cache cleanup to pass `cachedImageUri` into `removeCachedImage()` and delete that concrete cached path
- Fixed library price presence handling so valid `0` values render instead of falling back to "Kein Preis"
- Reused shared library price selection logic in list/grid cards and price sorting to keep `0` handling consistent
- Added localized price parsing helper and wired it into `FinalPriceCard`
- Applied the same localized parsing helper to `PriceEditSheet`, which is the currently active detail-screen save surface
- Fixed `FinalPriceCard` comparison-row visibility so `0` comparison values are still treated as present

## Validated

- `node --test --experimental-strip-types packages/mobile/src/features/history/utils/historyPricing.test.ts`
  - Passed
- `git diff --check`
  - Passed
- `npm run typecheck:mobile`
  - Could not run successfully in this workspace because `tsc` is not installed locally (`sh: 1: tsc: not found`)
- `npm run lint:mobile`
  - Could not run successfully in this workspace because `eslint` is not installed locally (`sh: 1: eslint: not found`)

## What Remains

- Run mobile typecheck/lint once workspace dev dependencies are available
- Run the Batch 1 manual regression items on a device/simulator
- Start Batch 2 resilience work in `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`, `packages/mobile/src/features/scan/services/visionService.ts`, and `packages/mobile/src/shared/services/apiClient.ts`

## Exact Next Step

Begin Batch 2 by hardening image-analysis degradation paths: add bounded/timeout-aware product-image loading in `useAnalysis.ts`, add explicit file-read failure handling in `visionService.ts`, and stop silently swallowing SecureStore failures in `apiClient.ts`.
es/market/services/ebay/search.ts`, `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`, and `packages/mobile/src/app/(tabs)/library.tsx`, then rerun mobile validation in an environment with `tsc` and `eslint` installed.
ning Batch 1 fixes in `packages/mobile/src/features/market/services/ebay/search.ts`, `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`, and `packages/mobile/src/app/(tabs)/library.tsx`, then rerun mobile validation in an environment with `tsc` and `eslint` installed.
