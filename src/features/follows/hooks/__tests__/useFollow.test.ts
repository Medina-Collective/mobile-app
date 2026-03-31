import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFollow } from '../useFollow';
import { useFollowsStore } from '@store/follows.store';
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
  useFollowsStore.setState({ followedIds: [] });
  useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false });
  mockFrom.mockReturnValue({
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useFollow', () => {
  it('returns isFollowing=false when not following', () => {
    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    expect(result.current.isFollowing).toBe(false);
  });

  it('returns isFollowing=true when already following', () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });
    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    expect(result.current.isFollowing).toBe(true);
  });

  it('optimistically flips isFollowing on toggle', () => {
    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    act(() => result.current.toggle());
    expect(result.current.isFollowing).toBe(true);
  });

  it('calls insert when not yet following', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: insertMock });
    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    await act(async () => result.current.toggle());
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('calls delete path when already following', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });
    const eqMock = jest.fn();
    eqMock
      .mockReturnValueOnce({ delete: jest.fn().mockReturnThis(), eq: eqMock })
      .mockReturnValueOnce({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    mockFrom.mockReturnValue({ delete: deleteMock, eq: eqMock });

    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    await act(async () => result.current.toggle());
    expect(deleteMock).toHaveBeenCalled();
  });

  it('rolls back optimistic update when Supabase returns error', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
    });
    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isFollowing).toBe(false));
  });

  it('throws Not authenticated when no user is logged in', async () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isFollowing).toBe(false));
  });

  it('isToggling is true during mutation', async () => {
    let resolve!: (v: { error: null }) => void;
    const slowInsert = jest.fn().mockReturnValue(
      new Promise<{ error: null }>((r) => {
        resolve = r;
      }),
    );
    mockFrom.mockReturnValue({ insert: slowInsert });

    const { result } = renderHook(() => useFollow('pro-1'), { wrapper: createWrapper() });
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isToggling).toBe(true));
    resolve({ error: null });
  });
});
