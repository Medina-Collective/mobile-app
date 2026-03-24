import { useFavoritesStore } from '@store/favorites.store';

// TODO: when backend is ready, also call:
//   apiClient.post(`/professionals/${id}/favorite`) or DELETE to unfavorite

export function useFavorite(professionalId: string) {
  const isFavorited = useFavoritesStore((s) => s.isFavorited(professionalId));
  const toggle = useFavoritesStore((s) => s.toggle);

  return {
    isFavorited,
    toggle: () => toggle(professionalId),
  };
}
