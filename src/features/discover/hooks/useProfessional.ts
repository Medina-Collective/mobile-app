import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase.client';
import type {
  Professional,
  ProfileType,
  MonetizationType,
  ServiceTypeValue,
} from '@app-types/professional';
import type { Database } from '@app-types/supabase';

type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];

function rowToProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    businessName: row.business_name,
    profileType: row.profile_type as ProfileType,
    monetizationType: (row.monetization_type ?? 'for_profit') as MonetizationType,
    category: row.category,
    subcategories: row.subcategories,
    serviceTypes: row.service_types as ServiceTypeValue[],
    basedIn: row.based_in,
    servesAreas: row.serves_areas,
    description: row.description,
    inquiryEmail: row.inquiry_email,
    instagram: row.instagram ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    bookingLink: row.booking_link ?? undefined,
    priceRange: row.price_range ?? undefined,
    startingPrice: row.starting_price ?? undefined,
    logoUri: row.logo_uri ?? undefined,
    status: row.status,
    isFavorited: false,
  };
}

export function useListProfessionals() {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async (): Promise<Professional[]> => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('status', 'approved');
      if (error) throw error;
      return data.map(rowToProfessional);
    },
  });
}

export function useGetProfessional(id: string) {
  return useQuery({
    queryKey: ['professionals', id],
    queryFn: async (): Promise<Professional> => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return rowToProfessional(data);
    },
  });
}
