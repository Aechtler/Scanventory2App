/**
 * Kleinanzeigen Service
 * Nur noch Quicklink-URL-Generierung (keine API-Anbindung)
 */

/**
 * Generates a Kleinanzeigen search URL for manual searching
 */
export function getKleinanzeigenSearchUrl(query: string): string {
  return `https://www.kleinanzeigen.de/s-suchen/k0?keywords=${encodeURIComponent(query)}`;
}
