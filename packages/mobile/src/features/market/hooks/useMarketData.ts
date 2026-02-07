/**
 * useMarketData Hook
 * 
 * Shared hook for loading market data (eBay, Kleinanzeigen, AI Market Value).
 * Used by both analyze.tsx and history/[id].tsx to avoid code duplication.
 */

import { useState, useCallback } from 'react';
import { searchMarket, PriceStats, MarketListing } from '@/features/market/services/ebay';
import { searchKleinanzeigen } from '@/features/market/services/kleinanzeigen';
import { getMarketValue, MarketValueResult } from '@/features/market/services/perplexity';

export interface MarketDataState {
  // eBay data
  ebayPriceStats: PriceStats | null;
  ebayListings: MarketListing[];
  ebayLoading: boolean;
  
  // Kleinanzeigen data
  kleinanzeigenPriceStats: PriceStats | null;
  kleinanzeigenListings: MarketListing[];
  kleinanzeigenLoading: boolean;
  
  // AI Market Value
  marketValue: MarketValueResult | null;
  marketValueLoading: boolean;
}

export interface MarketDataActions {
  loadEbayData: (searchQuery: string, gtin?: string) => Promise<void>;
  loadKleinanzeigenData: (searchQuery: string, category?: string) => Promise<void>;
  loadMarketValue: (productName: string, category?: string, forceRefresh?: boolean) => Promise<void>;
  loadAllData: (params: {
    searchQuery: string;
    productName: string;
    category?: string;
    kleinanzeigenQuery?: string;
    gtin?: string;
    cachedMarketValue?: MarketValueResult;
    forceRefresh?: boolean;
  }) => Promise<void>;
  setEbayData: (priceStats: PriceStats | null, listings?: MarketListing[]) => void;
  setKleinanzeigenData: (priceStats: PriceStats | null, listings?: MarketListing[]) => void;
  setMarketValue: (value: MarketValueResult | null) => void;
}

export type UseMarketDataReturn = MarketDataState & MarketDataActions;

/**
 * Hook for managing market data loading and state
 * 
 * @param options.onEbayDataLoaded - Callback when eBay data is loaded (for persisting to store)
 * @param options.onKleinanzeigenDataLoaded - Callback when Kleinanzeigen data is loaded
 * @param options.onMarketValueLoaded - Callback when market value is loaded
 */
export function useMarketData(options?: {
  onEbayDataLoaded?: (priceStats: PriceStats, listings: MarketListing[]) => void;
  onKleinanzeigenDataLoaded?: (listings: MarketListing[]) => void;
  onMarketValueLoaded?: (value: MarketValueResult) => void;
}): UseMarketDataReturn {
  // eBay state
  const [ebayPriceStats, setEbayPriceStats] = useState<PriceStats | null>(null);
  const [ebayListings, setEbayListings] = useState<MarketListing[]>([]);
  const [ebayLoading, setEbayLoading] = useState(false);
  
  // Kleinanzeigen state
  const [kleinanzeigenPriceStats, setKleinanzeigenPriceStats] = useState<PriceStats | null>(null);
  const [kleinanzeigenListings, setKleinanzeigenListings] = useState<MarketListing[]>([]);
  const [kleinanzeigenLoading, setKleinanzeigenLoading] = useState(false);
  
  // AI Market Value state
  const [marketValue, setMarketValueState] = useState<MarketValueResult | null>(null);
  const [marketValueLoading, setMarketValueLoading] = useState(false);

  /**
   * Load eBay price data and listings
   */
  const loadEbayData = useCallback(async (searchQuery: string, gtin?: string) => {
    setEbayLoading(true);
    // Only clear stats if we are not doing a refined search with GTIN
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
   * Load Kleinanzeigen data
   */
  const loadKleinanzeigenData = useCallback(async (searchQuery: string, category?: string) => {
    setKleinanzeigenLoading(true);
    setKleinanzeigenPriceStats(null);
    setKleinanzeigenListings([]);

    try {
      console.log('[useMarketData] Loading Kleinanzeigen data for:', searchQuery);
      const result = await searchKleinanzeigen(searchQuery, category);
      if (result) {
        setKleinanzeigenPriceStats(result.priceStats);
        setKleinanzeigenListings(result.listings || []);
        options?.onKleinanzeigenDataLoaded?.(result.listings || []);
      }
    } catch (err) {
      console.error('[useMarketData] Kleinanzeigen loading error:', err);
    } finally {
      setKleinanzeigenLoading(false);
    }
  }, [options?.onKleinanzeigenDataLoaded]);

  /**
   * Load AI market value estimate
   */
  const loadMarketValue = useCallback(async (
    productName: string, 
    category?: string,
    forceRefresh = false
  ) => {
    // Skip if we have cached value and not forcing refresh
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
    kleinanzeigenQuery?: string;
    gtin?: string;
    cachedMarketValue?: MarketValueResult;
    forceRefresh?: boolean;
  }) => {
    const { 
      searchQuery, 
      productName, 
      category, 
      kleinanzeigenQuery, 
      gtin,
      cachedMarketValue,
      forceRefresh = false 
    } = params;

    // Use cached market value if available and not forcing refresh
    if (cachedMarketValue && !forceRefresh) {
      setMarketValueState(cachedMarketValue);
    }

    // Load all data in parallel (non-blocking)
    loadEbayData(searchQuery, gtin);
    loadMarketValue(productName, category, forceRefresh);
    loadKleinanzeigenData(kleinanzeigenQuery || searchQuery, category);
  }, [loadEbayData, loadMarketValue, loadKleinanzeigenData]);

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
   * Manually set Kleinanzeigen data (for loading from cache)
   */
  const setKleinanzeigenData = useCallback((priceStats: PriceStats | null, listings?: MarketListing[]) => {
    setKleinanzeigenPriceStats(priceStats);
    if (listings) {
      setKleinanzeigenListings(listings);
    }
  }, []);

  /**
   * Manually set market value (for loading from cache)
   */
  const setMarketValue = useCallback((value: MarketValueResult | null) => {
    setMarketValueState(value);
  }, []);

  return {
    // State
    ebayPriceStats,
    ebayListings,
    ebayLoading,
    kleinanzeigenPriceStats,
    kleinanzeigenListings,
    kleinanzeigenLoading,
    marketValue,
    marketValueLoading,
    // Actions
    loadEbayData,
    loadKleinanzeigenData,
    loadMarketValue,
    loadAllData,
    setEbayData,
    setKleinanzeigenData,
    setMarketValue,
  };
}
