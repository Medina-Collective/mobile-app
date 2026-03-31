import { supabase } from '@services/supabase.client';
import type { Announcement, AnnouncementType, AnnouncementAudience } from '@app-types/announcement';
import type { Database } from '@app-types/supabase';

export type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
export type ProfessionalSnippet = { business_name: string; logo_uri: string | null } | null;

export function rowToAnnouncement(
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
 * Batch-fetches which announcement IDs the current user has participated in.
 * Returns an empty Set when the user is not authenticated.
 */
export async function fetchParticipatedSet(announcementIds: string[]): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data: participated } = await supabase
    .from('announcement_participants')
    .select('announcement_id')
    .eq('user_id', user.id)
    .in('announcement_id', announcementIds);

  return new Set(participated?.map((p) => p.announcement_id) ?? []);
}
