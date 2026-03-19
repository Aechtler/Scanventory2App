import type { CreateItemBody, MarketListing, MarketValueResult, PriceStats } from '../types';

interface ItemCreateData {
  userId: string;
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  confidence: number;
  gtin: string | null;
  searchQuery: string;
  searchQueries: CreateItemBody['searchQueries'] | null;
  imageFilename: string;
  originalUri: string | null;
  priceStats: PriceStats | null;
  ebayListings: MarketListing[] | null;
  ebayListingsFetchedAt: Date | null;
  kleinanzeigenListings: MarketListing[] | null;
  kleinanzeigenListingsFetchedAt: Date | null;
  marketValue: MarketValueResult | null;
  marketValueFetchedAt: Date | null;
  finalPrice: number | null;
  finalPriceNote: string | null;
  scannedAt: Date;
}

interface PriceUpdateData {
  priceStats: PriceStats;
  ebayListings?: MarketListing[];
  ebayListingsFetchedAt: Date;
}

interface KleinanzeigenPriceUpdateData {
  kleinanzeigenListings: MarketListing[];
  kleinanzeigenListingsFetchedAt: Date;
}

interface MarketValueUpdateData {
  marketValue: MarketValueResult;
  marketValueFetchedAt: Date;
}

function toOptionalDate(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}

export function buildCreateItemData(
  userId: string,
  data: CreateItemBody,
  imageFilename: string
): ItemCreateData {
  return {
    userId,
    productName: data.productName,
    category: data.category,
    brand: data.brand ?? null,
    condition: data.condition,
    confidence: data.confidence,
    gtin: data.gtin ?? null,
    searchQuery: data.searchQuery,
    searchQueries: data.searchQueries ?? null,
    imageFilename,
    originalUri: data.originalUri ?? null,
    priceStats: data.priceStats ?? null,
    ebayListings: data.ebayListings ?? null,
    ebayListingsFetchedAt: toOptionalDate(data.ebayListingsFetchedAt),
    kleinanzeigenListings: data.kleinanzeigenListings ?? null,
    kleinanzeigenListingsFetchedAt: toOptionalDate(data.kleinanzeigenListingsFetchedAt),
    marketValue: data.marketValue ?? null,
    marketValueFetchedAt: toOptionalDate(data.marketValueFetchedAt),
    finalPrice: data.finalPrice ?? null,
    finalPriceNote: data.finalPriceNote ?? null,
    scannedAt: new Date(data.scannedAt),
  };
}

export function buildPriceUpdateData(
  priceStats: PriceStats,
  ebayListings?: MarketListing[]
): PriceUpdateData {
  return {
    priceStats,
    ebayListings,
    ebayListingsFetchedAt: new Date(),
  };
}

export function buildKleinanzeigenPriceUpdateData(
  kleinanzeigenListings: MarketListing[]
): KleinanzeigenPriceUpdateData {
  return {
    kleinanzeigenListings,
    kleinanzeigenListingsFetchedAt: new Date(),
  };
}

export function buildMarketValueUpdateData(
  marketValue: MarketValueResult
): MarketValueUpdateData {
  return {
    marketValue,
    marketValueFetchedAt: new Date(),
  };
}
