import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@services/api.client';
import { useFavoritesStore } from '@store/favorites.store';

async function addFavorite(id: string): Promise<void> {
  await apiClient.post(`/professionals/${id}/favorite`);
}

async function removeFavorite(id: string): Promise<void> {
  await apiClient.delete(`/professionals/${id}/favorite`);
}

export function useFavorite(professionalId: string) {
  const isFavorited = useFavoritesStore((s) => s.isFavorited(professionalId));
  const toggle = useFavoritesStore((s) => s.toggle);

  const mutation = useMutation({
    mutationFn: () => (isFavorited ? removeFavorite(professionalId) : addFavorite(professionalId)),
    onMutate: () => {
      // Optimistic update — flip immediately so the UI feels instant
      toggle(professionalId);
    },
    onError: () => {
      // Revert on failure
      toggle(professionalId);
    },
  });

  return {
    isFavorited,
    toggle: () => mutation.mutate(),
    isToggling: mutation.isPending,
  };
}
