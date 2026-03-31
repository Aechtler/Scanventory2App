/**
 * Backend API Types
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SearchQueries {
  ebay?: string;
  kleinanzeigen?: string;
  amazon?: string;
  idealo?: string;
  generic?: string;
}

export interface MarketListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  imageUrl: string;
  itemUrl: string;
  sold: boolean;
  marketplace?: string;
  selected?: boolean;
}

export interface PriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  totalListings: number;
  soldListings: number;
}

export type MarketValueConfidence = 'hoch' | 'mittel' | 'niedrig';

export interface MarketValueResult {
  estimatedPrice: string;
  priceRange: string;
  confidence: MarketValueConfidence;
  sources: string[];
  summary: string;
  rawResponse: string;
}

// ─── Kategorie-Types ──────────────────────────────────────────────────────────

export interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  iconName: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

export interface CreateCategoryBody {
  name: string;
  parentId?: string | null;
  iconName?: string | null;
  sortOrder?: number;
}

export interface UpdateCategoryBody {
  name?: string;
  iconName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

// ─── Item-Types ───────────────────────────────────────────────────────────────

/** Body beim Erstellen eines neuen Items (Multipart: JSON als `data` Feld) */
export interface CreateItemBody {
  productName: string;
  category: string;
  brand?: string | null;
  condition: string;
  confidence: number;
  gtin?: string | null;
  searchQuery: string;
  searchQueries?: SearchQueries;
  originalUri?: string;
  priceStats?: PriceStats;
  ebayListings?: MarketListing[];
  ebayListingsFetchedAt?: string;
  kleinanzeigenListings?: MarketListing[];
  kleinanzeigenListingsFetchedAt?: string;
  marketValue?: MarketValueResult;
  marketValueFetchedAt?: string;
  finalPrice?: number | null;
  finalPriceNote?: string | null;
  scannedAt: string;
}

/** Body beim Aktualisieren der Preisdaten */
export interface UpdatePricesBody {
  priceStats: PriceStats;
  ebayListings?: MarketListing[];
}

/** Body beim Aktualisieren der Kleinanzeigen-Preisdaten */
export interface UpdateKleinanzeigenPricesBody {
  kleinanzeigenListings: MarketListing[];
}

/** Body beim Aktualisieren des Marktwerts */
export interface UpdateMarketValueBody {
  marketValue: MarketValueResult;
}
