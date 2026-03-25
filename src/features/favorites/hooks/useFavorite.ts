import { useMutation } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useFavoritesStore } from '@store/favorites.store';
import { useAuthStore } from '@store/auth.store';

export function useFavorite(professionalId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const isFavorited = useFavoritesStore((s) => s.isFavorited(professionalId));
  const toggle = useFavoritesStore((s) => s.toggle);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('professional_id', professionalId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, professional_id: professionalId });
        if (error) throw error;
      }
    },
    onMutate: () => {
      toggle(professionalId);
    },
    onError: () => {
      toggle(professionalId);
    },
  });

  return {
    isFavorited,
    toggle: () => mutation.mutate(),
    isToggling: mutation.isPending,
  };
}
