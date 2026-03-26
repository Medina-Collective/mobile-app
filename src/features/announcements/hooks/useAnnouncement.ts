import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES, QUERY_KEYS } from '@constants/index';
import type { Announcement, AnnouncementType, AnnouncementAudience } from '@app-types/announcement';
import type { Database } from '@app-types/supabase';
import type { AnnouncementFormData } from '../schemas/announcement.schema';

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

// ── List (active feed) ────────────────────────────────────────────────────────

export function useListAnnouncements(typeFilter?: AnnouncementType | undefined) {
  const isPro = useAuthStore((s) => s.user?.role === USER_ROLES.PROFESSIONAL);

  return useQuery({
    queryKey: typeFilter
      ? ([...QUERY_KEYS.announcements, 'type', typeFilter, isPro] as const)
      : ([...QUERY_KEYS.announcements, isPro] as const),
    queryFn: async (): Promise<Announcement[]> => {
      const now = new Date().toISOString();

      let query = supabase
        .from('announcements')
        .select('*, professionals(business_name, logo_uri)')
        .eq('status', 'published')
        .lte('visibility_start', now)
        .gte('visibility_end', now)
        .order('created_at', { ascending: false });

      if (typeFilter !== undefined) {
        query = query.eq('type', typeFilter);
      }

      // Non-pro users only see public announcements
      if (!isPro) {
        query = query.eq('audience', 'public');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch current user's participation in one batch query
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || data.length === 0) {
        return data.map((r) => rowToAnnouncement(r, false, r.professionals as ProfessionalSnippet));
      }

      const ids = data.map((r) => r.id);
      const { data: participated } = await supabase
        .from('announcement_participants')
        .select('announcement_id')
        .eq('user_id', user.id)
        .in('announcement_id', ids);

      const participatedSet = new Set(participated?.map((p) => p.announcement_id) ?? []);
      return data.map((r) =>
        rowToAnnouncement(r, participatedSet.has(r.id), r.professionals as ProfessionalSnippet),
      );
    },
  });
}

// ── Single ────────────────────────────────────────────────────────────────────

export function useGetAnnouncement(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.announcement(id),
    queryFn: async (): Promise<Announcement> => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, professionals(business_name, logo_uri)')
        .eq('id', id)
        .single();
      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let hasParticipated = false;
      if (user) {
        const { data: p } = await supabase
          .from('announcement_participants')
          .select('announcement_id')
          .eq('user_id', user.id)
          .eq('announcement_id', id)
          .maybeSingle();
        hasParticipated = p !== null;
      }

      return rowToAnnouncement(data, hasParticipated, data.professionals as ProfessionalSnippet);
    },
  });
}

// ── My announcements (PRO) ────────────────────────────────────────────────────

export function useMyAnnouncements() {
  return useQuery({
    queryKey: QUERY_KEYS.myAnnouncements,
    queryFn: async (): Promise<Announcement[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Look up the professional profile linked to this user
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id, business_name, logo_uri')
        .eq('user_id', user.id)
        .single();
      if (profError) throw profError;

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const proSnippet: ProfessionalSnippet = {
        business_name: professional.business_name,
        logo_uri: professional.logo_uri,
      };
      return data.map((r) => rowToAnnouncement(r, false, proSnippet));
    },
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AnnouncementFormData): Promise<Announcement> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Resolve the professional profile ID from the current user
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profError) throw profError;

      // Upload cover image if one was selected
      let coverImageUrl: string | null = null;
      if (formData.coverImageUri !== undefined) {
        const filename = `${professional.id}/${Date.now()}.jpg`;
        // fetch().blob() returns 0 bytes for local file URIs in React Native.
        // XHR with arraybuffer is the reliable cross-platform alternative.
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', formData.coverImageUri!);
          xhr.responseType = 'arraybuffer';
          xhr.onload = () => resolve(xhr.response as ArrayBuffer);
          xhr.onerror = () => reject(new Error('Failed to read image file'));
          xhr.send();
        });
        const { error: uploadError } = await supabase.storage
          .from('announcement-images')
          .upload(filename, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('announcement-images')
          .getPublicUrl(filename);
        coverImageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          professional_id: professional.id,
          type: formData.type,
          title: formData.title,
          description: formData.description ?? null,
          cover_image_url: coverImageUrl,
          location: formData.location ?? null,
          event_start: formData.eventStart?.toISOString() ?? null,
          event_end: formData.eventEnd?.toISOString() ?? null,
          visibility_start: formData.visibilityStart.toISOString(),
          visibility_end: formData.visibilityEnd.toISOString(),
          audience: formData.audience,
          participation_enabled: formData.participationEnabled,
          max_capacity: formData.maxCapacity ?? null,
          status: 'published',
        })
        .select()
        .single();
      if (error) throw error;

      return rowToAnnouncement(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAnnouncements });
    },
  });
}
