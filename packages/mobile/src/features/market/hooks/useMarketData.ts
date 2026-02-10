/**
 * useMarketData Hook
 *
 * Shared hook for loading market data (eBay, AI Market Value).
 * Used by both analyze.tsx and history/[id].tsx to avoid code duplication.
 */

import { useState, useCallback } from 'react';
import { searchMarket, PriceStats, MarketListing } from '@/features/market/services/ebay';
import { getMarketValue, MarketValueResult } from '@/features/market/services/perplexity';

export interface MarketDataState {
  // eBay data
  ebayPriceStats: PriceStats | null;
  ebayListings: MarketListing[];
  ebayLoading: boolean;

  // AI Market Value
  marketValue: MarketValueResult | null;
  marketValueLoading: boolean;
}

export interface MarketDataActions {
  loadEbayData: (searchQuery: string, gtin?: string) => Promise<void>;
  loadMarketValue: (productName: string, category?: string, forceRefresh?: boolean) => Promise<void>;
  loadAllData: (params: {
    searchQuery: string;
    productName: string;
    category?: string;
    gtin?: string;
    cachedMarketValue?: MarketValueResult;
    forceRefresh?: boolean;
  }) => Promise<void>;
  setEbayData: (priceStats: PriceStats | null, listings?: MarketListing[]) => void;
  setMarketValue: (value: MarketValueResult | null) => void;
}

export type UseMarketDataReturn = MarketDataState & MarketDataActions;

/**
 * Hook for managing market data loading and state
 *
 * @param options.onEbayDataLoaded - Callback when eBay data is loaded (for persisting to store)
 * @param options.onMarketValueLoaded - Callback when market value is loaded
 */
export function useMarketData(options?: {
  onEbayDataLoaded?: (priceStats: PriceStats, listings: MarketListing[]) => void;
  onMarketValueLoaded?: (value: MarketValueResult) => void;
}): UseMarketDataReturn {
  // eBay state
  const [ebayPriceStats, setEbayPriceStats] = useState<PriceStats | null>(null);
  const [ebayListings, setEbayListings] = useState<MarketListing[]>([]);
  const [ebayLoading, setEbayLoading] = useState(false);

  // AI Market Value state
  const [marketValue, setMarketValueState] = useState<MarketValueResult | null>(null);
  const [marketValueLoading, setMarketValueLoading] = useState(false);

  /**
   * Load eBay price data and listings
   */
  const loadEbayData = useCallback(async (searchQuery: string, gtin?: string) => {
    setEbayLoading(true);
    if (!gtin) {
      setEbayPriceStats(null);
      setEbayListings([]);
    }

    try {
      console.log('[useMarketData] Loading eBay data for:', searchQuery, gtin ? `(GTIN: ${gtin})` : '');
      const result = await searchMarket(searchQuery, gtin);
      if (result) {
        setEbayPriceStats(result.priceStats);
        setEbayListings(result.listings || []);
        options?.onEbayDataLoaded?.(result.priceStats, result.listings || []);
      }
    } catch (err) {
      console.error('[useMarketData] eBay loading error:', err);
    } finally {
      setEbayLoading(false);
    }
  }, [options?.onEbayDataLoaded]);

  /**
   * Load AI market value estimate
   */
  const loadMarketValue = useCallback(async (
    productName: string,
    category?: string,
    forceRefresh = false
  ) => {
    if (!forceRefresh && marketValue) {
      return;
    }

    setMarketValueLoading(true);
    if (forceRefresh) {
      setMarketValueState(null);
    }

    try {
      console.log('[useMarketData] Loading market value for:', productName);
      const result = await getMarketValue(productName, category);
      setMarketValueState(result);
      if (result) {
        options?.onMarketValueLoaded?.(result);
      }
    } catch (err) {
      console.error('[useMarketData] Market value loading error:', err);
    } finally {
      setMarketValueLoading(false);
    }
  }, [marketValue, options?.onMarketValueLoaded]);

  /**
   * Load all market data in parallel
   */
  const loadAllData = useCallback(async (params: {
    searchQuery: string;
    productName: string;
    category?: string;
    gtin?: string;
    cachedMarketValue?: MarketValueResult;
    forceRefresh?: boolean;
  }) => {
    const { searchQuery, productName, category, gtin, cachedMarketValue, forceRefresh = false } = params;

    if (cachedMarketValue && !forceRefresh) {
      setMarketValueState(cachedMarketValue);
    }

    loadEbayData(searchQuery, gtin);
    loadMarketValue(productName, category, forceRefresh);
  }, [loadEbayData, loadMarketValue]);

  /**
   * Manually set eBay data (for loading from cache)
   */
  const setEbayData = useCallback((priceStats: PriceStats | null, listings?: MarketListing[]) => {
    setEbayPriceStats(priceStats);
    if (listings) {
      setEbayListings(listings);
    }
  }, []);

  /**
   * Manually set market value (for loading from cache)
   */
  const setMarketValue = useCallback((value: MarketValueResult | null) => {
    setMarketValueState(value);
  }, []);

  return {
    ebayPriceStats,
    ebayListings,
    ebayLoading,
    marketValue,
    marketValueLoading,
    loadEbayData,
    loadMarketValue,
    loadAllData,
    setEbayData,
    setMarketValue,
  };
}
