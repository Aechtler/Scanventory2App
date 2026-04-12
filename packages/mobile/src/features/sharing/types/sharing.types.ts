export type ShareTargetType = 'user' | 'group';
export type SharePermission = 'VIEW' | 'COMMENT';

export interface ShareTarget {
  type: ShareTargetType;
  id: string;
  name: string;
  avatarUrl?: string | null;
  subtitle?: string | null;
}

export interface SharedItemResult {
  shareId: string;
  itemId: string;
  sharedById: string;
  targetType: ShareTargetType;
  targetId: string;
  permission: SharePermission;
  sharedAt: string;
}

/** Ein Item das jemand anders mit MIR geteilt hat */
export interface ReceivedItem {
  shareId: string;
  itemId: string;
  sharedById: string;
  sharedByUsername: string | null;
  sharedByDisplayName: string | null;
  sharedByAvatarUrl: string | null;
  permission: SharePermission;
  sharedAt: string;
  productName: string;
  category: string;
  brand: string | null;
  condition: string;
  imageFilename: string;
  imageUrl: string;           // Supabase Storage CDN URL
  priceStats: unknown;
  scannedAt: string;
}
