---
name: scanventory-recognition-flow
description: Use when changing or debugging Scanventory2App scan, image analysis, Gemini recognition, candidate selection, or auto-save behavior
---

# Scanventory Recognition Flow

Follow the user path end to end before editing.

## Primary Files

- Entry: `packages/mobile/src/app/(tabs)/index.tsx`
- Analyze screen: `packages/mobile/src/app/analyze.tsx`
- Analysis state: `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`
- Candidate UI: `packages/mobile/src/features/scan/components/MatchSelectionSheet.tsx`
- Vision service and prompts: `packages/mobile/src/features/scan/services/visionService.ts`
- Save path: `packages/mobile/src/features/history/store/historyStore.ts`

## What To Check

- Does image permission / pick / camera flow still route correctly to `/analyze`?
- Does `runAnalysis()` use the correct URI and API-key fallback path?
- If recognition is uncertain, does the selection sheet show usable candidates and manual search?
- Does selected or manual match produce the expected `productName`, `category`, `brand`, `condition`, `searchQuery`, `searchQueries`, `gtin`, and `confidence`?
- Does `analyze.tsx` still auto-save exactly once and navigate to edit correctly?

## Common Failure Boundaries

- Prompt change breaks JSON parsing in `visionService.ts`
- Match selection looks right but saved payload is wrong in `analyze.tsx`
- Manual search path diverges from AI match path
- GTIN enrichment updates UI state but not persisted item state

## Minimum Verification

- Gallery scan with a likely-recognizable item
- Manual-search fallback
- Confirm saved item appears in library and opens in edit/detail with expected fields
