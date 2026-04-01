import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { syncFetchFollowingItems, type FollowingItem } from '../services/syncService';

export type { FollowingItem };

export function useFollowingItems() {
  const [items, setItems] = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const result = await syncFetchFollowingItems();
    if (result) setItems(result);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  return { items, loading, refetch: fetch };
}
