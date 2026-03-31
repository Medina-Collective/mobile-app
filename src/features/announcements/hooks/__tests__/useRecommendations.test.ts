import { renderHook } from '@testing-library/react-native';
import {
  useTrendingAnnouncements,
  useRankedAnnouncements,
} from '@features/announcements/hooks/useRecommendations';
import { useRecommendationsStore } from '@store/recommendations.store';
import type { Announcement } from '@app-types/announcement';

// ── Factory ─────────────────────────────────────────────────────────────────

const baseAnnouncement = (overrides: Partial<Announcement>): Announcement => ({
  id: 'a1',
  type: 'activity_event',
  title: 'Test',
  description: undefined,
  location: undefined,
  coverImageUrl: undefined,
  visibilityStart: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  visibilityEnd: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  eventStart: undefined,
  eventEnd: undefined,
  deadline: undefined,
  externalUrl: undefined,
  professionalId: 'p1',
  professionalName: 'Test Pro',
  professionalLogoUrl: undefined,
  audience: 'public',
  participationEnabled: false,
  participantCount: 0,
  maxCapacity: undefined,
  hasParticipated: false,
  isSaved: false,
  openCount: 0,
  status: 'published',
  createdAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  useRecommendationsStore.setState({ typeScores: {}, signalCount: 0, openCounts: {} });
});

// ── useTrendingAnnouncements ─────────────────────────────────────────────────

describe('useTrendingAnnouncements', () => {
  it('returns an empty array when input is empty', () => {
    const { result } = renderHook(() => useTrendingAnnouncements([]));
    expect(result.current).toEqual([]);
  });

  it('sorts by open count descending', () => {
    const a1 = baseAnnouncement({ id: 'a1', title: 'Low Opens' });
    const a2 = baseAnnouncement({ id: 'a2', title: 'High Opens' });

    useRecommendationsStore.setState({
      openCounts: { a1: 1, a2: 10 },
      typeScores: {},
      signalCount: 0,
    });

    const { result } = renderHook(() => useTrendingAnnouncements([a1, a2]));
    expect(result.current[0]!.id).toBe('a2');
    expect(result.current[1]!.id).toBe('a1');
  });

  it('falls back to recency for equal open counts (newer first)', () => {
    const older = baseAnnouncement({
      id: 'old',
      visibilityStart: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    });
    const newer = baseAnnouncement({
      id: 'new',
      visibilityStart: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    });

    // Both have 0 opens
    const { result } = renderHook(() => useTrendingAnnouncements([older, newer]));
    expect(result.current[0]!.id).toBe('new');
    expect(result.current[1]!.id).toBe('old');
  });

  it('limits to the requested count', () => {
    const items = ['a1', 'a2', 'a3', 'a4', 'a5'].map((id) => baseAnnouncement({ id }));
    const { result } = renderHook(() => useTrendingAnnouncements(items, 3));
    expect(result.current).toHaveLength(3);
  });

  it('returns all items when count is larger than input', () => {
    const items = [baseAnnouncement({ id: 'a1' }), baseAnnouncement({ id: 'a2' })];
    const { result } = renderHook(() => useTrendingAnnouncements(items, 10));
    expect(result.current).toHaveLength(2);
  });
});

// ── useRankedAnnouncements ───────────────────────────────────────────────────

describe('useRankedAnnouncements', () => {
  it('returns an empty array when input is empty', () => {
    const { result } = renderHook(() => useRankedAnnouncements([]));
    expect(result.current).toEqual([]);
  });

  it('returns diversity-sorted (round-robin by type) in cold start (< 8 signals)', () => {
    useRecommendationsStore.setState({ typeScores: {}, signalCount: 0, openCounts: {} });

    // Two different types
    const event1 = baseAnnouncement({ id: 'e1', type: 'activity_event' });
    const bazaar1 = baseAnnouncement({ id: 'b1', type: 'bazaar' });
    const event2 = baseAnnouncement({ id: 'e2', type: 'activity_event' });

    const { result } = renderHook(() => useRankedAnnouncements([event1, event2, bazaar1]));

    // Round-robin: first item is activity_event, second is bazaar, third is activity_event
    const types = result.current.map((a) => a.type);
    // First two items should be one of each type (diversity interleaving)
    expect(types[0]).toBe('activity_event');
    expect(types[1]).toBe('bazaar');
    expect(types[2]).toBe('activity_event');
  });

  it('sorts by personal affinity when signal count is >= 25 (warm threshold)', () => {
    // High affinity for 'halaqa' type
    useRecommendationsStore.setState({
      typeScores: { halaqa: 100, activity_event: 1 },
      signalCount: 25,
      openCounts: {},
    });

    const event = baseAnnouncement({ id: 'e1', type: 'activity_event', title: 'Event' });
    const halaqa = baseAnnouncement({ id: 'h1', type: 'halaqa', title: 'Halaqa' });

    const { result } = renderHook(() => useRankedAnnouncements([event, halaqa]));

    // halaqa has much higher affinity, should rank first
    expect(result.current[0]!.id).toBe('h1');
  });

  it('includes all input items in output', () => {
    const items = ['a1', 'a2', 'a3'].map((id) => baseAnnouncement({ id }));
    const { result } = renderHook(() => useRankedAnnouncements(items));
    expect(result.current).toHaveLength(3);
  });
});
