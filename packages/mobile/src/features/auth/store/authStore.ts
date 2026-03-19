import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/shared/constants';

export interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User, token: string) => void;
}

const TOKEN_KEY = 'auth_token';
const API_URL = API_CONFIG.BASE_URL;

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

      // Load token from secure storage
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return;
      }

      // Fetch user from API
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Invalid token, clear it
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const user = await response.json();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Load user error:', error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = 'Login failed';
        try {
          const error = await response.json();
          message = error.error || message;
        } catch { /* non-JSON response */ }
        throw new Error(message);
      }

      const data = await response.json();

      if (!data?.token || !data?.user?.id) {
        throw new Error('Invalid server response');
      }

      // Save token to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        let message = 'Registration failed';
        try {
          const error = await response.json();
          message = error.error || message;
        } catch { /* non-JSON response */ }
        throw new Error(message);
      }

      const data = await response.json();

      if (!data?.token || !data?.user?.id) {
        throw new Error('Invalid server response');
      }

      // Save token to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear token from secure storage
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
