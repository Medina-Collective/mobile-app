import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFollowedAnnouncements } from '../useFollowedAnnouncements';
import { useFollowsStore } from '@store/follows.store';
import { useAuthStore } from '@store/auth.store';
import { supabase } from '@services/supabase.client';

const mockFrom = supabase.from as jest.Mock;
const mockGetUser = supabase.auth.getUser as jest.Mock;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test',
  role: 'user' as const,
  createdAt: '2026-01-01',
};

const mockRow = {
  id: 'ann-1',
  professional_id: 'pro-1',
  type: 'activity_event',
  title: 'Test Event',
  description: null,
  cover_image_url: null,
  location: null,
  event_start: null,
  event_end: null,
  visibility_start: '2026-01-01T00:00:00Z',
  visibility_end: '2026-12-31T00:00:00Z',
  audience: 'public',
  participation_enabled: false,
  max_capacity: null,
  participant_count: 0,
  status: 'published',
  created_at: '2026-01-01T00:00:00Z',
  professionals: { business_name: 'Test Pro', logo_uri: null },
};

/**
 * Creates a chainable query builder mock that is also thenable (awaitable).
 * This mirrors how Supabase query builders work: methods are chainable until you
 * `await` the builder, at which point it resolves to { data, error }.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeQueryChain(resolveValue: { data: any; error: null | Error }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  for (const method of ['select', 'eq', 'lte', 'gte', 'in', 'order']) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }
  // Make the chain thenable so `await chain` resolves
  chain.then = (resolve: (v: typeof resolveValue) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(resolveValue).then(resolve, reject);
  return chain;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  useFollowsStore.setState({ followedIds: [] });
  useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false });
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
});

describe('useFollowedAnnouncements', () => {
  it('returns empty array immediately when user follows nobody', async () => {
    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('fetches announcements when user follows professionals', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });

    const announcementsChain = makeQueryChain({ data: [mockRow], error: null });
    const participantsChain = makeQueryChain({ data: [], error: null });

    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? announcementsChain : participantsChain,
    );

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]!.title).toBe('Test Event');
  });

  it('filters pro-only announcements for non-pro users (adds audience=public filter)', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });

    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.eq).toHaveBeenCalledWith('audience', 'public');
  });

  it('does not add audience filter for pro users', async () => {
    useAuthStore.setState({
      user: { ...mockUser, role: 'professional' as const },
      token: 'tok',
      isAuthenticated: true,
      isLoading: false,
    });
    useFollowsStore.setState({ followedIds: ['pro-1'] });

    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.eq).not.toHaveBeenCalledWith('audience', 'public');
  });

  it('returns empty array when query returns no rows', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });

    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('marks hasParticipated=true for announcements user participated in', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });

    const announcementsChain = makeQueryChain({ data: [mockRow], error: null });
    const participantsChain = makeQueryChain({
      data: [{ announcement_id: 'ann-1' }],
      error: null,
    });

    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? announcementsChain : participantsChain,
    );

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0]!.hasParticipated).toBe(true);
  });

  it('handles the case where no user is returned by getUser (hasParticipated=false)', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const announcementsChain = makeQueryChain({ data: [mockRow], error: null });
    mockFrom.mockReturnValue(announcementsChain);

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0]!.hasParticipated).toBe(false);
  });

  it('throws when Supabase returns an error', async () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });

    const chain = makeQueryChain({ data: null, error: new Error('DB error') });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useFollowedAnnouncements(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
