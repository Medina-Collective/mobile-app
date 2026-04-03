import { useMutation } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { useSavedStore } from '@store/saved.store';
import { useRecommendationsStore } from '@store/recommendations.store';
import type { AnnouncementType } from '@app-types/announcement';

/**
 * Save/unsave toggle — mirrors the useFollow pattern.
 *
 * Local Zustand state flips immediately for instant UI feedback.
 * Supabase is updated in the background (used by edge functions for
 * event reminders and interest-based recommendations).
 * On error the store rolls back.
 */
export function useSave(announcementId: string, announcementType: AnnouncementType) {
  const userId = useAuthStore((s) => s.user?.id);
  const isSaved = useSavedStore((s) => s.isSaved(announcementId));
  const toggle = useSavedStore((s) => s.toggle);
  const recordSignal = useRecommendationsStore((s) => s.recordSignal);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      if (isSaved) {
        const { error } = await supabase
          .from('saved_announcements')
          .delete()
          .eq('user_id', userId)
          .eq('announcement_id', announcementId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_announcements')
          .insert({ user_id: userId, announcement_id: announcementId });
        if (error) throw error;
      }
    },
    onMutate: () => {
      if (!isSaved) recordSignal(announcementType, 'save');
      toggle(announcementId);
    },
    onError: () => {
      toggle(announcementId);
    },
  });

  return {
    isSaved,
    toggle: () => mutation.mutate(),
    isToggling: mutation.isPending,
  };
}
