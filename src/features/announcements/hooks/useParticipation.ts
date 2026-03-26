import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { QUERY_KEYS } from '@constants/index';
import type { Announcement } from '@app-types/announcement';

/**
 * Optimistic participation toggle — mirrors the useFavorite pattern.
 *
 * On press:
 *  1. Immediately flips `hasParticipated` + adjusts `participantCount` in the cache
 *  2. Runs the Supabase insert/delete in the background
 *  3. Rolls back the cache on error
 */
export function useParticipation(announcementId: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  // Read current participation state from the detail cache (fallback: false)
  const detailKey = QUERY_KEYS.announcement(announcementId);
  const current = queryClient.getQueryData<Announcement>(detailKey);
  const isParticipating = current?.hasParticipated ?? false;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      if (isParticipating) {
        const { error } = await supabase
          .from('announcement_participants')
          .delete()
          .eq('user_id', userId)
          .eq('announcement_id', announcementId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcement_participants')
          .insert({ user_id: userId, announcement_id: announcementId });
        if (error) throw error;
      }
    },

    // Optimistic update — flip the state before the network call
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.announcements });

      const previousDetail = queryClient.getQueryData<Announcement>(detailKey);
      const previousList = queryClient.getQueryData<Announcement[]>(QUERY_KEYS.announcements);

      const flipAnnouncement = (a: Announcement): Announcement => ({
        ...a,
        hasParticipated: !a.hasParticipated,
        participantCount: a.hasParticipated
          ? Math.max(0, a.participantCount - 1)
          : a.participantCount + 1,
      });

      if (previousDetail) {
        queryClient.setQueryData<Announcement>(detailKey, flipAnnouncement(previousDetail));
      }

      if (previousList) {
        queryClient.setQueryData<Announcement[]>(
          QUERY_KEYS.announcements,
          previousList.map((a) => (a.id === announcementId ? flipAnnouncement(a) : a)),
        );
      }

      return { previousDetail, previousList };
    },

    // Roll back on error
    onError: (_err, _vars, context) => {
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.announcements, context.previousList);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });

  return {
    isParticipating,
    toggle: () => mutation.mutate(),
    isToggling: mutation.isPending,
  };
}
