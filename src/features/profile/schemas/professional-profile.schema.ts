import { z } from 'zod';

// ── Profile identity types ─────────────────────────────────────────────────────

export const PROFILE_TYPES = [
  {
    value: 'community_organizer' as const,
    label: 'Community organizer',
    description: 'Events, gatherings & community initiatives',
  },
  {
    value: 'nonprofit_organization' as const,
    label: 'Mosque / association',
    description: 'Mosques, associations & community organizations',
  },
  {
    value: 'business_brand' as const,
    label: 'Business / brand',
    description: 'Products, shops & brands',
  },
  {
    value: 'freelancer_service' as const,
    label: 'Freelancer / service provider',
    description: 'Beauty, fitness, photography & more',
  },
];

export type ProfileType =
  | 'community_organizer'
  | 'nonprofit_organization'
  | 'business_brand'
  | 'freelancer_service';

// ── Monetization types ────────────────────────────────────────────────────────

export const MONETIZATION_TYPES = [
  {
    value: 'nonprofit' as const,
    label: 'Nonprofit / community-based',
    description: 'Free or donation-based, no profit goal',
  },
  {
    value: 'for_profit' as const,
    label: 'For-profit / paid',
    description: 'Charge for products or services',
  },
];

export type MonetizationType = 'nonprofit' | 'for_profit';

// ── Categories per profile type ───────────────────────────────────────────────

export const CATEGORIES_BY_TYPE: Record<ProfileType, string[]> = {
  community_organizer: [
    'Eid Events',
    'Bazaars',
    'Sisters Events',
    'Community Events',
    'Workshops',
    'Cultural Events',
  ],
  nonprofit_organization: [
    'Mosque / Masjid',
    'Association',
    'Community Group',
    'Charity / Foundation',
    'Educational Institution',
    'Cultural Centre',
  ],
  business_brand: [
    'Clothing',
    'Jewelry & Accessories',
    'Beauty Products',
    'Home & Decor',
    'Food & Sweets',
    'Islamic Products',
    'Handmade / Artisan',
  ],
  freelancer_service: [
    'Beauty',
    'Fitness',
    'Photography & Content',
    'Event Services',
    'Food Services',
    'Education & Tutoring',
    'Design & Creative',
  ],
};

// ── Subcategories (freelancer_service only) ───────────────────────────────────

export const SUBCATEGORIES_BY_CATEGORY: Partial<Record<string, string[]>> = {
  Beauty: ['Henna', 'Makeup', 'Hair', 'Nails', 'Lashes / Brows', 'Facials', 'Massage', 'Laser'],
  Fitness: ['Pilates / Yoga', 'Personal Training', 'Women Fitness Classes', 'Hijama'],
  'Photography & Content': ['Photography', 'Videography', 'Content Creation', 'Graphic Design'],
  'Event Services': [
    'Decor & Setup',
    'Catering',
    'Cakes & Desserts',
    'Venue Rental',
    'Dress Rental',
    'Equipment Rental',
  ],
  'Food Services': ['Catering', 'Meal Prep', 'Custom Desserts'],
  'Education & Tutoring': [
    'Quran Tutoring',
    'Academic Tutoring',
    'Language Classes',
    'Islamic Studies',
  ],
  'Design & Creative': ['Graphic Design', 'Web Design', 'Calligraphy', 'Illustration'],
};

// ── Service types (how you work) ──────────────────────────────────────────────

export const SERVICE_TYPE_OPTIONS = [
  { value: 'in_person' as const, label: 'In person' },
  { value: 'online' as const, label: 'Online' },
  { value: 'hybrid' as const, label: 'Hybrid' },
  { value: 'travels_to_client' as const, label: 'Travels to client' },
];

export type ServiceTypeValue = 'in_person' | 'online' | 'hybrid' | 'travels_to_client';

// ── Location options ──────────────────────────────────────────────────────────

export const QC_AREAS = [
  'Montreal',
  'Laval',
  'Longueuil',
  'Brossard',
  'Terrebonne',
  'Blainville',
  'Rosemère',
];

export const BASED_IN_OPTIONS = [...QC_AREAS, 'Online only'];

export const SERVES_AREAS_OPTIONS = [
  ...QC_AREAS,
  'Online',
  "At client's location",
  'At my location',
];

// ── Price ranges ──────────────────────────────────────────────────────────────

export const PRICE_RANGES = ['$', '$$', '$$$'] as const;

export type PriceRange = '$' | '$$' | '$$$';

// ── Profile status ────────────────────────────────────────────────────────────
// Server-managed — not part of the onboarding form submission.

export const PROFILE_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested',
  REJECTED: 'rejected',
  NEEDS_FOLLOW_UP: 'needs_follow_up',
} as const;

export type ProfileStatus = (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS];

// ── Step 3 copy (category step) per profile type ──────────────────────────────

export const CATEGORY_STEP_COPY: Record<ProfileType, { title: string; subtitle: string }> = {
  community_organizer: {
    title: 'What do you organize?',
    subtitle: 'Select the type of events or gatherings you run.',
  },
  nonprofit_organization: {
    title: 'What does your organization focus on?',
    subtitle: 'Select your main community area.',
  },
  business_brand: {
    title: 'What do you sell?',
    subtitle: 'Select the main category for your business.',
  },
  freelancer_service: {
    title: 'What service do you offer?',
    subtitle: 'Select your main service category.',
  },
};

// ── Step 5 copy (service type / delivery mode) per profile type ───────────────

export const SERVICE_TYPE_STEP_COPY: Partial<
  Record<ProfileType, { title: string; subtitle: string }>
> = {
  freelancer_service: {
    title: 'How do you work?',
    subtitle: 'Select all that apply. Helps people know how to book you.',
  },
};

// ── Zod schema ────────────────────────────────────────────────────────────────

export const professionalProfileSchema = z.object({
  // Step 1 — Identity
  logoUri: z.string().optional(),
  businessName: z.string().min(2, 'A profile name is required'),
  profileType: z.enum([
    'community_organizer',
    'nonprofit_organization',
    'business_brand',
    'freelancer_service',
  ]),

  // Step 2 — Monetization
  monetizationType: z.enum(['nonprofit', 'for_profit']),

  // Step 3 — Category (single-select, required)
  category: z.string().min(1, 'Please select a category'),

  // Step 4 — Subcategories (multi-select, freelancer_service only, optional)
  subcategories: z.array(z.string()),

  // Step 5 — Service type / delivery mode (multi-select, optional)
  serviceTypes: z.array(z.string()),

  // Step 6 — Location
  basedIn: z.string().min(1, 'Please select where you are based'),
  servesAreas: z.array(z.string()),

  // Step 7 — About & Contact
  description: z.string().min(10, 'Please add a short description').max(300, 'Max 300 characters'),
  instagram: z.string().optional(),
  phone: z.string().optional(),
  inquiryEmail: z.email(),
  website: z.string().optional(),
  bookingLink: z.string().optional(),
  priceRange: z.enum(['$', '$$', '$$$']).optional(),
  startingPrice: z.string().optional(),
});

export type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;

// ── Step-level field maps ─────────────────────────────────────────────────────

export const STEP_FIELDS: (keyof ProfessionalProfileFormData)[][] = [
  ['businessName', 'profileType'], // 0 — Identity
  ['monetizationType'], // 1 — Monetization
  ['category'], // 2 — Category
  [], // 3 — Subcategory (freelancer_service only)
  [], // 4 — Delivery mode (freelancer_service + class_workshop_host)
  ['basedIn'], // 5 — Location
  ['description', 'inquiryEmail'], // 6 — About & Contact
  [], // 7 — Review
];
