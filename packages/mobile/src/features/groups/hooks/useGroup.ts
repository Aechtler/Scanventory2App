import { useState, useEffect, useCallback } from 'react';
import { groupService } from '../services/groupService';
import type { GroupSummary, GroupMember } from '../types/group.types';

interface UseGroupReturn {
  group: GroupSummary | null;
  members: GroupMember[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Lädt Detail + Mitglieder einer Gruppe. */
export function useGroup(groupId: string): UseGroupReturn {
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([groupService.getById(groupId), groupService.getMembers(groupId)])
      .then(([g, m]) => { if (!cancelled) { setGroup(g); setMembers(m); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Fehler'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [groupId, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);
  return { group, members, loading, error, refetch };
}
