import { useRecentlyViewedStore } from '../recentlyViewed.store';

beforeEach(() => {
  useRecentlyViewedStore.setState({ ids: [] });
});

describe('recentlyViewedStore — initial state', () => {
  it('starts with an empty ids array', () => {
    expect(useRecentlyViewedStore.getState().ids).toEqual([]);
  });
});

describe('record', () => {
  it('adds an id when first viewed', () => {
    useRecentlyViewedStore.getState().record('ann-1');
    expect(useRecentlyViewedStore.getState().ids).toContain('ann-1');
  });

  it('places the most recently viewed id first', () => {
    useRecentlyViewedStore.getState().record('ann-1');
    useRecentlyViewedStore.getState().record('ann-2');
    expect(useRecentlyViewedStore.getState().ids[0]).toBe('ann-2');
  });

  it('moves an already-viewed id back to the front', () => {
    useRecentlyViewedStore.getState().record('ann-1');
    useRecentlyViewedStore.getState().record('ann-2');
    useRecentlyViewedStore.getState().record('ann-1');
    const { ids } = useRecentlyViewedStore.getState();
    expect(ids[0]).toBe('ann-1');
    expect(ids.filter((id) => id === 'ann-1')).toHaveLength(1);
  });

  it('does not store duplicate ids', () => {
    useRecentlyViewedStore.getState().record('ann-1');
    useRecentlyViewedStore.getState().record('ann-1');
    expect(useRecentlyViewedStore.getState().ids).toHaveLength(1);
  });

  it('caps the list at 10 entries', () => {
    for (let i = 1; i <= 12; i++) {
      useRecentlyViewedStore.getState().record(`ann-${i}`);
    }
    expect(useRecentlyViewedStore.getState().ids).toHaveLength(10);
  });

  it('drops the oldest entry when the cap is exceeded', () => {
    for (let i = 1; i <= 11; i++) {
      useRecentlyViewedStore.getState().record(`ann-${i}`);
    }
    expect(useRecentlyViewedStore.getState().ids).not.toContain('ann-1');
  });
});
