/**
 * Sync Service - Fire-and-Forget Push zum Backend
 * Fehler werden still gefangen, Items bleiben lokal erhalten
 */

import { apiGet, apiUploadItem, apiPatch, apiPut, apiDelete, UploadItemPayload } from '@/shared/services';
import { API_CONFIG } from '@/shared/constants';
import type { HistoryItem } from '../store/types';
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

export interface FollowingItem {
  id: string;
  imageUri: string;
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  priceStats: PriceStats;
  scannedAt: string;
  owner: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
}

/** Items von gefolgten Usern laden */
export async function syncFetchFollowingItems(): Promise<FollowingItem[] | null> {
  try {
    const result = await apiGet<any>('/api/items/following');
    if (result.success && Array.isArray(result.data)) {
      return result.data.map((item: any): FollowingItem => ({
        id: item.id,
        imageUri: `${API_CONFIG.BASE_URL}/api/images/${item.imageFilename}`,
        productName: item.productName,
        category: item.category,
        brand: item.brand ?? null,
        condition: item.condition,
        priceStats: typeof item.priceStats === 'string' ? JSON.parse(item.priceStats) : (item.priceStats ?? {}),
        scannedAt: item.scannedAt,
        owner: item.owner,
      }));
    }
    return null;
  } catch (error) {
    console.warn('[Sync] Fetch Following Items error:', error);
    return null;
  }
}

/**
 * History vom Backend laden (Ansatz: Always On)
 * Lädt die neuesten Scans des Nutzers herunter und konvertiert sie in das HistoryItem Format
 */
export async function syncFetchHistory(page: number = 1, limit: number = 50): Promise<HistoryItem[] | null> {
  try {
    const result = await apiGet<any>(`/api/items?page=${page}&limit=${limit}`);
    
    if (result.success && result.data?.items) {
      const serverItems = result.data.items;
      
      return serverItems.map((item: any): HistoryItem => {
        // Parse search queries
        let searchQueries = undefined;
        if (item.searchQueries) {
          searchQueries = typeof item.searchQueries === 'string' 
            ? JSON.parse(item.searchQueries) 
            : item.searchQueries;
        }

        // Construct remote image URI using backend endpoint
        const remoteImageUri = `${API_CONFIG.BASE_URL}/api/images/${item.imageFilename}`;
        
        return {
          id: item.id,
          serverId: item.id,
          imageUri: remoteImageUri,
          productName: item.productName,
          category: item.category,
          brand: item.brand,
          condition: item.condition,
          conditionNote: item.conditionNote ?? null,
          confidence: item.confidence,
          categoryId: item.categoryId ?? null,
          categoryPath: item.categoryPath ?? null,
          gtin: item.gtin,
          searchQuery: item.searchQuery,
          searchQueries,
          priceStats: typeof item.priceStats === 'string' ? JSON.parse(item.priceStats) : item.priceStats,
          ebayListings: typeof item.ebayListings === 'string' ? JSON.parse(item.ebayListings) : item.ebayListings,
          ebayListingsFetchedAt: item.ebayListingsFetchedAt,
          marketValue: typeof item.marketValue === 'string' ? JSON.parse(item.marketValue) : item.marketValue,
          marketValueFetchedAt: item.marketValueFetchedAt,
          finalPrice: item.finalPrice,
          finalPriceNote: item.finalPriceNote,
          scannedAt: item.scannedAt,
          syncStatus: 'synced',
        };
      });
    }
    
    console.warn('[Sync] Fetch History fehlgeschlagen:', result.error?.message);
    return null;
  } catch (error) {
    console.warn('[Sync] Fetch History error:', error);
    return null;
  }
}
