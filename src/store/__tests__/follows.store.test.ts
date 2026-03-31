import { useFollowsStore } from '../follows.store';

beforeEach(() => {
  useFollowsStore.setState({ followedIds: [] });
});

describe('follows store', () => {
  it('starts with empty followedIds', () => {
    expect(useFollowsStore.getState().followedIds).toEqual([]);
  });

  it('isFollowing returns false when not following', () => {
    expect(useFollowsStore.getState().isFollowing('pro-1')).toBe(false);
  });

  it('toggle adds id when not yet following', () => {
    useFollowsStore.getState().toggle('pro-1');
    expect(useFollowsStore.getState().followedIds).toContain('pro-1');
    expect(useFollowsStore.getState().isFollowing('pro-1')).toBe(true);
  });

  it('toggle removes id when already following', () => {
    useFollowsStore.setState({ followedIds: ['pro-1'] });
    useFollowsStore.getState().toggle('pro-1');
    expect(useFollowsStore.getState().followedIds).not.toContain('pro-1');
    expect(useFollowsStore.getState().isFollowing('pro-1')).toBe(false);
  });

  it('toggle does not affect other followed ids', () => {
    useFollowsStore.setState({ followedIds: ['pro-1', 'pro-2'] });
    useFollowsStore.getState().toggle('pro-1');
    expect(useFollowsStore.getState().followedIds).toContain('pro-2');
    expect(useFollowsStore.getState().followedIds).not.toContain('pro-1');
  });

  it('can follow multiple professionals', () => {
    useFollowsStore.getState().toggle('pro-1');
    useFollowsStore.getState().toggle('pro-2');
    useFollowsStore.getState().toggle('pro-3');
    expect(useFollowsStore.getState().followedIds).toHaveLength(3);
  });
});
