import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';
import { USER_ROLES, QUERY_KEYS } from '@constants/index';
import { rowToAnnouncement, fetchParticipatedSet } from '../utils/announcement.utils';
import type { ProfessionalSnippet } from '../utils/announcement.utils';
import type { Announcement, AnnouncementType } from '@app-types/announcement';
import type { AnnouncementFormData } from '../schemas/announcement.schema';

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: formData.type as any,
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

      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profError) throw profError;

      // Determine cover image: upload new if picked, keep existing, or clear
      let coverImageUrl: string | null = existingCoverUrl ?? null;
      if (formData.coverImageUri !== undefined) {
        const filename = `${professional.id}/${Date.now()}.jpg`;
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
        .update({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: formData.type as any,
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
