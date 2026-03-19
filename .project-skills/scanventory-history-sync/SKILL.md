---
name: scanventory-history-sync
description: Use when changing or debugging Scanventory2App library/history behavior, offline image caching, local persistence, or backend item sync
---

# Scanventory History Sync

This app is local-first. Check local state, cache, and backend sync together.

## Primary Files

- Store: `packages/mobile/src/features/history/store/historyStore.ts`
- Sync calls: `packages/mobile/src/features/history/services/syncService.ts`
- Image cache: `packages/mobile/src/features/history/services/imageCacheService.ts`
- Library UI: `packages/mobile/src/app/(tabs)/library.tsx`
- Detail/edit: `packages/mobile/src/app/history/[id].tsx`, `packages/mobile/src/app/history/edit/[id].tsx`
- Backend item API: `packages/backend/src/routes/items.ts`, `packages/backend/src/services/itemService.ts`

## What To Check

- Is the source of truth local item state, cached image state, or backend state?
- Does add/update/delete mutate local state first and then sync?
- If a field is added to `HistoryItem`, does it flow through save, patch, and backend persistence?
- Does delete clean both local cache and backend record?

## Known Sharp Edges

- Fire-and-forget sync can hide failures
- Cache cleanup is easy to break
- `serverId` and `syncStatus` are critical for later updates
- Many persisted fields are JSON-shaped and loosely typed across app/backend

## Minimum Verification

- Save an item, close/reopen app, confirm it persists
- Edit item fields and confirm detail screen reflects changes
- Delete an item and confirm library entry and cached image behavior are correct
