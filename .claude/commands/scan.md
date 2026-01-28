# Scan Workflow

Projektspezifischer Workflow zum Testen der Scan-Funktionalität.

## Verwendung
```
/scan [mode]
```

## Parameter
- `camera` - Kamera-Scan testen
- `upload` - Bild-Upload testen
- `mock` - Mit Mock-Daten testen

## Test-Szenarien

### 1. Kamera-Scan testen
```bash
# Expo Go auf dem Gerät starten
npx expo start

# Dann auf dem Gerät:
# 1. Kamera-Button drücken
# 2. Objekt fotografieren
# 3. Erkennung prüfen
```

### 2. Bild-Upload testen
```bash
# Test mit Beispielbild
npm run test:scan -- --image ./test-images/sample.jpg
```

### 3. Mock-Modus für Entwicklung
```bash
# Startet App mit gemockter Vision API
MOCK_VISION_API=true npx expo start
```

## Test-Bilder

Empfohlene Test-Kategorien:
- Elektronik (Smartphone, Laptop)
- Sammlerstücke (Münzen, Briefmarken)
- Kleidung (Schuhe, Jacken)
- Möbel (Stühle, Tische)

## Debugging

### Vision API Response loggen
```typescript
// In services/vision.ts
console.log('Vision API Response:', JSON.stringify(response, null, 2));
```

### Marktdaten Response loggen
```typescript
// In services/market.ts
console.log('Market Data:', JSON.stringify(marketData, null, 2));
```

## Performance-Metriken

- Scan-Zeit: < 3 Sekunden
- Erkennung-Genauigkeit: > 80%
- Marktdaten-Abfrage: < 5 Sekunden
