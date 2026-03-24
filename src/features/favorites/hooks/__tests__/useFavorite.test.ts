import { renderHook, act } from '@testing-library/react-native';
import { useFavorite } from '../useFavorite';
import { useFavoritesStore } from '@store/favorites.store';

beforeEach(() => {
  useFavoritesStore.setState({ favoritedIds: [] });
});

describe('useFavorite', () => {
  it('returns false when the professional is not favorited', () => {
    const { result } = renderHook(() => useFavorite('1'));
    expect(result.current.isFavorited).toBe(false);
  });

  it('returns true after toggling on', () => {
    const { result } = renderHook(() => useFavorite('1'));
    act(() => result.current.toggle());
    expect(result.current.isFavorited).toBe(true);
  });

  it('returns false after toggling off', () => {
    const { result } = renderHook(() => useFavorite('1'));
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(result.current.isFavorited).toBe(false);
  });
});
