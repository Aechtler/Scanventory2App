import { useState, useEffect, useCallback } from 'react';
import { sharingService } from '../services/sharingService';
import type { ReceivedItem } from '../types/sharing.types';

interface UseSharedWithMeReturn {
  items: ReceivedItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSharedWithMe(): UseSharedWithMeReturn {
  const [items, setItems] = useState<ReceivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    sharingService.getSharedWithMe()
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Fehler'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);
  return { items, loading, error, refetch };
}
