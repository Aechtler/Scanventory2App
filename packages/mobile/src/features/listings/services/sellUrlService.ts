import type { ListingPlatform } from '../types/listing.types';

export function generateSellUrl(
  platform: ListingPlatform,
  productName: string,
  _price?: number | null,
): string {
  const encoded = encodeURIComponent(productName);

  switch (platform) {
    case 'ebay':
      return `https://www.ebay.de/sl/sell?searchPhrase=${encoded}`;
    case 'kleinanzeigen':
      return `https://www.kleinanzeigen.de/m-anzeige-aufgeben.html?title=${encoded}`;
    case 'amazon':
      return `https://sellercentral.amazon.de/listing/product-classify?searchPhrase=${encoded}`;
  }
}

export const PLATFORM_META: Record<
  ListingPlatform,
  { label: string; color: string; icon: string }
> = {
  ebay: { label: 'eBay', color: '#E53238', icon: 'Tag' },
  kleinanzeigen: { label: 'Kleinanzeigen', color: '#BBDE14', icon: 'MessageCircle' },
  amazon: { label: 'Amazon', color: '#FF9900', icon: 'ShoppingCart' },
};
