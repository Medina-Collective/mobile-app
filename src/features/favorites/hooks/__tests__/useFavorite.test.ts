import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFavorite } from '../useFavorite';
import { useFavoritesStore } from '@store/favorites.store';

jest.mock('@services/api.client', () => ({
  apiClient: {
    post: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  useFavoritesStore.setState({ favoritedIds: [] });
});

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
