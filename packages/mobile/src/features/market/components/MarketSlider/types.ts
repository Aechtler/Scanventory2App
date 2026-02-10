/**
 * MarketSlider Types
 */

import { PriceStats, MarketListing } from '@/features/market/services/ebay';
import { MarketValueResult } from '@/features/market/services/perplexity';

export interface MarketSliderProps {
  /** Perplexity AI Marktwert */
  marketValue: MarketValueResult | null;
  marketValueLoading: boolean;
  onRefreshMarketValue?: () => void;
  /** eBay Preisdaten */
  ebayPriceStats: PriceStats | null;
  ebayListings: MarketListing[];
  ebayLoading: boolean;
  onRefreshEbay?: () => void;
  /** Kleinanzeigen Preisdaten */
  kleinanzeigenPriceStats: PriceStats | null;
  kleinanzeigenListings: MarketListing[];
  kleinanzeigenLoading: boolean;
  kleinanzeigenError?: string | null;
  onRefreshKleinanzeigen?: () => void;
  /** Callback wenn eBay Listings sich aendern (Selektion) */
  onEbayListingsChange?: (listings: MarketListing[]) => void;
}

export interface SummarySlideProps {
  marketValue: MarketValueResult | null;
  marketValueLoading: boolean;
  ebayPriceStats: PriceStats | null;
  ebayLoading: boolean;
  kleinanzeigenPriceStats: PriceStats | null;
  kleinanzeigenLoading: boolean;
  onPress: () => void;
}

export interface PlatformSlideProps {
  platform: 'ebay' | 'kleinanzeigen';
  priceStats: PriceStats | null;
  listings: MarketListing[];
  isLoading: boolean;
  error?: string | null;
  onPress: () => void;
}
