/**
 * Image Service - Bild-Speicherung via Supabase Storage
 * Ersetzt lokales Filesystem (uploads/) durch Supabase Storage Bucket 'item-images'
 */

import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabaseClient';

const BUCKET = 'item-images';

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function getSafeExtension(mimetype: string, originalname: string): string {
  return MIME_TYPE_TO_EXTENSION[mimetype] || originalname.split('.').pop()?.toLowerCase() || '.jpg';
}

/**
 * Lädt ein Bild in Supabase Storage hoch und gibt den Storage-Pfad zurück.
 * Multer muss auf memoryStorage() konfiguriert sein.
 */
export async function saveImage(file: Express.Multer.File): Promise<string> {
  const ext = getSafeExtension(file.mimetype, file.originalname);
  const filename = `${uuidv4()}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage Upload fehlgeschlagen: ${error.message}`);
  }

  return filename;
}

/**
 * Gibt die öffentliche URL für ein Bild zurück (CDN-URL von Supabase)
 */
export function getImageUrl(filename: string): string {
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * @deprecated Verwende getImageUrl() statt getImagePath().
 * Nur für Rückwärtskompatibilität während der Migration.
 */
export function getImagePath(filename: string): string {
  return getImageUrl(filename);
}

/**
 * Prüft ob ein Bild im Supabase Storage existiert
 */
export async function imageExists(filename: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .list('', { search: filename });

  if (error) return false;
  return (data ?? []).some((f) => f.name === filename);
}

/**
 * Löscht ein Bild aus Supabase Storage
 */
export async function deleteImage(filename: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([filename]);
  if (error) {
    throw new Error(`Supabase Storage Löschen fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Lädt ein Avatar-Bild hoch (Prefix: avatars/) und gibt die öffentliche CDN-URL zurück.
 */
export async function saveAvatar(file: Express.Multer.File): Promise<string> {
  const ext = getSafeExtension(file.mimetype, file.originalname);
  const filename = `avatars/${uuidv4()}${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Avatar Upload fehlgeschlagen: ${error.message}`);
  }

  return getImageUrl(filename);
}

/**
 * Extrahiert den Storage-Pfad (z.B. "avatars/uuid.jpg") aus einer öffentlichen Supabase-URL.
 * Gibt null zurück wenn es keine verwaltete Storage-URL ist.
 */
export function extractStorageFilename(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const match = url.pathname.match(/\/item-images\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
