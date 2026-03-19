# ScanApp - Code Review TODO Liste

> Erstellt: 2026-02-11 | Reviewer: Claude Code (Senior Engineer Review)
> Aktualisiert: 2026-03-19 | Erledigte Punkte entfernt

---

## Priorisierung

- **P0 - CRITICAL**: Sicherheitslücken, Datenverlust, App-Crashes
- **P1 - HIGH**: Logische Bugs, fehlende Fehlerbehandlung, Performance
- **P2 - MEDIUM**: Code-Qualität, Projektregeln, Maintainability
- **P3 - LOW**: Best Practices, Documentation, Nice-to-haves

---

## P0 - CRITICAL (Sofort beheben)

_Keine offenen P0-Issues mehr! 🎉_

---

## P1 - HIGH (Diese Woche beheben)

### Logische Bugs

- [x] **BUG-03**: `removeCachedImage()` bekommt falschen Parameter
  - `packages/mobile/src/features/history/store/historyStore.ts`
  - Behoben: Cache-Cleanup nutzt den konkreten `cachedImageUri`-Pfad

- [x] **BUG-04**: Median-Berechnung fehlerhaft bei gerader Anzahl
  - `packages/mobile/src/features/market/services/ebay/search.ts`
  - Überprüft: die aktuelle Implementierung verwendet bereits die korrekte Gerade-Anzahl-Formel; kein Code-Change nötig

- [x] **BUG-05**: Preis €0 wird als "kein Preis" behandelt
  - `packages/mobile/src/app/(tabs)/library.tsx`
  - Behoben: gültige `0`-Preise werden korrekt gerendert und in gemeinsamer Preislogik konsistent behandelt

- [x] **BUG-06**: Europäische Dezimal-Trennung nicht korrekt geparst
  - `packages/mobile/src/features/history/components/FinalPriceCard/FinalPriceCard.tsx`
  - Behoben: lokalisierte Preis-Parsing-Helfer unterstützen Werte wie `1.234,56`

- [x] **BUG-07**: Manuelle Suche hat `confidence: 1.0` (100%)
  - `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`
  - Behoben: manuelle Suche verwendet keine irreführende KI-Confidence mehr

- [x] **BUG-08**: Orphaned Image bei fehlgeschlagenem createItem
  - `packages/backend/src/routes/items.ts`
  - Behoben: DB-Create-Fehler räumen gespeicherte Bilder auf; zusätzliche Temp-Upload-Cleanup für ungültiges Multipart-JSON und Save-Fehler ergänzt

### Fehlende Fehlerbehandlung

- [x] **ERR-02**: `Promise.all()` statt `Promise.allSettled()` bei Image-Loading
  - `packages/mobile/src/features/analyze/hooks/useAnalysis.ts`
  - Behoben: Bild-Ladepfad ist timeout-begrenzt und blockiert nicht mehr die komplette Ergebnisliste

- [x] **ERR-03**: Keine Fehlerbehandlung bei File-Read in visionService
  - `packages/mobile/src/features/scan/services/visionService.ts`
  - Behoben: File-Read-Fehler werden explizit behandelt und liefern eine aussagekräftige Fehlerspur

- [x] **ERR-04**: `sendFile()` ohne Error Callback
  - `packages/backend/src/routes/images.ts`
  - Behoben: Error-Callback vorhanden, loggt Fehler explizit und liefert konsistente Fallback-Antwort

- [x] **ERR-05**: `deleteImage()` in Route ohne try-catch
  - `packages/backend/src/routes/items.ts`
  - Behoben: File-Cleanup läuft in try-catch mit Logging; Response enthält jetzt `imageDeleted`

- [x] **ERR-06**: SecureStore Fehler still verschluckt
  - `packages/mobile/src/shared/services/apiClient.ts`
  - Behoben: SecureStore-Leseprobleme werden jetzt mit brauchbarer Warnung geloggt, ohne Secrets zu leaken

### Performance

- [x] **PERF-03**: FlashList re-rendert komplett bei ViewMode-Toggle
  - `packages/mobile/src/app/(tabs)/library.tsx`
  - Behoben: der erzwungene vollständige Remount beim Umschalten wurde entfernt

---

## P2 - MEDIUM (Nächster Sprint)

### Projektregeln-Verletzungen (>150 Zeilen)

- [ ] **SIZE-01**: `packages/mobile/src/app/(tabs)/library.tsx` — 235 Zeilen
  - Aufteilen in: LibraryListItem, LibraryGridItem, Pagination-Hook

- [ ] **SIZE-02**: `packages/mobile/src/shared/components/Animated.tsx` — 232 Zeilen
  - Aufteilen in: AnimatedButton.tsx, FadeInView.tsx, etc.

- [ ] **SIZE-03**: `packages/mobile/src/features/market/services/ebay/search.ts` — 215 Zeilen
  - Aufteilen in: parseListings.ts, calculateStats.ts, search.ts

- [ ] **SIZE-04**: `packages/mobile/src/features/history/store/historyStore.ts` — 205 Zeilen
  - Aufteilen in: actions.ts, selectors.ts

- [ ] **SIZE-05**: `packages/mobile/src/features/analyze/hooks/useAnalysis.ts` — 204 Zeilen
  - Aufteilen in: useVisionAnalysis, useProductImages, usePlatformLinks

- [ ] **SIZE-06**: `packages/backend/src/routes/items.ts` — 210 Zeilen
  - Aufteilen in: separate Handler-Dateien pro Route

- [ ] **SIZE-07**: `packages/mobile/src/app/history/[id].tsx` — 191 Zeilen
  - MarketSlider und HeaderActions als separate Komponenten

- [ ] **SIZE-08**: `packages/backend/src/services/itemService.ts` — 163 Zeilen
  - Validation-Layer separieren

### Type Safety

- [ ] **TYPE-01**: Backend-Types zu lose (`Record<string, unknown>`)
  - `packages/backend/src/types/index.ts:25-61`
  - `priceStats`, `marketValue`, `ebayListings` ohne Struktur
  - **Fix**: Strikte Interfaces definieren (PriceStats, MarketListing, etc.)

- [x] **TYPE-02**: `any` in JWT Middleware
  - `packages/backend/src/middleware/jwtAuth.ts`
  - Behoben: `AuthRequest` nutzt jetzt standardmäßig `Record<string, string>` statt `any`

- [x] **TYPE-03**: `apiUploadItem` data-Parameter zu permissiv
  - `packages/mobile/src/shared/services/apiClient.ts`
  - Behoben: Upload nutzt jetzt einen expliziten `UploadItemPayload`-Vertrag statt `Record<string, unknown>`

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

- [x] **SEC-06**: Kein HTTPS Enforcement im Backend
  - `packages/backend/src/app.ts`, `packages/backend/src/middleware/https.ts`
  - Behoben: Production erzwingt jetzt HTTPS via Proxy-aware Middleware, setzt HSTS auf sichere Requests und gibt Redirect/426 für unsichere Zugriffe zurück

- [x] **SEC-07**: Image Upload ohne MIME-Type Validierung
  - `packages/backend/src/routes/items.ts`
  - Behoben: Multer filtert jetzt MIME-Type und Dateiendung auf JPG/PNG/WEBP; Upload-Fehler liefern eine 400-Antwort

- [x] **SEC-08**: Image Upload Frontend ohne Validierung
  - `packages/mobile/src/shared/services/apiClient.ts`
  - Behoben: Client validiert jetzt URI, Dateiexistenz, Dateigröße und unterstützte Dateitypen vor dem Upload

- [x] **SEC-09**: Kein HTTPS Enforcement im Frontend
  - `packages/mobile/src/shared/constants/index.ts`
  - Behoben: Production-Builds verlangen jetzt eine gültige absolute HTTPS-API-URL statt still auf localhost zurückzufallen

- [x] **SEC-10**: Password-Validierung zu schwach
  - `packages/backend/src/routes/auth.ts`
  - Behoben: Registrierung verlangt jetzt mindestens 8 Zeichen plus Groß-/Kleinbuchstaben und Zahl

- [x] **SEC-11**: Keine Input Validation auf Route-Params
  - `packages/backend/src/routes/items.ts`
  - Behoben: Item-IDs und auth-abgeleitete User-IDs werden vor Service-Zugriffen auf UUID-Format geprüft

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
| P0 - Critical | 0 | ✅ Alle erledigt |
| P1 - High | 0 | ✅ Alle aktuell erfassten P1-Punkte erledigt |
| P2 - Medium | 14 | Offen |
| P3 - Low | 12 | Offen |
| **Gesamt** | **26** | - |

| Kategorie | Anzahl |
|-----------|--------|
| Security | 1 |
| Bugs | 6 |
| Error Handling | 5 |
| Performance | 1 |
| File Size (>150) | 8 |
| Type Safety | 1 |
| Code-Qualität | 6 |
| Architektur | 8 |
| Minor | 4 |

---

## ✅ Erledigte Punkte (entfernt am 2026-02-11)

- **SEC-01**: JWT Secret wird in Production erzwungen (throw bei fehlendem `JWT_SECRET`)
- **SEC-02**: API Client prüft HTTP Status via `handleResponse()` mit `res.ok` Check
- **SEC-03**: CORS konfigurierbar über `CORS_ORIGINS` env var
- **SEC-04**: API Key im Seed Script als required env var (throw bei fehlendem `API_KEY`)
- **SEC-05**: Rate Limiting auf Login (10/15min) und Register (5/15min) Endpoints
- **BUG-01**: Seed Script enthält `email` Feld
- **BUG-02**: `clearHistory()` ruft `clearImageCache()` auf
- **CRASH-01**: `JSON.parse` bei Upload-Response in try-catch gewrappt
- **CRASH-02**: ThemeSelector Icons type-safe via `keyof typeof Icons`
- **ERR-01**: API Timeout via `AbortController` in `fetchWithTimeout()` implementiert
- **PERF-01**: CardSlider `handleScroll` nutzt `useRef` für `currentPage`, nicht in deps
- **PERF-02**: PrismaClient als Singleton in `itemService.ts` exportiert und von anderen Services importiert
- **MINOR-03**: Skeleton `width` korrekt conditional gesetzt
