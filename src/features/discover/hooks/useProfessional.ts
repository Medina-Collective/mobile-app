import { useQuery } from '@tanstack/react-query';
import type { Professional } from '@app-types/professional';

// ── Mock data ─────────────────────────────────────────────────────────────────
// Replace queryFn body with: const { data } = await apiClient.get<Professional>(`/professionals/${id}`); return data;

const MOCK_PROFESSIONALS: Record<string, Professional> = {
  '1': {
    id: '1',
    businessName: 'Henna by Fatima',
    profileType: 'service',
    category: 'Beauty',
    subcategories: ['Henna', 'Makeup'],
    serviceTypes: ['at_home', 'travels_to_client'],
    basedIn: 'Montreal',
    servesAreas: ['Montreal', 'Laval', 'Longueuil'],
    description:
      'Specialised henna artist and makeup artist serving the Montreal Muslim community. Available for weddings, Eid events, and special occasions. Traditional and modern designs tailored just for you.',
    inquiryEmail: 'hello@hennabyfattima.com',
    instagram: 'hennabyfattima',
    phone: '+1 514 000 0000',
    bookingLink: 'https://calendly.com/henna',
    priceRange: '$$',
    startingPrice: '$50',
    status: 'approved',
    isFavorited: false,
  },
  '2': {
    id: '2',
    businessName: 'Nour Pilates',
    profileType: 'service',
    category: 'Fitness',
    subcategories: ['Pilates / Yoga', 'Women Fitness Classes'],
    serviceTypes: ['has_studio', 'online'],
    basedIn: 'Laval',
    servesAreas: ['Laval', 'Montreal', 'Online'],
    description:
      'Women-only pilates and wellness studio in Laval. Online classes available. All levels welcome — from beginners to advanced practitioners.',
    inquiryEmail: 'nour@nourpilates.ca',
    instagram: 'nourpilates',
    website: 'https://nourpilates.ca',
    priceRange: '$$$',
    startingPrice: '$25/session',
    status: 'approved',
    isFavorited: true,
  },
  '3': {
    id: '3',
    businessName: 'Sakina Sweets',
    profileType: 'shop',
    category: 'Food & Sweets',
    subcategories: [],
    serviceTypes: [],
    basedIn: 'Brossard',
    servesAreas: ['Brossard', 'Longueuil', "At client's home"],
    description:
      'Handmade Middle Eastern sweets and custom celebration cakes. Perfect for weddings, Eid, and all your special moments. Orders placed 1 week in advance.',
    inquiryEmail: 'orders@skinasweets.com',
    instagram: 'sakinasweets',
    phone: '+1 438 000 0000',
    priceRange: '$',
    status: 'approved',
    isFavorited: false,
  },
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useListProfessionals() {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async (): Promise<Professional[]> => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return Object.values(MOCK_PROFESSIONALS);
    },
  });
}

export function useGetProfessional(id: string) {
  return useQuery({
    queryKey: ['professionals', id],
    queryFn: async (): Promise<Professional> => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const professional = MOCK_PROFESSIONALS[id];
      if (professional === undefined) {
        throw new Error('Professional not found');
      }
      return professional;
    },
  });
}
