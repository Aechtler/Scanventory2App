---
name: scanventory-pricing-pipeline
description: Use when changing or debugging Scanventory2App price estimation, eBay search, Perplexity market value, quicklinks, or price presentation
---

# Scanventory Pricing Pipeline

Treat pricing as a pipeline, not a single component.

## Primary Files

- Shared loader: `packages/mobile/src/features/market/hooks/useMarketData.ts`
- eBay search: `packages/mobile/src/features/market/services/ebay/search.ts`
- eBay exports/types: `packages/mobile/src/features/market/services/ebay`
- Perplexity value: `packages/mobile/src/features/market/services/perplexity`
- Quicklinks: `packages/mobile/src/features/market/services/quicklinks`, `packages/mobile/src/features/market/components/PlatformQuicklinks/PlatformQuicklinks.tsx`
- Detail UI: `packages/mobile/src/features/market/components/MarketSlider/MarketSlider.tsx`
- Persistence callbacks: `packages/mobile/src/features/history/store/historyStore.ts`

## What To Check

- Which pricing source changed: eBay stats, listings, Perplexity summary, or quicklinks?
- Are values only shown in UI, or also cached back onto the `HistoryItem`?
- If changing payload shape, does backend `CreateItemBody` / patch handling still accept it?
- Are zero values, empty listings, and unavailable AI results handled intentionally?

## Common Failure Boundaries

- Stats computed correctly but never persisted
- Cached values hide live refresh problems
- Perplexity parsing falls back silently to weak output
- Quicklinks or sell actions suggest functionality the repo does not actually implement

## Minimum Verification

- Open item detail and refresh market data
- Confirm eBay stats or listings change where expected
- Confirm market value card/modal still renders sensible fallback states
- Confirm library/detail values remain coherent after app reload
