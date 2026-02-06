/**
 * Sync Service - Fire-and-Forget Push zum Backend
 * Fehler werden still gefangen, Items bleiben lokal erhalten
 */

import { apiUploadItem, apiPatch, apiDelete } from '@/shared/services';

interface SyncItemData {
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  confidence: number;
  gtin?: string | null;
  searchQuery: string;
  searchQueries?: Record<string, string>;
  priceStats: Record<string, unknown>;
  ebayListings?: unknown[];
  ebayListingsFetchedAt?: string;
  kleinanzeigenListings?: unknown[];
  kleinanzeigenListingsFetchedAt?: string;
  marketValue?: Record<string, unknown>;
  marketValueFetchedAt?: string;
  scannedAt: string;
}

/** Neues Item zum Backend hochladen (Bild + Metadaten) */
export async function syncNewItem(
  imageUri: string,
  data: SyncItemData
): Promise<string | null> {
  try {
    const result = await apiUploadItem(imageUri, { ...data });
    if (result.success && result.data) {
      return result.data.id;
    }
    console.warn('[Sync] Upload fehlgeschlagen:', result.error?.message);
    return null;
  } catch (error) {
    console.warn('[Sync] Upload error:', error);
    return null;
  }
}

/** Preisdaten zum Backend pushen */
export async function syncPrices(
  serverId: string,
  priceStats: Record<string, unknown>,
  ebayListings?: unknown[]
): Promise<boolean> {
  try {
    const result = await apiPatch(`/api/items/${serverId}/prices`, {
      priceStats,
      ebayListings,
    });
    return result.success;
  } catch (error) {
    console.warn('[Sync] Price update error:', error);
    return false;
  }
}

/** Marktwert zum Backend pushen */
export async function syncMarketValue(
  serverId: string,
  marketValue: Record<string, unknown>
): Promise<boolean> {
  try {
    const result = await apiPatch(`/api/items/${serverId}/market-value`, {
      marketValue,
    });
    return result.success;
  } catch (error) {
    console.warn('[Sync] Market value update error:', error);
    return false;
  }
}

/** Kleinanzeigen-Preisdaten zum Backend pushen */
export async function syncKleinanzeigenPrices(
  serverId: string,
  kleinanzeigenListings: unknown[]
): Promise<boolean> {
  try {
    const result = await apiPatch(`/api/items/${serverId}/kleinanzeigen-prices`, {
      kleinanzeigenListings,
    });
    return result.success;
  } catch (error) {
    console.warn('[Sync] Kleinanzeigen prices update error:', error);
    return false;
  }
}

/** Item auf dem Backend loeschen */
export async function syncDeleteItem(serverId: string): Promise<boolean> {
  try {
    const result = await apiDelete(`/api/items/${serverId}`);
    return result.success;
  } catch (error) {
    console.warn('[Sync] Delete error:', error);
    return false;
  }
}
