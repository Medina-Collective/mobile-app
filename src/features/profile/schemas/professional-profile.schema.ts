import { z } from 'zod';

// ── Profile types ─────────────────────────────────────────────────────────────

export const PROFILE_TYPES = [
  { value: 'shop' as const, label: 'Shop', description: 'Sell physical products' },
  { value: 'service' as const, label: 'Service', description: 'Offer a service' },
  {
    value: 'organizer' as const,
    label: 'Organizer',
    description: 'Organize events & gatherings',
  },
  {
    value: 'classes_circles' as const,
    label: 'Classes & Circles',
    description: 'Run classes, halaqas, or workshops',
  },
];

export type ProfileType = 'shop' | 'service' | 'organizer' | 'classes_circles';

// ── Categories per profile type ───────────────────────────────────────────────

export const CATEGORIES_BY_TYPE: Record<ProfileType, string[]> = {
  shop: [
    'Clothing',
    'Jewelry & Accessories',
    'Beauty Products',
    'Home & Decor',
    'Food & Sweets',
    'Islamic Products',
    'Handmade',
  ],
  service: ['Beauty', 'Fitness', 'Photography', 'Event Services', 'Food Services'],
  organizer: ['Eid Events', 'Bazaars', 'Sisters Events', 'Workshops', 'Community Events'],
  classes_circles: ['Quran', 'Islamic Studies', 'Halaqa', 'Workshops', 'Book Club', 'Skill Classes'],
};

// ── Subcategories (service providers only) ────────────────────────────────────

export const SUBCATEGORIES_BY_CATEGORY: Partial<Record<string, string[]>> = {
  Beauty: ['Henna', 'Makeup', 'Hair', 'Nails', 'Lashes / Brows', 'Facials', 'Massage', 'Laser'],
  Fitness: ['Pilates / Yoga', 'Personal Training', 'Women Fitness Classes', 'Hijama'],
  Photography: ['Photography', 'Videography', 'Content Creation', 'Graphic Design'],
  'Event Services': [
    'Decor & Setup',
    'Catering',
    'Cakes & Desserts',
    'Venue Rental',
    'Dress Rental',
    'Equipment Rental',
  ],
  'Food Services': ['Catering', 'Meal Prep', 'Custom Desserts'],
};

// ── Service types ─────────────────────────────────────────────────────────────

export const SERVICE_TYPE_OPTIONS = [
  { value: 'at_home' as const, label: 'At home' },
  { value: 'has_studio' as const, label: 'Has a studio' },
  { value: 'online' as const, label: 'Online' },
  { value: 'travels_to_client' as const, label: 'Travels to client' },
];

export type ServiceTypeValue = 'at_home' | 'has_studio' | 'online' | 'travels_to_client';

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
  "At client's home",
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
} as const;

export type ProfileStatus = (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS];

// ── Step 2 copy (category step) per profile type ──────────────────────────────

export const CATEGORY_STEP_COPY: Record<ProfileType, { title: string; subtitle: string }> = {
  shop: {
    title: 'What do you sell?',
    subtitle: 'Select the main category for your shop.',
  },
  service: {
    title: 'What service do you offer?',
    subtitle: 'Select your main service category.',
  },
  organizer: {
    title: 'What do you organize?',
    subtitle: 'Select the type of events you run.',
  },
  classes_circles: {
    title: 'What do you teach or lead?',
    subtitle: 'Select your main program type.',
  },
};

// ── Zod schema ────────────────────────────────────────────────────────────────

export const professionalProfileSchema = z.object({
  // Step 1 — Profile Type
  logoUri: z.string().optional(),
  businessName: z.string().min(2, 'A profile name is required'),
  profileType: z.enum(['shop', 'service', 'organizer', 'classes_circles']),

  // Step 2 — Category (single-select, required)
  category: z.string().min(1, 'Please select a category'),

  // Step 3 — Subcategories (multi-select, service only, optional)
  subcategories: z.array(z.string()),

  // Step 4 — Service type (multi-select, optional)
  serviceTypes: z.array(z.string()),

  // Step 5 — Location
  basedIn: z.string().min(1, 'Please select where you are based'),
  servesAreas: z.array(z.string()),

  // Step 6 — About & Contact
  description: z
    .string()
    .min(10, 'Please add a short description')
    .max(300, 'Max 300 characters'),
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
  ['businessName', 'profileType'], // 0 — Profile Type
  ['category'],                    // 1 — Category
  [],                              // 2 — Subcategory (optional)
  [],                              // 3 — Service Type (optional)
  ['basedIn'],                     // 4 — Location
  ['description', 'inquiryEmail'], // 5 — About & Contact
  [],                              // 6 — Review
];
