// Market Feature - Type Definitions

import type { MarketPlatform } from '@/shared/constants';

/**
 * Einzelnes Angebot von einem Marktplatz
 */
export interface MarketListing {
  id: string;
  platform: MarketPlatform;
  title: string;
  price: number;
  currency: string;
  url: string;
  imageUrl?: string;
  condition?: 'new' | 'used' | 'refurbished';
  sold?: boolean;
  listedAt?: Date;
}

/**
 * Preisstatistiken für ein Item
 */
export interface PriceStats {
  min: number;
  max: number;
  average: number;
  median: number;
  count: number;
}

/**
 * Marktanalyse-Ergebnis pro Plattform
 */
export interface PlatformAnalysis {
  platform: MarketPlatform;
  listings: MarketListing[];
  stats: PriceStats;
  lastUpdated: Date;
}

/**
 * Komplette Marktanalyse für ein Item
 */
export interface MarketAnalysis {
  itemId: string;
  itemName: string;
  platforms: PlatformAnalysis[];
  overallStats: PriceStats;
  estimatedValue: number;
  analyzedAt: Date;
}
