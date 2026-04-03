import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useListAnnouncements,
  useGetAnnouncement,
  useMyAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useAnnouncementsByProfessional,
  useCurrentProfessionalId,
  fromDbType,
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
    'update',
    'delete',
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
    expect(result.current.data![0]!.title).toBe('Test Event');
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
    expect(result.current.data![0]!.hasParticipated).toBe(true);
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
    type: 'event' as const,
    title: 'New Event',
    description: 'Description',
    category: 'Events & Activities',
    girlsOnly: false,
    isFree: true,
    visibilityStart: new Date('2026-03-01'),
    visibilityEnd: new Date('2026-04-01'),
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

  it('combines eventDate and eventTime into eventStart for event type', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      if (table === 'announcements') return makeQueryChain({ data: mockRow, error: null });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      const data = await result.current.mutateAsync({
        ...mockFormData,
        type: 'event',
        eventDate: new Date('2026-06-15'),
        eventTime: new Date('2026-06-15T14:30:00'),
      });
      expect(data.title).toBe('Test Event');
    });
  });
});

// ── fromDbType ─────────────────────────────────────────────────────────────────

describe('fromDbType', () => {
  it('maps limited_offer → offer', () => {
    expect(fromDbType('limited_offer')).toBe('offer');
  });

  it('maps other → update', () => {
    expect(fromDbType('other')).toBe('update');
  });

  it('maps activity_event → event', () => {
    expect(fromDbType('activity_event')).toBe('event');
  });

  it('maps bazaar → event (fallback)', () => {
    expect(fromDbType('bazaar')).toBe('event');
  });

  it('maps brand_popup → event (fallback)', () => {
    expect(fromDbType('brand_popup')).toBe('event');
  });

  it('maps halaqa → event (fallback)', () => {
    expect(fromDbType('halaqa')).toBe('event');
  });

  it('maps any unknown string → event (fallback)', () => {
    expect(fromDbType('unknown_type')).toBe('event');
  });
});

// ── useAnnouncementsByProfessional ────────────────────────────────────────────

describe('useAnnouncementsByProfessional', () => {
  it('fetches announcements for a given professional id', async () => {
    const chain = makeQueryChain({ data: [mockRow], error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useAnnouncementsByProfessional('pro-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]!.title).toBe('Test Event');
  });

  it('returns empty list when no announcements found', async () => {
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useAnnouncementsByProfessional('pro-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('throws when supabase returns error', async () => {
    const chain = makeQueryChain({ data: null, error: new Error('DB error') });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useAnnouncementsByProfessional('pro-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('does not fetch when professionalId is empty', () => {
    const chain = makeQueryChain({ data: [], error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useAnnouncementsByProfessional(''), {
      wrapper: createWrapper(),
    });
    // enabled: false means query won't run — stays in idle state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

// ── useCurrentProfessionalId ──────────────────────────────────────────────────

describe('useCurrentProfessionalId', () => {
  it('returns the professional id for the logged-in user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockFrom.mockReturnValue(makeQueryChain({ data: { id: 'pro-1' }, error: null }));

    const { result } = renderHook(() => useCurrentProfessionalId(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('pro-1');
  });

  it('returns null when no user is logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useCurrentProfessionalId(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('returns null when professional profile does not exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockFrom.mockReturnValue(makeQueryChain({ data: null, error: null }));

    const { result } = renderHook(() => useCurrentProfessionalId(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

// ── useUpdateAnnouncement ─────────────────────────────────────────────────────

describe('useUpdateAnnouncement', () => {
  const updateFormData = {
    type: 'event' as const,
    title: 'Updated Event',
    description: 'Updated description',
    category: 'Events & Activities',
    girlsOnly: false,
    isFree: true,
    visibilityStart: new Date('2026-03-01'),
    visibilityEnd: new Date('2026-04-01'),
  };

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'ann-1', formData: updateFormData }),
      ).rejects.toThrow('Not authenticated');
    });
  });

  it('throws when professional profile fetch fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals')
        return makeQueryChain({ data: null, error: new Error('No profile') });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'ann-1', formData: updateFormData }),
      ).rejects.toThrow();
    });
  });

  it('updates announcement successfully', async () => {
    const updatedRow = {
      ...mockRow,
      title: 'Updated Event',
      professionals: { business_name: 'Test Pro', logo_uri: null },
    };
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      if (table === 'announcements') return makeQueryChain({ data: updatedRow, error: null });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      const data = await result.current.mutateAsync({ id: 'ann-1', formData: updateFormData });
      expect(data.title).toBe('Updated Event');
    });
  });

  it('throws when update query fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      return makeQueryChain({ data: null, error: new Error('Update failed') });
    });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: 'ann-1', formData: updateFormData }),
      ).rejects.toThrow();
    });
  });

  it('preserves existingCoverUrl when no new image is provided', async () => {
    const updatedRow = {
      ...mockRow,
      cover_image_url: 'https://existing.com/image.jpg',
      professionals: { business_name: 'Test Pro', logo_uri: null },
    };
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      if (table === 'announcements') return makeQueryChain({ data: updatedRow, error: null });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      const data = await result.current.mutateAsync({
        id: 'ann-1',
        formData: updateFormData,
        existingCoverUrl: 'https://existing.com/image.jpg',
      });
      expect(data).toBeDefined();
    });
  });

  it('combines eventDate and eventTime for event type on update', async () => {
    const updatedRow = {
      ...mockRow,
      professionals: { business_name: 'Test Pro', logo_uri: null },
    };
    mockFrom.mockImplementation((table: string) => {
      if (table === 'professionals') return makeQueryChain({ data: { id: 'pro-1' }, error: null });
      if (table === 'announcements') return makeQueryChain({ data: updatedRow, error: null });
      return makeQueryChain({ data: null, error: null });
    });

    const { result } = renderHook(() => useUpdateAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      const data = await result.current.mutateAsync({
        id: 'ann-1',
        formData: {
          ...updateFormData,
          type: 'event',
          eventDate: new Date('2026-06-15'),
          eventTime: new Date('2026-06-15T14:30:00'),
        },
      });
      expect(data).toBeDefined();
    });
  });
});

// ── useDeleteAnnouncement ─────────────────────────────────────────────────────

describe('useDeleteAnnouncement', () => {
  it('deletes an announcement successfully', async () => {
    const chain = makeQueryChain({ data: null, error: null });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useDeleteAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(result.current.mutateAsync('ann-1')).resolves.toBeUndefined();
    });
  });

  it('throws when delete query fails', async () => {
    const chain = makeQueryChain({ data: null, error: new Error('Delete failed') });
    mockFrom.mockReturnValue(chain);

    const { result } = renderHook(() => useDeleteAnnouncement(), { wrapper: createWrapper() });
    await act(async () => {
      await expect(result.current.mutateAsync('ann-1')).rejects.toThrow('Delete failed');
    });
  });
});
