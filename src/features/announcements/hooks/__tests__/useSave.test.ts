import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSave } from '../useSave';
import { useSavedStore } from '@store/saved.store';
import { useRecommendationsStore } from '@store/recommendations.store';
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
  useSavedStore.setState({ savedIds: [] });
  useRecommendationsStore.setState({ typeScores: {}, signalCount: 0, openCounts: {} });
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

describe('useSave', () => {
  it('returns isSaved=false when not in saved store', () => {
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isSaved).toBe(false);
  });

  it('returns isSaved=true when id is in saved store', () => {
    useSavedStore.setState({ savedIds: ['ann-1'] });
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isSaved).toBe(true);
  });

  it('optimistically adds id to store on toggle when not saved', () => {
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    act(() => result.current.toggle());
    expect(useSavedStore.getState().savedIds).toContain('ann-1');
  });

  it('records save signal when not saved and toggled', () => {
    const { result } = renderHook(() => useSave('ann-1', 'halaqa'), {
      wrapper: createWrapper(),
    });
    act(() => result.current.toggle());
    expect(useRecommendationsStore.getState().signalCount).toBe(1);
  });

  it('does not record signal when already saved and toggled', () => {
    useSavedStore.setState({ savedIds: ['ann-1'] });
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    act(() => result.current.toggle());
    expect(useRecommendationsStore.getState().signalCount).toBe(0);
  });

  it('calls supabase insert when not saved', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: insertMock });
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    await act(async () => result.current.toggle());
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('calls supabase delete when already saved', async () => {
    useSavedStore.setState({ savedIds: ['ann-1'] });
    const eqMock = jest.fn();
    eqMock.mockReturnValueOnce({ eq: eqMock }).mockReturnValueOnce({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    mockFrom.mockReturnValue({ delete: deleteMock, eq: eqMock });

    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    await act(async () => result.current.toggle());
    expect(deleteMock).toHaveBeenCalled();
  });

  it('rolls back optimistic update on error', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
    });
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    await act(async () => result.current.toggle());
    await waitFor(() => expect(useSavedStore.getState().savedIds).not.toContain('ann-1'));
  });

  it('throws when userId is not set', async () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    const insertMock = jest.fn();
    mockFrom.mockReturnValue({ insert: insertMock });
    const { result } = renderHook(() => useSave('ann-1', 'activity_event'), {
      wrapper: createWrapper(),
    });
    // toggle optimistically updates store; mutation will fail because no userId
    await act(async () => result.current.toggle());
    // Store rolls back on error
    await waitFor(() => expect(useSavedStore.getState().savedIds).not.toContain('ann-1'));
  });
});
