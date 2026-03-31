import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useParticipation } from '../useParticipation';
import { useAuthStore } from '@store/auth.store';
import { supabase } from '@services/supabase.client';
import type { Announcement } from '@app-types/announcement';

const mockFrom = supabase.from as jest.Mock;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test',
  role: 'user' as const,
  createdAt: '2026-01-01',
};

function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  return {
    id: 'ann-1',
    type: 'activity_event',
    title: 'Test Event',
    description: undefined,
    location: undefined,
    coverImageUrl: undefined,
    visibilityStart: '2026-03-01T00:00:00Z',
    visibilityEnd: '2026-04-01T00:00:00Z',
    eventStart: undefined,
    eventEnd: undefined,
    deadline: undefined,
    externalUrl: undefined,
    professionalId: 'pro-1',
    professionalName: 'Test Pro',
    professionalLogoUrl: undefined,
    audience: 'public',
    participationEnabled: true,
    participantCount: 5,
    maxCapacity: undefined,
    hasParticipated: false,
    isSaved: false,
    openCount: 0,
    status: 'published',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function createWrapper(queryClient?: QueryClient) {
  const qc =
    queryClient ??
    new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false });
  mockFrom.mockReturnValue({
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
});

describe('useParticipation', () => {
  it('returns isParticipating=false when no cache data', () => {
    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isParticipating).toBe(false);
    expect(result.current.isToggling).toBe(false);
  });

  it('reads isParticipating=true from detail cache', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(
      ['announcements', 'ann-1'],
      makeAnnouncement({ hasParticipated: true }),
    );

    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isParticipating).toBe(true);
  });

  it('reads isParticipating from list cache when detail cache is missing', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(
      ['announcements'],
      [makeAnnouncement({ id: 'ann-1', hasParticipated: true })],
    );

    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isParticipating).toBe(true);
  });

  it('optimistically flips isParticipating when toggling', async () => {
    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(),
    });
    expect(result.current.isParticipating).toBe(false);
    act(() => result.current.toggle());
    // optimistic update happens synchronously via onMutate
    await waitFor(() => expect(result.current.isToggling).toBe(false));
  });

  it('calls insert when not yet participating', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      insert: insertMock,
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => result.current.toggle());
    await waitFor(() => expect(insertMock).toHaveBeenCalled());
  });

  it('calls delete when already participating', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(
      ['announcements', 'ann-1'],
      makeAnnouncement({ hasParticipated: true }),
    );

    const deleteMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ delete: deleteMock, eq: eqMock });

    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isParticipating).toBe(true);
    await act(async () => result.current.toggle());
    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
  });

  it('throws Not authenticated when no user', async () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(),
    });
    // Should not crash — mutation will fail internally
    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isToggling).toBe(false));
  });

  it('rolls back detail cache on error', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const ann = makeAnnouncement({ hasParticipated: false, participantCount: 5 });
    queryClient.setQueryData(['announcement', 'ann-1'], ann);

    mockFrom.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
    });

    const { result } = renderHook(() => useParticipation('ann-1'), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => result.current.toggle());
    await waitFor(() => expect(result.current.isToggling).toBe(false));

    // Cache should be restored to original value after rollback
    const cached = queryClient.getQueryData<Announcement>(['announcement', 'ann-1']);
    expect(cached?.hasParticipated).toBe(false);
  });
});
