import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES, QUERY_KEYS } from '@constants/index';
import { rowToAnnouncement, fetchParticipatedSet } from '../utils/announcement.utils';
import type { ProfessionalSnippet } from '../utils/announcement.utils';
import type { Announcement, AnnouncementType } from '@app-types/announcement';
import type { AnnouncementFormData } from '../schemas/announcement.schema';

// Normalize to start/end of the local calendar day so UTC storage
// never bleeds into a different calendar day in the user's timezone.
function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
function endOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/**
 * Maps the 3 form types to the DB enum values.
 * event → activity_event, offer → limited_offer, update → other
 */
function toDbType(
  formType: 'event' | 'offer' | 'update',
): 'activity_event' | 'limited_offer' | 'other' {
  if (formType === 'event') return 'activity_event';
  if (formType === 'offer') return 'limited_offer';
  return 'other';
}

/**
 * Maps DB type back to the 3 form types for the edit screen.
 */
export function fromDbType(dbType: string): 'event' | 'offer' | 'update' {
  if (dbType === 'limited_offer') return 'offer';
  if (dbType === 'other') return 'update';
  return 'event'; // activity_event, bazaar, brand_popup, halaqa
}

// ── Private helpers ───────────────────────────────────────────────────────────

/** Resolves the professional profile id for an authenticated user. */
async function fetchProfessionalId(userId: string): Promise<string> {
  const { data: professional, error: profError } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (profError) throw profError;
  return professional.id;
}

/**
 * Uploads a local image URI to Supabase Storage and returns the public URL.
 * fetch().blob() returns 0 bytes for local file URIs in React Native.
 * XHR with arraybuffer is the reliable cross-platform alternative.
 */
async function uploadCoverImage(uri: string, professionalId: string): Promise<string> {
  const filename = `${professionalId}/${Date.now()}.jpg`;
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', uri);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => resolve(xhr.response as ArrayBuffer);
    xhr.onerror = () => reject(new Error('Failed to read image file'));
    xhr.send();
  });
  const { error: uploadError } = await supabase.storage
    .from('announcement-images')
    .upload(filename, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw uploadError;
  const { data: urlData } = supabase.storage.from('announcement-images').getPublicUrl(filename);
  return urlData.publicUrl;
}

/** Combines the event date + optional time field into a single ISO string. */
function buildEventStart(formData: AnnouncementFormData): string | null {
  if (formData.type !== 'event' || formData.eventDate === undefined) return null;
  const d = new Date(formData.eventDate);
  if (formData.eventTime !== undefined) {
    d.setHours(formData.eventTime.getHours(), formData.eventTime.getMinutes(), 0, 0);
  }
  return d.toISOString();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = query.eq('type', typeFilter as any);
      }

      // Non-pro users only see public announcements
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

      return rowToAnnouncement(
        data,
        hasParticipated,
        data.professionals as unknown as ProfessionalSnippet,
      );
    },
  });
}

// ── All announcements for a professional profile (includes expired) ────────────

export function useAnnouncementsByProfessional(professionalId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.announcements, 'professional', professionalId] as const,
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, professionals(business_name, logo_uri)')
        .eq('professional_id', professionalId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data.length === 0) return [];
      return data.map((r) =>
        rowToAnnouncement(r, false, r.professionals as unknown as ProfessionalSnippet),
      );
    },
    enabled: professionalId.length > 0,
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

// ── Current professional id (used for ownership checks) ───────────────────────

export function useCurrentProfessionalId() {
  return useQuery({
    queryKey: ['currentProfessionalId'],
    queryFn: async (): Promise<string | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.id ?? null;
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

      const professionalId = await fetchProfessionalId(user.id);

      let coverImageUrl: string | null = null;
      if (formData.coverImageUri !== undefined) {
        coverImageUrl = await uploadCoverImage(formData.coverImageUri, professionalId);
      }

      const eventStart = buildEventStart(formData);

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          professional_id: professionalId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: toDbType(formData.type) as any,
          title: formData.title,
          description: formData.description ?? null,
          cover_image_url: coverImageUrl,
          location: formData.location ?? null,
          event_start: eventStart,
          event_end: null,
          visibility_start: startOfLocalDay(formData.visibilityStart).toISOString(),
          visibility_end: endOfLocalDay(formData.visibilityEnd).toISOString(),
          audience: 'public',
          participation_enabled: false,
          max_capacity: formData.maxParticipants ?? null,
          status: 'published',
        })
        .select()
        .single();
      if (error) throw error;

      return rowToAnnouncement(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAnnouncements });
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
      existingCoverUrl,
    }: {
      id: string;
      formData: AnnouncementFormData;
      existingCoverUrl?: string;
    }): Promise<Announcement> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const professionalId = await fetchProfessionalId(user.id);

      // Determine cover image: upload new if picked, keep existing, or clear
      let coverImageUrl: string | null = existingCoverUrl ?? null;
      if (formData.coverImageUri !== undefined) {
        coverImageUrl = await uploadCoverImage(formData.coverImageUri, professionalId);
      }

      const eventStart = buildEventStart(formData);

      const { data, error } = await supabase
        .from('announcements')
        .update({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: toDbType(formData.type) as any,
          title: formData.title,
          description: formData.description ?? null,
          cover_image_url: coverImageUrl,
          location: formData.location ?? null,
          event_start: eventStart,
          event_end: null,
          visibility_start: startOfLocalDay(formData.visibilityStart).toISOString(),
          visibility_end: endOfLocalDay(formData.visibilityEnd).toISOString(),
          audience: 'public',
          participation_enabled: false,
          max_capacity: formData.maxParticipants ?? null,
        })
        .eq('id', id)
        .select('*, professionals(business_name, logo_uri)')
        .single();
      if (error) throw error;

      return rowToAnnouncement(data, false, data.professionals as unknown as ProfessionalSnippet);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.announcement(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAnnouncements });
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.announcement(id) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.announcements });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAnnouncements });
    },
  });
}
