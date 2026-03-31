-- Supabase Auth ersetzt lokale Passwort-Authentifizierung.
-- password-Spalte wird nullable gemacht (bestehende Daten bleiben erhalten).
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
