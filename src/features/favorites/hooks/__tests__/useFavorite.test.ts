import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFavorite } from '../useFavorite';
import { useFavoritesStore } from '@store/favorites.store';
import { supabase } from '@services/supabase.client';

const mockFrom = supabase.from as jest.Mock;

// Stub Supabase insert/delete to resolve successfully
beforeEach(() => {
  mockFrom.mockReturnValue({
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
  useFavoritesStore.setState({ favoritedIds: [] });
});

// Stub auth so useFavorite can get a user id
jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
  data: { user: { id: 'user-1' } as never },
  error: null,
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
});
