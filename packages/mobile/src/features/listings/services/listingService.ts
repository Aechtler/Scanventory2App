import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/services/apiClient';
import type { Listing, CreateListingInput } from '../types/listing.types';

interface UpdateListingPayload {
  status?: string;
  soldPrice?: number | null;
  soldAt?: string | null;
  fixedPrice?: number | null;
  startingPrice?: number | null;
  listingType?: string;
  externalUrl?: string | null;
}

export const listingService = {
  fetchAll: () => apiGet<Listing[]>('/api/listings'),

  create: (payload: Omit<CreateListingInput, 'productName' | 'imageFilename'>) =>
    apiPost<Listing>('/api/listings', payload),

  update: (id: string, payload: UpdateListingPayload) =>
    apiPut<Listing>(`/api/listings/${id}`, payload),

  delete: (id: string) => apiDelete<void>(`/api/listings/${id}`),
};
