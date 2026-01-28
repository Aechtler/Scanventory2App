# Deploy Workflow

Deployed die ScanApp zu verschiedenen Umgebungen.

## Verwendung
```
/deploy [environment]
```

## Parameter
- `dev` - Development/Preview Build
- `staging` - Staging Umgebung
- `production` - Production Release

## Schritte

### 1. Development Build (OTA Update)
```bash
# Expo Updates für schnelle Iteration
npx expo publish --release-channel dev
```

### 2. Staging Build
```bash
# EAS Build für Tester
eas build --platform all --profile preview

# Update verteilen
eas update --branch staging --message "Staging Release"
```

### 3. Production Release

#### iOS (App Store)
```bash
# Build erstellen
eas build --platform ios --profile production

# Zum App Store submitten
eas submit --platform ios --latest
```

#### Android (Play Store)
```bash
# Build erstellen
eas build --platform android --profile production

# Zum Play Store submitten
eas submit --platform android --latest
```

### 4. Backend Deploy (falls vorhanden)
```bash
# Je nach Hosting
# Vercel
vercel --prod

# Railway
railway up

# Docker
docker build -t scanapp-backend .
docker push scanapp-backend
```

## EAS Profile Konfiguration (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## Checkliste vor Production Release

- [ ] Alle Tests bestanden
- [ ] Lint ohne Fehler
- [ ] Version in app.json erhöht
- [ ] Changelog aktualisiert
- [ ] Screenshots aktuell (App Store)
- [ ] Release Notes geschrieben
