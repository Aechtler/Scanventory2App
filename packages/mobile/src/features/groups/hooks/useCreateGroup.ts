import { useState, useCallback } from 'react';
import { groupService } from '../services/groupService';
import type { GroupSummary, CreateGroupPayload } from '../types/group.types';

interface UseCreateGroupReturn {
  creating: boolean;
  error: string | null;
  create: (payload: CreateGroupPayload) => Promise<GroupSummary>;
  clearError: () => void;
}

export function useCreateGroup(): UseCreateGroupReturn {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreateGroupPayload): Promise<GroupSummary> => {
    if (!payload.name.trim()) throw new Error('Name ist erforderlich');
    setCreating(true);
    setError(null);
    try {
      return await groupService.create(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gruppe konnte nicht erstellt werden';
      setError(msg);
      throw e;
    } finally {
      setCreating(false);
    }
  }, []);

  return { creating, error, create, clearError: () => setError(null) };
}
