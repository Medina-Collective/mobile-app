import { useFavoritesStore } from '../favorites.store';

beforeEach(() => {
  useFavoritesStore.setState({ favoritedIds: [] });
});

describe('favoritesStore', () => {
  it('starts with no favorites', () => {
    expect(useFavoritesStore.getState().isFavorited('1')).toBe(false);
  });

  it('toggle adds an id', () => {
    useFavoritesStore.getState().toggle('1');
    expect(useFavoritesStore.getState().isFavorited('1')).toBe(true);
  });

  it('toggle removes an already-favorited id', () => {
    useFavoritesStore.getState().toggle('1');
    useFavoritesStore.getState().toggle('1');
    expect(useFavoritesStore.getState().isFavorited('1')).toBe(false);
  });

  it('manages multiple ids independently', () => {
    useFavoritesStore.getState().toggle('1');
    useFavoritesStore.getState().toggle('2');
    expect(useFavoritesStore.getState().isFavorited('1')).toBe(true);
    expect(useFavoritesStore.getState().isFavorited('2')).toBe(true);
    useFavoritesStore.getState().toggle('1');
    expect(useFavoritesStore.getState().isFavorited('1')).toBe(false);
    expect(useFavoritesStore.getState().isFavorited('2')).toBe(true);
  });
});
