import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useListAnnouncements,
  useGetAnnouncement,
  useMyAnnouncements,
  useCreateAnnouncement,
} from '../useAnnouncement';
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
  deadline: null,
  external_url: null,
  professionals: { business_name: 'Test Pro', logo_uri: null },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeQueryChain(resolveValue: { data: any; error: null | Error }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  for (const method of [
    'select',
    'eq',
    'lte',
    'gte',
    'in',
    'order',
    'insert',
    'single',
    'maybeSingle',
  ]) {
    chain[method] = jest.fn().mockReturnValue(chain);
  }
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
  useAuthStore.setState({ user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false });
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
});

// ── useListAnnouncements ──────────────────────────────────────────────────────

describe('useListAnnouncements', () => {
  it('fetches and maps announcement rows', async () => {
    const announcementsChain = makeQueryChain({ data: [mockRow], error: null });
    const participantsChain = makeQueryChain({ data: [], error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? announcementsChain : participantsChain,
    );

    const { result } = renderHook(() => useListAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe('Test Event');
  });

  it('applies typeFilter when provided', async () => {
    const chain = makeQueryChain({ data: [], error: null });
    const participantsChain = makeQueryChain({ data: [], error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? chain : participantsChain,
    );

    const { result } = renderHook(() => useListAnnouncements('activity_event'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.eq).toHaveBeenCalledWith('type', 'activity_event');
  });

  it('adds audience=public filter for non-pro users', async () => {
    const chain = makeQueryChain({ data: [], error: null });
    const participantsChain = makeQueryChain({ data: [], error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? chain : participantsChain,
    );

    const { result } = renderHook(() => useListAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.eq).toHaveBeenCalledWith('audience', 'public');
  });

  it('does NOT add audience filter for pro users', async () => {
    useAuthStore.setState({
      user: { ...mockUser, role: 'professional' as const },
      token: 'tok',
      isAuthenticated: true,
      isLoading: false,
    });
    const chain = makeQueryChain({ data: [], error: null });
    const participantsChain = makeQueryChain({ data: [], error: null });
    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? chain : participantsChain,
    );

    const { result } = renderHook(() => useListAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(chain.eq).not.toHaveBeenCalledWith('audience', 'public');
  });

  it('returns empty list when no data and skips participation lookup', async () => {
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useListAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('marks hasParticipated=true for matching participant', async () => {
    const announcementsChain = makeQueryChain({ data: [mockRow], error: null });
    const participantsChain = makeQueryChain({
      data: [{ announcement_id: 'ann-1' }],
      error: null,
    });
    mockFrom.mockImplementation((table: string) =>
      table === 'announcements' ? announcementsChain : participantsChain,
    );

    const { result } = renderHook(() => useListAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data![0].hasParticipated).toBe(true);
  });

  it('throws when supabase returns error', async () => {
    const chain = makeQueryChain({ data: null, error: new Error('DB error') });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useListAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useGetAnnouncement ────────────────────────────────────────────────────────

describe('useGetAnnouncement', () => {
  it('fetches and maps a single announcement', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'announcements') return makeQueryChain({ data: mockRow, error: null });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useGetAnnouncement('ann-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe('Test Event');
  });

  it('sets hasParticipated=true when participant record exists', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'announcements') return makeQueryChain({ data: mockRow, error: null });
      return makeQueryChain({ data: { announcement_id: 'ann-1' }, error: null });
    });

    const { result } = renderHook(() => useGetAnnouncement('ann-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.hasParticipated).toBe(true);
  });

  it('sets hasParticipated=false when no user is logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const chain = makeQueryChain({ data: mockRow, error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useGetAnnouncement('ann-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.hasParticipated).toBe(false);
  });

  it('throws when supabase returns error', async () => {
    const chain = makeQueryChain({ data: null, error: new Error('Not found') });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useGetAnnouncement('ann-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useMyAnnouncements ────────────────────────────────────────────────────────

describe('useMyAnnouncements', () => {
  const mockPro = {
    id: 'pro-1',
    business_name: 'My Business',
    logo_uri: null,
  };

  it('fetches announcements for the current pro user', async () => {
    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: mockPro, error: null });
      if (table === 'announcements') {
        callCount++;
        return makeQueryChain({ data: callCount === 1 ? [mockRow] : [], error: null });
      }
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useMyAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useMyAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('throws when professional profile fetch fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals')
        return makeQueryChain({ data: null, error: new Error('No profile') });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useMyAnnouncements(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useCreateAnnouncement ─────────────────────────────────────────────────────

describe('useCreateAnnouncement', () => {
  const mockFormData = {
    type: 'activity_event' as const,
    title: 'New Event',
    description: 'Description',
    visibilityStart: new Date('2026-03-01'),
    visibilityEnd: new Date('2026-04-01'),
    audience: 'public' as const,
    participationEnabled: false,
    location: undefined,
    eventStart: undefined,
    eventEnd: undefined,
    deadline: undefined,
    externalUrl: undefined,
    maxCapacity: undefined,
    coverImageUri: undefined,
  };

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(result.current.mutateAsync(mockFormData)).rejects.toThrow('Not authenticated');
    });
  });

  it('throws when professional profile not found', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals')
        return makeQueryChain({ data: null, error: new Error('No profile') });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(result.current.mutateAsync(mockFormData)).rejects.toThrow();
    });
  });

  it('inserts announcement successfully', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      if (table === 'announcements') return makeQueryChain({ data: mockRow, error: null });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      const data = await result.current.mutateAsync(mockFormData);
      expect(data.title).toBe('Test Event');
    });
  });

  it('throws when insert fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      return makeQueryChain({ data: null, error: new Error('Insert failed') });
    });

    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(result.current.mutateAsync(mockFormData)).rejects.toThrow();
    });
  });
});
