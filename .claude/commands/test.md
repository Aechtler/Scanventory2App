# Test Workflow

Führt Tests für die ScanApp aus.

## Verwendung
```
/test [type]
```

## Parameter
- `unit` - Nur Unit Tests
- `integration` - Nur Integration Tests
- `e2e` - Nur End-to-End Tests
- `all` - Alle Tests (Standard)
- `watch` - Tests im Watch-Modus

## Schritte

1. **Unit Tests**
   ```bash
   npm test -- --testPathPattern="unit"
   ```

2. **Integration Tests**
   ```bash
   npm test -- --testPathPattern="integration"
   ```

3. **E2E Tests (mit Detox)**
   ```bash
   # iOS
   npx detox test --configuration ios.sim.release

   # Android
   npx detox test --configuration android.emu.release
   ```

4. **Coverage Report**
   ```bash
   npm test -- --coverage
   ```

## Watch-Modus
```bash
npm test -- --watch
```

## Einzelne Datei testen
```bash
npm test -- path/to/test.spec.ts
```

## Voraussetzungen

- Jest konfiguriert
- Für E2E: Detox installiert und konfiguriert
