import { useState, useCallback } from 'react';
import { updateProfile } from '../services/profileService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ProfileUpdatePayload, PublicProfile } from '../types/profile.types';

interface UseProfileReturn {
  updating: boolean;
  error: string | null;
  update: (payload: ProfileUpdatePayload) => Promise<PublicProfile>;
  clearError: () => void;
}

/**
 * Hook zum Bearbeiten des eigenen Profils.
 * Aktualisiert nach Erfolg den globalen authStore.
 */
export function useProfile(): UseProfileReturn {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setProfileFields = useAuthStore((s) => s.setProfileFields);

  const update = useCallback(
    async (payload: ProfileUpdatePayload): Promise<PublicProfile> => {
      setUpdating(true);
      setError(null);
      try {
        const profile = await updateProfile(payload);
        // Globalen User-State synchron halten
        setProfileFields({
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          isPublic: profile.isPublic,
        });
        return profile;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unbekannter Fehler';
        setError(msg);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [setProfileFields]
  );

  const clearError = useCallback(() => setError(null), []);

  return { updating, error, update, clearError };
}
