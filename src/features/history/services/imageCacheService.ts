/**
 * Image Cache Service
 * Speichert Bilder lokal für Offline-Zugriff
 */

import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.documentDirectory}image_cache/`;

/**
 * Stellt sicher, dass das Cache-Verzeichnis existiert
 */
async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

/**
 * Generiert einen Cache-Dateinamen aus der URI
 */
function getCacheFilename(uri: string): string {
  // Erstelle einen einfachen Hash aus der URI
  const hash = uri.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `img_${Math.abs(hash)}.jpg`;
}

/**
 * Kopiert ein Bild in den lokalen Cache
 * @returns Lokaler Cache-Pfad oder Original-URI wenn Caching fehlschlägt
 */
export async function cacheImage(originalUri: string): Promise<string> {
  try {
    await ensureCacheDir();
    
    const filename = getCacheFilename(originalUri);
    const cacheUri = CACHE_DIR + filename;
    
    // Prüfe ob bereits im Cache
    const cached = await FileSystem.getInfoAsync(cacheUri);
    if (cached.exists) {
      return cacheUri;
    }
    
    // Kopiere Bild in Cache
    await FileSystem.copyAsync({
      from: originalUri,
      to: cacheUri,
    });
    
    return cacheUri;
  } catch (error) {
    console.warn('Image caching failed:', error);
    return originalUri; // Fallback zu Original
  }
}

/**
 * Prüft ob ein gecachtes Bild existiert
 */
export async function getCachedImage(originalUri: string): Promise<string | null> {
  try {
    const filename = getCacheFilename(originalUri);
    const cacheUri = CACHE_DIR + filename;
    
    const info = await FileSystem.getInfoAsync(cacheUri);
    return info.exists ? cacheUri : null;
  } catch {
    return null;
  }
}

/**
 * Löscht ein Bild aus dem Cache
 */
export async function removeCachedImage(originalUri: string): Promise<void> {
  try {
    const filename = getCacheFilename(originalUri);
    const cacheUri = CACHE_DIR + filename;
    
    const info = await FileSystem.getInfoAsync(cacheUri);
    if (info.exists) {
      await FileSystem.deleteAsync(cacheUri);
    }
  } catch (error) {
    console.warn('Failed to remove cached image:', error);
  }
}

/**
 * Leert den gesamten Bildcache
 */
export async function clearImageCache(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(CACHE_DIR);
    }
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
}
