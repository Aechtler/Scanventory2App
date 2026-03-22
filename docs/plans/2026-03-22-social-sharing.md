# Feature-Plan: Social Layer & Library Sharing

**Datum:** 2026-03-22
**Status:** Entwurf v2 — simpel & erweiterbar
**Ziel:** Instagram-artiges Social-System — User folgen, Bibliothek teilen, Gruppen

---

## Leitprinzip

> **Jetzt simpel bauen, später erweiterbar.**

Das System ist von Grund auf auf ein vollständiges Social-Network ausgelegt,
aber der erste Schritt ist bewusst minimal gehalten:

| Jetzt (v1) | Später (v2+) |
|---|---|
| User-Profile + Follow-System | Direct Messages |
| User & Gruppen suchen | Activity Feed / Timeline |
| Gruppen (Invite-only) | Stories / Posts |
| Library-Items teilen | Kommentare & Likes |
| — | Push-Notifications |

---

## Datenmodell — auf Erweiterung ausgelegt

Das DB-Schema wird jetzt schon so angelegt, dass spätere Features ohne Breaking Changes hinzukommen.

### Neue Tabellen

```sql
-- User-Profil-Erweiterung (kein neues Table, ALTER auf users)
ALTER TABLE users ADD COLUMN username      VARCHAR(30) UNIQUE;
ALTER TABLE users ADD COLUMN display_name  VARCHAR(60);
ALTER TABLE users ADD COLUMN avatar_url    TEXT;
ALTER TABLE users ADD COLUMN bio           TEXT;
ALTER TABLE users ADD COLUMN is_public     BOOLEAN DEFAULT true;
-- Vorbereitung für Messaging/Notifications:
ALTER TABLE users ADD COLUMN push_token    TEXT;
ALTER TABLE users ADD COLUMN last_seen_at  TIMESTAMP;

-- Follow-System (unidirektional, wie Instagram)
-- "follower_id folgt following_id"
CREATE TABLE follows (
  follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
-- Index für "wer folgt mir" und "wem folge ich"
CREATE INDEX idx_follows_follower  ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Gruppen
CREATE TABLE groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(60) NOT NULL,
  description  TEXT,
  avatar_url   TEXT,
  invite_code  VARCHAR(12) UNIQUE NOT NULL,
  owner_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public    BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Gruppen-Mitgliedschaft
CREATE TABLE group_members (
  group_id   UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(10) CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at  TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Library Sharing (Items mit User oder Gruppe teilen)
CREATE TABLE shared_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id             UUID REFERENCES items(id) ON DELETE CASCADE,
  shared_by           UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_user    UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_group   UUID REFERENCES groups(id) ON DELETE CASCADE,
  permission          VARCHAR(10) DEFAULT 'view',
  shared_at           TIMESTAMP DEFAULT NOW(),
  CONSTRAINT one_target CHECK (
    (shared_with_user IS NOT NULL) != (shared_with_group IS NOT NULL)
  )
);

-- Vorbereitung Messaging (v2) — Tabelle existiert, wird noch nicht genutzt
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  sent_at         TIMESTAMP DEFAULT NOW(),
  read_at         TIMESTAMP
);
```

> Die Messaging-Tabellen werden jetzt angelegt aber nicht befüllt.
> So sind spätere Migrationen ein einfaches ALTER statt einer Neu-Erstellung.

---

## Architektur — Feature-Module

```
/features
  /social          (NEU) — Profile, Follow, Discovery, später: Feed, DMs
    /components
    /hooks
    /services
    /types
    index.ts
  /groups          (NEU) — Gruppen erstellen, einladen, verwalten
    /components
    /hooks
    /services
    /types
    index.ts
  /library         (ERWEITERN) — Sharing-Logik ergänzen
  /auth            (ERWEITERN) — Profil-Felder ergänzen

/app/(tabs)
  index.tsx              (Home — später: Feed)
  library.tsx            (Bibliothek — + "Geteilt mit mir"-Tab)
  social.tsx             (NEU — Suche, Folge-Liste, Gruppen)
  profile.tsx            (Eigenes Profil)

/app
  /profile/[id].tsx      (NEU — fremdes Profil ansehen)
  /groups/[id]/index.tsx (NEU — Gruppen-Detail)
  /groups/create.tsx     (NEU — Gruppe erstellen)
```

---

## Phase 1 — User-Profil (Fundament)

Jeder User bekommt ein öffentliches @handle. Das ist die Grundlage für alles weitere.

### Backend

**`PATCH /api/auth/profile`** — Profil bearbeiten
- Felder: `username`, `displayName`, `bio`, `isPublic`
- Username-Validierung: 3–30 Zeichen, nur `[a-z0-9_]`
- Rate-Limit: 5 Updates / 15 min

**`POST /api/auth/profile/avatar`** — Avatar hochladen
- Multipart, max 2 MB, wird komprimiert

**`GET /api/users/:usernameOrId`** — Öffentliches Profil
- Gibt zurück: `displayName`, `username`, `bio`, `avatarUrl`, `followerCount`, `followingCount`, `isFollowing` (wenn eingeloggt)
- Bei `isPublic = false`: 404 für fremde User

**`GET /api/users/check-username?q=...`** — Username-Verfügbarkeit
- Schneller Check, kein Auth nötig

### Mobile — `features/social/`

```
/components/
  ProfileHeader.tsx      Avatar + Name + @handle + Bio + Follower/Following-Zahlen
  ProfileForm.tsx        Felder bearbeiten (Name, Bio, Username, Sichtbarkeit)
  AvatarPicker.tsx       Kamera oder Galerie, direkt uploaden
  UsernameInput.tsx      Live-Check mit ✓ / ✗ (Debounce 500ms)
/hooks/
  useOwnProfile.ts       Eigenes Profil laden + updaten
  usePublicProfile.ts    Fremdes Profil laden (by username or id)
  useUsernameCheck.ts    Debounced Verfügbarkeitscheck
/services/
  profileService.ts
/types/
  profile.types.ts       UserProfile, ProfileUpdatePayload, PublicProfile
```

**Screens:**
- `/app/(tabs)/profile.tsx` — eigenes Profil + Edit-Button → Modal
- `/app/profile/[id].tsx` — fremdes Profil (Avatar, Bio, Follow-Button, geteilte Items)

---

## Phase 2 — Follow-System

Einfaches unidirektionales Follow (kein "Freunde"-Konzept).
Basis für später: Feed, DMs nur mit Followees.

### Backend

**`POST /api/users/:id/follow`** — Folgen
**`DELETE /api/users/:id/follow`** — Entfolgen
**`GET /api/users/:id/followers`** — Follower-Liste (paginiert)
**`GET /api/users/:id/following`** — Following-Liste (paginiert)

### Mobile

```
/features/social/components/
  FollowButton.tsx         Button mit Loading-State + optimistisches Update
  UserCard.tsx             Avatar + Name + @handle + FollowButton
  UserList.tsx             Follower- oder Following-Liste
/hooks/
  useFollow.ts             Follow/Unfollow-Mutation + lokaler State
  useFollowers.ts
  useFollowing.ts
```

**UX:**
- Follow-Button auf fremdem Profil: "Folgen" → "Gefolgt" (sofortiges Update, Rollback bei Fehler)
- Eigenes Profil: Follower- und Following-Zahl sind tippbar → öffnet jeweilige Liste

---

## Phase 3 — Discovery (Suche)

User und Gruppen finden — über Suche, Invite-Link oder QR-Code.

### Backend

**`GET /api/search/users?q=...`** — User suchen (username + displayName, partial match)
**`GET /api/search/groups?q=...`** — Gruppen suchen (nur öffentliche)
**`GET /api/groups/resolve/:inviteCode`** — Gruppen-Info per Code (vor Beitritt)

### Mobile — `features/social/`

```
/components/
  SearchBar.tsx            Suchfeld mit Debounce + Clear-Button
  SearchResultsUsers.tsx   Liste von UserCards
  SearchResultsGroups.tsx  Liste von GroupCards
  GroupCard.tsx            Avatar + Name + Mitgliederzahl
  EmptySearchState.tsx     "Finde Freunde und Gruppen"
  InviteCodeSheet.tsx      Bottom Sheet: Code eingeben
/hooks/
  useSearch.ts             Kombinierte Suche (User + Gruppen)
```

**Neuer Tab: `/app/(tabs)/social.tsx`**
- Suchfeld oben
- Segmented Control: "Personen" | "Gruppen"
- Leerer State: folge-Empfehlungen (später) — für jetzt: Anleitung
- FAB: "Gruppe erstellen" + "Per Code beitreten"

---

## Phase 4 — Gruppen

Invite-only Gruppen als Container für gemeinsame Library-Inhalte.

### Backend

**`POST /api/groups`** — erstellen
**`GET /api/groups/:id`** — Details + Mitgliederzahl
**`POST /api/groups/:id/invite/user/:userId`** — User direkt einladen
**`POST /api/groups/join/:inviteCode`** — per Code beitreten
**`DELETE /api/groups/:id/members/me`** — Gruppe verlassen
**`DELETE /api/groups/:id/members/:userId`** — Mitglied entfernen (Admin)
**`PATCH /api/groups/:id/members/:userId/role`** — Rolle ändern

### Mobile — `features/groups/`

```
/components/
  GroupHeader.tsx          Avatar + Name + Mitglieder + Buttons
  MemberListItem.tsx       Avatar + Name + Rolle + Optionen
  InviteMemberSheet.tsx    User-Suche + Einladen
  CreateGroupForm.tsx      Name, Beschreibung, Avatar, Sichtbarkeit
  GroupInviteCard.tsx      Einladung annehmen / ablehnen
  RoleBadge.tsx            Pill: Owner / Admin / Mitglied
/hooks/
  useGroup.ts
  useGroupMembers.ts
  useGroupList.ts
  useCreateGroup.ts
/services/
  groupService.ts
/types/
  group.types.ts
```

**Screens:**
- `/app/(tabs)/social.tsx` — Gruppen erscheinen im "Gruppen"-Tab der Suche + eigene Gruppen-Liste
- `/app/groups/[id]/index.tsx` — Gruppen-Profil + geteilte Library
- `/app/groups/create.tsx` — Gruppe erstellen (Modal / Sheet)

**Invite-Wege:**
1. Username-Suche → "Einladen" → In-App-Benachrichtigung
2. Invite-Link kopieren → per WhatsApp, iMessage etc. teilen
3. QR-Code anzeigen → anderer User scannt mit ScanApp (nutzt bestehende Kamera-Infrastruktur)

---

## Phase 5 — Library Sharing

Items mit einzelnen Followees oder Gruppen teilen.

### Backend

**`POST /api/items/:id/share`** — Item teilen
**`DELETE /api/items/:id/share/:shareId`** — Sharing aufheben
**`GET /api/shared/with-me`** — Items die ich empfangen habe
**`GET /api/groups/:id/library`** — Geteilte Items einer Gruppe

**Payload:**
```typescript
interface ShareItemPayload {
  targetType: 'user' | 'group';
  targetId: string;
  permission: 'view'; // für jetzt nur view; comment/edit später
}
```

> **Wichtig:** Nur Usern teilen, denen man gegenseitig folgt (following + follower).
> Das verhindert Spam und ist das natürliche Instagram-Modell.
> Gruppen: jedes Mitglied kann teilen.

### Mobile

```
/features/library/components/
  ShareSheet.tsx           Bottom Sheet — Haupteinstieg fürs Teilen
  ShareTargetSearch.tsx    Suche unter Followees + eigene Gruppen
  SharedBadge.tsx          Kleines Icon auf geteilten Items
  SharedWithMeTab.tsx      "Für mich"-Tab im Library-Screen
/hooks/
  useShareItem.ts
  useSharedWithMe.ts
  useGroupLibrary.ts
/services/
  sharingService.ts
```

**UX:**
- Long-Press auf Library-Item → Kontext-Menü → "Teilen"
- Share-Sheet: Tabs "Personen" (nur Followees) | "Gruppen" (eigene Gruppen)
- Shared Items bekommen ein kleines Icon + sind subtil anders eingefärbt
- Library-Screen: Segmented Control "Meine Items" | "Für mich"

---

## Implementierungs-Reihenfolge

| Batch | Inhalt | Geschätzt |
|---|---|---|
| **1** | DB-Migration (alle Tabellen auf einmal) + User-Profil (Backend + Mobile) | 1–2 Tage |
| **2** | Follow-System + Discovery-Tab (Suche) | 1–2 Tage |
| **3** | Gruppen (Backend + Mobile) | 2 Tage |
| **4** | Library Sharing | 1–2 Tage |
| **5** | Polish: fremdes Profil, Empty-States, Error-States | 1 Tag |

**Gesamt: ~6–9 Tage**

---

## Erweiterbarkeit — was später einfach dazukommt

Durch die gewählte Architektur sind folgende v2-Features ohne Umbau möglich:

**Direct Messages:**
- Tabellen existieren bereits (`conversations`, `messages`)
- Neues Feature-Modul `features/messages` + neuer Tab
- Route: `GET /api/conversations`, `POST /api/messages`

**Activity Feed:**
- Neue Tabelle `activities` (type, actor_id, target_id, created_at)
- Events schreiben: bei Follow, Teilen, Gruppen-Beitritt
- Feed: `GET /api/feed` → Items aller Followees

**Push-Notifications:**
- `push_token` Feld auf users ist bereits vorbereitet
- Expo Notifications SDK + Backend-Trigger bei relevanten Events

**Öffentliche Profile / "Posts":**
- Items können auf `visibility = 'public'` gesetzt werden
- Erscheinen dann auf dem öffentlichen Profil (wie Instagram-Grid)

---

## Design-Entscheidungen

**Unidirektionales Follow (nicht bidirektionale Freundschaft):**
Skaliert besser, kein "Freundschaftsanfrage"-Overhead. Gegenseitiges Folgen
entsteht natürlich und ist Voraussetzung für Sharing zwischen Usern.

**Username als primäre Identität:**
E-Mail bleibt privat. Suche und Mentions laufen über `@username`.

**Sharing nur unter Followees:**
Verhindert Spam. Ist das natürliche Verhalten von Instagram DMs / Close Friends.

**Berechtigungen bewusst simpel (nur 'view'):**
Keine Edit-Rechte. Kommentieren kommt in v2. Jetzt keine unnötige Komplexität.

**Messaging-Tabellen jetzt anlegen:**
Kostet nichts, spart später eine komplexe Migration. Die Tabellen sind leer
bis das Feature aktiviert wird.
