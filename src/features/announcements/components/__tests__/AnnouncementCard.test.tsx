import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnnouncementCard } from '../AnnouncementCard';
import { useSavedStore } from '@store/saved.store';
import { useRecommendationsStore } from '@store/recommendations.store';
import type { Announcement } from '@app-types/announcement';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(undefined),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function makeAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  return {
    id: 'ann-1',
    type: 'activity_event',
    title: 'Test Event',
    description: 'A great event',
    coverImageUrl: undefined,
    location: 'Montreal',
    visibilityStart: '2026-03-01T00:00:00Z',
    visibilityEnd: '2026-04-01T00:00:00Z',
    eventStart: '2026-03-15T14:00:00Z',
    eventEnd: undefined,
    deadline: undefined,
    externalUrl: undefined,
    professionalId: 'pro-1',
    professionalName: 'Test Pro',
    professionalLogoUrl: undefined,
    audience: 'public',
    participationEnabled: false,
    participantCount: 0,
    maxCapacity: undefined,
    hasParticipated: false,
    status: 'published',
    createdAt: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  useSavedStore.setState({ savedIds: [] });
  useRecommendationsStore.setState({ typeScores: {}, signalCount: 0, openCounts: {} });
  mockPush.mockClear();
});

// ── Default variant ────────────────────────────────────────────────────────────

describe('AnnouncementCard — default variant', () => {
  it('renders the announcement title', () => {
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={makeAnnouncement()} />);
    expect(getByText('Test Event')).toBeTruthy();
  });

  it('renders professionalName when present', () => {
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={makeAnnouncement({ professionalName: 'Fatima Studio' })} />,
    );
    expect(getByText('Fatima Studio')).toBeTruthy();
  });

  it('renders description when present', () => {
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={makeAnnouncement({ description: 'Amazing description' })} />,
    );
    expect(getByText('Amazing description')).toBeTruthy();
  });

  it('does NOT render description when undefined', () => {
    const { queryByText } = renderWithQuery(
      <AnnouncementCard announcement={makeAnnouncement({ description: undefined })} />,
    );
    expect(queryByText('A great event')).toBeNull();
  });

  it('renders location in meta row', () => {
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={makeAnnouncement({ location: 'Montreal' })} />,
    );
    expect(getByText('Montreal')).toBeTruthy();
  });

  it('pressing the card navigates to /announcements/ann-1', () => {
    const ann = makeAnnouncement();
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    fireEvent.press(getByText('Test Event'));
    expect(mockPush).toHaveBeenCalledWith('/announcements/ann-1');
  });

  it('pressing the card records open in recommendations store', () => {
    const ann = makeAnnouncement();
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    fireEvent.press(getByText('Test Event'));
    expect(useRecommendationsStore.getState().openCounts['ann-1']).toBe(1);
  });

  it('renders ParticipationButton CTA for activity_event with participationEnabled=true', () => {
    const ann = makeAnnouncement({ type: 'activity_event', participationEnabled: true });
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    // ParticipationButton shows "Participate" text
    expect(getByText('Participate')).toBeTruthy();
  });

  it('renders "View Offer" CTA for limited_offer type with participationEnabled=false', () => {
    const ann = makeAnnouncement({ type: 'limited_offer', participationEnabled: false });
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    expect(getByText('View Offer')).toBeTruthy();
  });

  it('renders "Learn More" CTA for update type', () => {
    const ann = makeAnnouncement({ type: 'update', participationEnabled: false });
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    expect(getByText('Learn More')).toBeTruthy();
  });

  it('renders deadline label when deadline is set and no eventStart', () => {
    const ann = makeAnnouncement({
      deadline: '2026-03-20T00:00:00Z',
      eventStart: undefined,
    });
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    expect(getByText(/Deadline:/)).toBeTruthy();
  });

  it('renders event date label when eventStart is set', () => {
    const ann = makeAnnouncement({ eventStart: '2026-03-15T14:00:00Z' });
    const { getByText } = renderWithQuery(<AnnouncementCard announcement={ann} />);
    // format(2026-03-15, 'MMM d, yyyy') = 'Mar 15, 2026'
    expect(getByText('Mar 15, 2026')).toBeTruthy();
  });
});

// ── Featured variant ───────────────────────────────────────────────────────────

describe('AnnouncementCard — featured variant', () => {
  it('renders the announcement title in featured variant', () => {
    const ann = makeAnnouncement();
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="featured" />,
    );
    expect(getByText('Test Event')).toBeTruthy();
  });

  it('renders cover image area even when coverImageUrl is undefined', () => {
    const ann = makeAnnouncement({ coverImageUrl: undefined });
    const { toJSON } = renderWithQuery(<AnnouncementCard announcement={ann} variant="featured" />);
    // Should render without crashing — cover placeholder View is always rendered
    expect(toJSON()).toBeTruthy();
  });

  it('featured variant shows CTA button', () => {
    const ann = makeAnnouncement({ type: 'update', participationEnabled: false });
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="featured" />,
    );
    expect(getByText('Learn More')).toBeTruthy();
  });

  it('featured variant shows professionalName', () => {
    const ann = makeAnnouncement({ professionalName: 'Halal Eats' });
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="featured" />,
    );
    expect(getByText('Halal Eats')).toBeTruthy();
  });

  it('pressing featured card navigates to announcement detail', () => {
    const ann = makeAnnouncement();
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="featured" />,
    );
    fireEvent.press(getByText('Test Event'));
    expect(mockPush).toHaveBeenCalledWith('/announcements/ann-1');
  });
});

// ── Compact variant ────────────────────────────────────────────────────────────

describe('AnnouncementCard — compact variant', () => {
  it('renders title in compact variant', () => {
    const ann = makeAnnouncement();
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(getByText('Test Event')).toBeTruthy();
  });

  it('renders professionalName in compact variant', () => {
    const ann = makeAnnouncement({ professionalName: 'Studio Amira' });
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(getByText('Studio Amira')).toBeTruthy();
  });

  it('renders without crash when coverImageUrl is undefined', () => {
    const ann = makeAnnouncement({ coverImageUrl: undefined });
    const { toJSON } = renderWithQuery(<AnnouncementCard announcement={ann} variant="compact" />);
    expect(toJSON()).toBeTruthy();
  });

  it('pressing compact card navigates to announcement detail', () => {
    const ann = makeAnnouncement();
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    fireEvent.press(getByText('Test Event'));
    expect(mockPush).toHaveBeenCalledWith('/announcements/ann-1');
  });

  it('renders event date in compact variant when eventStart is set', () => {
    const ann = makeAnnouncement({ eventStart: '2026-04-18T10:00:00Z' });
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(getByText('Apr 18, 2026')).toBeTruthy();
  });

  it('renders deadline date in compact variant when no eventStart but deadline is set', () => {
    const ann = makeAnnouncement({
      eventStart: undefined,
      deadline: '2026-05-15T12:00:00Z',
    });
    const { getByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(getByText('May 15, 2026')).toBeTruthy();
  });

  it('hides date row in compact variant when neither eventStart nor deadline is set', () => {
    const ann = makeAnnouncement({ eventStart: undefined, deadline: undefined });
    const { queryByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(queryByText(/2026/)).toBeNull();
  });

  it('hides professionalName row when name is empty string', () => {
    const ann = makeAnnouncement({ professionalName: '' });
    const { queryByText } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(queryByText('')).toBeNull();
  });

  it('renders cover image in compact variant when coverImageUrl is set', () => {
    const ann = makeAnnouncement({ coverImageUrl: 'https://example.com/img.jpg' });
    const { toJSON } = renderWithQuery(
      <AnnouncementCard announcement={ann} variant="compact" />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
