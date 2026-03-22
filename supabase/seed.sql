-- =============================================================
-- ScanApp Seed Data
-- Wird bei `supabase db reset` ausgeführt
-- =============================================================

-- Storage Bucket für Item-Bilder anlegen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  TRUE,                          -- Öffentlich: Bilder direkt per URL abrufbar
  5242880,                       -- 5MB Limit (wie in Multer konfiguriert)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policy: Jeder kann Bilder lesen (Bucket ist public)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Public read access',
  'item-images',
  'SELECT',
  'TRUE'
)
ON CONFLICT DO NOTHING;

-- Storage Policy: Nur authentifizierte User können hochladen
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Authenticated users can upload',
  'item-images',
  'INSERT',
  '(auth.role() = ''authenticated'')'
)
ON CONFLICT DO NOTHING;

-- Storage Policy: User kann nur eigene Bilder löschen
-- (Dateiname enthält keine userId → Backend nutzt service_role für Löschen)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Service role can delete',
  'item-images',
  'DELETE',
  '(auth.role() = ''service_role'')'
)
ON CONFLICT DO NOTHING;
