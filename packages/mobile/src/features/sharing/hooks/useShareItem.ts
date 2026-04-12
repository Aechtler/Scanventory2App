import { useState, useCallback } from 'react';
import { sharingService } from '../services/sharingService';
import type { SharedItemResult, ShareTargetType, SharePermission } from '../types/sharing.types';

interface UseShareItemReturn {
  sharing: boolean;
  error: string | null;
  share: (itemId: string, targetType: ShareTargetType, targetId: string, permission?: SharePermission) => Promise<SharedItemResult>;
  clearError: () => void;
}

export function useShareItem(): UseShareItemReturn {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async (
    itemId: string,
    targetType: ShareTargetType,
    targetId: string,
    permission: SharePermission = 'VIEW'
  ): Promise<SharedItemResult> => {
    setSharing(true);
    setError(null);
    try {
      return await sharingService.share(itemId, targetType, targetId, permission);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Teilen fehlgeschlagen';
      setError(msg);
      throw e;
    } finally {
      setSharing(false);
    }
  }, []);

  return { sharing, error, share, clearError: () => setError(null) };
}
