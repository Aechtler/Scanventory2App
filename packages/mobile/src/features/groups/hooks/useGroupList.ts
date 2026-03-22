import { useState, useEffect, useCallback } from 'react';
import { groupService } from '../services/groupService';
import type { GroupSummary, GroupInvitation } from '../types/group.types';

interface UseGroupListReturn {
  groups: GroupSummary[];
  invitations: GroupInvitation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Lädt eigene Gruppen + offene Einladungen des eingeloggten Users. */
export function useGroupList(): UseGroupListReturn {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([groupService.getMine(), groupService.getInvitations()])
      .then(([g, inv]) => {
        if (!cancelled) { setGroups(g); setInvitations(inv); }
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Fehler'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);
  return { groups, invitations, loading, error, refetch };
}
