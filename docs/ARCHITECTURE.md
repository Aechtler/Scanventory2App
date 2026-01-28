# ScanApp - Architektur & Best Practices

## Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    /src/app (Expo Router)                │    │
│  │         Nur Routing & Screen-Komposition                 │    │
│  │         KEINE Geschäftslogik hier!                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FEATURE LAYER                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │    /scan      │  │   /market     │  │   /history    │        │
│  │  ┌─────────┐  │  │  ┌─────────┐  │  │  ┌─────────┐  │        │
│  │  │components│  │  │  │components│  │  │  │components│  │        │
│  │  │  hooks   │  │  │  │  hooks   │  │  │  │  hooks   │  │        │
│  │  │ services │  │  │  │ services │  │  │  │ services │  │        │
│  │  │  types   │  │  │  │  types   │  │  │  │  types   │  │        │
│  │  └─────────┘  │  │  └─────────┘  │  │  └─────────┘  │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             │                                    │
│                    NUR über /shared                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SHARED LAYER                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │components│ │  hooks   │ │ services │ │  utils   │           │
│  │ (UI-Lib) │ │(generisch)│ │(api,store)│ │ (pure)  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Vision API│ │ eBay API │ │Amazon API│ │  Storage │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dependency Rules (Clean Architecture)

```
                    DARF IMPORTIEREN
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌────────┐         ┌────────────┐         ┌─────────┐
│  App   │ ──────► │  Features  │ ──────► │ Shared  │
│(Screens)│         │            │         │         │
└────────┘         └────────────┘         └─────────┘
    │                     │                     │
    │                     │                     │
    │    ┌────────────────┘                     │
    │    │                                      │
    │    │         DARF NICHT IMPORTIEREN       │
    │    │              ◄───────────────────────┘
    │    │
    ▼    ▼
Features dürfen NICHT andere Features importieren!
Nur über Shared-Layer kommunizieren.
```

---

## Feature-Modul Aufbau

```
/features/scan/
│
├── components/              # UI-Komponenten des Features
│   ├── ScanCamera.tsx       # Kamera-Ansicht
│   ├── ScanButton.tsx       # Auslöser
│   ├── ScanPreview.tsx      # Vorschau des Bildes
│   ├── ResultCard.tsx       # Einzelnes Ergebnis
│   └── ResultList.tsx       # Liste der Ergebnisse
│
├── hooks/                   # Feature-spezifische Hooks
│   ├── useScan.ts           # Haupt-Hook für Scan-Logik
│   ├── useImagePicker.ts    # Bildauswahl
│   └── useRecognition.ts    # KI-Erkennung
│
├── services/                # API-Kommunikation
│   ├── visionService.ts     # Vision API Calls
│   └── imageService.ts      # Bildverarbeitung
│
├── types/                   # TypeScript Definitionen
│   ├── scan.types.ts        # ScanResult, Recognition
│   └── index.ts             # Re-exports
│
├── utils/                   # Feature-spezifische Hilfsfunktionen
│   └── imageUtils.ts        # Komprimierung, Resize
│
└── index.ts                 # PUBLIC API
    │
    │   // Nur das exportieren, was andere brauchen!
    │   export { ScanCamera } from './components/ScanCamera';
    │   export { useScan } from './hooks/useScan';
    │   export type { ScanResult } from './types';
```

---

## Komponenten-Hierarchie

```
┌─────────────────────────────────────────────────────┐
│                    SCREEN (in /app)                  │
│                                                      │
│   Verantwortung:                                     │
│   - Layout zusammenstellen                           │
│   - Feature-Komponenten einbinden                    │
│   - Navigation                                       │
│                                                      │
│   KEINE Geschäftslogik!                              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              FEATURE COMPONENT (Smart)               │
│                                                      │
│   Verantwortung:                                     │
│   - Hooks verwenden                                  │
│   - State verwalten                                  │
│   - Events an Services weiterleiten                  │
│   - Shared Components zusammenstellen                │
│                                                      │
│   Beispiel: <ScanCamera />                           │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              SHARED COMPONENT (Dumb/Pure)            │
│                                                      │
│   Verantwortung:                                     │
│   - NUR Darstellung                                  │
│   - Props rein, Events raus                          │
│   - Kein eigener State (außer UI-State)              │
│   - Wiederverwendbar                                 │
│                                                      │
│   Beispiel: <Button />, <Card />, <Input />          │
└─────────────────────────────────────────────────────┘
```

---

## Datenfluss

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│   User   │      │    UI    │      │   Hook   │      │ Service  │
│  Action  │ ───► │Component │ ───► │  Logic   │ ───► │   API    │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
                                                            │
                                                            ▼
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│    UI    │      │  State   │      │   Hook   │      │ External │
│  Update  │ ◄─── │  Update  │ ◄─── │ Process  │ ◄─── │   API    │
└──────────┘      └──────────┘      └──────────┘      └──────────┘

Beispiel Scan-Flow:
1. User drückt "Scan" Button
2. ScanCamera Component ruft useScan().capture() auf
3. useScan Hook ruft visionService.analyze(image) auf
4. visionService sendet Request an Vision API
5. Response kommt zurück
6. Hook verarbeitet und updated State
7. Component rendert Ergebnisse
```

---

## Naming Conventions

### Dateien
```
components/
  ScanButton.tsx          # PascalCase für Komponenten
  ScanButton.styles.ts    # Styles separat
  ScanButton.test.tsx     # Tests mit .test suffix

hooks/
  useScan.ts              # camelCase mit use-Prefix
  useScan.test.ts

services/
  visionService.ts        # camelCase mit Service-Suffix
  vision.service.ts       # Alternative: Punkt-Notation

types/
  scan.types.ts           # lowercase mit .types suffix
  index.ts                # Re-exports

utils/
  formatPrice.ts          # camelCase, beschreibend
  formatPrice.test.ts
```

### Code
```typescript
// Interfaces - PascalCase, optional mit I-Prefix
interface ScanResult { }
interface IScanResult { }  // Alternative

// Types - PascalCase
type MarketPlatform = 'ebay' | 'amazon';

// Constants - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 1024 * 1024;

// Functions - camelCase, Verb als Präfix
function calculateAveragePrice() { }
function formatCurrency() { }
function validateInput() { }

// Boolean - is/has/can/should Präfix
const isLoading = true;
const hasError = false;
const canSubmit = true;
```

---

## Beispiel: Neues Feature hinzufügen

### Schritt 1: Feature-Ordner erstellen
```bash
mkdir -p src/features/newFeature/{components,hooks,services,types}
touch src/features/newFeature/index.ts
```

### Schritt 2: Types definieren
```typescript
// src/features/newFeature/types/newFeature.types.ts
export interface NewFeatureData {
  id: string;
  name: string;
}

export interface NewFeatureState {
  data: NewFeatureData | null;
  loading: boolean;
  error: Error | null;
}
```

### Schritt 3: Service erstellen
```typescript
// src/features/newFeature/services/newFeatureService.ts
import { apiClient } from '@/shared/services';
import type { NewFeatureData } from '../types';

export const newFeatureService = {
  async fetch(id: string): Promise<NewFeatureData> {
    return apiClient.get(`/new-feature/${id}`);
  },
};
```

### Schritt 4: Hook erstellen
```typescript
// src/features/newFeature/hooks/useNewFeature.ts
import { useState, useCallback } from 'react';
import { newFeatureService } from '../services/newFeatureService';
import type { NewFeatureState } from '../types';

export function useNewFeature() {
  const [state, setState] = useState<NewFeatureState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (id: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await newFeatureService.fetch(id);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(s => ({ ...s, loading: false, error: error as Error }));
    }
  }, []);

  return { ...state, fetch };
}
```

### Schritt 5: Komponente erstellen
```typescript
// src/features/newFeature/components/NewFeatureView.tsx
import { View, Text } from 'react-native';
import { useNewFeature } from '../hooks/useNewFeature';
import { Button, LoadingSpinner } from '@/shared/components';

export function NewFeatureView() {
  const { data, loading, error, fetch } = useNewFeature();

  if (loading) return <LoadingSpinner />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>{data?.name}</Text>
      <Button onPress={() => fetch('123')}>Laden</Button>
    </View>
  );
}
```

### Schritt 6: Public API exportieren
```typescript
// src/features/newFeature/index.ts
export { NewFeatureView } from './components/NewFeatureView';
export { useNewFeature } from './hooks/useNewFeature';
export type { NewFeatureData, NewFeatureState } from './types';
```

### Schritt 7: In Screen verwenden
```typescript
// src/app/new-feature.tsx
import { NewFeatureView } from '@/features/newFeature';

export default function NewFeatureScreen() {
  return <NewFeatureView />;
}
```

---

## Anti-Patterns (NICHT machen!)

### ❌ God Component
```typescript
// FALSCH - Komponente macht alles
function ScanScreen() {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // API Call direkt in Komponente
  async function analyze() {
    setLoading(true);
    const response = await fetch('/api/vision', {
      method: 'POST',
      body: image,
    });
    setResults(await response.json());
    setLoading(false);
  }

  // 200+ Zeilen UI-Code...
}
```

### ✅ Richtig aufgeteilt
```typescript
// Screen nur für Komposition
function ScanScreen() {
  return (
    <View>
      <ScanCamera />
      <ScanResults />
    </View>
  );
}

// Logik in Hook
function useScan() { ... }

// API in Service
const visionService = { ... }
```

### ❌ Feature importiert anderes Feature
```typescript
// FALSCH
import { useHistory } from '@/features/history';

function ScanResults() {
  const { addToHistory } = useHistory(); // Direkte Abhängigkeit!
}
```

### ✅ Über Shared kommunizieren
```typescript
// RICHTIG - Event-basiert oder über Store
import { eventBus } from '@/shared/services';

function ScanResults() {
  function onScanComplete(result) {
    eventBus.emit('scan:complete', result);
  }
}

// History Feature reagiert auf Event
eventBus.on('scan:complete', (result) => {
  historyService.add(result);
});
```
