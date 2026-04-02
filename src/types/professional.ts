export type ProfileType =
  | 'community_organizer'
  | 'nonprofit_organization'
  | 'business_brand'
  | 'freelancer_service';

export type MonetizationType = 'nonprofit' | 'for_profit';

export type ProfileStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'needs_follow_up';

export type MembershipStatus = 'member' | 'verified_applicant' | 'verified_approved';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_follow_up';

export type PriceRange = '$' | '$$' | '$$$';

export type ServiceTypeValue = 'in_person' | 'online' | 'hybrid' | 'travels_to_client';

export interface Professional {
  id: string;
  businessName: string;
  profileType: ProfileType;
  monetizationType: MonetizationType;
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
  community_organizer: 'Community organizer',
  nonprofit_organization: 'Mosque / association',
  business_brand: 'Business / brand',
  freelancer_service: 'Freelancer / service provider',
};

export const MONETIZATION_TYPE_LABELS: Record<MonetizationType, string> = {
  nonprofit: 'Nonprofit / community-based',
  for_profit: 'For-profit / paid',
};

export const SERVICE_TYPE_LABELS: Record<ServiceTypeValue, string> = {
  in_person: 'In person',
  online: 'Online',
  hybrid: 'Hybrid',
  travels_to_client: 'Travels to client',
};
