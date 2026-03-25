import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFavorite } from '../useFavorite';
import { useFavoritesStore } from '@store/favorites.store';
import { useAuthStore } from '@store/auth.store';
import { supabase } from '@services/supabase.client';

const mockFrom = supabase.from as jest.Mock;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test',
  role: 'user' as const,
  createdAt: '2026-01-01',
};

beforeEach(() => {
  mockFrom.mockReturnValue({
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
  useFavoritesStore.setState({ favoritedIds: [] });
  useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false });
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useFavorite', () => {
  it('returns false when the professional is not favorited', () => {
    const { result } = renderHook(() => useFavorite('1'), { wrapper: createWrapper() });
    expect(result.current.isFavorited).toBe(false);
  });

  it('optimistically flips to true on toggle', () => {
    const { result } = renderHook(() => useFavorite('1'), { wrapper: createWrapper() });
    act(() => result.current.toggle());
    expect(result.current.isFavorited).toBe(true);
  });

  it('optimistically flips back to false on second toggle', () => {
    const { result } = renderHook(() => useFavorite('1'), { wrapper: createWrapper() });
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.isFavorited).toBe(false);
  });

  it('calls delete path when already favorited', async () => {
    useFavoritesStore.setState({ favoritedIds: ['1'] });
    // Build a chainable mock: delete().eq().eq() resolves at the end
    const chain: { delete: jest.Mock; eq: jest.Mock } = {
      delete: jest.fn(),
      eq: jest.fn(),
    };
    chain.delete.mockReturnValue(chain);
    chain.eq
      .mockReturnValueOnce(chain) // first .eq() → chainable
      .mockResolvedValueOnce({ error: null }); // second .eq() → resolves
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useFavorite('1'), { wrapper: createWrapper() });
    expect(result.current.isFavorited).toBe(true);
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isFavorited).toBe(false));
    expect(chain.delete).toHaveBeenCalled();
  });

  it('rolls back optimistic update when Supabase returns an error', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const { result } = renderHook(() => useFavorite('1'), { wrapper: createWrapper() });
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isFavorited).toBe(false));
  });

  it('throws Not authenticated when no user is logged in', async () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    const { result } = renderHook(() => useFavorite('1'), { wrapper: createWrapper() });
    // Optimistic toggle fires, then mutation throws, rolling it back
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isFavorited).toBe(false));
  });
});
