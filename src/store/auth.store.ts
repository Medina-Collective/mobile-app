import { create } from 'zustand';
import { supabase } from '@services/supabase.client';
import { USER_ROLES, type UserRole } from '@constants/index';
import type { User } from '@app-types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

function mapSupabaseUser(u: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  created_at: string;
}): User {
  const appRole = u.app_metadata?.['role'] as string | undefined;
  let role: UserRole = USER_ROLES.USER;
  if (appRole === 'admin') role = USER_ROLES.ADMIN;
  else if (appRole === 'professional') role = USER_ROLES.PROFESSIONAL;
  return {
    id: u.id,
    email: u.email ?? '',
    displayName:
      (u.user_metadata?.['display_name'] as string | undefined) ?? u.email?.split('@')[0] ?? '',
    role,
    createdAt: u.created_at,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({
        user: mapSupabaseUser(data.user),
        token: data.session.access_token,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      if (data.session && data.user) {
        set({
          user: mapSupabaseUser(data.user),
          token: data.session.access_token,
          isAuthenticated: true,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrateFromStorage: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      set({
        user: mapSupabaseUser(session.user),
        token: session.access_token,
        isAuthenticated: true,
      });
    }
  },
}));
