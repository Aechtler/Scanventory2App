import { apiGet, apiPost, apiDelete } from '@/shared/services/apiClient';
import type { Campaign } from '../types/campaign.types';

interface CampaignPayload {
  name: string;
  itemIds: string[];
  startsAt: string | null;
  endsAt: string | null;
}

export const campaignService = {
  fetchAll: () => apiGet<Campaign[]>('/api/campaigns'),

  create: (payload: CampaignPayload) => apiPost<Campaign>('/api/campaigns', payload),

  delete: (id: string) => apiDelete<void>(`/api/campaigns/${id}`),
};
