import { useMutation } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { useFollowsStore } from '@store/follows.store';

/**
 * Optimistic follow toggle — mirrors the useFavorite pattern.
 *
 * The local Zustand store flips immediately; Supabase is updated in the background.
 * On error the store rolls back.
 */
export function useFollow(professionalId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const isFollowing = useFollowsStore((s) => s.isFollowing(professionalId));
  const toggle = useFollowsStore((s) => s.toggle);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('user_id', userId)
          .eq('professional_id', professionalId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({ user_id: userId, professional_id: professionalId });
        if (error) throw error;
      }
    },
    onMutate: () => {
      toggle(professionalId);
    },
    onError: () => {
      // Roll back the optimistic flip
      toggle(professionalId);
    },
  });

  return {
    isFollowing,
    toggle: () => mutation.mutate(),
    isToggling: mutation.isPending,
  };
}
