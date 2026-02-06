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

/** Body beim Erstellen eines neuen Items (Multipart: JSON als `data` Feld) */
export interface CreateItemBody {
  productName: string;
  category: string;
  brand?: string | null;
  condition: string;
  confidence: number;
  gtin?: string | null;
  searchQuery: string;
  searchQueries?: Record<string, string>;
  originalUri?: string;
  priceStats?: Record<string, unknown>;
  ebayListings?: unknown[];
  ebayListingsFetchedAt?: string;
  kleinanzeigenListings?: unknown[];
  kleinanzeigenListingsFetchedAt?: string;
  marketValue?: Record<string, unknown>;
  marketValueFetchedAt?: string;
  scannedAt: string;
}

/** Body beim Aktualisieren der Preisdaten */
export interface UpdatePricesBody {
  priceStats: Record<string, unknown>;
  ebayListings?: unknown[];
}

/** Body beim Aktualisieren der Kleinanzeigen-Preisdaten */
export interface UpdateKleinanzeigenPricesBody {
  kleinanzeigenListings: unknown[];
}

/** Body beim Aktualisieren des Marktwerts */
export interface UpdateMarketValueBody {
  marketValue: Record<string, unknown>;
}
