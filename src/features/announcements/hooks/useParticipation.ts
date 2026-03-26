import { useEffect, useState } from 'react';
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

  const detailKey = QUERY_KEYS.announcement(announcementId);

  // Subscribe to the detail cache reactively without registering a queryFn.
  // useQuery({ enabled: false, queryFn: throw }) would corrupt the shared cache
  // entry used by useGetAnnouncement, causing the detail page to show an error.
  // The QueryCache subscription API is the correct low-level approach here.
  const [detailData, setDetailData] = useState<Announcement | undefined>(
    () => queryClient.getQueryData<Announcement>(detailKey),
  );
  useEffect(() => {
    // Sync on mount in case the cache was populated between render and effect
    setDetailData(queryClient.getQueryData<Announcement>(detailKey));
    return queryClient.getQueryCache().subscribe(() => {
      setDetailData(queryClient.getQueryData<Announcement>(detailKey));
    });
  }, [queryClient, detailKey]);

  // Fallback: search list caches when the detail hasn't been fetched yet
  // (i.e. user hasn't visited the detail page — fixes "Full" instead of "Going" in feed).
  let isParticipating = detailData?.hasParticipated ?? false;
  if (detailData === undefined) {
    const lists = queryClient.getQueriesData<Announcement[]>({ queryKey: QUERY_KEYS.announcements });
    for (const [, list] of lists) {
      if (!Array.isArray(list)) continue;
      const found = list.find((a) => a.id === announcementId);
      if (found !== undefined) {
        isParticipating = found.hasParticipated;
        break;
      }
    }
  }

  // Pass the snapshot as `variables` so mutationFn never relies on a stale closure.
  const mutation = useMutation({
    mutationFn: async (wasParticipating: boolean) => {
      if (!userId) throw new Error('Not authenticated');

      if (wasParticipating) {
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

    // Optimistic update — flip state before the network call
    onMutate: async (wasParticipating: boolean) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.announcements });

      const previousDetail = queryClient.getQueryData<Announcement>(detailKey);
      const previousLists = queryClient.getQueriesData<Announcement[]>({
        queryKey: QUERY_KEYS.announcements,
      });

      const flip = (a: Announcement): Announcement => ({
        ...a,
        hasParticipated: !wasParticipating,
        participantCount: wasParticipating
          ? Math.max(0, a.participantCount - 1)
          : a.participantCount + 1,
      });

      if (previousDetail !== undefined) {
        queryClient.setQueryData<Announcement>(detailKey, flip(previousDetail));
      }

      for (const [key, list] of previousLists) {
        if (Array.isArray(list)) {
          queryClient.setQueryData<Announcement[]>(
            key,
            list.map((a) => (a.id === announcementId ? flip(a) : a)),
          );
        }
      }

      return { previousDetail, previousLists };
    },

    onError: (err, _vars, context) => {
      console.error('[useParticipation] toggle failed:', err);
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
      for (const [key, list] of context?.previousLists ?? []) {
        queryClient.setQueryData(key, list);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
    },
  });

  return {
    isParticipating,
    toggle: () => mutation.mutate(isParticipating),
    isToggling: mutation.isPending,
  };
}
