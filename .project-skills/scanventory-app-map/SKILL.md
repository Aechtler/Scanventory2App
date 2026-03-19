---
name: scanventory-app-map
description: Use when working in Scanventory2App and you need the fastest route to the right files, layers, or product workflow before editing
---

# Scanventory App Map

Use this as the repo routing table.

## Workflow Map

- Auth: `packages/mobile/src/app/login.tsx`, `packages/mobile/src/app/register.tsx`, `packages/mobile/src/features/auth`, backend `packages/backend/src/routes/auth.ts`
- Scan entry: `packages/mobile/src/app/(tabs)/index.tsx`
- Analyze flow: `packages/mobile/src/app/analyze.tsx`, `packages/mobile/src/features/analyze`, `packages/mobile/src/features/scan/services/visionService.ts`
- Library/history: `packages/mobile/src/app/(tabs)/library.tsx`, `packages/mobile/src/features/history`
- Item detail/edit: `packages/mobile/src/app/history/[id].tsx`, `packages/mobile/src/app/history/edit/[id].tsx`
- Market data: `packages/mobile/src/features/market`
- Shared API client: `packages/mobile/src/shared/services/apiClient.ts`
- Backend item CRUD: `packages/backend/src/routes/items.ts`, `packages/backend/src/services/itemService.ts`
- Data model: `packages/backend/prisma/schema.prisma`

## Cross-Cut Rules

- Route files compose screens; feature folders hold most behavior.
- Local-first item state lives in `features/history/store/historyStore.ts`.
- Backend sync from mobile is mostly fire-and-forget via `features/history/services/syncService.ts`.
- Price/value data is cached on history items, not only fetched live.

## Fast Triage

- Wrong saved item fields: analyze hook -> analyze screen -> history store -> sync service -> backend create item
- Missing market numbers: `useMarketData` -> eBay/Perplexity service -> history store callbacks -> detail UI
- Delete/cache bugs: history store -> image cache service -> sync delete -> backend delete route
