export type AnnouncementType =
  | 'activity_event'
  | 'bazaar'
  | 'brand_popup'
  | 'halaqa'
  | 'limited_offer'
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
  other: 'Announcement',
};

/** Maps each type to an Ionicons icon name */
export const ANNOUNCEMENT_TYPE_ICONS: Record<AnnouncementType, string> = {
  activity_event: 'people-outline',
  bazaar: 'bag-handle-outline',
  brand_popup: 'storefront-outline',
  halaqa: 'book-outline',
  limited_offer: 'pricetag-outline',
  other: 'notifications-outline',
};

/** Badge colors for each type — bg + text that work on white card surfaces */
export const ANNOUNCEMENT_TYPE_COLORS: Record<AnnouncementType, { bg: string; text: string }> = {
  activity_event: { bg: '#fce7ef', text: '#28020a' },
  bazaar: { bg: '#fff8e1', text: '#7b5e00' },
  brand_popup: { bg: '#ede7f6', text: '#4a2280' },
  halaqa: { bg: '#e8f5e9', text: '#1b5e20' },
  limited_offer: { bg: '#fff3e0', text: '#b45309' },
  other: { bg: '#f3f4f6', text: '#374151' },
};
