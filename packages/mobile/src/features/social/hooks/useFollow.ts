import { useState, useCallback } from 'react';
import { followUser, unfollowUser } from '../services/followService';

interface UseFollowReturn {
  isFollowing: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
}

/**
 * Verwaltet den Follow-State für einen einzelnen User.
 * Optimistisches Update: State wechselt sofort, Rollback bei Fehler.
 */
export function useFollow(userId: string, initialIsFollowing: boolean): UseFollowReturn {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading) return;

    // Optimistisches Update
    const prev = isFollowing;
    setIsFollowing(!prev);
    setLoading(true);

    try {
      if (prev) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch {
      // Rollback bei Fehler
      setIsFollowing(prev);
    } finally {
      setLoading(false);
    }
  }, [userId, isFollowing, loading]);

  return { isFollowing, loading, toggle };
}
