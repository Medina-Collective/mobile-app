import { z } from 'zod';

export const MAX_VISIBILITY_DAYS = 30;

// ── DB-level type options (used by filter chips in list/discover screens) ─────

export const ANNOUNCEMENT_TYPE_OPTIONS = [
  { value: 'activity_event' as const, label: 'Activity Event', icon: 'people-outline' },
  { value: 'bazaar' as const, label: 'Bazaar', icon: 'bag-handle-outline' },
  { value: 'brand_popup' as const, label: 'Brand Pop-Up', icon: 'storefront-outline' },
  { value: 'halaqa' as const, label: 'Halaqa', icon: 'book-outline' },
  { value: 'limited_offer' as const, label: 'Limited Offer', icon: 'pricetag-outline' },
  { value: 'other' as const, label: 'Other', icon: 'notifications-outline' },
] as const;

// ── Form types (3 simplified types matching the web app) ──────────────────────

export const ANNOUNCEMENT_FORM_TYPES = [
  {
    value: 'event' as const,
    label: 'Event / Activity',
    description: 'Gatherings, classes, workshops',
    icon: 'calendar-outline',
  },
  {
    value: 'offer' as const,
    label: 'Offer / Promotion',
    description: 'Sales, deals, launches',
    icon: 'pricetag-outline',
  },
  {
    value: 'update' as const,
    label: 'Community Update',
    description: 'News, registrations, announcements',
    icon: 'megaphone-outline',
  },
] as const;

export type AnnouncementFormType = 'event' | 'offer' | 'update';

// ── Categories ────────────────────────────────────────────────────────────────

export const ANNOUNCEMENT_CATEGORIES = [
  'Halaqas & Classes',
  'Events & Activities',
  'Bazaars & Markets',
  'Offers & Promotions',
  'Community News',
  'Youth',
  'Sisters',
  'Charity & Volunteering',
  'Business',
] as const;

// ── Zod schema ────────────────────────────────────────────────────────────────

export const announcementSchema = z
  .object({
    type: z.enum(['event', 'offer', 'update']),
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    description: z.string().max(1000, 'Description cannot exceed 1,000 characters').optional(),
    category: z.string().min(1, 'Please select a category'),
    coverImageUri: z.string().optional(),

    // ── Event fields ────────────────────────────────────────────────────────────
    eventDate: z.date().optional(),
    eventTime: z.date().optional(),
    location: z.string().max(200, 'Location is too long').optional(),
    girlsOnly: z.boolean().default(false),
    isFree: z.boolean().default(true),
    price: z.string().optional(),
    maxParticipants: z.number().int().positive('Capacity must be a positive number').optional(),
    registrationLink: z.string().optional(),

    // ── Offer fields ────────────────────────────────────────────────────────────
    discountLabel: z.string().optional(),
    validUntil: z.date().optional(),
    promoCode: z.string().optional(),
    shopLink: z.string().optional(),

    // ── Update fields ───────────────────────────────────────────────────────────
    deadline: z.date().optional(),
    externalLink: z.string().optional(),

    // ── Visibility window (required) ────────────────────────────────────────────
    visibilityStart: z.date(),
    visibilityEnd: z.date(),
  })
  .refine((d) => d.visibilityEnd > d.visibilityStart, {
    message: 'End date must be after start date',
    path: ['visibilityEnd'],
  })
  .refine(
    (d) =>
      d.visibilityEnd.getTime() - d.visibilityStart.getTime() <=
      MAX_VISIBILITY_DAYS * 24 * 60 * 60 * 1000,
    {
      message: `Visibility window cannot exceed ${MAX_VISIBILITY_DAYS} days`,
      path: ['visibilityEnd'],
    },
  );

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
