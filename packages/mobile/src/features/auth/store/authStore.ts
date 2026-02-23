import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/shared/constants';

export interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string | { code?: string; message?: string };
}

interface AuthPayload {
  user: User;
  token: string;
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
}

const TOKEN_KEY = 'auth_token';
const API_URL = API_CONFIG.BASE_URL;

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
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

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

  loadUser: async () => {
    try {
      set({ isLoading: true });

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
        // 401 = ungültiges/abgelaufenes Token → ausloggen
        if (response.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
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
      // Netzwerkfehler → Token behalten, User wird zum Login weitergeleitet
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
