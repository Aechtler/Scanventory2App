import type { MarketListing } from './types';

interface EbayItemSummary {
  itemId?: string;
  title?: string;
  price?: {
    value?: string;
    currency?: string;
  };
  condition?: string;
  thumbnailImages?: Array<{
    imageUrl?: string;
  }>;
  itemWebUrl?: string;
}

export function parseListingsWithMarketplace(
  itemSummaries: EbayItemSummary[] = [],
  marketplaceId: string,
): MarketListing[] {
  const listings: MarketListing[] = [];

  for (const item of itemSummaries) {
    const priceValue = Number.parseFloat(item.price?.value ?? '0');
    if (!item.itemId || !item.title || !(priceValue > 0)) {
      continue;
    }

    listings.push({
      id: item.itemId,
      title: item.title,
      price: priceValue,
      currency: item.price?.currency || 'EUR',
      condition: item.condition || 'Unbekannt',
      imageUrl: item.thumbnailImages?.[0]?.imageUrl || '',
      itemUrl: item.itemWebUrl || '',
      sold: false,
      marketplace: marketplaceId,
      selected: false,
    });
  }

  return listings;
}
