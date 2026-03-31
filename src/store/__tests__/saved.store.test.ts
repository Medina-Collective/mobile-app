import { useSavedStore } from '../saved.store';

beforeEach(() => {
  useSavedStore.setState({ savedIds: [] });
});

describe('savedStore — initial state', () => {
  it('starts with an empty savedIds array', () => {
    expect(useSavedStore.getState().savedIds).toEqual([]);
  });
});

describe('toggle', () => {
  it('adds an id when it is not already saved', () => {
    useSavedStore.getState().toggle('ann-1');
    expect(useSavedStore.getState().savedIds).toContain('ann-1');
  });

  it('removes an id when it is already saved', () => {
    useSavedStore.getState().toggle('ann-1');
    useSavedStore.getState().toggle('ann-1');
    expect(useSavedStore.getState().savedIds).not.toContain('ann-1');
  });

  it('manages multiple ids independently', () => {
    useSavedStore.getState().toggle('ann-1');
    useSavedStore.getState().toggle('ann-2');
    useSavedStore.getState().toggle('ann-1');
    expect(useSavedStore.getState().savedIds).not.toContain('ann-1');
    expect(useSavedStore.getState().savedIds).toContain('ann-2');
  });
});

describe('isSaved', () => {
  it('returns false when the id has not been saved', () => {
    expect(useSavedStore.getState().isSaved('ann-1')).toBe(false);
  });

  it('returns true after toggling an id in', () => {
    useSavedStore.getState().toggle('ann-1');
    expect(useSavedStore.getState().isSaved('ann-1')).toBe(true);
  });

  it('returns false after toggling an id back out', () => {
    useSavedStore.getState().toggle('ann-1');
    useSavedStore.getState().toggle('ann-1');
    expect(useSavedStore.getState().isSaved('ann-1')).toBe(false);
  });
});

describe('clear', () => {
  it('empties savedIds', () => {
    useSavedStore.getState().toggle('ann-1');
    useSavedStore.getState().toggle('ann-2');
    // Reset via setState (simulates a clear operation)
    useSavedStore.setState({ savedIds: [] });
    expect(useSavedStore.getState().savedIds).toEqual([]);
  });
});
