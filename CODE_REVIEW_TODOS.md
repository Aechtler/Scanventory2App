# ScanApp - Code Review TODO Liste

> Erstellt: 2026-02-11 | Reviewer: Claude Code (Senior Engineer Review)
> Aktualisiert: 2026-03-20 | Erledigte Punkte entfernt

---

## Priorisierung

- **P0 - CRITICAL**: Sicherheitslücken, Datenverlust, App-Crashes
- **P1 - HIGH**: Logische Bugs, fehlende Fehlerbehandlung, Performance
- **P2 - MEDIUM**: Code-Qualität, Projektregeln, Maintainability
- **P3 - LOW**: Best Practices, Documentation, Nice-to-haves

## Statusnotiz

- 2026-03-20: `docs/manual-regression-checklist.md` ist jetzt selbst per `npm run validate:manual-regression` und `scripts/manual-regression-checklist.test.ts` gegen Repo-Drift abgesichert; `npm run test:targeted` guardet damit sowohl die dokumentierten Quick-Checks als auch die geforderten Trello-Felder `Ziel/Umfang/Nachweise/Nächster Schritt/Validierung`.
- 2026-03-20: `scripts/setup-workspace-toolchain.mjs` reicht angeforderte `workspaceNames` jetzt bis zum eigentlichen `npm install` durch; backend-/mobile-Guards versuchen dadurch zuerst den kleinsten `npm install --workspace=...`-Restore-Slice statt immer den kompletten Root-Install.
- 2026-03-20: `npm run build:all` laeuft jetzt ueber einen gemeinsamen Runnable-environment-Guard statt direkt in `Cannot find module .../typescript/bin/tsc` zu crashen; der aktuelle Output zeigt den echten Backend-Restore-Slice mit 13 direkten Blockern plus knapper `Workspace build summary`.
- 2026-03-20: Workspace-spezifische Guard-Diagnostik filtert Shared-Dependency-Owner jetzt auf den angeforderten Restore-Slice; `npm run typecheck:backend` empfiehlt dadurch bei fehlendem `typescript` nicht mehr irrefuehrend `@scanapp/mobile`, sondern korrekt nur `npm install --workspace=@scanapp/backend`.
- 2026-03-20: Aggregate Runnable-environment-Diagnostik gruppiert `npm run typecheck:all`-Blocker jetzt zusaetzlich nach Workspace und priorisiert den kleineren Restore-Slice zuerst; der aktuelle Guard zeigt damit direkt `@scanapp/backend` mit 13 Blockern vor `@scanapp/mobile` mit 33 Blockern.
- 2026-03-20: `npm run typecheck:all` macht jetzt zuerst einen gemeinsamen `setup:workspace`-Preflight fuer `@scanapp/mobile` und `@scanapp/backend`; bei weiter fehlenden Tarballs bleibt der Aggregate-Guard dadurch auf der echten direkten 45-Paket-Blockerliste statt nach dem ersten Fehlversuch in 500+ hohle Transitiv-Pakete zu kippen.
- 2026-03-20: `npm run typecheck:all` laeuft jetzt bewusst ueber mobile und backend weiter und gibt am Ende eine knappe Workspace-Zusammenfassung aus; die verbleibenden Blocker sind echte fehlende/offline nicht gecachte Tarballs in beiden Workspaces statt eines vorzeitig abgebrochenen ersten Fehlers.
- 2026-03-20: Runnable-environment Guard-Diagnostik zeigt jetzt zusätzlich workspace-spezifische `npm install --workspace=...`-Hinweise fuer mobile/backend Validierung; der verbleibende Blocker sind weiterhin fehlende/offline nicht gecachte Tarballs, nicht mehr unklare Reparaturschritte.
- 2026-03-20: Workspace-Dependency-Checks bevorzugen jetzt vorhandene workspace-lokale `package-lock.json`-Eintraege vor stale hoisted Root-Pfaden; `npm run typecheck:backend` meldet dadurch den echten Backend-Blocker `packages/backend/node_modules/uuid` mit `uuid-11.1.0.tgz` statt eines irrefuehrenden Root-`uuid-7.0.3`-Treffers.

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

- [x] **SIZE-01**: `packages/mobile/src/app/(tabs)/library.tsx` — 235 Zeilen
  - Behoben: Screen auf 136 Zeilen reduziert; Row-Wrapper (`LibraryListItem`, `LibraryGridItem`) sowie `libraryRows.ts` und `LibraryEmptyStates.tsx` extrahiert, Verhalten beibehalten

- [x] **SIZE-02**: `packages/mobile/src/shared/components/Animated.tsx` — 232 Zeilen
  - Behoben: `Animated.tsx` ist jetzt ein 7-zeiliges Compatibility-Barrel; konkrete Helper liegen in `packages/mobile/src/shared/components/Animated/`

- [x] **SIZE-03**: `packages/mobile/src/features/market/services/ebay/search.ts` — 215 Zeilen
  - Behoben: `search.ts` auf 141 Zeilen reduziert; Listing-Parsing und Preisstatistik leben jetzt in `parseListings.ts` und `calculateStats.ts`, abgesichert durch einen gezielten Node-Test

- [x] **SIZE-04**: `packages/mobile/src/features/history/store/historyStore.ts` — 205 Zeilen
  - Behoben: `historyStore.ts` auf 117 Zeilen reduziert; pure Store-Transitions und Sync-Payload-Building nach `actions.ts`, Lookup-Logik nach `selectors.ts`, Typen nach `types.ts` extrahiert und mit einem gezielten Node-Test abgesichert

- [x] **SIZE-05**: `packages/mobile/src/features/analyze/hooks/useAnalysis.ts` — 204 Zeilen
  - Behoben: `useAnalysis.ts` auf 141 Zeilen reduziert; Vision-Orchestrierung, Produktbild-Laden und Plattform-Link-Building nach `useVisionAnalysis.ts`, `useProductImages.ts` und `usePlatformLinks.ts` extrahiert, abgesichert durch `analysisHelpers.test.ts`

- [x] **SIZE-06**: `packages/backend/src/routes/items.ts` — 210 Zeilen
  - Behoben: `items.ts` ist jetzt ein 27-zeiliger Router-Entry; CRUD-/Preis-Handler wurden nach `packages/backend/src/routes/items/` in fokussierte Dateien ausgelagert, abgesichert durch einen gezielten Node-Test fuer Pagination- und Create-Validation-Helper

- [x] **SIZE-07**: `packages/mobile/src/app/history/[id].tsx` — 191 Zeilen
  - Behoben: Screen auf 143 Zeilen reduziert; Header-Actions, Market-/Quicklink-Section, Not-Found-State und Detail-State-Helper in fokussierte Dateien extrahiert, Verhalten beibehalten

- [x] **SIZE-08**: `packages/backend/src/services/itemService.ts` — 163 Zeilen
  - Behoben: `itemService.ts` auf 138 Zeilen reduziert; Create-/Preis-Update-Normalisierung nach `packages/backend/src/services/itemPayloads.ts` extrahiert und mit einem gezielten Node-Test abgesichert

### Type Safety

- [x] **TYPE-01**: Backend-Types zu lose (`Record<string, unknown>`)
  - `packages/backend/src/types/index.ts`, `packages/backend/src/services/itemService.ts`
  - Behoben: Strikte Backend-Interfaces für `PriceStats`, `MarketListing`, `MarketValueResult` und `SearchQueries` ersetzen die losen JSON-Randtypen

- [x] **TYPE-02**: `any` in JWT Middleware
  - `packages/backend/src/middleware/jwtAuth.ts`
  - Behoben: `AuthRequest` nutzt jetzt standardmäßig `Record<string, string>` statt `any`

- [x] **TYPE-03**: `apiUploadItem` data-Parameter zu permissiv
  - `packages/mobile/src/shared/services/apiClient.ts`
  - Behoben: Upload nutzt jetzt einen expliziten `UploadItemPayload`-Vertrag statt `Record<string, unknown>`

### Code-Qualität

- [x] **QUAL-01**: Login/Register Code-Duplizierung
  - `packages/mobile/src/features/auth/store/authStore.ts`
  - Behoben: Login/Register teilen sich jetzt einen gemeinsamen `authenticate()`-Helper für Request-, Envelope- und Token-Handling

- [x] **QUAL-02**: Hardcoded Colors dupliziert
  - `packages/mobile/src/shared/components/GlobalTabBar.tsx:22-23`
  - `packages/mobile/src/shared/components/CustomTabBar.tsx:19-20`
  - Behoben: gemeinsame Tab-Bar-Inactive-Farben leben jetzt zentral in `packages/mobile/src/shared/constants/index.ts`

- [x] **QUAL-03**: Magic Numbers in Animationen
  - `packages/mobile/src/shared/components/Animated.tsx:40-41, 50, 84, 118, 173`
  - Behoben: wiederverwendete Spring-/Timing-/Offset-Werte wurden in `ANIMATION_PRESETS` zentralisiert

- [x] **QUAL-04**: Fehlende Barrel Exports in shared/components
  - `packages/mobile/src/shared/components/index.ts`
  - Behoben: Animated-, Skeleton-, Icons-, GlobalTabBar-, CustomTabBar- und ThemeSelector-Exporte sind jetzt Teil der Public API

- [x] **QUAL-05**: Inkonsistentes Response-Format im Backend
  - `packages/backend/src/routes/auth.ts`, `packages/backend/src/middleware/jwtAuth.ts`
  - Behoben: Auth-Routen und JWT-Middleware liefern jetzt konsistente `ApiResponse`-Envelopes; der mobile Auth-Store unterstützt die normalisierte Struktur

- [x] **QUAL-06**: Race Condition in deleteItem
  - `packages/backend/src/services/itemService.ts`
  - Behoben: Delete läuft jetzt in einer Prisma-Transaction mit `findUnique` + `delete`, inklusive `P2025`-Fallback für konkurrierende Löschungen

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

- [x] **ARCH-01**: Dependency Injection fehlt im Backend
  - `packages/backend/src/services/itemService.ts`
  - Behoben: `itemService` nutzt jetzt ein `createItemService(prisma)`-Pattern über eine injizierbare Factory; die Default-Prisma-Instanz bleibt für die App bestehen, aber die Kernlogik ist jetzt ohne Prisma-Laufzeit gezielt testbar

- [x] **ARCH-02**: Dependency Injection fehlt im historyStore
  - `packages/mobile/src/features/history/store/historyStore.ts`
  - Behoben: die Zustand-Wiring-Datei nutzt jetzt einen injizierbaren `createHistoryStoreState(...)`-Seam; Cache- und Sync-Nebenwirkungen sind damit ohne Expo-/Backend-Runtime gezielt testbar

- [x] **ARCH-03**: Fehlende Datenbank-Compound-Indexes
  - `packages/backend/prisma/schema.prisma`
  - Behoben: `ScannedItem` nutzt jetzt zusätzlich `@@index([userId, scannedAt])`; die zugehörige Prisma-Migration und ein leichter Schema-Guard-Test sichern den Index für user-gefilterte Timeline-Reads ab

- [x] **ARCH-04**: Kein Request-Logging Middleware
  - `packages/backend/src/app.ts`, `packages/backend/src/middleware/requestLogging.ts`
  - Behoben: zentrale Express-Request-Logs erfassen jetzt Method, Path, Status, Timing und anonymen bzw. JWT-abgeleiteten `userId`; ein Node-Test guardet Log-Format und Middleware-Registrierung

- [x] **ARCH-05**: Health-Check prüft nur Server-Status
  - `packages/backend/src/routes/health.ts`
  - Behoben: `/api/health` prueft jetzt DB-Konnektivitaet, Upload-Verzeichnis-Schreibbarkeit und freien Speicherplatz; degradierte Dependencies liefern 503 und ein detailliertes Check-Ergebnis

- [x] **ARCH-06**: Docker-Compose hardcoded Credentials
  - `packages/backend/docker-compose.yml:6-8`
  - Behoben: Root- und Backend-Compose lesen Postgres- und `DATABASE_URL`-Werte jetzt aus `.env.docker` bzw. `packages/backend/.env`; ein gezielter Node-Test guardet, dass die Compose-Dateien keine DB-Credentials mehr hartkodieren

- [x] **ARCH-07**: Keine API-Dokumentation (OpenAPI/Swagger)
  - `packages/backend/src/routes/apiDocs.ts`, `packages/backend/src/routes/docs.ts`
  - Behoben: `/api/docs/openapi.json` liefert jetzt eine gepflegte OpenAPI-3.1-Spezifikation fuer Auth-, Health-, Image- und Item-Endpunkte; `/api/docs` rendert dazu eine schlanke Swagger-UI-Ansicht, abgesichert durch einen gezielten Node-Test

- [x] **ARCH-08**: Kein Request-ID Tracing für Log-Korrelation
  - `packages/backend/src/app.ts`, `packages/backend/src/middleware/requestId.ts`, `packages/backend/src/middleware/requestLogging.ts`
  - Behoben: zentrale Request-ID-Middleware uebernimmt oder erzeugt jetzt sichere `x-request-id`-Werte, lehnt leere/unsichere/uebergrosse Headerwerte ab, spiegelt die finalen IDs im Response und reichert die bestehenden Request-Logs fuer bessere Korrelation an

### Minor Issues

- [x] **MINOR-01**: `index` als React key in CardSlider
  - `packages/mobile/src/shared/components/CardSlider/CardSlider.tsx:49`
  - Behoben: `CardSlider` nutzt jetzt Child-Keys statt `index` und hat einen kleinen Node-getesteten Helper fuer stabile Fallback-Keys

- [x] **MINOR-02**: `useAsync` Return-Type nicht explizit
  - `packages/mobile/src/shared/hooks/useAsync.ts`
  - Behoben: `useAsync` exportiert jetzt einen expliziten `UseAsyncResult<T, Args>`-Vertrag; ein leichter Node-Guard-Test sichert die Signatur ohne React-Runtime ab

- [x] **MINOR-04**: Preisverteilung künstlich linear
  - `packages/mobile/src/features/market/services/marketAggregator.ts:71-75`
  - Behoben: Aggregation nutzt jetzt reale Plattform-Listings fuer Median/Verteilung und faellt bei fehlenden Listings nur noch kontrolliert auf plattformspezifische Stats zurueck

- [x] **MINOR-05**: Error Stack Traces in Logs
  - `packages/backend/src/middleware/errorHandler.ts:14`
  - Behoben: zentrales Backend-Error-Logging nutzt jetzt eine sanitisierte Log-Zeile mit `requestId`, Error-Namen und redigierter Message statt roher Stack-Traces

---

## Statistik

| Priorität | Anzahl | Status |
|-----------|--------|--------|
| P0 - Critical | 0 | ✅ Alle erledigt |
| P1 - High | 0 | ✅ Alle aktuell erfassten P1-Punkte erledigt |
| P2 - Medium | 8 | Offen |
| P3 - Low | 11 | Offen |
| **Gesamt** | **19** | - |

| Kategorie | Anzahl |
|-----------|--------|
| Security | 0 |
| Bugs | 0 |
| Error Handling | 0 |
| Performance | 0 |
| File Size (>150) | 8 |
| Type Safety | 0 |
| Code-Qualität | 0 |
| Architektur | 8 |
| Minor | 3 |

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
