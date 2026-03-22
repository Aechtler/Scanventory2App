import { useState, useEffect, useRef } from 'react';
import { checkUsernameAvailability } from '../services/profileService';

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface UseUsernameCheckReturn {
  state: CheckState;
  reason?: string;
}

const DEBOUNCE_MS = 500;
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

/**
 * Prüft die Verfügbarkeit eines Usernames — debounced, live beim Tippen.
 * Gibt 'idle' zurück wenn der Input leer oder unveränderter Anfangswert ist.
 */
export function useUsernameCheck(
  username: string,
  /** Aktueller eigener Username — wird nicht geprüft (kein Netzwerk-Call) */
  currentUsername?: string | null
): UseUsernameCheckReturn {
  const [state, setState] = useState<CheckState>('idle');
  const [reason, setReason] = useState<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Leer oder gleich wie eigener aktueller Username → kein Check nötig
    if (!username || username === currentUsername) {
      setState('idle');
      setReason(undefined);
      return;
    }

    // Einfache Format-Vorprüfung client-seitig
    if (!USERNAME_REGEX.test(username)) {
      setState('invalid');
      setReason('3–30 Zeichen, nur Kleinbuchstaben, Zahlen und _');
      return;
    }

    setState('checking');
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(username);
        if (result.available) {
          setState('available');
          setReason(undefined);
        } else {
          setState('taken');
          setReason(result.reason ?? 'Bereits vergeben');
        }
      } catch {
        setState('idle'); // Fehler still ignorieren (Netzwerk etc.)
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [username, currentUsername]);

  return { state, reason };
}
