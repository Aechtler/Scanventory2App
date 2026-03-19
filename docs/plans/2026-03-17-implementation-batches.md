# ScanApp Implementation Batches Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce the highest-risk defects first, then harden upload/security/type boundaries, then take on refactors once there is a safer verification baseline.

**Architecture:** Keep changes small and localized to the current mobile feature modules and backend routes/services. Do not start the large file-splitting work until the P1 bug/error-handling surface is reduced and at least minimal verification scaffolding exists.

**Tech Stack:** Expo Router, React Native, Zustand, Express 5, Prisma, PostgreSQL, TypeScript

---

## Current Grounded State

- Branch confirmed: `scanapp2`
- Review backlog source: `CODE_REVIEW_TODOS.md`
- Existing checkpoint was stale and marked the work as complete although P1, P2, and P3 review items remain open
- No repo test files were found under `packages/mobile` or `packages/backend`
- Available verification today is mainly `npm run typecheck:mobile`, `npm run typecheck:backend`, `npm run lint:mobile`, plus focused manual regression

## Priority Order

1. P1 correctness and error-handling defects already identified in real code
2. P2 security and type-boundary hardening that protects uploads, auth, and backend payloads
3. P2 response-shape and delete-flow consistency improvements that reduce future breakage
4. Only then the large file-size refactors and architecture cleanups

## Batch 1: P1 Mobile Correctness Fixes

**Goal:** Remove user-visible library/history/pricing bugs with minimal blast radius.

**Files:**
- Modify: `packages/mobile/src/features/history/store/historyStore.ts`
- Modify: `packages/mobile/src/features/market/services/ebay/search.ts`
- Modify: `packages/mobile/src/app/(tabs)/library.tsx`
- Modify: `packages/mobile/src/features/history/components/FinalPriceCard/FinalPriceCard.tsx`
- Modify: `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`

**Scope:**
- Fix cached-image deletion to use `cachedImageUri`
- Preserve valid zero-price rendering in library UI
- Confirm the even-length median calculation remains correct while refactoring safely if needed
- Normalize final-price parsing for German-style input like `1.234,56`
- Keep manual search distinct from AI confidence semantics
- Remove full `FlashList` remounts on view-mode toggle

**Verification:**
- Run: `npm run typecheck:mobile`
- Run: `npm run lint:mobile`
- Manual:
  - save an item, delete it, and confirm cached image cleanup
  - enter `0` and `1.234,56` as final prices
  - toggle library list/grid mode without losing scroll or causing obvious remount jank
  - perform manual search and confirm confidence/labeling is not misleading

**Progress notes (2026-03-17 → 2026-03-19):**
- Implemented the cache-deletion fix, zero-price rendering fix, localized final-price parsing fix, manual-search confidence semantics cleanup, and the library list/grid remount cleanup
- Confirmed the even-length median calculation in `packages/mobile/src/features/market/services/ebay/search.ts` already uses the correct formula, so no code change was needed there
- Added a small pure helper test for price presence/parsing using `node --test --experimental-strip-types`
- `npm run typecheck:mobile` and `npm run lint:mobile` are currently blocked in this workspace because `tsc` and `eslint` are not installed
- Batch 1 is complete in code; remaining work for the batch is validation on a machine/environment with the missing tooling and device/simulator manual regression

## Batch 2: P1 Resilience In Analyze And Scan Flow

**Goal:** Make the image-analysis path degrade gracefully instead of failing all-or-nothing.

**Progress notes (2026-03-19):**
- Added timeout-bounded per-match product-image loading so one slow eBay image lookup no longer blocks the entire result set
- Extracted the timeout/image-loading behavior into a small tested helper in `packages/mobile/src/features/analyze/utils/productImageLoading.ts`
- Added explicit unreadable-image handling in `packages/mobile/src/features/scan/services/visionService.ts`
- Updated `identifyProductIdentifier()` to continue without image context if the optional local file read fails
- Updated `packages/mobile/src/shared/services/apiClient.ts` to warn on `SecureStore` token-read failures instead of silently swallowing them
- Remaining Batch 2 work is validation in a runnable mobile environment plus any follow-up fixes from real auth/network/manual regression

**Files:**
- Modify: `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`
- Modify: `packages/mobile/src/features/scan/services/visionService.ts`
- Modify: `packages/mobile/src/shared/services/apiClient.ts`

**Scope:**
- Add bounded image-loading behavior around product-image fetches instead of allowing one slow request to stall the whole set
- Add explicit file-read error handling in `visionService`
- Stop swallowing SecureStore failures silently; log actionable warnings without leaking secrets

**Verification:**
- Run: `npm run typecheck:mobile`
- Run: `npm run lint:mobile`
- Manual:
  - analyze an image with network disruption and verify partial results still surface
  - test missing/unreadable local image behavior and confirm a useful error reaches the UI/logs
  - test authenticated and unauthenticated app startup paths

## Batch 3: P1 Backend Upload And Delete Safety

**Goal:** Close backend data-loss/orphan-file gaps in the item/image routes.

**Files:**
- Modify: `packages/backend/src/routes/items.ts`
- Modify: `packages/backend/src/routes/images.ts`
- Inspect: `packages/backend/src/services/imageService.ts`
- Inspect: `packages/backend/src/services/itemService.ts`

**Scope:**
- Keep create-item image cleanup robust on DB failure
- Preserve explicit error handling around `sendFile`
- Ensure delete-item image cleanup failures are logged deliberately and do not create misleading API success behavior

**Verification:**
- Run: `npm run typecheck:backend`
- Manual:
  - upload item successfully
  - force a create failure after image upload and confirm no orphan file remains
  - fetch a valid image, invalid filename, and missing filename
  - delete an item and verify both DB and file outcomes

## Batch 4: P2 Security Boundary Hardening

**Goal:** Tighten the most exposed trust boundaries before broader refactors.

**Files:**
- Modify: `packages/backend/src/routes/items.ts`
- Modify: `packages/backend/src/routes/auth.ts`
- Modify: `packages/backend/src/middleware/jwtAuth.ts`
- Modify: `packages/mobile/src/shared/services/apiClient.ts`
- Modify: `packages/mobile/src/shared/constants/index.ts`

**Scope:**
- Add upload MIME/type validation on backend and complementary client-side validation for URI, size, and MIME/type where available
- Remove weak `any` defaulting in auth request typing
- Add route-param validation strategy for item IDs and auth-derived identifiers
- Prevent production fallback to insecure backend URLs
- Raise password validation beyond a 6-character minimum

**Verification:**
- Run: `npm run typecheck:mobile`
- Run: `npm run lint:mobile`
- Run: `npm run typecheck:backend`
- Manual:
  - valid image upload still succeeds
  - invalid file type is rejected on both client and server paths
  - production config without HTTPS fails loudly instead of silently downgrading
  - weak passwords are rejected with a clear message

## Batch 5: P2 Type Safety And API Consistency

**Goal:** Replace broad JSON blobs at the app boundary with explicit contracts before large refactors.

**Files:**
- Modify: `packages/backend/src/types/index.ts`
- Modify: `packages/backend/src/services/itemService.ts`
- Modify: `packages/backend/src/routes/items.ts`
- Modify: `packages/mobile/src/shared/services/apiClient.ts`
- Inspect: `packages/mobile/src/features/history/services/syncService.ts`

**Scope:**
- Introduce concrete backend interfaces for `priceStats`, `marketValue`, and market listings
- Narrow `apiUploadItem` payload typing away from arbitrary records
- Normalize backend success/error response envelopes where practical without broad endpoint churn
- Review delete-item flow for race-condition handling and transaction boundaries

**Verification:**
- Run: `npm run typecheck:mobile`
- Run: `npm run typecheck:backend`
- Manual:
  - sync new item
  - patch prices
  - patch market value
  - update and delete item from a synced device state

## Batch 6: Verification Baseline Before Refactors

**Goal:** Add the smallest useful safety net before splitting large files.

**Files:**
- Create: `docs/manual-regression-checklist.md` or reuse existing project skill material as a repo doc
- Create: targeted test scaffolding in the workspace chosen for the first extracted pure functions
- Prefer first targets:
  - `packages/mobile/src/features/market/services/ebay/search.ts`
  - `packages/mobile/src/features/history/components/FinalPriceCard/FinalPriceCard.tsx`

**Scope:**
- Codify the manual regression path for auth, scan, analyze, save, edit, refresh pricing, and delete
- Add tests only where pure parsing/stat-calculation logic can be covered cheaply first

**Verification:**
- Ensure the new checklist is runnable end-to-end
- Run the new targeted tests if introduced

## Batch 7: P2 Size Refactors

**Goal:** Split oversized files only after critical correctness, security, and verification work is in place.

**Primary candidates from backlog:**
- `packages/mobile/src/app/(tabs)/library.tsx`
- `packages/mobile/src/shared/components/Animated.tsx`
- `packages/mobile/src/features/market/services/ebay/search.ts`
- `packages/mobile/src/features/history/store/historyStore.ts`
- `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`
- `packages/backend/src/routes/items.ts`
- `packages/mobile/src/app/history/[id].tsx`
- `packages/backend/src/services/itemService.ts`

**Refactor rules:**
- Preserve public APIs where possible
- Extract pure helpers first
- Keep file moves reviewable and avoid mixing refactors with new behavior
- Require typecheck after each extracted slice

## Recommended Next Execution Start

Start with **Batch 1**, then **Batch 2**, then **Batch 3**. That order removes user-facing defects first, stabilizes the mobile analysis path, and then hardens the backend upload/delete boundary without mixing in broader architectural churn too early.
