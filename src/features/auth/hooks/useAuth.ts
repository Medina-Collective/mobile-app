import { useAuthStore } from '@store/auth.store';

/**
 * Convenience hook — exposes all auth state and actions.
 * Import this in components instead of useAuthStore directly.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);

  return { user, token, isAuthenticated, isLoading, signIn, signUp, signOut };
}
