import { useState, useEffect } from 'react';
import { getPublicProfile } from '../services/profileService';
import type { PublicProfile } from '../types/profile.types';

interface UsePublicProfileReturn {
  profile: PublicProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Lädt ein öffentliches Profil per ID oder @username.
 * Wird z.B. auf der fremden Profil-Seite verwendet.
 */
export function usePublicProfile(idOrUsername: string): UsePublicProfileReturn {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!idOrUsername) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getPublicProfile(idOrUsername)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Profil nicht gefunden');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idOrUsername, trigger]);

  const refetch = () => setTrigger((t) => t + 1);

  return { profile, loading, error, refetch };
}
