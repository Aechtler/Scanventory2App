/**
 * Sync Service - Fire-and-Forget Push zum Backend
 * Fehler werden still gefangen, Items bleiben lokal erhalten
 */

import { apiUploadItem, apiPatch, apiPut, apiDelete, UploadItemPayload } from '@/shared/services';
import { PriceStats, MarketListing } from '@/features/market/services/ebay';
import { MarketValueResult } from '@/features/market/services/perplexity';

interface SyncItemData extends UploadItemPayload {}

/** Neues Item zum Backend hochladen (Bild + Metadaten) */
export async function syncNewItem(
  imageUri: string,
  data: SyncItemData
): Promise<string | null> {
  try {
    const result = await apiUploadItem(imageUri, data);
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
  priceStats: PriceStats,
  ebayListings?: MarketListing[]
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
  marketValue: MarketValueResult
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
