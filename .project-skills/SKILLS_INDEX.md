# Project Skills Index

Project-local skills for Scanventory2App live here.

## Skills

### `scanventory-app-map`
Use when:
- You need to find the right file or layer before editing
- You are tracing a user flow across mobile, shared services, and backend
- You want the shortest route to auth, scan, history, pricing, or item APIs

### `scanventory-recognition-flow`
Use when:
- Working on scan, gallery upload, analysis, Gemini prompt/output, or match selection
- Debugging bad recognition, missing candidates, or wrong saved metadata
- Changing the auto-save behavior after analysis

### `scanventory-pricing-pipeline`
Use when:
- Working on eBay search, Perplexity market value, quicklinks, or price presentation
- Debugging missing price stats, stale market value, or broken detail-screen refresh
- Modifying price aggregation or pricing payloads

### `scanventory-history-sync`
Use when:
- Working on library/history, item persistence, offline image cache, or backend sync
- Debugging save/edit/delete inconsistencies between local state and server state
- Changing item payload shape or sync status handling

### `scanventory-manual-regression`
Use when:
- Finishing any user-facing change in this repo
- Touching auth, scan, analysis, save, history, pricing, or delete flows
- There is no automated test covering the change and you need a fast manual check

## Suggested Order

Start with:
1. `scanventory-app-map`
2. One domain skill for the area you are changing
3. `scanventory-manual-regression` before claiming the work is done
