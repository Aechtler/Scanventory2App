import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { syncFetchFollowingItems, type FollowingItem } from '../services/syncService';

export type { FollowingItem };

export function useFollowingItems() {
  const [items, setItems] = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const activeRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const result = await syncFetchFollowingItems();
    if (activeRef.current && result) setItems(result);
    if (activeRef.current) setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      activeRef.current = true;
      fetch();
      return () => { activeRef.current = false; };
    }, [fetch])
  );

  return { items, loading, refetch: fetch };
}
