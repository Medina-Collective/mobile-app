import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotifications } from '../useNotifications';
import { useAuthStore } from '@store/auth.store';
import { supabase } from '@services/supabase.client';

const mockFrom = supabase.from as jest.Mock;

// Mock the real-time channel to prevent open handles
const mockSubscribe = jest.fn().mockReturnThis();
const mockOn = jest.fn().mockReturnThis();
const mockChannel = { on: mockOn, subscribe: mockSubscribe };
const mockRemoveChannel = jest.fn().mockResolvedValue(undefined);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(supabase as any).channel = jest.fn().mockReturnValue(mockChannel);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(supabase as any).removeChannel = mockRemoveChannel;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test',
  role: 'user' as const,
  createdAt: '2026-01-01',
};

const mockRows = [
  {
    id: 'n-1',
    user_id: 'user-1',
    type: 'announcement',
    title: 'Hello',
    subtitle: 'World',
    announcement_id: 'ann-1',
    read: false,
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min ago
  },
  {
    id: 'n-2',
    user_id: 'user-1',
    type: 'event_reminder',
    title: 'Reminder',
    subtitle: 'Event tomorrow',
    announcement_id: 'ann-2',
    read: true,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(), // 2 hrs ago
  },
  {
    id: 'n-3',
    user_id: 'user-1',
    type: 'community',
    title: 'Community',
    subtitle: 'Update',
    announcement_id: null,
    read: false,
    created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(), // 3 days ago
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false });
  mockFrom.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: mockRows, error: null }),
    update: jest.fn().mockReturnThis(),
  });
  mockRemoveChannel.mockClear();
  mockSubscribe.mockReturnThis();
});

describe('useNotifications', () => {
  it('returns empty array while loading', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(result.current.notifications).toEqual([]);
  });

  it('returns notifications after fetch', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toHaveLength(3);
  });

  it('computes unreadCount correctly', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // n-1 and n-3 are unread
    expect(result.current.unreadCount).toBe(2);
  });

  it('formats time as minutes when < 60 min', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications[0]?.time).toMatch(/m ago/);
  });

  it('formats time as hours when >= 60 min and < 24h', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications[1]?.time).toMatch(/h ago/);
  });

  it('formats time as days when >= 24h', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications[2]?.time).toMatch(/d ago/);
  });

  it('does not fetch when userId is absent', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.notifications).toEqual([]);
  });

  it('markAllRead calls mutation', async () => {
    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: updateMock.mockReturnValue({ eq: eqMock.mockReturnValue({ eq: eqMock }) }),
    });

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => result.current.markAllRead());
    await waitFor(() => expect(updateMock).toHaveBeenCalled());
  });
});
