import { useState, useEffect, useRef } from 'react';
import { searchUsers } from '../services/profileService';
import type { PublicProfile } from '../types/profile.types';

type SearchState = 'idle' | 'loading' | 'results' | 'empty' | 'error';

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: PublicProfile[];
  state: SearchState;
  clear: () => void;
}

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

/**
 * Suche nach Usern mit Debounce.
 * state: 'idle' = noch nicht gesucht, 'empty' = keine Ergebnisse.
 */
export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query || query.trim().length < MIN_QUERY_LENGTH) {
      setState('idle');
      setResults([]);
      return;
    }

    setState('loading');

    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchUsers(query.trim());
        setResults(data);
        setState(data.length > 0 ? 'results' : 'empty');
      } catch {
        setState('error');
        setResults([]);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setState('idle');
  };

  return { query, setQuery, results, state, clear };
}
