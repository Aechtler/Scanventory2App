export type ListingPlatform = 'ebay' | 'kleinanzeigen' | 'amazon';
export type ListingType = 'auction' | 'fixed_price' | 'negotiable';
export type ListingStatus = 'draft' | 'active' | 'sold' | 'cancelled';

export interface Listing {
  id: string;
  itemId: string;
  platform: ListingPlatform;
  listingType: ListingType;
  startingPrice: number | null;
  fixedPrice: number | null;
  status: ListingStatus;
  soldPrice: number | null;
  soldAt: string | null;
  externalUrl: string | null;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  // Vom Backend denormalisiert (aus Item-Relation)
  productName?: string;
  imageFilename?: string;
}

export interface PlatformRecommendation {
  platform: 'ebay' | 'amazon' | 'vinted';
  listingType: 'auction' | 'fixed_price';
  suggestedPrice: number;
  reasoning: string;
}

export interface CreateListingInput {
  itemId: string;
  platform: ListingPlatform;
  listingType: ListingType;
  startingPrice?: number | null;
  fixedPrice?: number | null;
  status: ListingStatus;
  externalUrl?: string | null;
  // Lokal für optimistisches UI
  productName?: string;
  imageFilename?: string;
}
