import { z } from 'zod';

export const MAX_VISIBILITY_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ── Type options (used by the selector UI) ────────────────────────────────────

export const ANNOUNCEMENT_TYPE_OPTIONS = [
  {
    value: 'activity_event' as const,
    label: 'Activity Event',
    description: 'A gathering or activity for the community',
    icon: 'people-outline',
  },
  {
    value: 'bazaar' as const,
    label: 'Bazaar',
    description: 'A marketplace or shopping event',
    icon: 'bag-handle-outline',
  },
  {
    value: 'brand_popup' as const,
    label: 'Brand Pop-Up',
    description: 'A temporary showcase or pop-up shop',
    icon: 'ribbon-outline',
  },
  {
    value: 'halaqa' as const,
    label: 'Halaqa',
    description: 'A study circle or Islamic gathering',
    icon: 'book-outline',
  },
  {
    value: 'limited_offer' as const,
    label: 'Limited Offer',
    description: 'A special promotion or sale',
    icon: 'pricetag-outline',
  },
  {
    value: 'other' as const,
    label: 'Other',
    description: 'Any other type of announcement',
    icon: 'notifications-outline',
  },
];

// ── Zod schema ────────────────────────────────────────────────────────────────

export const announcementSchema = z
  .object({
    type: z.enum(['activity_event', 'bazaar', 'brand_popup', 'halaqa', 'limited_offer', 'other']),
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(80, 'Title cannot exceed 80 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    coverImageUri: z.string().optional(),
    location: z.string().max(100, 'Location is too long').optional(),

    // The actual date range of the event/offer (both optional — not all announcements have a date)
    eventStart: z.date().optional(),
    eventEnd: z.date().optional(),

    // When the post appears on the feed (required, max 30 days apart)
    visibilityStart: z.date(),
    visibilityEnd: z.date(),

    /**
     * Who can see this announcement.
     *  - public   → all users
     *  - pro_only → professional accounts only (e.g. a bazaar looking for vendor partners)
     */
    audience: z.enum(['public', 'pro_only']),
    participationEnabled: z.boolean(),
    maxCapacity: z.number().int().positive('Capacity must be a positive number').optional(),
  })
  .refine((d) => d.visibilityEnd > d.visibilityStart, {
    message: 'End date must be after start date',
    path: ['visibilityEnd'],
  })
  .refine(
    (d) =>
      d.visibilityEnd.getTime() - d.visibilityStart.getTime() <= MAX_VISIBILITY_DAYS * MS_PER_DAY,
    {
      message: `Visibility window cannot exceed ${MAX_VISIBILITY_DAYS} days`,
      path: ['visibilityEnd'],
    },
  )
  .refine((d) => !d.eventStart || !d.eventEnd || d.eventEnd >= d.eventStart, {
    message: 'Event end date must be on or after the start date',
    path: ['eventEnd'],
  });

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
