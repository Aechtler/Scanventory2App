export interface Campaign {
  id: string;
  name: string;
  itemIds: string[];
  startsAt: string | null; // ISO date string
  endsAt: string | null;   // ISO date string
  createdAt: string;
}

export interface CampaignDraft {
  name: string;
  itemIds: string[];
  startsAt: string | null;
  endsAt: string | null;
}
