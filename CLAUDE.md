# ScanApp - Projekt-Regeln für Claude Code

## Projektübersicht

ScanApp ist eine mobile Anwendung zur automatischen Erkennung von Gegenständen und Analyse deren aktuellen Marktwerts auf dem deutschen Markt (eBay, Kleinanzeigen, Amazon, Idealo).

---

## KRITISCHE ENTWICKLUNGSREGELN

> Diese Regeln MÜSSEN bei JEDEM Entwicklungsschritt eingehalten werden.

### 1. Modularer Aufbau (Single Responsibility)

- **Eine Datei = Eine Verantwortung**
  - Komponenten nur für UI-Darstellung
  - Hooks nur für Logik/State
  - Services nur für externe Kommunikation
  - Utils nur für reine Funktionen

- **Maximale Dateigröße: 150 Zeilen**
  - Wird eine Datei größer → aufteilen
  - Ausnahme: Type-Definitionen

- **Keine God-Components**
  - Komponenten die alles können → aufteilen
  - Jede Komponente max. 1 Hauptaufgabe

### 2. Skalierbarkeit durch Feature-Module

```
/features
  /scan                    # Scan-Feature
    /components            # Nur Scan-spezifische Komponenten
    /hooks                 # Nur Scan-spezifische Hooks
    /services              # Nur Scan-spezifische API-Calls
    /types                 # Nur Scan-spezifische Types
    index.ts               # Public API des Features
  /market                  # Markt-Feature
    /components
    /hooks
    /services
    /types
    index.ts
  /history                 # Verlauf-Feature
    ...
```

- **Feature-Isolation:** Features kennen sich nicht gegenseitig
- **Shared Code:** Nur in `/shared` oder `/common`
- **Public API:** Jedes Feature exportiert nur das Nötige via `index.ts`

### 3. Saubere Ordnerstruktur

```
/src
  /app                     # Expo Router (nur Routing, keine Logik!)
  /features                # Feature-Module (Hauptlogik)
  /shared                  # Geteilter Code zwischen Features
    /components            # Basis-UI-Komponenten (Button, Input, Card)
    /hooks                 # Geteilte Hooks (useAsync, useDebounce)
    /services              # Geteilte Services (api-client, storage)
    /utils                 # Reine Hilfsfunktionen
    /types                 # Geteilte TypeScript Types
    /constants             # App-weite Konstanten
    /config                # Konfiguration
  /assets                  # Bilder, Fonts, etc.
```

### 4. Import-Regeln

```typescript
// RICHTIG - Absolute Imports mit Alias
import { Button } from '@/shared/components';
import { useScan } from '@/features/scan';

// FALSCH - Relative Imports über Feature-Grenzen
import { Button } from '../../../shared/components/Button';
```

- **Barrel Exports** für jeden Ordner (`index.ts`)
- **Keine zirkulären Imports**
- **Import-Reihenfolge:** React → External → Internal → Types → Styles

### 5. Komponenten-Patterns

```typescript
// RICHTIG - Kleine, fokussierte Komponente
export function PriceDisplay({ price, currency = 'EUR' }: PriceDisplayProps) {
  const formatted = formatPrice(price, currency);
  return <Text style={styles.price}>{formatted}</Text>;
}

// FALSCH - Komponente mit zu viel Logik
export function PriceDisplay({ itemId }) {
  const [price, setPrice] = useState(null);
  useEffect(() => {
    fetch(`/api/prices/${itemId}`).then(...)  // API-Call gehört in Hook!
  }, []);
  // ... 100 Zeilen mehr
}
```

**Komponentenstruktur:**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Komponente
// 4. Styles (oder separate Datei)
// 5. Sub-Komponenten (oder separate Datei)
```

### 6. Hook-Patterns

```typescript
// RICHTIG - Hook für eine spezifische Aufgabe
export function useMarketPrice(itemId: string) {
  const [data, setData] = useState<MarketPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ... Logik

  return { data, loading, error, refetch };
}

// FALSCH - God-Hook
export function useEverything() {
  // Scan-Logik + Market-Logik + History-Logik + ...
}
```

### 7. Service-Layer Pattern

```typescript
// /features/market/services/marketService.ts
class MarketService {
  async getPrice(query: string): Promise<MarketPrice> { ... }
  async getPriceHistory(itemId: string): Promise<PriceHistory[]> { ... }
}

export const marketService = new MarketService();

// ODER funktional:
export const marketService = {
  getPrice: async (query: string): Promise<MarketPrice> => { ... },
  getPriceHistory: async (itemId: string): Promise<PriceHistory[]> => { ... },
};
```

### 8. Type-Safety

```typescript
// IMMER explizite Types
interface ScanResult {
  id: string;
  confidence: number;
  label: string;
  boundingBox?: BoundingBox;
}

// KEINE any oder unknown ohne Validierung
function processResult(result: ScanResult) { ... }  // RICHTIG
function processResult(result: any) { ... }         // FALSCH
```

### 9. Error Handling

```typescript
// Zentrale Error-Types
type AppError =
  | { type: 'NETWORK'; message: string }
  | { type: 'VALIDATION'; field: string; message: string }
  | { type: 'API'; code: number; message: string };

// Result-Pattern für kritische Operationen
type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### 10. Dependency Injection für Testbarkeit

```typescript
// RICHTIG - Dependencies als Parameter
export function createMarketService(apiClient: ApiClient) {
  return {
    getPrice: (query: string) => apiClient.get(`/prices?q=${query}`),
  };
}

// In der App
const marketService = createMarketService(realApiClient);

// In Tests
const marketService = createMarketService(mockApiClient);
```

---

## Checkliste bei JEDEM Code-Schritt

Bevor Code geschrieben wird, prüfen:

- [ ] Gehört dieser Code in ein bestehendes Feature oder braucht es ein neues?
- [ ] Ist die Datei < 150 Zeilen?
- [ ] Hat die Komponente/Funktion nur EINE Verantwortung?
- [ ] Sind alle Types explizit definiert?
- [ ] Werden Imports über `@/` Alias gemacht?
- [ ] Ist der Code testbar (Dependencies injizierbar)?
- [ ] Gibt es Error Handling?

---

## Tech-Stack

### Frontend (Native Mobile App - iOS & Android)
- **Framework:** React Native mit Expo (Managed Workflow)
- **Sprache:** TypeScript (strict mode)
- **Styling:** NativeWind (Tailwind für React Native)
- **State Management:** Zustand (leichtgewichtig, einfach)
- **Navigation:** Expo Router (File-based)
- **Kamera:** expo-camera
- **Bildauswahl:** expo-image-picker
- **Lokaler Storage:** expo-secure-store / AsyncStorage

> **Hinweis:** Kein Web-Support. Fokus auf beste native UX für iOS und Android.

### Backend
- **Framework:** Node.js mit Express oder Python mit FastAPI
- **Datenbank:** PostgreSQL
- **ORM:** Prisma (Node.js) oder SQLAlchemy (Python)

### Externe Services
- **Bilderkennung:** OpenAI Vision API oder Google Cloud Vision
- **Marktdaten:** eBay API, Web-Scraping für andere Plattformen

## Code-Konventionen

### Allgemein
- TypeScript strict mode aktiviert
- ESLint und Prettier für Code-Formatierung
- Functional Components mit React Hooks
- Keine Class Components

### Dateistruktur (Feature-basiert)
```
/src
  /app                     # Expo Router (NUR Routing!)
    _layout.tsx            # Root Layout
    index.tsx              # Home Screen
    /scan                  # Scan Screens
    /history               # History Screens

  /features                # Feature-Module
    /scan                  # Scan-Feature
      /components          # ScanCamera, ScanResult, etc.
      /hooks               # useScan, useImagePicker
      /services            # visionService
      /types               # ScanResult, Recognition
      index.ts             # Public exports
    /market                # Market-Feature
      /components          # PriceCard, MarketChart
      /hooks               # useMarketPrice
      /services            # ebayService, amazonService
      /types               # MarketPrice, PriceHistory
      index.ts
    /history               # History-Feature
      /components          # HistoryList, HistoryItem
      /hooks               # useHistory
      /services            # storageService
      /types               # HistoryEntry
      index.ts

  /shared                  # Geteilter Code
    /components            # Button, Card, Input, Modal
    /hooks                 # useAsync, useDebounce
    /services              # apiClient, localStorage
    /utils                 # formatPrice, formatDate
    /types                 # ApiResponse, AppError
    /constants             # API_URL, COLORS
    /config                # app.config.ts

  /assets                  # Statische Assets
    /images
    /fonts
```

### Namenskonventionen
- **Komponenten:** PascalCase (`ScanButton.tsx`)
- **Hooks:** camelCase mit `use` Prefix (`useMarketData.ts`)
- **Utilities:** camelCase (`formatPrice.ts`)
- **Types/Interfaces:** PascalCase mit `I` oder `T` Prefix optional

### Kommentare
- Deutsche Kommentare sind erlaubt
- JSDoc für öffentliche Funktionen
- TODO-Kommentare mit Ticket-Referenz wenn vorhanden

## Wichtige Befehle

```bash
# Entwicklung starten
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Tests ausführen
npm test

# Linting
npm run lint

# Type-Check
npm run typecheck
```

## Projektspezifische Regeln

### Bilderkennung
- Bilder vor dem Upload komprimieren (max 1MB)
- Immer mehrere Erkennungs-Kandidaten anzeigen
- Nutzer-Feedback zur Verbesserung speichern

### Marktanalyse
- Preise immer in EUR anzeigen
- Durchschnitt, Min, Max und Median berechnen
- Verkaufte Artikel bevorzugen (realistischer Marktwert)
- API-Rate-Limits beachten

### Datenschutz
- Keine Bilder ohne Zustimmung in die Cloud hochladen
- Scan-Verlauf lokal speichern
- DSGVO-konform entwickeln

## Testing

- Unit Tests für Utilities und Hooks
- Integration Tests für API-Calls
- E2E Tests für kritische User Flows (Scan, Analyse, Verlauf)

## Git Workflow

- Feature Branches: `feature/beschreibung`
- Bugfix Branches: `fix/beschreibung`
- Commit Messages auf Deutsch oder Englisch
- Pull Requests für alle Änderungen
