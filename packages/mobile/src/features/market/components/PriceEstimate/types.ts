/**
 * Price Estimate Component Types
 */

import { PriceStats, MarketListing, MarketplaceResult } from '../../services/ebay';

export interface PriceEstimateProps {
  priceStats: PriceStats | null;
  listings?: MarketListing[];
  marketplaceResults?: MarketplaceResult[];
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onListingsChange?: (listings: MarketListing[]) => void;
}

export interface GroupedListings {
  [marketplace: string]: MarketListing[];
}
