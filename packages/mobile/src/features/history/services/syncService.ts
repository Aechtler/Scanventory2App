/**
 * Sync Service - Fire-and-Forget Push zum Backend
 * Fehler werden still gefangen, Items bleiben lokal erhalten
 */

import { apiUploadItem, apiPatch, apiPut, apiDelete } from '@/shared/services';

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

/** Generisches Item-Update zum Backend pushen (PUT) */
export async function syncItemUpdate(
  serverId: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  try {
    const result = await apiPut(`/api/items/${serverId}`, fields);
    return result.success;
  } catch (error) {
    console.warn('[Sync] Item update error:', error);
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
