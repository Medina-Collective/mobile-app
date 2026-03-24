import { create } from 'zustand';
import { storage } from '@utils/storage';
import { STORAGE_KEYS, USER_ROLES } from '@constants/index';
import type { User } from '@app-types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email, _password) => {
    set({ isLoading: true });
    try {
      // TODO: replace with real API call via apiClient
      const mockToken = 'mock-token';
      const mockUser: User = {
        id: '1',
        email,
        displayName: email.split('@')[0] ?? email,
        role: USER_ROLES.USER,
        createdAt: new Date().toISOString(),
      };
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      set({ user: mockUser, token: mockToken, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrateFromStorage: async () => {
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token !== null) {
      set({ token, isAuthenticated: true });
    }
  },
}));
