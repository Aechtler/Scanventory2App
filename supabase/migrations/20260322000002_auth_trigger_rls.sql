-- ============================================================
-- ScanApp — Supabase Setup SQL
-- Im Supabase Dashboard unter: SQL Editor → New Query
-- ============================================================


-- ── 1. User-Sync Trigger ─────────────────────────────────────
-- Wenn sich ein neuer User via Supabase Auth registriert,
-- wird automatisch ein Eintrag in public."User" erstellt.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, email, "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Falls User bereits existiert
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger feuert nach jedem neuen auth.users Eintrag
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── 2. Row Level Security (RLS) ──────────────────────────────

-- User-Profil
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Öffentliche Profile lesbar"
  ON public."User" FOR SELECT
  USING ("isPublic" = TRUE OR auth.uid()::text = id);

CREATE POLICY "User aktualisiert eigenes Profil"
  ON public."User" FOR UPDATE
  USING (auth.uid()::text = id);

-- ScannedItems
ALTER TABLE public."ScannedItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sieht eigene Items"
  ON public."ScannedItem" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "User erstellt eigene Items"
  ON public."ScannedItem" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "User bearbeitet eigene Items"
  ON public."ScannedItem" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "User löscht eigene Items"
  ON public."ScannedItem" FOR DELETE
  USING (auth.uid()::text = "userId");

-- SharedItem — geteilte Items sichtbar für Empfänger
ALTER TABLE public."SharedItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geteilte Items für Empfänger lesbar"
  ON public."SharedItem" FOR SELECT
  USING (
    auth.uid()::text = "sharedById"
    OR auth.uid()::text = "sharedWithUserId"
  );

-- Follow-System
ALTER TABLE public."Follow" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows lesbar wenn Profil öffentlich"
  ON public."Follow" FOR SELECT
  USING (TRUE); -- Follows sind öffentlich sichtbar

CREATE POLICY "User verwaltet eigene Follows"
  ON public."Follow" FOR ALL
  USING (auth.uid()::text = "followerId");

-- Gruppen
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Öffentliche Gruppen lesbar"
  ON public."Group" FOR SELECT
  USING ("isPublic" = TRUE OR auth.uid()::text = "ownerId");

CREATE POLICY "Owner verwaltet Gruppe"
  ON public."Group" FOR ALL
  USING (auth.uid()::text = "ownerId");

-- GroupMember
ALTER TABLE public."GroupMember" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mitglieder sehen Gruppenmitglieder"
  ON public."GroupMember" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "groupId"
        AND gm."userId" = auth.uid()::text
    )
  );

-- WICHTIG: Das Backend nutzt service_role → RLS wird für Backend-Calls bypassed.
-- RLS gilt nur für direkte Supabase Client Calls (z.B. aus der Mobile App).
