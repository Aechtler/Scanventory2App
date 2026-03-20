# Manual Regression Checklist

_Last updated: 2026-03-20_

This is the minimum repeatable manual verification pass for the current Scanventory2App state on `scanapp2`.

## Goal

Catch regressions in the product-critical flows before starting the larger P2 size refactors.

## Preflight

- Use branch `scanapp2`
- Ensure backend and mobile app are both pointed at the same environment
- Use a clean test account or a disposable local app state where possible
- If testing production-like mobile config, confirm `EXPO_PUBLIC_API_URL` is absolute HTTPS
- If testing uploads, prepare at least:
  - 1 valid JPG/PNG/WEBP image
  - 1 invalid/non-image file for rejection testing
  - 1 missing/unreadable local file case if reproducible on device/simulator

## Quick command checks

Run what is available in the current environment:

```bash
npm run test:targeted
npm run validate:manual-regression
npm run manual-regression:report
npm run typecheck:mobile
npm run lint:mobile
npm run typecheck:backend
```

If the toolchain is unavailable, record that explicitly instead of silently skipping it.

## 1) Auth

### Register validation

- Try a weak password (<8 chars and/or missing upper/lowercase/number)
- Expected:
  - registration is rejected
  - user sees a clear validation error
  - no partial login state is stored

### Login / persisted auth

- Log in with a valid account
- Restart/reopen app
- Expected:
  - session restores cleanly when SecureStore works
  - if token read fails, app does not crash and logs a useful warning without leaking secrets

### Unauthenticated state

- Start app without a valid token
- Expected:
  - app stays usable in unauthenticated flow
  - authenticated-only calls fail cleanly

## 2) Scan and analyze

### Happy path analyze

- Capture or pick a valid product image
- Run analysis
- Expected:
  - result list appears
  - no full-flow failure if one product image lookup is slow
  - product matches remain usable even if some thumbnail/image lookups fail

### Slow / degraded network

- Repeat analysis under slow or flaky network
- Expected:
  - analysis still returns partial usable results when possible
  - slow image lookups time out instead of blocking the whole result set

### Unreadable image path

- Reproduce with a missing/unreadable local image if possible
- Expected:
  - user gets a useful error path
  - app does not crash
  - optional GTIN lookup degrades gracefully without image context

### Manual search flow

- Use manual search after an uncertain or failed recognition
- Expected:
  - manual result is clearly distinct from AI confidence
  - no fake `100%` confidence semantics are shown

## 3) Save, library, and detail flows

### Save analyzed item

- Save an analyzed item into history/library
- Expected:
  - item appears in library/history
  - image/reference data persists as expected
  - backend sync is attempted when configured/authenticated

### Library rendering and sorting

- Use items with:
  - `finalPrice = 0`
  - `avgPrice = 0`
  - no price
- Expected:
  - `0` is rendered as a real price, not as “Kein Preis”
  - sorting and list/grid cards use the same price semantics

### View mode toggle

- Toggle library list/grid repeatedly with a populated library
- Expected:
  - no obvious full remount jank
  - scroll position is not needlessly reset by a forced list remount

### Detail/edit price parsing

- Enter these values in the active final price editing flow:
  - `0`
  - `12,34`
  - `1.234,56`
  - blank value
- Expected:
  - localized values parse correctly
  - `0` persists as a valid value
  - blank clears or stays empty without producing invalid numeric state

## 4) Backend upload and image routes

### Valid upload

- Upload a valid supported image
- Expected:
  - item create succeeds
  - image can be fetched afterward

### Invalid upload

- Upload an invalid file type
- Expected:
  - client rejects unsupported local file when possible
  - backend rejects invalid multipart/file-type payload with 400

### Create failure cleanup

- Force or simulate a create failure after upload if possible
- Expected:
  - temp upload file is removed
  - saved image is not left orphaned
  - original failure remains diagnosable in logs

### Image fetch route

- Fetch:
  - a valid image filename
  - an invalid filename
  - a missing image
- Expected:
  - valid image returns correctly
  - failures produce explicit/logged error handling rather than silent sendFile issues

## 5) Sync / update / delete

### Sync new item

- Create an item from the mobile app in an authenticated state
- Expected:
  - sync succeeds or fails visibly
  - response envelope handling remains consistent

### Patch/update prices

- Update final price and any available market/pricing fields
- Expected:
  - app state updates consistently
  - backend accepts the normalized payload shapes

### Delete item

- Delete an item that has a cached image and backend image
- Expected:
  - local entry is removed
  - cached image cleanup uses the concrete cached path
  - backend returns consistent delete metadata including `imageDeleted`
  - concurrent/repeat delete attempts fail gracefully

## Recording results

For each run, capture:

- environment used (device/simulator/backend)
- command checks run and pass/fail/block status
- manual sections completed
- any regressions or blockers with exact file/flow context

Before updating Trello, generate the current handoff skeleton with:

```bash
npm run manual-regression:report
```

If Trello is available, update the matching card/checklist with:

- what was validated
- what is still blocked by environment/tooling
- whether Batch 6 is ready to move forward

## Validation result template

- Environment:
- Command checks:
- Manual sections completed:
- Regressions / blockers:

## Trello update template

- Ziel
- Umfang
- Nachweise
- Nächster Schritt
- Validierung
