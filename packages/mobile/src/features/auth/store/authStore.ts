import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/shared/constants';

export interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  // Öffentliches Profil (Phase 1 — Social)
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isPublic?: boolean;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string | { code?: string; message?: string };
}

interface AuthPayload {
  user: User;
  token: string;
  refreshToken?: string;
}

interface ProfileFields {
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  isPublic?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User, token: string) => void;
  /** Aktualisiert Profil-Felder im lokalen State nach einem Profil-Update */
  setProfileFields: (fields: ProfileFields) => void;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const API_URL = API_CONFIG.BASE_URL;
const REQUEST_TIMEOUT_MS = 12000; // 12 Sekunden — danach Fehlermeldung statt endlosem Ladebalken

/** Wirft nach `ms` Millisekunden einen Timeout-Fehler */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Network error: request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const error = (payload as ApiEnvelope<unknown>).error;
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object' && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function unwrapEnvelope<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.success && envelope.data !== undefined) {
      return envelope.data;
    }
  }

  return payload as T;
}

async function authenticate(
  endpoint: '/api/auth/login' | '/api/auth/register',
  body: { email: string; password: string; name?: string },
  fallbackMessage: string,
  set: (partial: Partial<AuthState>) => void
): Promise<void> {
  const response = await withTimeout(
    fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const error = await response.json();
      message = getErrorMessage(error, message);
    } catch {
      // non-JSON response
    }
    throw new Error(message);
  }

  const payload = await response.json();
  const data = unwrapEnvelope<AuthPayload>(payload);

  if (!data?.token || !data?.user?.id) {
    throw new Error('Invalid server response');
  }

  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  if (data.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
  }

  set({
    user: data.user,
    token: data.token,
    isAuthenticated: true,
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },

  setProfileFields: (fields) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    }));
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });

      let token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // 401 = ungültiges/abgelaufenes Token → ausloggen oder Token refreshen
        if (response.status === 401) {
          const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshResponse.ok) {
                const refreshedPayload = await refreshResponse.json();
                const refreshedData = unwrapEnvelope<AuthPayload>(refreshedPayload);

                if (refreshedData?.token && refreshedData?.user?.id) {
                  // Save new tokens
                  token = refreshedData.token;
                  await SecureStore.setItemAsync(TOKEN_KEY, token);
                  if (refreshedData.refreshToken) {
                    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshedData.refreshToken);
                  }

                  set({ user: refreshedData.user, token, isAuthenticated: true, isLoading: false });
                  return; // Escape hier, der User ist erfolgreich eingeloggt
                }
              }
            } catch (err) {
              console.warn('Token refresh network error:', err);
              // Bei Netzwerk-Fehlern während des Refreshes lassen wir es auf false und behalten die Tokens
              set({ user: null, token: null, isAuthenticated: false, isLoading: false });
              return;
            }
          }

          // Refresh fehlgeschlagen oder nicht vorhanden
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        } else {
          // Server-Fehler (5xx) → Token behalten, als nicht authentifiziert markieren
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
        return;
      }

      const payload = await response.json();
      const user = unwrapEnvelope<User>(payload);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Netzwerkfehler → Token behalten
      console.error('Load user error:', error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      await authenticate('/api/auth/login', { email, password }, 'Login failed', set);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: failed to fetch');
      }
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      await authenticate('/api/auth/register', { email, password, name }, 'Registration failed', set);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: failed to fetch');
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));
