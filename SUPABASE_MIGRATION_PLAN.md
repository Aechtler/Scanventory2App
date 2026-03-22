# Supabase Migration Plan — ScanApp

> Erstellt: 2026-03-22

---

## Was wir gewinnen

| Feature | Aktuell | Nach Supabase |
|---|---|---|
| Datenbank | Self-hosted PostgreSQL | Managed PostgreSQL (Supabase) |
| Auth | Custom JWT + bcrypt | Supabase Auth (OAuth, Magic Link, etc.) |
| Bild-Storage | Lokales Filesystem (`uploads/`) | Supabase Storage (CDN, öffentliche URLs) |
| Realtime | Nicht vorhanden | Supabase Realtime (WebSockets) |
| Row Security | Nur App-Layer | RLS direkt in der DB |
| Infrastruktur | Docker + eigener Server | Vollständig managed |

---

## Übersicht der Phasen

```
Phase 1 → Supabase Projekt Setup
Phase 2 → Datenbank-Migration (Prisma bleibt als ORM)
Phase 3 → Auth-Migration (größter Umbau)
Phase 4 → Storage-Migration (Bilder)
Phase 5 → Row Level Security (RLS)
Phase 6 → Realtime aktivieren (optional)
Phase 7 → Cleanup & Deployment
```

---

## Phase 1: Supabase Projekt aufsetzen

**Was zu tun ist:**

1. Account auf [supabase.com](https://supabase.com) erstellen
2. Neues Projekt anlegen (Region: `eu-central-1` für deutsche Nutzer empfohlen)
3. Folgende Werte aus dem Supabase Dashboard notieren:
   - `Project URL` → `SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (nur Backend!)
   - `Connection string (Prisma)` → `DATABASE_URL`

4. `.env` im Backend anpassen:

```env
# Alt
DATABASE_URL="postgresql://user:password@localhost:5432/scanapp"
JWT_SECRET="..."

# Neu
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

5. `@supabase/supabase-js` installieren:
```bash
cd packages/backend && npm install @supabase/supabase-js
cd packages/mobile && npm install @supabase/supabase-js
```

---

## Phase 2: Datenbank-Migration

**Was bleibt:** Prisma als ORM bleibt vollständig erhalten. Nur die DB-Verbindung wechselt zu Supabase PostgreSQL.

**Was zu ändern ist:**

### `packages/backend/prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // PgBouncer (für Queries)
  directUrl = env("DIRECT_URL")         // Direkte Verbindung (für Migrationen)
}
```

> `directUrl` ist wichtig, weil Prisma Migrationen nicht über PgBouncer laufen können.

### Migration ausführen

```bash
# Alle bisherigen Migrations auf Supabase anwenden
cd packages/backend
npx prisma migrate deploy
```

Supabase erstellt automatisch eine `public` Schema-Ansicht im Dashboard — alle Tabellen sind sofort sichtbar.

---

## Phase 3: Auth-Migration ⚠️ Größter Umbau

**Problem:** Aktuell verwenden wir eigene Passwort-Hashing (`bcrypt`) + JWT-Generierung. Supabase Auth übernimmt beides vollständig.

### Was Supabase Auth bietet (sofort ohne Extra-Arbeit):
- Email/Passwort Login
- Magic Link (passwortlos)
- OAuth (Google, Apple, GitHub, ...)
- Automatische Token-Rotation
- Passwort-Reset-Flow

### 3a — Backend: `authService.ts` ersetzen

**Aktuell:** `registerUser()` / `loginUser()` ruft direkt Prisma auf, hasht Passwort, generiert JWT.

**Neu:** Supabase Admin Client übernimmt Auth. Die `User`-Tabelle in Prisma wird zur **öffentlichen Profil-Tabelle** (kein `password`-Feld mehr nötig).

Neue Datei: `packages/backend/src/services/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service Role für Backend-Operationen
);
```

Geänderter Flow in `authService.ts`:
- `registerUser()` → `supabaseAdmin.auth.admin.createUser({ email, password })`
- `loginUser()` → `supabaseAdmin.auth.signInWithPassword({ email, password })`
- `getUserById()` → `supabaseAdmin.auth.admin.getUserById(userId)`

### 3b — Backend: Auth-Middleware ersetzen

**Aktuell:** `middleware/jwtAuth.ts` verifiziert den Token mit `jwt.verify(token, JWT_SECRET)`.

**Neu:** Supabase JWT-Tokens werden über Supabase verifiziert:
```typescript
// middleware/jwtAuth.ts
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
req.user = { userId: user.id, email: user.email! };
```

> Vorteil: Kein `JWT_SECRET` mehr nötig. Supabase verifiziert gegen seinen eigenen Public Key.

### 3c — Prisma Schema: `password`-Feld entfernen

Das `password`-Feld in der `User`-Tabelle wird überflüssig. Neue Migration:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  // password String  ← ENTFERNT, liegt jetzt in auth.users
  name      String?
  // ... rest bleibt gleich
}
```

### 3d — Supabase Trigger: User-Sync

Wenn sich ein Nutzer via Supabase Auth registriert, muss automatisch ein Eintrag in der `public.User`-Tabelle entstehen. Dafür eine **Supabase Database Function** (im Supabase Dashboard unter SQL Editor):

```sql
-- Funktion: Neuen User in public.User spiegeln
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public."User" (id, email, "createdAt", "updatedAt")
  values (new.id, new.email, now(), now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: Beim neuen Auth-User feuern
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3e — Mobile App: Auth-Feature umbauen

**Aktuell:** Mobile sendet `email`/`password` an `/api/auth/register` und `/api/auth/login`.

**Neu:** Mobile spricht direkt mit Supabase Auth. Das Backend-Passwort-Feld entfällt.

Neuer Supabase Client für Mobile: `packages/mobile/src/shared/services/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

Geänderte `features/auth/services/authService.ts` auf Mobile:
- `login()` → `supabase.auth.signInWithPassword({ email, password })`
- `register()` → `supabase.auth.signUp({ email, password })`
- `logout()` → `supabase.auth.signOut()`
- Token für API-Calls: `(await supabase.auth.getSession()).data.session?.access_token`

Alle bestehenden API-Calls an das Backend behalten den `Authorization: Bearer <token>` Header — nur dass der Token jetzt von Supabase kommt statt vom eigenen Backend.

---

## Phase 4: Storage-Migration (Bilder)

**Problem:** Aktuell speichert `imageService.ts` Bilder auf dem lokalen Filesystem. Das ist nicht skalierbar und geht verloren wenn der Server neugestartet wird.

**Supabase Storage bietet:**
- Direkte öffentliche URLs (kein Backend-Proxy mehr nötig)
- CDN (schnellere Ladezeiten)
- Automatische Größenbeschränkungen
- Bucket-Policies (öffentlich vs. privat)

### 4a — Supabase Storage Bucket anlegen

Im Supabase Dashboard → Storage → New Bucket:
- Name: `item-images`
- Public: **Ja** (Bilder sollen öffentlich abrufbar sein)

### 4b — `imageService.ts` komplett ersetzen

```typescript
// packages/backend/src/services/imageService.ts
import { supabaseAdmin } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/** Bild in Supabase Storage hochladen, gibt Storage-Pfad zurück */
export async function saveImage(file: Express.Multer.File): Promise<string> {
  const ext = getExtension(file.mimetype);
  const filename = `${uuidv4()}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('item-images')
    .upload(filename, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return filename;
}

/** Öffentliche URL für ein Bild generieren */
export function getImageUrl(filename: string): string {
  const { data } = supabaseAdmin.storage
    .from('item-images')
    .getPublicUrl(filename);
  return data.publicUrl;
}

/** Bild löschen */
export async function deleteImage(filename: string): Promise<void> {
  await supabaseAdmin.storage.from('item-images').remove([filename]);
}
```

### 4c — Route `/images/:filename` entfernen

Die Route `GET /api/images/:filename` wird überflüssig, weil Bilder direkt über Supabase Storage URLs erreichbar sind. Diese Route kann gelöscht werden.

### 4d — Mobile App: Bild-URLs anpassen

In der Mobile App werden alle Stellen angepasst, die Bild-URLs aus dem Backend konstruieren (z.B. `${API_URL}/images/${item.imageFilename}`). Diese werden ersetzt durch direkte Supabase Storage URLs.

### 4e — Multer: memory storage statt disk storage

Da Bilder jetzt in Supabase hochgeladen werden, brauchen wir kein `diskStorage` mehr:
```typescript
// Multer auf memoryStorage umstellen
const upload = multer({ storage: multer.memoryStorage() });
```

---

## Phase 5: Row Level Security (RLS)

Supabase empfiehlt RLS für alle Tabellen. Das stellt sicher, dass auch direkte DB-Zugriffe (z.B. über Supabase Studio) datenschutzkonform sind.

**Wichtig:** Das Backend nutzt den `service_role`-Key, der RLS bypassed. RLS gilt primär für direkte Client-Zugriffe (z.B. wenn die Mobile App irgendwann direkt Supabase fragt statt über das Backend).

Mindest-Policies im SQL Editor einrichten:

```sql
-- ScannedItem: User sieht nur eigene Items
alter table "ScannedItem" enable row level security;

create policy "Users see own items"
  on "ScannedItem" for select
  using (auth.uid()::text = "userId");

create policy "Users insert own items"
  on "ScannedItem" for insert
  with check (auth.uid()::text = "userId");

create policy "Users update own items"
  on "ScannedItem" for update
  using (auth.uid()::text = "userId");

create policy "Users delete own items"
  on "ScannedItem" for delete
  using (auth.uid()::text = "userId");

-- User-Profil: Öffentliche Profile lesbar
alter table "User" enable row level security;

create policy "Public profiles are viewable"
  on "User" for select
  using (("isPublic" = true) or (auth.uid()::text = id));

create policy "Users update own profile"
  on "User" for update
  using (auth.uid()::text = id);
```

---

## Phase 6: Realtime aktivieren (optional, aber wertvoll)

Die Datenbank hat bereits `Conversation` und `Message` Modelle — diese werden aber laut Analyse noch nicht befüllt. Supabase Realtime kann hier sofort genutzt werden.

### Neue Möglichkeiten:

**Live-Updates für gescannte Items:**
```typescript
// Mobile: Realtime subscription
supabase
  .channel('items')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'ScannedItem',
    filter: `userId=eq.${userId}`
  }, (payload) => {
    // Zustand aktualisieren
  })
  .subscribe();
```

**Messaging (setzt Phase 3 voraus):**
Sobald Auth migriert ist, kann Realtime für live Messaging genutzt werden — die DB-Tabellen sind bereits vorhanden.

**Einschalten im Supabase Dashboard:**
Database → Replication → `ScannedItem`, `Message` und `Conversation` Tables aktivieren.

---

## Phase 7: Cleanup & Deployment

Nachdem alle Phasen abgeschlossen sind:

### Dependencies entfernen:
```bash
cd packages/backend
npm uninstall bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### Dateien löschen:
- `packages/backend/src/routes/images.ts` (nicht mehr benötigt)
- Lokales `uploads/`-Verzeichnis
- `config.uploadDir` aus Konfiguration entfernen

### Docker Compose anpassen:
- `db`-Service (PostgreSQL Container) entfernen
- Volume `uploads:/app/uploads` entfernen
- ENV-Variablen auf Supabase-Werte aktualisieren

### Expo / Mobile ENV:
```env
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Zusammenfassung: Was alles geändert werden muss

### Backend (`packages/backend`)

| Datei | Aktion |
|---|---|
| `prisma/schema.prisma` | `directUrl` hinzufügen, `password`-Feld aus `User` entfernen |
| `src/services/supabaseClient.ts` | **Neu** — Supabase Admin Client |
| `src/services/authService.ts` | Komplett ersetzen (Supabase Auth statt bcrypt/JWT) |
| `src/services/imageService.ts` | Komplett ersetzen (Supabase Storage statt Filesystem) |
| `src/middleware/jwtAuth.ts` | Token-Verifikation auf Supabase umstellen |
| `src/middleware/auth.ts` | Anpassen |
| `src/routes/images.ts` | Löschen |
| `src/routes/index.ts` | Image-Route entfernen |
| `src/config/index.ts` | `uploadDir` entfernen, Supabase-Vars hinzufügen |
| `.env` | Neue Variablen |

### Mobile (`packages/mobile`)

| Datei | Aktion |
|---|---|
| `src/shared/services/supabaseClient.ts` | **Neu** — Supabase Client |
| `src/features/auth/services/authService.ts` | Supabase Auth verwenden |
| `src/features/auth/hooks/useAuth.ts` | Anpassen |
| `src/shared/services/apiClient.ts` | Token-Source auf Supabase ändern |
| Alle Stellen mit Bild-URLs | `${API_URL}/images/...` → Supabase Storage URL |

### Supabase Dashboard (einmalig)

| Aufgabe | Wo |
|---|---|
| Storage Bucket `item-images` anlegen | Storage |
| Database Trigger für User-Sync | SQL Editor |
| RLS Policies einrichten | SQL Editor |
| Realtime für Tabellen aktivieren | Database → Replication |

---

## Empfohlene Reihenfolge

```
1. Phase 1 (Setup) — 30 min
2. Phase 2 (DB) — 1 Stunde  ← Risikoarm, Prisma bleibt
3. Phase 4 (Storage) — 2 Stunden  ← Unabhängig von Auth
4. Phase 3 (Auth) — 4-6 Stunden  ← Größter Umbau
5. Phase 5 (RLS) — 1 Stunde
6. Phase 7 (Cleanup) — 1 Stunde
7. Phase 6 (Realtime) — nach Bedarf
```

> **Tipp:** Phase 2 und Phase 4 können parallel zur aktuellen Auth laufen. Erst wenn Storage und DB funktionieren, Phase 3 (Auth) angehen — das ist der kritische Pfad.
