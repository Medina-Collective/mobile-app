import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useFollowsStore } from '@store/follows.store';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import {
  rowToAnnouncement,
  fetchParticipatedSet,
} from '@features/announcements/utils/announcement.utils';
import type { ProfessionalSnippet } from '@features/announcements/utils/announcement.utils';
import type { Announcement } from '@app-types/announcement';

/**
 * Returns active announcements from the professional accounts the current user follows.
 * Returns an empty array (not an error) when the user follows nobody yet.
 * Pro-only announcements are filtered out for non-professional users.
 */
export function useFollowedAnnouncements() {
  const followedIds = useFollowsStore((s) => s.followedIds);
  const isPro = useAuthStore((s) => s.user?.role === USER_ROLES.PROFESSIONAL);

  return useQuery({
    queryKey: ['announcements', 'followed', followedIds, isPro] as const,
    queryFn: async (): Promise<Announcement[]> => {
      if (followedIds.length === 0) return [];

      const now = new Date().toISOString();

      let query = supabase
        .from('announcements')
        .select('*, professionals(business_name, logo_uri)')
        .eq('status', 'published')
        .lte('visibility_start', now)
        .gte('visibility_end', now)
        .in('professional_id', followedIds)
        .order('created_at', { ascending: false });

      if (!isPro) {
        query = query.eq('audience', 'public');
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data.length === 0) return [];

      const participatedSet = await fetchParticipatedSet(data.map((r) => r.id));
      return data.map((r) =>
        rowToAnnouncement(
          r,
          participatedSet.has(r.id),
          r.professionals as unknown as ProfessionalSnippet,
        ),
      );
    },
  });
}
