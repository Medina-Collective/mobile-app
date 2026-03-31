import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useFollowsStore } from '@store/follows.store';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES } from '@constants/index';
import type { Announcement, AnnouncementType, AnnouncementAudience } from '@app-types/announcement';
import type { Database } from '@app-types/supabase';

type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
type ProfessionalSnippet = { business_name: string; logo_uri: string | null } | null;

function rowToAnnouncement(
  row: AnnouncementRow,
  hasParticipated = false,
  professional: ProfessionalSnippet = null,
): Announcement {
  return {
    id: row.id,
    professionalId: row.professional_id,
    professionalName: professional?.business_name ?? '',
    professionalLogoUrl: professional?.logo_uri ?? undefined,
    type: row.type as AnnouncementType,
    title: row.title,
    description: row.description ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    location: row.location ?? undefined,
    eventStart: row.event_start ?? undefined,
    eventEnd: row.event_end ?? undefined,
    visibilityStart: row.visibility_start,
    visibilityEnd: row.visibility_end,
    audience: (row.audience ?? 'public') as AnnouncementAudience,
    participationEnabled: row.participation_enabled,
    maxCapacity: row.max_capacity ?? undefined,
    participantCount: row.participant_count,
    hasParticipated,
    status: row.status,
    createdAt: row.created_at,
  };
}

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

      // Batch-fetch participation status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return data.map((r) =>
          rowToAnnouncement(r, false, r.professionals as unknown as ProfessionalSnippet),
        );
      }

      const ids = data.map((r) => r.id);
      const { data: participated } = await supabase
        .from('announcement_participants')
        .select('announcement_id')
        .eq('user_id', user.id)
        .in('announcement_id', ids);

      const participatedSet = new Set(participated?.map((p) => p.announcement_id) ?? []);
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
