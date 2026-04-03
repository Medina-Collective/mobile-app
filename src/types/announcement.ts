export type AnnouncementType =
  | 'activity_event'
  | 'bazaar'
  | 'brand_popup'
  | 'halaqa'
  | 'limited_offer'
  | 'update'
  | 'other';

export type AnnouncementStatus = 'draft' | 'published' | 'archived';

/**
 * Who can see this announcement on the feed.
 *  - public   → all authenticated users
 *  - pro_only → only professional accounts
 */
export type AnnouncementAudience = 'public' | 'pro_only';

export interface Announcement {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalLogoUrl?: string | undefined;
  type: AnnouncementType;
  title: string;
  description?: string | undefined;
  coverImageUrl?: string | undefined;
  location?: string | undefined;
  /** ISO string — the actual start date of the event/offer */
  eventStart?: string | undefined;
  /** ISO string — the actual end date of the event/offer */
  eventEnd?: string | undefined;
  /** ISO string — when the post starts appearing on the feed */
  visibilityStart: string;
  /** ISO string — when the post stops appearing on the feed (max 30 days after start) */
  visibilityEnd: string;
  audience: AnnouncementAudience;
  participationEnabled: boolean;
  maxCapacity?: number | undefined;
  participantCount: number;
  /** Whether the currently authenticated user has confirmed participation */
  hasParticipated: boolean;
  /** Category tag selected at creation time */
  category?: string | undefined;
  /** External URL for offers/updates — opens in browser instead of detail page */
  externalUrl?: string | undefined;
  /** ISO string — a registration or application deadline (mutually exclusive with eventStart/eventEnd) */
  deadline?: string | undefined;
  status: AnnouncementStatus;
  createdAt: string;
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  activity_event: 'Activity Event',
  bazaar: 'Bazaar',
  brand_popup: 'Brand Pop-Up',
  halaqa: 'Halaqa',
  limited_offer: 'Limited Offer',
  update: 'Update',
  other: 'Update',
};

/** Maps each type to an Ionicons icon name */
export const ANNOUNCEMENT_TYPE_ICONS: Record<AnnouncementType, string> = {
  activity_event: 'people-outline',
  bazaar: 'bag-handle-outline',
  brand_popup: 'storefront-outline',
  halaqa: 'book-outline',
  limited_offer: 'pricetag-outline',
  update: 'megaphone-outline',
  other: 'notifications-outline',
};

/** Badge colors for each type — bg + text that work on dark card surfaces */
export const ANNOUNCEMENT_TYPE_COLORS: Record<AnnouncementType, { bg: string; text: string }> = {
  activity_event: { bg: 'rgba(252, 100, 150, 0.15)', text: '#f9a8c0' },
  bazaar: { bg: 'rgba(255, 200, 50, 0.12)', text: '#e8c060' },
  brand_popup: { bg: 'rgba(150, 100, 240, 0.15)', text: '#c4a8f0' },
  halaqa: { bg: 'rgba(80, 200, 100, 0.13)', text: '#88c890' },
  limited_offer: { bg: 'rgba(240, 150, 50, 0.13)', text: '#e8a855' },
  update: { bg: 'rgba(100, 149, 237, 0.13)', text: '#6495ed' },
  other: { bg: 'rgba(150, 160, 180, 0.13)', text: '#a8b0c0' },
};
