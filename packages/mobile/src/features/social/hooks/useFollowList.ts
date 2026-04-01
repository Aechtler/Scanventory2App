import { useState, useEffect, useCallback } from 'react';
import { getFollowers, getFollowing } from '../services/followService';
import type { PublicProfile } from '../types/profile.types';

interface UseFollowListReturn {
  users: PublicProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Lädt die Follower-Liste eines Users */
export function useFollowers(userId: string): UseFollowListReturn {
  return useFollowList(userId, 'followers');
}

/** Lädt die Following-Liste eines Users */
export function useFollowing(userId: string): UseFollowListReturn {
  return useFollowList(userId, 'following');
}

function useFollowList(
  userId: string,
  type: 'followers' | 'following'
): UseFollowListReturn {
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    const fn = type === 'followers' ? getFollowers : getFollowing;
    fn(userId)
      .then((list) => { if (!cancelled) setUsers(list); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Fehler');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId, type, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);
  return { users, loading, error, refetch };
}
