export type ProfileType = 'shop' | 'service' | 'organizer' | 'classes_circles';
export type ProfileStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected';
export type PriceRange = '$' | '$$' | '$$$';
export type ServiceTypeValue = 'at_home' | 'has_studio' | 'online' | 'travels_to_client';

export interface Professional {
  id: string;
  businessName: string;
  profileType: ProfileType;
  category: string;
  subcategories: string[];
  serviceTypes: ServiceTypeValue[];
  basedIn: string;
  servesAreas: string[];
  description: string;
  inquiryEmail: string;
  instagram?: string | undefined;
  phone?: string | undefined;
  website?: string | undefined;
  bookingLink?: string | undefined;
  priceRange?: PriceRange | undefined;
  startingPrice?: string | undefined;
  logoUri?: string | undefined;
  status: ProfileStatus;
  isFavorited: boolean;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  shop: 'Shop',
  service: 'Service',
  organizer: 'Organizer',
  classes_circles: 'Classes & Circles',
};

export const SERVICE_TYPE_LABELS: Record<ServiceTypeValue, string> = {
  at_home: 'At home',
  has_studio: 'Has a studio',
  online: 'Online',
  travels_to_client: 'Travels to client',
};
