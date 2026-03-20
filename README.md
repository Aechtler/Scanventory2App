# ScanApp

Mobile Inventar-App mit Barcode-Scanner und Marktpreisanalyse.

## 🏗️ Struktur

```
ScanApp/
├── packages/
│   ├── mobile/      # React Native App (Expo)
│   └── backend/     # Express API + PostgreSQL
└── package.json     # Monorepo Workspace
```

## 🚀 Schnellstart

```bash
# Dependencies installieren
npm install
npm run setup:workspace

# Prisma Client generieren
cd packages/backend && npx prisma generate && cd ../..

# Backend + Datenbank starten
npm run docker:up

# Mobile App starten (anderes Terminal)
npm run dev:mobile
```

## 📦 Installation

### Voraussetzungen

- Node.js >= 18
- npm >= 9
- Docker & Docker Compose

### Setup

```bash
# Repository klonen
git clone <repository-url>
cd ScanApp

# Alle Dependencies installieren
npm install
npm run setup:workspace

# Prisma Client generieren
cd packages/backend
npx prisma generate
cd ../..

# Environment Variablen (optional)
cp .env.docker.example .env
```

## � Entwicklung

### Backend + Datenbank

```bash
# Starten
npm run docker:up

# Logs ansehen
npm run docker:logs

# Stoppen
npm run docker:down
```

**URLs:**
- API: http://localhost:3000
- API-Doku: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs/openapi.json
- PostgreSQL: localhost:5432

### Mobile App

```bash
# Dev Server starten
npm run dev:mobile

# Auf Android
npm run android --workspace=@scanapp/mobile

# Auf iOS
npm run ios --workspace=@scanapp/mobile
```

## 🗄️ Datenbank

```bash
# Migrationen ausführen
npm run db:migrate

# Prisma Studio öffnen
npm run db:studio

# DB seeden
npm run db:seed
```

## 📝 Wichtige Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `npm run docker:up` | Backend + DB starten |
| `npm run docker:down` | Backend + DB stoppen |
| `npm run docker:logs` | Logs ansehen |
| `npm run dev:mobile` | Mobile App starten |
| `npm run build:backend` | Backend-Build erst nach `setup:workspace`-Guard ausfuehren, sonst mit konkreten Toolchain-Blockern abbrechen |
| `npm run build:all` | Alles bauen |
| `npm run setup:workspace` | Lokale Lint-/Typecheck-Toolchain pruefen und fehlende/hohle Cache-Pakete inkl. naechster Wiederherstellungsschritte explizit melden |
| `npm run lint:mobile` | Mobile Quelltexte erst nach `setup:workspace`-Guard linten, damit fehlende Toolchain-Pakete vor rohen `typescript`-Importfehlern sichtbar werden |
| `npm run typecheck:mobile` | Mobile TypeScript-Pruefung erst nach `setup:workspace`-Guard ausfuehren, sonst mit konkreten Toolchain-Blockern abbrechen |
| `npm run typecheck:backend` | Backend-TypeScript-Pruefung erst nach `setup:workspace`-Guard ausfuehren, sonst mit konkreten Toolchain-Blockern abbrechen |
| `npm run typecheck:all` | Fuehrt die mobilen und Backend-Typechecks jetzt nacheinander ueber den jeweiligen `setup:workspace`-Guard aus, damit fehlende Toolchain-Pakete pro Workspace klar gemeldet werden |

## 🛠️ Tech Stack

**Mobile App:**
- React Native + Expo
- NativeWind (Tailwind)
- Zustand
- Expo Router

**Backend:**
- Express.js
- Prisma ORM
- PostgreSQL
- Docker

## � Environment Variablen

### Mobile (`packages/mobile/.env`)
```env
API_URL=http://localhost:3000
```

### Docker Compose (`.env.docker`)
```env
POSTGRES_USER=scanapp
POSTGRES_PASSWORD=change-me-in-local-env
POSTGRES_DB=scanapp
DATABASE_URL=postgresql://scanapp:change-me-in-local-env@db:5432/scanapp
API_KEY=change-me-to-a-secure-key
```

Compose liest diese Werte aus `.env.docker`. Starte daher mit:
```bash
cp .env.docker.example .env.docker
```

### Backend (`packages/backend/.env`)
```env
POSTGRES_USER=scanapp
POSTGRES_PASSWORD=change-me-in-local-env
POSTGRES_DB=scanapp
DATABASE_URL=postgresql://scanapp:change-me-in-local-env@db:5432/scanapp
PORT=3000
API_KEY=your-secret-key
UPLOAD_DIR=/app/uploads
```

## 🔧 Troubleshooting

**Prisma Client Fehler:**
```bash
cd packages/backend
npx prisma generate
```

**Port bereits belegt:**
```bash
# Container stoppen
npm run docker:down

# Oder alle Container anzeigen
docker ps
```

**Node Modules Probleme:**
```bash
npm run clean
SCANAPP_ALLOW_NETWORK_INSTALL=1 npm run setup:workspace
# Fallback:
npm install
npm run setup:workspace
```

Wenn `npm run setup:workspace` fehlschlaegt, listet der Befehl jetzt die konkret betroffenen Pakete, ihre direkten Workspace-Owner und zusaetzliche hohle transitive Installationen getrennt auf. In einer eingeschraenkten Offline-Umgebung muss der fehlende npm-Cache zuerst wiederhergestellt oder einmal mit Netzwerkzugriff der bevorzugte Guard-Lauf `SCANAPP_ALLOW_NETWORK_INSTALL=1 npm run setup:workspace` ausgefuehrt werden.
Falls der Guard-Lauf selbst nicht moeglich ist, bleibt `npm install` der Fallback; danach sollte erneut `npm run setup:workspace` laufen.
Fehlt die Root-`package-lock.json` oder ist sie defekt, meldet der Setup-Befehl das jetzt ebenfalls explizit und fordert zur Wiederherstellung bzw. Regenerierung der Lockfile auf, bevor weitere Offline-Restore-Schritte sinnvoll sind.
Die Root-Befehle `npm run lint:mobile`, `npm run typecheck:mobile`, `npm run typecheck:backend` und `npm run typecheck:all` laufen jetzt ebenfalls zuerst durch diesen Guard, damit fehlende Expo-/Backend-Pakete nicht mehr nur als rohe `typescript`-/`tsc`-Importfehler auftauchen.
`npm run build:backend` nutzt jetzt denselben Guard, damit ein fehlendes lokales `typescript`-Binary im eingeschraenkten Workspace nicht mehr als unklare `Cannot find module .../tsc`-Fehlermeldung endet.

---

Weitere Details in [QUICKSTART.md](QUICKSTART.md)
