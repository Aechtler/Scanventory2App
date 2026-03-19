# Scanventory2App Project Analysis

## Product Summary

Scanventory2App is a mobile Expo app plus a small Node/Express backend for scanning collectible-style products and estimating value.

Current repo-supported product shape:
- User auth with email/password and JWT
- Scan flow via camera or gallery upload
- AI product recognition with Gemini Vision, including multiple candidate matches
- Manual fallback search when recognition is uncertain
- Library/history of saved items stored locally and synced to backend
- Market data focused on eBay search plus AI market-value estimation via Perplexity
- Platform quicklinks for compare/sell actions
- Item detail/edit flows, including manual final price entry
- CSV export and portfolio total value

Grounded gaps visible in repo:
- Marketplace coverage is uneven: eBay is real, Amazon/Idealo/Kleinanzeigen are partial or mock-shaped
- “Sell” quick actions are mostly placeholder UI
- No meaningful automated test suite is present
- Several known bugs and architecture issues are already listed in `CODE_REVIEW_TODOS.md`

## Architecture Summary

Monorepo layout:
- `packages/mobile`: Expo Router + React Native + TypeScript + NativeWind + Zustand
- `packages/backend`: Express 5 + TypeScript + Prisma + PostgreSQL

Mobile architecture:
- Route layer under `packages/mobile/src/app`
- Feature modules under `packages/mobile/src/features`
- Shared UI/services/state under `packages/mobile/src/shared`
- Important active features: `scan`, `analyze`, `market`, `history`, `auth`

Backend architecture:
- Express app in `packages/backend/src/app.ts`
- Routes in `packages/backend/src/routes`
- Service layer in `packages/backend/src/services`
- Prisma schema in `packages/backend/prisma/schema.prisma`

Core persisted domain model:
- `User`
- `ScannedItem`
  - recognition fields: `productName`, `category`, `brand`, `condition`, `confidence`, `gtin`
  - search fields: `searchQuery`, `searchQueries`
  - image fields: `imageFilename`, `originalUri`
  - market fields: `priceStats`, `ebayListings`, `kleinanzeigenListings`, `marketValue`
  - selling fields: `finalPrice`, `finalPriceNote`

Key product workflows in code:
1. Scan or pick image in `packages/mobile/src/app/(tabs)/index.tsx`
2. Analyze with Gemini in `packages/mobile/src/app/analyze.tsx` and `features/analyze/hooks/useAnalysis.ts`
3. Save locally in `features/history/store/historyStore.ts`
4. Fire-and-forget sync to backend via `features/history/services/syncService.ts`
5. Edit/view item in `packages/mobile/src/app/history/[id].tsx` and `packages/mobile/src/app/history/edit/[id].tsx`
6. Load eBay and Perplexity data through `features/market/hooks/useMarketData.ts`

## Pain Points And Opportunity Areas

High-likelihood workflow pain points:
- Recognition issues span several files: route entry, analysis hook, Gemini prompt, manual selection sheet, local save path.
- Pricing/value work is split across eBay search, Perplexity parsing, cached history data, and detail UI.
- Local-first history plus backend sync introduces subtle bugs around cache cleanup, sync status, and stale server IDs.
- There is little automated verification, so future changes need a repeatable manual regression path.
- The codebase has good feature separation, but product workflows cross module boundaries often enough that navigation overhead is real.

Repo-backed examples:
- Auto-save happens immediately after selection in `packages/mobile/src/app/analyze.tsx`
- History store contains known cache/sync sharp edges
- Backend item API accepts broad JSON payloads and stores many fields as JSON blobs
- `PlatformQuicklinks` has unfinished selling actions
- `CODE_REVIEW_TODOS.md` already highlights bugs in history, pricing, upload handling, and response consistency

## Recommended Skill List

### P1: `scanventory-app-map`
Why:
- Future work will repeatedly start with “where does this workflow live?”
- This repo’s feature isolation is good, but real user flows cross `app`, `analyze`, `scan`, `history`, `market`, shared services, and backend routes.
- A lean repo map skill will cut exploration time and reduce wrong-file edits.

### P1: `scanventory-recognition-flow`
Why:
- Scan/recognition is the defining product capability.
- Debugging it requires following image input, Gemini prompt/output, candidate selection, manual fallback, and save-to-history behavior.
- This is a high-change, high-risk path with product-critical UX impact.

### P1: `scanventory-pricing-pipeline`
Why:
- Price estimation is split across eBay, Perplexity, quicklinks, cached history data, and detail screens.
- Pricing changes can silently affect summary values, item detail, sync payloads, and sell/compare UX.
- The repo supports this strongly enough to justify a dedicated skill.

### P1: `scanventory-history-sync`
Why:
- Library/history is a core product surface and the app is local-first.
- Offline image caching, persisted Zustand state, backend sync, edit flows, and delete behavior are tightly coupled.
- Existing TODOs show this area already produces bugs.

### P1: `scanventory-manual-regression`
Why:
- There is effectively no test suite.
- A repository-specific manual verification checklist is more useful right now than a generic testing skill.
- This will help future changes ship safely across auth, scan, save, edit, pricing refresh, and delete flows.

## Priority Summary

Create now:
- `scanventory-app-map`
- `scanventory-recognition-flow`
- `scanventory-pricing-pipeline`
- `scanventory-history-sync`
- `scanventory-manual-regression`

Do not create now:
- Separate marketplace export/sell skill: supported only partially, too narrow today
- Generic React Native architecture skill: existing global skills already cover this
- Scanner ML/model-tuning skill: repo uses API prompting, not an in-repo ML pipeline
