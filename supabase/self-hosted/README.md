# Supabase Self-Hosted Setup für ScanApp

## Voraussetzungen
- Docker + Docker Compose installiert
- Mindestens 2GB freier RAM
- Port 8000 (API), 54323 (Studio) frei

---

## Erster Start

```bash
cd supabase/self-hosted

# 1. Stack starten
docker compose --env-file .env up -d

# 2. Warten bis alle Services healthy sind (~60 Sekunden)
docker compose ps

# 3. Migrationen ausführen (Schema + RLS + Trigger)
cd ../../packages/backend
npx prisma migrate deploy

# 4. Seed (Storage Bucket erstellen)
# Im Supabase Studio → SQL Editor → seed.sql einfügen
# ODER: psql direkt:
# psql "postgresql://postgres:DEIN_PW@localhost:5432/postgres" -f ../supabase/seed.sql
```

## URLs nach Start

| Service | URL |
|---|---|
| **API Gateway** | http://localhost:8000 |
| **Studio Dashboard** | http://localhost:54323 |
| **Email (Inbucket)** | http://localhost:54324 |
| **PostgreSQL** | localhost:5432 |

Studio Login: `admin` / (Passwort aus `.env` → `DASHBOARD_PASSWORD`)

---

## Backend verbinden

Die `.env` in `packages/backend/` ist bereits vorbefüllt.
Backend starten:

```bash
cd packages/backend
npm run dev
```

---

## Produktiv-Deployment (eigener Server)

1. `.env` anpassen:
   - `SITE_URL` → deine App-Domain (z.B. `https://app.deine-domain.de`)
   - `API_EXTERNAL_URL` → `https://supabase.deine-domain.de`

2. Nginx/Traefik als Reverse Proxy vor Kong (Port 8000) stellen

3. SSL-Zertifikat (Let's Encrypt) für deine Domain einrichten

4. `ENABLE_EMAIL_AUTOCONFIRM=false` + echten SMTP eintragen wenn Email-Verify gewünscht

---

## Nützliche Befehle

```bash
# Logs ansehen
docker compose logs -f auth
docker compose logs -f storage

# Stoppen
docker compose down

# Komplett zurücksetzen (ALLE Daten löschen!)
docker compose down -v

# Status
docker compose ps
```
