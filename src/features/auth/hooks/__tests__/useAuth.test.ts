import { renderHook } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@store/auth.store';

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
  });
});

describe('useAuth', () => {
  it('returns initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('reflects store state when user is set', () => {
    const mockUser = {
      id: 'user-1',
      email: 'a@b.com',
      displayName: 'A',
      role: 'user' as const,
      createdAt: '2026-01-01',
    };
    useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true });
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('tok');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('exposes signIn, signUp, and signOut functions', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });
});
