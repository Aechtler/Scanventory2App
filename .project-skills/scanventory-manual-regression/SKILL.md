---
name: scanventory-manual-regression
description: Use when finishing user-facing work in Scanventory2App and you need a fast repository-specific regression pass because automated coverage is minimal
---

# Scanventory Manual Regression

Run the smallest relevant set below before calling work done.

## Core Checks

- Auth: login, app reload, protected-route redirect still work
- Scan entry: camera or gallery path still reaches `/analyze`
- Analyze: recognition or manual fallback still reaches saved item flow
- Save/edit: item appears in library, opens detail, and edits persist
- Pricing: detail refresh still loads eBay and/or Perplexity states without obvious breakage
- Delete: item removal updates library and does not leave broken detail navigation

## If You Touched Backend Or Payloads

- Verify create item
- Verify update item or price patch
- Verify delete item
- Check backend response shape still matches mobile expectations

## If You Touched History Or Cache

- Reload app after saving
- Verify cached image path still renders
- Verify delete/clear flows do not leave stale local artifacts

## Evidence

Record exactly what you ran and what you could not run.
