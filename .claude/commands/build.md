# Build Workflow

Baut die ScanApp für die gewählte Plattform.

## Verwendung
```
/build [platform]
```

## Parameter
- `ios` - Baut für iOS (benötigt macOS)
- `android` - Baut für Android
- `all` - Baut für beide Plattformen

## Schritte

1. **Abhängigkeiten prüfen**
   ```bash
   npm install
   ```

2. **TypeScript prüfen**
   ```bash
   npm run typecheck
   ```

3. **Lint ausführen**
   ```bash
   npm run lint
   ```

4. **Build starten**
   - iOS: `npx expo run:ios --configuration Release`
   - Android: `npx expo run:android --variant release`

5. **EAS Build (für Store-Releases)**
   ```bash
   # iOS
   eas build --platform ios --profile production

   # Android
   eas build --platform android --profile production
   ```

## Voraussetzungen

- Node.js >= 18
- Expo CLI installiert
- Für iOS: Xcode und macOS
- Für Android: Android Studio und Java JDK
- EAS CLI für Store-Builds: `npm install -g eas-cli`
