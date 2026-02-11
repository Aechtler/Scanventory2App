# ScanApp - Code Review TODO Liste

> Erstellt: 2026-02-11 | Reviewer: Claude Code (Senior Engineer Review)
> Gesamtfunde: **71 Issues** across Frontend, Shared Code, Backend

---

## Priorisierung

- **P0 - CRITICAL**: Sicherheitslücken, Datenverlust, App-Crashes
- **P1 - HIGH**: Logische Bugs, fehlende Fehlerbehandlung, Performance
- **P2 - MEDIUM**: Code-Qualität, Projektregeln, Maintainability
- **P3 - LOW**: Best Practices, Documentation, Nice-to-haves

---

## P0 - CRITICAL (Sofort beheben)

### Security

- [ ] **SEC-01**: Hardcoded JWT Secret entfernen
  - `packages/backend/src/services/authService.ts:5`
  - Fallback `'scanapp-secret-key-change-in-production'` entfernen, JWT_SECRET als required env var erzwingen
  - **Risiko**: Token-Fälschung in Production möglich

- [ ] **SEC-02**: API Client prüft keine HTTP Status Codes
  - `packages/mobile/src/shared/services/apiClient.ts:39-84`
  - Alle API-Methoden rufen `.json()` auf ohne `res.ok` zu prüfen
  - 500er, 401er, 403er Fehler werden als Success behandelt
  - **Fix**: `if (!res.ok) throw new ApiError(res.status, await res.json())`

- [ ] **SEC-03**: CORS erlaubt alle Origins
  - `packages/backend/src/app.ts:13`
  - `app.use(cors())` ohne Einschränkung
  - **Fix**: `cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') })`

- [ ] **SEC-04**: Default API Key im Seed Script
  - `packages/backend/prisma/seed.ts:11`
  - `'change-me-to-a-secure-key'` als Fallback
  - **Fix**: Required env var ohne Default

- [ ] **SEC-05**: Kein Rate Limiting auf Auth-Endpoints
  - `packages/backend/src/routes/auth.ts`
  - Login/Register ohne Rate Limit = Brute-Force möglich
  - **Fix**: `express-rate-limit` Middleware hinzufügen

### Crashes & Datenverlust

- [ ] **CRASH-01**: JSON.parse ohne try-catch bei Upload-Response
  - `packages/mobile/src/shared/services/apiClient.ts:110`
  - `JSON.parse(uploadResult.body)` wirft SyntaxError bei ungültigem JSON
  - **Fix**: try-catch mit Fallback-Error

- [ ] **CRASH-02**: Unsicherer Icon-Zugriff in ThemeSelector
  - `packages/mobile/src/shared/components/ThemeSelector.tsx:28`
  - `Icons[icon]` kann `undefined` sein → Crash beim Rendern
  - **Fix**: Validierung oder Fallback-Icon

- [ ] **BUG-01**: Seed Script fehlt required `email` Feld
  - `packages/backend/prisma/seed.ts:13-22`
  - User-Erstellung ohne email-Feld schlägt fehl (Schema: `@unique`)
  - **Fix**: `email: process.env.ADMIN_EMAIL || 'admin@scanapp.local'` hinzufügen

---

## P1 - HIGH (Diese Woche beheben)

### Logische Bugs

- [ ] **BUG-02**: `clearHistory()` löscht gecachte Bilder nicht
  - `packages/mobile/src/features/history/store/historyStore.ts:133`
  - TODO-Kommentar vorhanden, aber nicht implementiert → Speicherleck
  - **Fix**: Alle gecachten Bilder beim Clear durchiterieren und löschen

- [ ] **BUG-03**: `removeCachedImage()` bekommt falschen Parameter
  - `packages/mobile/src/features/history/store/historyStore.ts:121`
  - `item.imageUri` statt `item.cachedImageUri` → gecachte Datei bleibt bestehen
  - **Fix**: `removeCachedImage(item.cachedImageUri)` verwenden

- [ ] **BUG-04**: Median-Berechnung fehlerhaft bei gerader Anzahl
  - `packages/mobile/src/features/market/services/ebay/search.ts:133`
  - `Math.floor(prices.length / 2)` ist bei gerader Anzahl falsch
  - **Fix**: Korrekte Median-Formel: `(arr[mid-1] + arr[mid]) / 2`

- [ ] **BUG-05**: Preis €0 wird als "kein Preis" behandelt
  - `packages/mobile/src/app/(tabs)/library.tsx:97`
  - `if (displayPrice)` ist falsy bei 0
  - **Fix**: `if (displayPrice !== null && displayPrice !== undefined)`

- [ ] **BUG-06**: Europäische Dezimal-Trennung nicht korrekt geparst
  - `packages/mobile/src/features/history/components/FinalPriceCard/FinalPriceCard.tsx:37`
  - `"1.234,56"` (Tausender-Trenner + Komma) wird falsch geparst
  - **Fix**: Tausender-Trenner zuerst entfernen, dann Komma ersetzen

- [ ] **BUG-07**: Manuelle Suche hat `confidence: 1.0` (100%)
  - `packages/mobile/src/features/analyze/hooks/useAnalysis.ts:161-165`
  - Irreführend, da keine KI-Erkennung stattfand
  - **Fix**: `confidence: 0` oder separates Flag `isManual: true`

- [ ] **BUG-08**: Orphaned Image bei fehlgeschlagenem createItem
  - `packages/backend/src/routes/items.ts:47-74`
  - Bild wird gespeichert, aber bei DB-Fehler nicht aufgeräumt
  - **Fix**: try-catch mit `deleteImage(imageFilename)` im catch-Block

### Fehlende Fehlerbehandlung

- [ ] **ERR-01**: API Request Timeout nicht implementiert
  - `packages/mobile/src/shared/services/apiClient.ts:8`
  - `API_CONFIG.TIMEOUT` definiert aber nie verwendet
  - **Fix**: `AbortController` mit Timeout verwenden

- [ ] **ERR-02**: `Promise.all()` statt `Promise.allSettled()` bei Image-Loading
  - `packages/mobile/src/features/analyze/hooks/useAnalysis.ts:70-76`
  - Ein hängendes Bild blockiert alle
  - **Fix**: `Promise.allSettled()` + Timeout pro Request

- [ ] **ERR-03**: Keine Fehlerbehandlung bei File-Read in visionService
  - `packages/mobile/src/features/scan/services/visionService.ts:45-46`
  - `readAsStringAsync` kann fehlschlagen (Datei fehlt, unlesbar)
  - **Fix**: try-catch mit aussagekräftigem Error

- [ ] **ERR-04**: `sendFile()` ohne Error Callback
  - `packages/backend/src/routes/images.ts:12-28`
  - Async ohne Fehlerbehandlung
  - **Fix**: Error-Callback hinzufügen

- [ ] **ERR-05**: `deleteImage()` in Route ohne try-catch
  - `packages/backend/src/routes/items.ts:93-107`
  - Wenn Löschen fehlschlägt, wird Exception verschluckt

- [ ] **ERR-06**: SecureStore Fehler still verschluckt
  - `packages/mobile/src/shared/services/apiClient.ts:14-18`
  - `catch { return null }` → Debugging unmöglich
  - **Fix**: Mindestens console.warn im catch

### Performance

- [ ] **PERF-01**: CardSlider `handleScroll` wird bei jedem Scroll neu erstellt
  - `packages/mobile/src/shared/components/CardSlider/CardSlider.tsx:23-33`
  - `currentPage` in useCallback deps → infinite recreations
  - **Fix**: `currentPage` aus deps entfernen, useRef verwenden

- [ ] **PERF-02**: Mehrere PrismaClient Instanzen
  - `packages/backend/src/services/itemService.ts:8`
  - `new PrismaClient()` pro Service → Connection Pool Exhaustion
  - **Fix**: Singleton-Pattern, eine Instanz exportieren

- [ ] **PERF-03**: FlashList re-rendert komplett bei ViewMode-Toggle
  - `packages/mobile/src/app/(tabs)/library.tsx:188-210`
  - `key={viewMode}` zwingt vollständigen Rebuild
  - **Fix**: Key entfernen, Rendering-Logik anpassen

---

## P2 - MEDIUM (Nächster Sprint)

### Projektregeln-Verletzungen (>150 Zeilen)

- [ ] **SIZE-01**: `packages/mobile/src/app/(tabs)/library.tsx` — 236 Zeilen
  - Aufteilen in: LibraryListItem, LibraryGridItem, Pagination-Hook

- [ ] **SIZE-02**: `packages/mobile/src/shared/components/Animated.tsx` — 233 Zeilen
  - Aufteilen in: AnimatedButton.tsx, FadeInView.tsx, etc.

- [ ] **SIZE-03**: `packages/mobile/src/features/market/services/ebay/search.ts` — 213 Zeilen
  - Aufteilen in: parseListings.ts, calculateStats.ts, search.ts

- [ ] **SIZE-04**: `packages/mobile/src/features/history/store/historyStore.ts` — 206 Zeilen
  - Aufteilen in: actions.ts, selectors.ts

- [ ] **SIZE-05**: `packages/mobile/src/features/analyze/hooks/useAnalysis.ts` — 202 Zeilen
  - Aufteilen in: useVisionAnalysis, useProductImages, usePlatformLinks

- [ ] **SIZE-06**: `packages/backend/src/routes/items.ts` — 200 Zeilen
  - Aufteilen in: separate Handler-Dateien pro Route

- [ ] **SIZE-07**: `packages/mobile/src/app/history/[id].tsx` — 192 Zeilen
  - MarketSlider und HeaderActions als separate Komponenten

- [ ] **SIZE-08**: `packages/backend/src/services/itemService.ts` — 163 Zeilen
  - Validation-Layer separieren

### Type Safety

- [ ] **TYPE-01**: Backend-Types zu lose (`Record<string, unknown>`)
  - `packages/backend/src/types/index.ts:25-61`
  - `priceStats`, `marketValue`, `ebayListings` ohne Struktur
  - **Fix**: Strikte Interfaces definieren (PriceStats, MarketListing, etc.)

- [ ] **TYPE-02**: `any` in JWT Middleware
  - `packages/backend/src/middleware/jwtAuth.ts:4`
  - `AuthRequest<P = any>` → `AuthRequest<P = Record<string, string>>`

- [ ] **TYPE-03**: `apiUploadItem` data-Parameter zu permissiv
  - `packages/mobile/src/shared/services/apiClient.ts:92`
  - `Record<string, unknown>` akzeptiert beliebige Daten

### Code-Qualität

- [ ] **QUAL-01**: Login/Register Code-Duplizierung
  - `packages/mobile/src/features/auth/store/authStore.ts:75-147`
  - Zwei fast identische Funktionen → shared Helper extrahieren

- [ ] **QUAL-02**: Hardcoded Colors dupliziert
  - `packages/mobile/src/shared/components/GlobalTabBar.tsx:22-23`
  - `packages/mobile/src/shared/components/CustomTabBar.tsx:19-20`
  - **Fix**: In Theme-Store/Constants zentralisieren

- [ ] **QUAL-03**: Magic Numbers in Animationen
  - `packages/mobile/src/shared/components/Animated.tsx:40-41, 50, 84, 118, 173`
  - `damping: 20, stiffness: 300` → benannte Konstanten

- [ ] **QUAL-04**: Fehlende Barrel Exports in shared/components
  - `packages/mobile/src/shared/components/index.ts`
  - Animated, Skeleton, Icons, GlobalTabBar, ThemeSelector fehlen

- [ ] **QUAL-05**: Inkonsistentes Response-Format im Backend
  - Manche: `{ success: true, data }`, andere: `{ error }`, `{ message }`
  - **Fix**: Einheitliches ApiResponse-Format

- [ ] **QUAL-06**: Race Condition in deleteItem
  - `packages/backend/src/services/itemService.ts:150-163`
  - Zwischen findFirst und deleteMany könnte Item gelöscht werden
  - **Fix**: Single delete mit Transaction

### Security (Medium)

- [ ] **SEC-06**: Kein HTTPS Enforcement im Backend
  - Kein Redirect-Middleware für Production

- [ ] **SEC-07**: Image Upload ohne MIME-Type Validierung
  - `packages/backend/src/routes/items.ts:14`
  - Multer akzeptiert alle Dateitypen
  - **Fix**: `fileFilter` mit Whitelist (.jpg, .png, .webp)

- [ ] **SEC-08**: Image Upload Frontend ohne Validierung
  - `packages/mobile/src/shared/services/apiClient.ts:90-111`
  - Keine Prüfung auf: gültige URI, Dateigröße, MIME-Type

- [ ] **SEC-09**: Kein HTTPS Enforcement im Frontend
  - `packages/mobile/src/shared/constants/index.ts:7`
  - Fallback auf `http://localhost:3000` in Production
  - **Fix**: In Production HTTPS erzwingen

- [ ] **SEC-10**: Password-Validierung zu schwach
  - `packages/backend/src/routes/auth.ts:15-42`
  - Nur Mindestlänge 6, keine Komplexitätsprüfung
  - **Fix**: zod/joi Validierung mit Komplexitätsregeln

- [ ] **SEC-11**: Keine Input Validation auf Route-Params
  - `packages/backend/src/routes/items.ts:20`
  - `req.user!.userId` ohne UUID-Format-Validierung

---

## P3 - LOW (Backlog)

### Architektur & Best Practices

- [ ] **ARCH-01**: Dependency Injection fehlt im Backend
  - Services instanziieren PrismaClient direkt → nicht testbar
  - **Fix**: `createItemService(prisma)` Pattern

- [ ] **ARCH-02**: Dependency Injection fehlt im historyStore
  - `syncNewItem`, `syncPrices` sind hardcoded → nicht testbar

- [ ] **ARCH-03**: Fehlende Datenbank-Compound-Indexes
  - `packages/backend/prisma/schema.prisma`
  - Missing: `@@index([userId, scannedAt])` für effizientes Filtering

- [ ] **ARCH-04**: Kein Request-Logging Middleware
  - Keine Logs für Method, Path, Timing, User, Status

- [ ] **ARCH-05**: Health-Check prüft nur Server-Status
  - `packages/backend/src/routes/health.ts`
  - Missing: DB-Connectivity, Disk Space, Upload-Dir writable

- [ ] **ARCH-06**: Docker-Compose hardcoded Credentials
  - `packages/backend/docker-compose.yml:6-8`
  - **Fix**: `.env` File verwenden

- [ ] **ARCH-07**: Keine API-Dokumentation (OpenAPI/Swagger)

- [ ] **ARCH-08**: Kein Request-ID Tracing für Log-Korrelation

### Minor Issues

- [ ] **MINOR-01**: `index` als React key in CardSlider
  - `packages/mobile/src/shared/components/CardSlider/CardSlider.tsx:49`
  - Anti-Pattern bei dynamischen Listen

- [ ] **MINOR-02**: `useAsync` Return-Type nicht explizit
  - `packages/mobile/src/shared/hooks/useAsync.ts:43-47`

- [ ] **MINOR-03**: Skeleton width `undefined` in Style
  - `packages/mobile/src/shared/components/Skeleton.tsx:35-44`
  - `width: undefined` ist ungültig in RN Styles

- [ ] **MINOR-04**: Preisverteilung künstlich linear
  - `packages/mobile/src/features/market/services/marketAggregator.ts:71-75`
  - Generiert gleichmäßig verteilte Preise statt realer Daten

- [ ] **MINOR-05**: Error Stack Traces in Logs
  - `packages/backend/src/middleware/errorHandler.ts:14`
  - Könnte sensible Infos leaken (DB-Connection-Strings, Pfade)

---

## Statistik

| Priorität | Anzahl | Status |
|-----------|--------|--------|
| P0 - Critical | 8 | Offen |
| P1 - High | 16 | Offen |
| P2 - Medium | 22 | Offen |
| P3 - Low | 13 | Offen |
| **Gesamt** | **59** | - |

| Kategorie | Anzahl |
|-----------|--------|
| Security | 11 |
| Bugs | 8 |
| Error Handling | 6 |
| Performance | 3 |
| File Size (>150) | 8 |
| Type Safety | 3 |
| Code-Qualität | 6 |
| Architektur | 8 |
| Minor | 5 |
